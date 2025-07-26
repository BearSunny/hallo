import { Medication, PatientProfile, MemoryPrompt, CaregiverAccount } from '../types';
import { authAPI, profileAPI, medicationsAPI, memoryPromptsAPI } from '../services/api';

export class DatabaseService {
  // Keep localStorage as fallback for offline mode
  private readonly FALLBACK_MODE = false; // Set to true for offline development

  async registerUser(username: string, password: string): Promise<boolean> {
    try {
      const response = await authAPI.register(username, password);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  }

  async loginUser(username: string, password: string): Promise<boolean> {
    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  getCurrentUser(): CaregiverAccount | null {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  }

  logoutUser() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  // Medication methods
  async saveMedications(medications: Medication[]): Promise<void> {
    // This method is kept for compatibility but individual operations are preferred
    console.warn('saveMedications is deprecated. Use individual create/update operations.');
  }

  async getMedications(): Promise<Medication[]> {
    try {
      return await medicationsAPI.getAll();
    } catch (error) {
      console.error('Failed to load medications:', error);
      return [];
    }
  }

  async addMedication(medication: Omit<Medication, 'id'>): Promise<Medication | null> {
    try {
      return await medicationsAPI.create(medication);
    } catch (error) {
      console.error('Failed to add medication:', error);
      return null;
    }
  }

  async updateMedication(id: string, medication: Medication): Promise<boolean> {
    try {
      await medicationsAPI.update(id, medication);
      return true;
    } catch (error) {
      console.error('Failed to update medication:', error);
      return false;
    }
  }

  async deleteMedication(id: string): Promise<boolean> {
    try {
      await medicationsAPI.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete medication:', error);
      return false;
    }
  }

  // Patient profile methods
  async savePatientProfile(profile: PatientProfile): Promise<void> {
    try {
      await profileAPI.save(profile);
    } catch (error) {
      console.error('Failed to save patient profile:', error);
    }
  }

  async getPatientProfile(): Promise<PatientProfile | null> {
    try {
      return await profileAPI.get();
    } catch (error) {
      console.error('Failed to load patient profile:', error);
      return null;
    }
  }

  // Memory prompts methods
  async saveMemoryPrompts(prompts: MemoryPrompt[]): Promise<void> {
    // This method is kept for compatibility but individual operations are preferred
    console.warn('saveMemoryPrompts is deprecated. Use individual create operations.');
  }

  async getMemoryPrompts(): Promise<MemoryPrompt[]> {
    try {
      return await memoryPromptsAPI.getAll();
    } catch (error) {
      console.error('Failed to load memory prompts:', error);
      return [];
    }
  }

  async addMemoryPrompt(prompt: Omit<MemoryPrompt, 'id'>): Promise<MemoryPrompt | null> {
    try {
      return await memoryPromptsAPI.create(prompt);
    } catch (error) {
      console.error('Failed to add memory prompt:', error);
      return null;
    }
  }

  async deleteMemoryPrompt(id: string): Promise<boolean> {
    try {
      await memoryPromptsAPI.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete memory prompt:', error);
      return false;
    }
  }

  // Utility methods - kept for backward compatibility
  clearAllData(): void {
    console.warn('clearAllData is deprecated. Data is now stored in MongoDB.');
  }

  exportData(): string {
    console.warn('exportData is deprecated. Use the analytics API instead.');
    return '';
  }

  importData(jsonData: string): boolean {
    console.warn('importData is deprecated. Use individual API methods instead.');
    return false;
  }
}