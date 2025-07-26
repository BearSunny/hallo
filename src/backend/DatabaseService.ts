import { Medication, PatientProfile, MemoryPrompt, CaregiverAccount } from '../types';

export class DatabaseService {
  private accountKey = 'caregiver_accounts';
  private currentUserKey = 'current_user';

  getAccounts(): CaregiverAccount[] {
    const raw = localStorage.getItem(this.accountKey);
    return raw ? JSON.parse(raw) : [];
  }

  saveAccounts(accounts: CaregiverAccount[]) {
    localStorage.setItem(this.accountKey, JSON.stringify(accounts));
  }

  getCurrentUser(): CaregiverAccount | null {
    const raw = localStorage.getItem(this.currentUserKey);
    return raw ? JSON.parse(raw) : null;
  }

  setCurrentUser(user: CaregiverAccount) {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  logoutUser() {
    localStorage.removeItem(this.currentUserKey);
  }

  registerUser(username: string, password: string): boolean {
    const users = this.getAccounts();
    if (users.find(u => u.username === username)) return false;
    const newUser = { id: Date.now().toString(), username, password };
    this.saveAccounts([...users, newUser]);
    this.setCurrentUser(newUser);
    return true;
  }

  loginUser(username: string, password: string): boolean {
    const users = this.getAccounts();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return false;
    this.setCurrentUser(user);
    return true;
  }

  private readonly MEDICATIONS_KEY = 'halo_medications';
  private readonly PROFILE_KEY = 'halo_patient_profile';
  private readonly MEMORIES_KEY = 'halo_memory_prompts';

  // Medication methods
  saveMedications(medications: Medication[]): void {
    const user = this.getCurrentUser();
    if (!user) return;
    
    try {
      localStorage.setItem(`medications_${user.id}`, JSON.stringify(medications));
    } catch (error) {
      console.error('Failed to save medications:', error);
    }
  }

  getMedications(): Medication[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    try {
      const data = localStorage.getItem(`medications_${user.id}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load medications:', error);
      return [];
    }
  }

  // Patient profile methods
  savePatientProfile(profile: PatientProfile): void {
    const user = this.getCurrentUser();
    if (!user) return;

    try {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save patient profile:', error);
    }
  }

  getPatientProfile(): PatientProfile | null {
    try {
      const data = localStorage.getItem(this.PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load patient profile:', error);
      return null;
    }
  }

  // Memory prompts methods
  saveMemoryPrompts(prompts: MemoryPrompt[]): void {
    const user = this.getCurrentUser();
    if (!user) return;

    try {
      localStorage.setItem(`prompts_${user.id}`, JSON.stringify(prompts));
    } catch (error) {
      console.error('Failed to save memory prompts:', error);
    }
  }

  getMemoryPrompts(): MemoryPrompt[] {
    try {
      const data = localStorage.getItem(this.MEMORIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load memory prompts:', error);
      return [];
    }
  }

  // Utility methods
  clearAllData(): void {
    try {
      localStorage.removeItem(this.MEDICATIONS_KEY);
      localStorage.removeItem(this.PROFILE_KEY);
      localStorage.removeItem(this.MEMORIES_KEY);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  exportData(): string {
    try {
      const data = {
        medications: this.getMedications(),
        profile: this.getPatientProfile(),
        memories: this.getMemoryPrompts(),
        exportDate: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.medications) {
        this.saveMedications(data.medications);
      }
      
      if (data.profile) {
        this.savePatientProfile(data.profile);
      }
      
      if (data.memories) {
        this.saveMemoryPrompts(data.memories);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}