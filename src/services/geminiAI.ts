import { GoogleGenerativeAI } from '@google/generative-ai';
import { PatientProfile, Medication } from '../types';

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Gemini API key not found. Using fallback responses.');
      this.genAI = null as any;
      this.model = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log("✅ Gemini API Key set up successfully with gemini-1.5-flash model!")
  }

  async generateResponse(
    userInput: string,
    context: {
      patientProfile?: PatientProfile | null;
      medications?: Medication[];
      conversationHistory?: string[];
    } = {}
  ): Promise<string> {
    // Fallback for when API key is not available
    if (!this.model) {
      return this.getFallbackResponse(userInput, context);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const fullPrompt = `${systemPrompt}\n\nPatient says: "${userInput}"\n\nRespond as a caring, patient AI companion:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Gemini AI error:', error);
      return this.getFallbackResponse(userInput, context);
    }
  }

  private buildSystemPrompt(context: {
    patientProfile?: PatientProfile | null;
    medications?: Medication[];
    conversationHistory?: string[];
  }): string {
    let prompt = `You are a compassionate AI companion designed to help elderly patients with Alzheimer's disease. Your role is to:

1. Provide emotional support and companionship
2. Help with medication reminders when appropriate
3. Engage in memory exercises and conversations
4. Maintain a calm, patient, and understanding tone
5. Use simple, clear language
6. Be encouraging and positive
7. Help orient the patient to time, place, and identity when needed

Guidelines:
- Keep responses concise but warm (1-3 sentences)
- Use the patient's name when you know it
- Be patient if they repeat questions
- Redirect gently if they seem confused
- Offer comfort and reassurance
- Avoid complex medical advice
- Focus on the present moment and immediate needs`;

    if (context.patientProfile) {
      prompt += `\n\nPatient Information:
- Name: ${context.patientProfile.name}
- Age: ${context.patientProfile.age || 'Not specified'}
- Family: ${context.patientProfile.familyMembers.map(f => `${f.name} (${f.relationship})`).join(', ')}
- Personal memories: ${context.patientProfile.personalMemories.join(', ')}`;
    }

    if (context.medications && context.medications.length > 0) {
      prompt += `\n\nCurrent Medications:
${context.medications.map(med => `- ${med.name} at ${med.time}${med.dosage ? ` (${med.dosage})` : ''}`).join('\n')}`;
    }

    return prompt;
  }

  private getFallbackResponse(userInput: string, context: any): string {
    const lowerInput = userInput.toLowerCase();
    const name = context.patientProfile?.name || '';
    
    // More specific medication-related responses
    if (lowerInput.includes('medication') || lowerInput.includes('medicine') || lowerInput.includes('pill') || lowerInput.includes('take')) {
      if (context.medications && context.medications.length > 0) {
        const nextMed = context.medications[0]; // Could be improved to find next due medication
        return `${name}, I see you have ${context.medications.length} medication${context.medications.length > 1 ? 's' : ''} scheduled. Your next one is ${nextMed.name} at ${nextMed.time}. It's important to take your medicines as prescribed.`;
      }
      return `${name}, I understand you're asking about medication. Please speak with your caregiver about your medication schedule.`;
    }
    
    // Pain or discomfort - more empathetic
    if (lowerInput.includes('hurt') || lowerInput.includes('pain') || lowerInput.includes('sick') || lowerInput.includes('feel bad')) {
      return `${name}, I'm sorry you're not feeling well. Your comfort is important. Please let your caregiver know about any pain or discomfort you're experiencing so they can help you feel better.`;
    }
    
    // Family-related - more personal
    if (lowerInput.includes('family') || lowerInput.includes('daughter') || lowerInput.includes('son') || lowerInput.includes('wife') || lowerInput.includes('husband') || lowerInput.includes('children')) {
      return `${name}, your family loves you very much. They care about you deeply and want you to be comfortable and happy. You mean the world to them.`;
    }
    
    // Confusion or memory - more supportive
    if (lowerInput.includes('confused') || lowerInput.includes('remember') || lowerInput.includes('forgot') || lowerInput.includes('lost') || lowerInput.includes('where am i')) {
      return `${name}, it's completely okay to feel confused sometimes. You're safe and cared for. I'm here with you, and you're not alone. Take a deep breath - everything is going to be alright.`;
    }
    
    // Time-related questions
    if (lowerInput.includes('time') || lowerInput.includes('day') || lowerInput.includes('date')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `${name}, it's ${timeStr} on ${dateStr}. You're doing well today.`;
    }
    
    // Greetings - more personalized
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('good morning') || lowerInput.includes('good afternoon') || lowerInput.includes('good evening')) {
      const hour = new Date().getHours();
      let greeting = 'Hello';
      if (hour < 12) greeting = 'Good morning';
      else if (hour < 17) greeting = 'Good afternoon';
      else greeting = 'Good evening';
      
      return `${greeting} ${name}! It's wonderful to see you today. How are you feeling right now?`;
    }
    
    // Questions about wellbeing
    if (lowerInput.includes('how are you') || lowerInput.includes('feeling') || lowerInput.includes('okay') || lowerInput.includes('alright')) {
      return `Thank you for asking, ${name}. I'm here and ready to help you. More importantly, how are you feeling today? Is there anything I can do to make you more comfortable?`;
    }
    
    // Help requests
    if (lowerInput.includes('help') || lowerInput.includes('need') || lowerInput.includes('want') || lowerInput.includes('can you')) {
      return `${name}, I'm here to help you in any way I can. I can remind you about medications, chat with you, or help you feel more comfortable. What would you like me to help you with?`;
    }
    
    // Default supportive response - more contextual
    return `I hear what you're saying, ${name}. Thank you for sharing that with me. I'm here to listen and support you. Is there anything specific I can help you with right now?`;
  }

  async generateMemoryPrompt(patientProfile: PatientProfile): Promise<string> {
    if (!this.model) {
      return this.getFallbackMemoryPrompt(patientProfile);
    }

    try {
      const prompt = `Generate a gentle, personalized memory prompt for an elderly patient with Alzheimer's. 

Patient details:
- Name: ${patientProfile.name}
- Age: ${patientProfile.age}
- Family: ${patientProfile.familyMembers.map(f => `${f.name} (${f.relationship})`).join(', ')}
- Memories: ${patientProfile.personalMemories.join(', ')}

Create a warm, encouraging prompt that helps them remember something positive. Keep it simple and comforting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Gemini AI memory prompt error:', error);
      return this.getFallbackMemoryPrompt(patientProfile);
    }
  }

  private getFallbackMemoryPrompt(patientProfile: PatientProfile): string {
    const prompts = [
      `Hello ${patientProfile.name}! Do you remember any happy times with your family? They think about you often.`,
      `${patientProfile.name}, you have lived such a rich life. What's one thing that always makes you smile?`,
      `Good day, ${patientProfile.name}! Your family loves you very much. Can you tell me about a favorite memory?`,
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  // Text-to-Speech using Web Speech API with Gemini-optimized content
  async speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.error('❌ Speech synthesis not supported');
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optimize for elderly users
      utterance.rate = options.rate || 0.8; // Slower speech
      utterance.pitch = options.pitch || 1.0; // Normal pitch
      utterance.volume = options.volume || 0.9; // High volume
      
      // Try to use a clear, pleasant voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha') ||
        voice.default
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

      window.speechSynthesis.speak(utterance);
    });
  }

  // Speech-to-Text using Web Speech API
  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): () => void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError('Speech recognition not supported in this browser');
      return () => {};
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      // Auto-restart if needed
      console.log('🎤 Speech recognition ended');
    };

    recognition.start();

    // Return stop function
    return () => {
      recognition.stop();
    };
  }
}

export const geminiAI = new GeminiAIService();
export default geminiAI;