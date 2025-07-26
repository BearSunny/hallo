import React, { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Clock, Pill, User, Heart, Save, X, Volume2, Play } from 'lucide-react';
import { Medication, PatientProfile, MemoryPrompt } from '../types';
import { ReminderEngine } from '../backend/ReminderEngine';
import { MemoryEngine } from '../backend/MemoryEngine';
import { geminiAI } from '../services/geminiAI';

interface ManagementPageProps {
  medications: Medication[];
  patientProfile: PatientProfile | null;
  memoryPrompts: MemoryPrompt[];
  onUpdateMedication: (id: string, medication: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onUpdateProfile: (profile: PatientProfile) => void;
  onDeleteMemory: (id: string) => void;
  onBack: () => void;
}

const ManagementPage: React.FC<ManagementPageProps> = ({
  medications,
  patientProfile,
  memoryPrompts,
  onUpdateMedication,
  onDeleteMedication,
  onUpdateProfile,
  onDeleteMemory,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'medications' | 'profile' | 'memories'>('medications');
  const [editingMed, setEditingMed] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editMedData, setEditMedData] = useState<Medication | null>(null);
  const [editProfileData, setEditProfileData] = useState<PatientProfile | null>(null);
  const [isTestingSpeech, setIsTestingSpeech] = useState(false);

  const reminderEngine = new ReminderEngine();
  const memoryEngine = new MemoryEngine();

  const testMedicationReminder = (medication: Medication) => {
    setIsTestingSpeech(true);
    const reminderMessage = `It's time for your ${medication.name}${medication.dosage ? `. Please take ${medication.dosage}` : ''}${medication.notes ? `. Remember: ${medication.notes}` : ''}. Please take your medication now.`;
    
    geminiAI.speak(reminderMessage).then(() => {
      setIsTestingSpeech(false);
    }).catch((error) => {
      console.error('Speech test error:', error);
      setIsTestingSpeech(false);
    });
  };

  const testMemoryPrompt = () => {
    if (patientProfile && memoryPrompts.length > 0) {
      setIsTestingSpeech(true);
      
      // Use Gemini AI to generate a more personalized memory prompt
      geminiAI.generateMemoryPrompt(patientProfile).then((prompt) => {
        return geminiAI.speak(prompt);
      }).then(() => {
        setIsTestingSpeech(false);
      }).catch((error) => {
        console.error('Memory prompt test error:', error);
        // Fallback to local memory engine
        const fallbackPrompt = memoryEngine.generateMemoryPrompt(patientProfile, memoryPrompts);
        geminiAI.speak(fallbackPrompt).finally(() => {
          setIsTestingSpeech(false);
        });
      });
    } else {
      setIsTestingSpeech(true);
      const fallbackPrompt = "Hello! I'm here to help you today. How are you feeling?";
      
      geminiAI.speak(fallbackPrompt).then(() => {
        setIsTestingSpeech(false);
      }).catch((error) => {
        console.error('Speech test error:', error);
        setIsTestingSpeech(false);
      });
    }
  };

  const testWellnessCheck = () => {
    setIsTestingSpeech(true);
    const wellnessMessage = memoryEngine.generateWellnessCheck();
    
    geminiAI.speak(wellnessMessage).then(() => {
      setIsTestingSpeech(false);
    }).catch((error) => {
      console.error('Wellness check test error:', error);
      setIsTestingSpeech(false);
    });
  };

  const testEncouragement = () => {
    setIsTestingSpeech(true);
    const encouragementMessage = memoryEngine.generateEncouragement();
    
    geminiAI.speak(encouragementMessage).then(() => {
      setIsTestingSpeech(false);
    }).catch((error) => {
      console.error('Encouragement test error:', error);
      setIsTestingSpeech(false);
    });
  };

  const startEditMedication = (medication: Medication) => {
    setEditingMed(medication.id);
    setEditMedData({ ...medication });
  };

  const saveEditMedication = () => {
    if (editMedData && editingMed) {
      onUpdateMedication(editingMed, editMedData);
      setEditingMed(null);
      setEditMedData(null);
    }
  };

  const cancelEditMedication = () => {
    setEditingMed(null);
    setEditMedData(null);
  };

  const startEditProfile = () => {
    setEditingProfile(true);
    setEditProfileData(patientProfile ? { ...patientProfile } : {
      name: '',
      age: undefined,
      familyMembers: [],
      personalMemories: [],
      importantDates: [],
      preferences: {}
    });
  };

  const saveEditProfile = () => {
    if (editProfileData) {
      onUpdateProfile(editProfileData);
      setEditingProfile(false);
      setEditProfileData(null);
    }
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
    setEditProfileData(null);
  };

  const removeFamilyMember = (index: number) => {
    if (editProfileData) {
      setEditProfileData({
        ...editProfileData,
        familyMembers: editProfileData.familyMembers.filter((_, i) => i !== index)
      });
    }
  };

  const removePersonalMemory = (index: number) => {
    if (editProfileData) {
      setEditProfileData({
        ...editProfileData,
        personalMemories: editProfileData.personalMemories.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-12">
          <button
            onClick={onBack}
            className="mr-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={24} className="text-green-600" />
          </button>
          <h1 className="text-4xl font-bold text-gray-800">Manage Information</h1>
        </div>

        {/* Voice Testing Panel */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Volume2 size={28} className="mr-3" />
            Voice Feature Testing
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={testMemoryPrompt}
              disabled={isTestingSpeech}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white p-4 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              <Play size={20} className="mr-2" />
              Test Memory Prompt
            </button>
            <button
              onClick={testWellnessCheck}
              disabled={isTestingSpeech}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white p-4 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              <Heart size={20} className="mr-2" />
              Test Wellness Check
            </button>
            <button
              onClick={testEncouragement}
              disabled={isTestingSpeech}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white p-4 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              <Heart size={20} className="mr-2" />
              Test Encouragement
            </button>
            <div className="bg-white/20 rounded-xl p-4 flex items-center justify-center">
              <span className={`text-sm ${isTestingSpeech ? 'animate-pulse' : ''}`}>
                {isTestingSpeech ? '🔊 Speaking...' : '🔇 Ready to test'}
              </span>
            </div>
          </div>
          <p className="text-blue-100 mt-4 text-sm">
            💡 Make sure your browser audio is enabled and volume is up to hear the voice prompts
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('medications')}
              className={`flex-1 py-6 px-8 text-xl font-semibold transition-colors duration-200 ${
                activeTab === 'medications'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Pill className="inline mr-3" size={24} />
              Medications ({medications.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-6 px-8 text-xl font-semibold transition-colors duration-200 ${
                activeTab === 'profile'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="inline mr-3" size={24} />
              Profile & Family
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`flex-1 py-6 px-8 text-xl font-semibold transition-colors duration-200 ${
                activeTab === 'memories'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className="inline mr-3" size={24} />
              Memories ({memoryPrompts.length})
            </button>
          </div>

          <div className="p-12">
            {/* Medications Tab */}
            {activeTab === 'medications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Medication Schedule</h2>
                {medications.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill size={64} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">No medications added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((medication) => (
                      <div key={medication.id} className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border-l-4 border-green-500">
                        {editingMed === medication.id && editMedData ? (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={editMedData.name}
                                onChange={(e) => setEditMedData({ ...editMedData, name: e.target.value })}
                                className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="Medication name"
                              />
                              <input
                                type="time"
                                value={editMedData.time}
                                onChange={(e) => setEditMedData({ ...editMedData, time: e.target.value })}
                                className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                              />
                            </div>
                            <input
                              type="text"
                              value={editMedData.dosage || ''}
                              onChange={(e) => setEditMedData({ ...editMedData, dosage: e.target.value })}
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                              placeholder="Dosage"
                            />
                            <textarea
                              value={editMedData.notes || ''}
                              onChange={(e) => setEditMedData({ ...editMedData, notes: e.target.value })}
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                              rows={3}
                              placeholder="Notes"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={saveEditMedication}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                              >
                                <Save size={16} className="mr-2" />
                                Save
                              </button>
                              <button
                                onClick={cancelEditMedication}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center"
                              >
                                <X size={16} className="mr-2" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <Pill size={20} className="text-green-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-800">{medication.name}</h3>
                              </div>
                              <div className="flex items-center mb-2">
                                <Clock size={16} className="text-gray-500 mr-2" />
                                <span className="text-lg text-gray-600">{medication.time}</span>
                                {medication.dosage && (
                                  <span className="ml-4 text-lg text-gray-600">• {medication.dosage}</span>
                                )}
                              </div>
                              {medication.notes && (
                                <p className="text-gray-600 mt-2">{medication.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => testMedicationReminder(medication)}
                                disabled={isTestingSpeech}
                                className="p-2 text-blue-600 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors duration-200"
                                title="Test voice reminder"
                              >
                                <Volume2 size={18} />
                              </button>
                              <button
                                onClick={() => startEditMedication(medication)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => onDeleteMedication(medication.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Patient Profile & Family</h2>
                  {!editingProfile && (
                    <button
                      onClick={startEditProfile}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                    >
                      <Edit2 size={18} className="mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {editingProfile && editProfileData ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={editProfileData.name}
                          onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Age</label>
                        <input
                          type="number"
                          value={editProfileData.age || ''}
                          onChange={(e) => setEditProfileData({ ...editProfileData, age: parseInt(e.target.value) || undefined })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-4">Family Members</label>
                      <div className="space-y-2">
                        {editProfileData.familyMembers.map((member, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span>{member.name} - {member.relationship}</span>
                            <button
                              onClick={() => removeFamilyMember(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-4">Personal Memories</label>
                      <div className="space-y-2">
                        {editProfileData.personalMemories.map((memory, index) => (
                          <div key={index} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="flex-1">{memory}</span>
                            <button
                              onClick={() => removePersonalMemory(index)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveEditProfile}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                      >
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEditProfile}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center"
                      >
                        <X size={18} className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {patientProfile ? (
                      <>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-600">Name:</span>
                              <p className="text-lg font-medium">{patientProfile.name}</p>
                            </div>
                            {patientProfile.age && (
                              <div>
                                <span className="text-gray-600">Age:</span>
                                <p className="text-lg font-medium">{patientProfile.age}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {patientProfile.familyMembers.length > 0 && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Family Members</h3>
                            <div className="space-y-2">
                              {patientProfile.familyMembers.map((member, index) => (
                                <div key={index} className="flex items-center">
                                  <User size={16} className="text-purple-600 mr-3" />
                                  <span className="text-lg">{member.name} - {member.relationship}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {patientProfile.personalMemories.length > 0 && (
                          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Memories</h3>
                            <div className="space-y-3">
                              {patientProfile.personalMemories.map((memory, index) => (
                                <div key={index} className="flex items-start">
                                  <Heart size={16} className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                                  <p className="text-gray-700">{memory}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <User size={64} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-xl text-gray-500">No profile information added yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Memories Tab */}
            {activeTab === 'memories' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Memory Prompts</h2>
                {memoryPrompts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={64} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">No memory prompts added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memoryPrompts.map((memory) => (
                      <div key={memory.id} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border-l-4 border-pink-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Heart size={20} className="text-pink-600 mr-3" />
                              <span className="text-sm font-medium text-pink-600 uppercase tracking-wide">
                                {memory.type} • {memory.frequency}
                              </span>
                            </div>
                            <p className="text-lg text-gray-700 leading-relaxed">{memory.content}</p>
                          </div>
                          <button
                            onClick={() => onDeleteMemory(memory.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 ml-4"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;