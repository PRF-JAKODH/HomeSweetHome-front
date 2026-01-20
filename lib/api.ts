import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

// AuthType enum 정의
export enum AuthType {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  NONE = 'NONE'
}

// API Request Config 타입
export interface ApiRequestConfig extends AxiosRequestConfig {
  authType?: AuthType  // 기본값: AuthType.ACCESS_TOKEN
  skipErrorHandler?: boolean  // 개별 에러 처리 시 전역 핸들러 스킵
  _retry?: boolean  // 재시도 플래그 (내부용)
}

// auth-store에서 토큰 읽기/쓰기 함수
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return useAuthStore.getState().accessToken
}

function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return
  useAuthStore.getState().setAccessToken(token)
}

// 에러 메시지 매핑
const errorMessages = {
  400: '잘못된 요청입니다',
  401: '인증이 필요합니다',
  403: '접근 권한이 없습니다',
  404: '요청한 리소스를 찾을 수 없습니다',
  500: '서버 오류가 발생했습니다'
}

// 전역 에러 핸들러
function handleError(error: AxiosError, skipErrorHandler: boolean = false): void {
  if (skipErrorHandler) return
  
  const status = error.response?.status || 500
  const message = errorMessages[status as keyof typeof errorMessages] || '알 수 없는 오류가 발생했습니다'
  
  // toast 메시지 표시 (sonner 사용)
  if (typeof window !== 'undefined' && (window as any).toast) {
    (window as any).toast.error(message)
  } else {
    console.error('API Error:', message, error)
  }
}

// 토큰 갱신 상태 관리
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

// 토큰 갱신 함수
async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }
  
  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await refreshTokenClient.post('/api/v1/auth/refresh', {})
      
      if (response.status === 200 && response.data?.accessToken) {
        setAccessToken(response.data.accessToken)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      // refresh 실패 시 로그아웃 처리
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()
  
  return refreshPromise
}

// Base URL 설정
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// 1. AccessToken 클라이언트
const accessTokenClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 2. RefreshToken 클라이언트 (쿠키 사용)
const refreshTokenClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 3. Public 클라이언트 (인증 없음)
const publicClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// AccessToken 클라이언트 Request 인터셉터
accessTokenClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('Access token not found for authenticated request')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// AccessToken 클라이언트 Response 인터셉터 (자동 토큰 갱신)
accessTokenClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ApiRequestConfig
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshSuccess = await refreshAccessToken()
      if (refreshSuccess) {
        // 토큰 갱신 성공 시 원래 요청 재시도
        const newToken = getAccessToken()
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return accessTokenClient(originalRequest)
      }
    }
    
    handleError(error, originalRequest?.skipErrorHandler)
    return Promise.reject(error)
  }
)

// RefreshToken 클라이언트 Response 인터셉터
refreshTokenClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    handleError(error, (error.config as ApiRequestConfig)?.skipErrorHandler)
    return Promise.reject(error)
  }
)

// Public 클라이언트 Response 인터셉터
publicClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    handleError(error, (error.config as ApiRequestConfig)?.skipErrorHandler)
    return Promise.reject(error)
  }
)

// ApiClient 클래스
class ApiClient {
  private getClient(authType: AuthType = AuthType.ACCESS_TOKEN): AxiosInstance {
    switch (authType) {
      case AuthType.ACCESS_TOKEN:
        return accessTokenClient
      case AuthType.REFRESH_TOKEN:
        return refreshTokenClient
      case AuthType.NONE:
        return publicClient
      default:
        return accessTokenClient
    }
  }

  async get<T = any>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    const authType = config?.authType || AuthType.ACCESS_TOKEN
    const client = this.getClient(authType)

  console.log("🟦 ApiClient GET:", client.defaults.baseURL, url, config?.params)
    return client.get<T>(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    const authType = config?.authType || AuthType.ACCESS_TOKEN
    const client = this.getClient(authType)
    return client.post<T>(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    const authType = config?.authType || AuthType.ACCESS_TOKEN
    const client = this.getClient(authType)
    return client.put<T>(url, data, config)
  }

  async delete<T = any>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    const authType = config?.authType || AuthType.ACCESS_TOKEN
    const client = this.getClient(authType)
    return client.delete<T>(url, config)
  }

  async patch<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    const authType = config?.authType || AuthType.ACCESS_TOKEN
    const client = this.getClient(authType)
    return client.patch<T>(url, data, config)
  }
}

// 싱글톤 인스턴스 생성 및 export
const apiClient = new ApiClient()
export default apiClient
