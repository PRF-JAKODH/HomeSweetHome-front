/**
 * 카테고리 관련 타입 정의
 */

import { ApiResponse } from './common'

// 카테고리 기본 정보
export interface Category {
  id: number
  name: string
  parentId: number | null  // 최상단 카테고리는 null, 하위 카테고리는 number
  depth: number
  createdAt: string
  updatedAt: string
}

// 카테고리 생성 요청 (백엔드 CategoryCreateRequest와 일치)
export interface CategoryCreateRequest {
  name: string
  parentId?: number  // 최상단 카테고리는 생략, 하위 카테고리는 필수
}

// 기존 호환성을 위한 별칭들
export type CreateTopCategoryRequest = Omit<CategoryCreateRequest, 'parentId'>
export type CreateSubCategoryRequest = Required<CategoryCreateRequest>
export type CreateCategoryRequest = CategoryCreateRequest

// 카테고리 목록 조회 요청
export interface GetCategoriesRequest {
  parentId?: number
  depth?: number
}

// 카테고리 목록 응답
export type GetCategoriesResponse = ApiResponse<Category[]>

// 카테고리 상세 조회 응답
export type GetCategoryResponse = ApiResponse<Category>

// 카테고리 생성 응답 (백엔드 CategoryResponse와 일치)
export type CategoryResponse = Category
export type CreateCategoryResponse = ApiResponse<Category>

// 카테고리 트리 구조
export interface CategoryTree extends Category {
  children?: CategoryTree[]
}
