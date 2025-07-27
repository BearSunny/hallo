import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import GlowingAvatar from './components/GlowingAvatar';
import VoiceInput from './components/VoiceInput';
import CaregiverPanel from './pages/CaregiverPanel';
import AddMedication from './pages/AddMedication';
import Dashboard from './pages/Dashboard';
import ManagementPage from './pages/ManagementPage';
import { Medication, PatientProfile, MemoryPrompt } from './types';
import { ReminderEngine } from './backend/ReminderEngine';
import { DatabaseService } from './backend/DatabaseService';
import { MemoryEngine } from './backend/MemoryEngine';
import LoginPage from './pages/LoginPage';
import { geminiAI } from './services/geminiAI';
import { conversationAPI } from './services/api';

type Page = 'login' | 'main' | 'caregiver' | 'add-medication' | 'dashboard' | 'manage';

function App() {
  const dbService = new DatabaseService();
  const [currentPage, setCurrentPage] = useState<Page>(() =>
    dbService.getCurrentUser() ? 'main' : 'login'
  );
  const [currentMessage, setCurrentMessage] = useState('Hello! I\'m here to help you today.');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [memoryPrompts, setMemoryPrompts] = useState<MemoryPrompt[]>([]);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [lastReminderTime, setLastReminderTime] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const reminderEngine = new ReminderEngine();
  const memoryEngine = new MemoryEngine();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!dbService.getCurrentUser());

  useEffect(() => {
    if (currentPage === 'main') {
      // Load data from localStorage on startup
      loadDataAsync();
      
      // Start reminder checking every 30 seconds for more reliable medication reminders
      const reminderInterval = setInterval(() => {
        // Use a function to ensure we get the latest medications state
        console.log('⏰ Timer-based reminder check triggered');
        checkReminders();
      }, 30000); // Check every 30 seconds
      
      // Start memory prompts every 5 minutes
      const memoryInterval = setInterval(triggerMemoryPrompt, 300000); // Every 5 minutes
      
      // Initial check after 5 seconds to catch any immediate reminders
      const initialCheck = setTimeout(() => {
        console.log('🚀 Initial reminder check triggered');
        checkReminders();
      }, 5000);
      
      return () => {
        clearInterval(reminderInterval);
        clearInterval(memoryInterval);
        clearTimeout(initialCheck);
      };
    }
  }, []);

  // Re-run reminder checks when medications change
  useEffect(() => {
    if (medications.length > 0) {
      console.log(`🔄 Medications changed, triggering reminder check. Count: ${medications.length}`);
      // Check immediately when medications are updated
      const timeoutId = setTimeout(() => {
        console.log('💊 Medication-triggered reminder check');
        checkReminders();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [medications]);

  useEffect(() => {
    // Reset reminder tracking at midnight
    const resetReminders = () => {
      setLastReminderTime('');
      console.log('🔄 Reset daily reminders');
    };

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const midnightTimer = setTimeout(resetReminders, msUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);
  
  const loadDataAsync = async () => {
    try {
      console.log('🔄 Loading data from database...');
      const [savedMeds, savedProfile, savedMemories] = await Promise.all([
        dbService.getMedications(),
        dbService.getPatientProfile(),
        dbService.getMemoryPrompts()
      ]);
      
      console.log('📊 Data loaded from database:', {
        medicationsCount: savedMeds.length,
        medications: savedMeds,
        hasProfile: !!savedProfile,
        memoriesCount: savedMemories.length
      });
      
      setMedications(savedMeds);
      setPatientProfile(savedProfile);
      setMemoryPrompts(savedMemories);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      // Don't clear existing data on error
    }
  };

  const checkReminders = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`🕐 Checking reminders at ${currentTime}`, { 
      medicationsCount: medications.length,
      medications: medications.map(m => ({ name: m.name, time: m.time, lastRemindedAt: (m as any).lastRemindedAt }))
    });
    
    // Ensure ReminderEngine has the latest medications
    reminderEngine.setMedications(medications);
    
    // Check for medications that are due now using the ReminderEngine
    const dueNow = reminderEngine.checkAllRemindersNow();
    
    if (dueNow.length > 0) {
      let hasUpdates = false;
      const updatedMeds = medications.map((med) => {
        const isDue = dueNow.some(dueMed => dueMed.id === med.id);
        const alreadyReminded = (med as any).lastRemindedAt === currentTime;

        if (isDue && !alreadyReminded) {
          const reminder = reminderEngine.generateMedicationReminder(med);
          console.log(`💊 Medication reminder triggered for "${med.name}" at ${currentTime}`);
          speakMessage(reminder);
          hasUpdates = true;

          return {
            ...med,
            lastRemindedAt: currentTime
          } as any;
        }

        return med;
      });

      // Save updated state with reminder timestamps only if there were changes
      if (hasUpdates) {
        console.log('💾 Saving updated medication reminders to database');
        
        // Update local state immediately for UI responsiveness
        setMedications(updatedMeds);
        
        // Save to MongoDB asynchronously
        dbService.saveMedications(updatedMeds)
          .then(() => {
            console.log('✅ Medication reminder timestamps saved to MongoDB successfully');
          })
          .catch(error => {
            console.error('❌ Failed to save medication updates to MongoDB:', error);
            console.warn('⚠️ Continuing with local state - reminder timestamps may not persist across sessions');
            // Don't reload data automatically as it can reset current state
            // The local state will remain consistent for this session
          });
      }
    }
  };

  const triggerMemoryPrompt = () => {
    if (patientProfile) {
      const prompt = memoryEngine.generateMemoryPrompt(patientProfile, memoryPrompts);
      console.log('🧠 Memory prompt triggered:', prompt);
      speakMessage(prompt);
    }
  };

  const speakMessage = (message: string) => {
    console.log('🔊 Speaking message:', message);
    setCurrentMessage(message);
    setIsAvatarSpeaking(true);
    
    // Add a small delay to ensure the UI updates before starting speech
    setTimeout(() => {
      geminiAI.speak(message).then(() => {
        console.log('✅ Finished speaking');
        setIsAvatarSpeaking(false);
      }).catch((error) => {
        console.error('❌ Speech error:', error);
        setIsAvatarSpeaking(false);
      });
    }, 100);
  };

  const handleVoiceInput = async (transcript: string, audioBlob: Blob) => {  
    if (!patientProfile) {
      speakMessage("I'm not sure who you are yet. Ask your caregiver to set up your profile.");
      setIsProcessingVoice(false);
      return;
    }

    console.log('🎤 Voice input received:', transcript);
    setIsProcessingVoice(true);
    setCurrentMessage(`I heard you say: "${transcript}"`);

    try {
      // Use Gemini AI for more contextual responses
      const reply = await geminiAI.generateResponse(transcript, {
        patientProfile,
        medications,
        conversationHistory: [] // Could be expanded to include recent conversations
      });
      
      // Also log the conversation to the backend
      try {
        await conversationAPI.sendMessage(transcript, 'general');
      } catch (logError) {
        console.warn('Failed to log conversation:', logError);
      }
      
      speakMessage(reply);
    } catch (err) {
      console.error('❌ GPT failed:', err);
      speakMessage("I'm having trouble understanding right now. Please try again later.");
    }

    setIsProcessingVoice(false);
  };

  const handleStartListening = () => {
    setIsListening(true);
    console.log('🎤 Started listening for voice input');
  };

  const handleStopListening = () => {
    setIsListening(false);
    console.log('🎤 Stopped listening for voice input');
  };

  const addMedication = (medication: Medication) => {
    dbService.addMedication(medication).then((newMedication) => {
      if (newMedication) {
        const updatedMeds = [...medications, newMedication];
        setMedications(updatedMeds);
        console.log('➕ Added medication:', newMedication);
        
        // Check if this medication should trigger immediately
        setTimeout(checkReminders, 1000);
      }
    }).catch((error) => {
      console.error('Failed to add medication:', error);
    });
  };

  const updateMedication = (id: string, medication: Medication) => {
    dbService.updateMedication(id, medication).then((success) => {
      if (success) {
        const updatedMeds = medications.map(med => med.id === id ? medication : med);
        setMedications(updatedMeds);
        console.log('✏️ Updated medication:', medication);
      }
    }).catch((error) => {
      console.error('Failed to update medication:', error);
    });
  };

  const deleteMedication = (id: string) => {
    dbService.deleteMedication(id).then((success) => {
      if (success) {
        const updatedMeds = medications.filter(med => med.id !== id);
        setMedications(updatedMeds);
        console.log('🗑️ Deleted medication with id:', id);
      }
    }).catch((error) => {
      console.error('Failed to delete medication:', error);
    });
  };

  const updatePatientProfile = (profile: PatientProfile) => {
    setPatientProfile(profile);
    dbService.savePatientProfile(profile).catch((error) => {
      console.error('Failed to save patient profile:', error);
    });
    
    console.log('👤 Updated patient profile:', profile);
  };

  const addMemoryPrompt = (memory: MemoryPrompt) => {
    dbService.addMemoryPrompt(memory).then((newMemory) => {
      if (newMemory) {
        const updatedMemories = [...memoryPrompts, newMemory];
        setMemoryPrompts(updatedMemories);
        console.log('💭 Added memory prompt:', newMemory);
      }
    }).catch((error) => {
      console.error('Failed to add memory prompt:', error);
    });
  };

  const deleteMemoryPrompt = (id: string) => {
    dbService.deleteMemoryPrompt(id).then((success) => {
      if (success) {
        const updatedMemories = memoryPrompts.filter(memory => memory.id !== id);
        setMemoryPrompts(updatedMemories);
        console.log('🗑️ Deleted memory prompt with id:', id);
      }
    }).catch((error) => {
      console.error('Failed to delete memory prompt:', error);
    });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage
            onLoginSuccess={() => {
              setCurrentPage('main');
              loadDataAsync();
            }}
          />
        );
      case 'main':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-4xl">
              <GlowingAvatar isActive={isAvatarSpeaking || isListening} />
              
              <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <p className="text-3xl font-medium text-gray-800 leading-relaxed">
                  {currentMessage}
                </p>
              </div>   

              <button
                onClick={() => setCurrentPage('caregiver')}
                className="fixed top-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Settings size={24} />
              </button>           
            </div>

            {/* Streamlined Voice Input Component */}
            <VoiceInput
              onVoiceInput={handleVoiceInput}
              isListening={isListening}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              disabled={isAvatarSpeaking || isProcessingVoice}
            />
          </div>
        );
      
      case 'caregiver':
        return (
          <CaregiverPanel
            onNavigate={setCurrentPage}
            onBack={() => setCurrentPage('main')}
            onLogout={() => {
              dbService.logoutUser();
              setCurrentPage('login');
              console.log("🔓 Logged out. Switching to login page...");
              setMedications([]);
              setPatientProfile(null);
              setMemoryPrompts([]);
            }}
          />
        );
      
      case 'add-medication':
        return (
          <AddMedication
            onAddMedication={addMedication}
            onBack={() => setCurrentPage('caregiver')}
          />
        );
      
      case 'dashboard':
        return (
          <Dashboard
            patientProfile={patientProfile}
            memoryPrompts={memoryPrompts}
            onUpdateProfile={updatePatientProfile}
            onAddMemory={addMemoryPrompt}
            onBack={() => setCurrentPage('caregiver')}
          />
        );
      
      case 'manage':
        return (
          <ManagementPage
            medications={medications}
            patientProfile={patientProfile}
            memoryPrompts={memoryPrompts}
            onUpdateMedication={updateMedication}
            onDeleteMedication={deleteMedication}
            onUpdateProfile={updatePatientProfile}
            onDeleteMemory={deleteMemoryPrompt}
            onBack={() => setCurrentPage('caregiver')}
          />
        );
      
      default:
        return null;
    }
  };

  return renderCurrentPage();
}

export default App;