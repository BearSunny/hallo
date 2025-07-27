import axios from 'axios';
import { Medication, PatientProfile, MemoryPrompt } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
  message: string;
}

export interface ConversationResponse {
  response: string;
}

export interface AnalyticsData {
  recentConversations: Array<{
    patientInput: string;
    aiResponse: string;
    timestamp: string;
    sentiment: string;
    context: string;
  }>;
  medicationCount: number;
  memoryPromptCount: number;
  totalInteractions: number;
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
};

// Patient Profile API
export const profileAPI = {
  get: async (): Promise<PatientProfile | null> => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  save: async (profile: PatientProfile): Promise<PatientProfile> => {
    const response = await api.post('/profile', profile);
    return response.data;
  },
};

// Medications API
export const medicationsAPI = {
  getAll: async (): Promise<Medication[]> => {
    const response = await api.get('/medications');
    return response.data.map((med: any) => ({
      ...med,
      id: med._id, // Convert MongoDB _id to id
    }));
  },

  create: async (medication: Omit<Medication, 'id'>): Promise<Medication> => {
    const response = await api.post('/medications', medication);
    return {
      ...response.data,
      id: response.data._id,
    };
  },

  update: async (id: string, medication: Medication): Promise<Medication> => {
    const response = await api.put(`/medications/${id}`, medication);
    return {
      ...response.data,
      id: response.data._id,
    };
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/medications/${id}`);
  },
};

// Memory Prompts API
export const memoryPromptsAPI = {
  getAll: async (): Promise<MemoryPrompt[]> => {
    const response = await api.get('/memory-prompts');
    return response.data.map((prompt: any) => ({
      ...prompt,
      id: prompt._id,
    }));
  },

  create: async (prompt: Omit<MemoryPrompt, 'id'>): Promise<MemoryPrompt> => {
    const response = await api.post('/memory-prompts', prompt);
    return {
      ...response.data,
      id: response.data._id,
    };
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/memory-prompts/${id}`);
  },
};

// AI Conversation API
export const conversationAPI = {
  sendMessage: async (message: string, context?: string): Promise<ConversationResponse> => {
    const response = await api.post('/conversation', { message, context });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  get: async (): Promise<AnalyticsData> => {
    const response = await api.get('/analytics');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string; database: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;