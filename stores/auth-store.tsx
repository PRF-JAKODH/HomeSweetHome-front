import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  LoginCredentials,
  SignupRequest,
} from '@/types/auth';

type AuthStore = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  // Actions
  setUser: (user: User) => void;
  setAccessToken: (accessToken: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      
      // Auth Actions
      setUser: (user: User) => set({ user }),
      setAccessToken: (accessToken: string | null) => set({ accessToken }),
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),

    }),
    { name: 'auth-storage' }
  )
);