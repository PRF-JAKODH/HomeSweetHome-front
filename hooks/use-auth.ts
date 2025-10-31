"use client"

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { logout as logoutApi, signup as signupApi, refreshToken as refreshTokenApi } from '@/api/auth-api'
import type { LoginCredentials, SignupRequest } from '@/types/auth'

type AuthAction = {
  login: (provider: LoginCredentials['provider']) => void
  signup: (signupRequest: SignupRequest) => Promise<boolean>
  refreshToken: () => Promise<boolean>
  logout: () => Promise<void>
  getIsAuthenticated: () => boolean
  clearError: () => void
}

type AuthState = {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isHydrated: boolean
}

type UseAuth = AuthAction & AuthState

export function useAuth (): UseAuth {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setUser = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  const login = useCallback((provider: LoginCredentials['provider']) => {
    if (typeof window === 'undefined') return
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/${provider}`
  }, [])

  const signup = useCallback(async (signupRequest: SignupRequest) => {
    setIsLoading(true)
    try {
      const response = await signupApi(signupRequest)
      if (response.status === 200 && response.data) {
        const { accessToken, user } = response.data
        setUser(user)
        setAccessToken(accessToken)
        setIsAuthenticated(true)
        setError(null)
        return true
      }
      setError('회원가입 실패')
      return false
    } catch (e) {
      setError('회원가입 실패')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setUser, setAccessToken, setIsAuthenticated])

  const refreshToken = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await refreshTokenApi()
      if (response.status === 200 && response.data) {
        const { accessToken, user } = response.data
        setUser(user)
        setAccessToken(accessToken)
        setIsAuthenticated(true)
        setError(null)
        return true
      }
      setError('토큰 갱신 실패')
      return false
    } catch (e) {
      setError('토큰 갱신 실패')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setUser, setAccessToken, setIsAuthenticated])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await logoutApi()
      if (response.status === 200 && response.data) {
        setError(null)
      } else {
        setError('로그아웃 실패')
      }
    } catch (e) {
      setError('로그아웃 실패')
    } finally {
      clearAuth()
      setIsLoading(false)
    }
  }, [clearAuth])

  const clearError = useCallback(() => setError(null), [])
  const getIsAuthenticated = useCallback(() => isAuthenticated, [isAuthenticated])

  return {
    isLoading,
    error,
    clearError,
    login,
    signup,
    refreshToken,
    logout,
    getIsAuthenticated,
    isAuthenticated,
    isHydrated,
  }
}

export function useRedirectIfAuthenticated (redirectTo: string) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) router.push(redirectTo)
  }, [isAuthenticated, redirectTo, router])
}