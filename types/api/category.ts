/**
 * 카테고리 관련 타입 정의
 */

import { ApiResponse } from './common'

// 카테고리 기본 정보
export interface Category {
  id: number
  name: string
  parentId: number | null
  depth: number
  createdAt: string
  updatedAt: string
}

// 카테고리 생성 요청
export interface CreateCategoryRequest {
  name: string
  parentId?: number
}

// 카테고리 수정 요청
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number
}

// 카테고리 목록 조회 요청
export interface GetCategoriesRequest {
  parentId?: number
  depth?: number
}

// 카테고리 목록 응답
export type GetCategoriesResponse = ApiResponse<Category[]>

// 카테고리 상세 조회 응답
export type GetCategoryResponse = ApiResponse<Category>

// 카테고리 생성 응답
export type CreateCategoryResponse = ApiResponse<Category>

// 카테고리 수정 응답
export type UpdateCategoryResponse = ApiResponse<Category>

// 카테고리 삭제 응답
export type DeleteCategoryResponse = ApiResponse<{ id: number }>

// 카테고리 트리 구조
export interface CategoryTree extends Category {
  children?: CategoryTree[]
}
