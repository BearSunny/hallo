export class TTSEngine {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeVoice();
  }

  private initializeVoice() {
    const setVoice = () => {
      const voices = this.synthesis.getVoices();
      console.log('🎤 Available voices:', voices.map(v => v.name));
      
      // Prefer a clear, calm voice
      this.voice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex') ||
        voice.default
      ) || voices[0] || null;
      
      if (this.voice) {
        console.log('🎤 Selected voice:', this.voice.name);
      } else {
        console.warn('⚠️ No voice available');
      }
    };

    if (this.synthesis.getVoices().length > 0) {
      setVoice();
    } else {
      this.synthesis.addEventListener('voiceschanged', setVoice);
    }
  }

  speak(text: string, onComplete?: () => void): void {
    console.log('🔊 TTSEngine.speak called with text:', text);
    
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech parameters for elderly users
    utterance.rate = 0.8; // Slower speech rate
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 0.9; // High volume
    
    if (this.voice) {
      utterance.voice = this.voice;
      console.log('🎤 Using voice:', this.voice.name);
    } else {
      console.warn('⚠️ No voice selected, using default');
    }

    utterance.onstart = () => {
      console.log('🔊 Speech started');
    };

    utterance.onend = () => {
      console.log('✅ Speech ended');
      if (onComplete) onComplete();
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech error:', event.error);
      if (onComplete) onComplete();
    };

    console.log('🚀 Starting speech synthesis...');
    this.synthesis.speak(utterance);
  }

  stop(): void {
    console.log('🛑 Stopping speech synthesis');
    this.synthesis.cancel();
  }

  isSupported(): boolean {
    const supported = 'speechSynthesis' in window;
    console.log('🎤 TTS supported:', supported);
    return supported;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }
}