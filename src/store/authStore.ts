import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';

type UserRole = 'jobseeker' | 'employer' | 'admin';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profile?: {
    title?: string;
    bio?: string;
    skills?: string[];
    experience?: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
    }>;
    education?: Array<{
      school: string;
      degree: string;
      field: string;
      startDate: string;
      endDate?: string;
      current: boolean;
    }>;
  };
  company?: {
    name: string;
    position: string;
    website: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: localStorage.getItem('token'),
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { user, token } = await authApi.login({ email, password });
          localStorage.setItem('token', token);
          set({ user: user as unknown as User, token, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to login',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const { user, token } = await authApi.register(data);
          localStorage.setItem('token', token);
          set({ user: user as unknown as User, token, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to register',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
        window.location.href = '/login';
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const updatedUser = await authApi.updateProfile(data);
          set({ user: updatedUser as User, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update profile',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;