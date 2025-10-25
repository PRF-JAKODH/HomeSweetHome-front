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
export interface ErrorResponse {
  status: number
  message: string
  timestamp: string
}

// 무한 스크롤 응답 (커서 기반)
export interface ScrollResponse<T> {
  contents: T[]
  nextCursorId: number | null
  hasNext: boolean
}