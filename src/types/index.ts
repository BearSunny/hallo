export interface Medication {
  id: string;
  name: string;
  time: string; // HH:MM format
  notes?: string;
  dosage?: string;
  lastRemindedAt?: string;
}

export interface CaregiverAccount {
  id: string;
  username: string;
  password: string;
}

export interface PatientProfile {
  name: string;
  age?: number;
  familyMembers: FamilyMember[];
  personalMemories: string[];
  importantDates: ImportantDate[];
  preferences: {
    favoriteColor?: string;
    favoriteFood?: string;
    hobbies?: string[];
  };
}

export interface FamilyMember {
  name: string;
  relationship: string;
  photo?: string;
}

export interface ImportantDate {
  date: string;
  description: string;
  type: 'birthday' | 'anniversary' | 'other';
}

export interface MemoryPrompt {
  id: string;
  type: 'identity' | 'family' | 'memory' | 'routine';
  content: string;
  frequency: 'daily' | 'weekly' | 'occasional';
}

// Extend the Window interface to include Speech Recognition
type SpeechRecognition = any;
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}