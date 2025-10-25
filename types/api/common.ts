/**
 * 공통 API 응답 형식 및 페이지네이션 타입 정의
 */

// 공통 API 응답 형식
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

// 에러 응답 형식
export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// 페이지네이션 요청 파라미터
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 정렬 옵션
export type SortOption = 'popular' | 'latest' | 'price_asc' | 'price_desc'

// 필터 옵션
export interface FilterOptions {
  category?: string
  subCategory?: string
  minPrice?: number
  maxPrice?: number
  brand?: string
  rating?: number
  inStock?: boolean
}

// 검색 파라미터
export interface SearchParams extends PaginationParams {
  query?: string
  filters?: FilterOptions
}
