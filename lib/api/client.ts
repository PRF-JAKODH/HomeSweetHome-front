/**
 * API 클라이언트 기본 설정
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse } from '@/types/api/common'

// API 클라이언트 클래스
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // JWT 토큰 자동 첨부
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 사용자 ID 헤더는 장바구니 API에서만 개별적으로 추가

        // 요청 로깅
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
        
        return config
      },
      (error) => {
        console.error('[API Request Error]', error)
        return Promise.reject(error)
      }
    )

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // 응답 로깅
        console.log(`[API Response] ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        // 에러 처리
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  // 사용자 ID 가져오기 함수 (장바구니 API에서 사용)
  getUserId(): string | null {
    if (typeof window === 'undefined') return null
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage)
        return parsed.state?.user?.id?.toString() || '1' // 기본값 1
      } catch {
        return '1' // 기본값 1
      }
    }
    return '1' // 기본값 1
  }

  private handleError(error: any) {
    console.error('[API Error]', error)

    if (error.response?.status === 401) {
      // 401 에러 시 자동 로그아웃
      this.logout()
    }
  }

  private logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
  }

  // HTTP 메서드들
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    // 백엔드에서 직접 데이터를 반환하므로 response.data가 실제 데이터
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient()
