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
  isHydrated: boolean;
  // Actions
  setUser: (user: User) => void;
  setAccessToken: (accessToken: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,
      
      // Auth Actions
      setUser: (user: User) => set({ user }),
      setAccessToken: (accessToken: string | null) => set({ accessToken }),
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isHydrated: true }),

    }),
    { 
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // 즉시 hydration 완료로 설정
        state?.setHydrated(true);
      },
      // 더 빠른 hydration을 위한 설정
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);