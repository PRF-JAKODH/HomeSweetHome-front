import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

/**
 * 기본 인증 훅 - 모든 인증 관련 상태와 액션을 제공
 * @param redirectTo - 인증되지 않은 경우 리다이렉트할 경로 (선택사항)
 */
export function useAuth(redirectTo?: string) {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    error, 
    clearError, 
    login, 
    signup, 
    logout,
    refreshToken,
    initializeAuth 
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    clearError,
    login,
    signup,
    logout,
    refreshToken,
    initializeAuth,
  };
}

/**
 * 인증이 필요한 페이지에서 사용하는 훅
 * 인증되지 않은 경우 지정된 경로로 리다이렉트
 * @param redirectTo - 리다이렉트할 경로 (기본값: '/login')
 */
export function useRequireAuth(redirectTo: string = '/login') {
  return useAuth(redirectTo);
}

/**
 * 이미 인증된 사용자를 리다이렉트하는 훅
 * 로그인 페이지에서 사용하여 이미 로그인한 사용자를 다른 페이지로 보냄
 * @param redirectTo - 리다이렉트할 경로 (기본값: '/dashboard')
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}
