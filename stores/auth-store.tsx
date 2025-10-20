import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AuthState, 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RefreshTokenResponse, 
  LogoutResponse, 
} from '@/types/auth';
import apiClient from '@/lib/api';

interface AuthStore extends AuthState {
  // Actions
  login: (provider: LoginCredentials['provider']) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (provider: LoginCredentials['provider']) => {
        if (provider === 'google') {
          // Google OAuth 로그인 - 서버로 리다이렉트
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
        }
        if (provider === 'kakao') {
          // Kakao OAuth 로그인 - 서버로 리다이렉트
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/kakao`;
        }
      },

      logout: async () => {
        const { accessToken } = get();
        
        try {
          set({ isLoading: true, error: null });
          
          // 서버에 로그아웃 요청 - ResponseEntity.ok(data) 형식으로 응답 처리
          if (accessToken) {
            const response = await apiClient.post<LogoutResponse>('/api/v1/auth/logout', {}, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            
            // ResponseEntity.ok(data) 응답 처리
            if (response.status !== 200) {
              console.warn('Logout warning:', response.data);
            }
          }
        } catch (error) {
          console.error('Logout error:', error);
          // 에러가 있어도 로컬 상태는 초기화
        } finally {
          // 로컬 상태 초기화
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post<RefreshTokenResponse>('/api/v1/auth/refresh', {}, {
            withCredentials: true, // 쿠키 포함
          });

          if (response.status === 200 && response.data) {
            const { accessToken, user } = response.data;
            
            set({
              accessToken,
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return true;
          } else {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Token refresh failed',
            });
            return false;
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Token refresh failed',
          });
          return false;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setAccessToken: (accessToken: string | null) => {
        set({ accessToken });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: async () => {
        const { accessToken } = get();
        
        if (!accessToken) {
          // 토큰이 없으면 refresh 시도
          await get().refreshToken();
          return;
        }

        // 토큰이 있으면 사용자 정보 확인
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.get<User>('/api/v1/auth/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // ResponseEntity.ok(data) 응답 처리
          if (response.status === 200 && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // 토큰이 유효하지 않으면 refresh 시도
            await get().refreshToken();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // 토큰이 유효하지 않으면 refresh 시도
          await get().refreshToken();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
