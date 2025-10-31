/**
 * 카테고리 관련 API 함수들
 */

import { apiClient } from './client'
import { CATEGORY_ENDPOINTS } from './endpoints'
import { Category, CategoryCreateRequest, CategoryResponse } from '@/types/api/category'


// 최상단 카테고리 조회
export const getTopCategories = async (): Promise<Category[]> => {
  console.log('getTopCategories called')
  try {
    const response = await apiClient.get<Category[]>(CATEGORY_ENDPOINTS.GET_TOP_CATEGORIES)
    console.log('API response:', response)
    return response || []
  } catch (error) {
    console.error('Failed to fetch top categories:', error)
    return []
  }
}

// 부모 ID로 하위 카테고리 조회
export const getCategoriesByParent = async (parentId: number): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>(CATEGORY_ENDPOINTS.GET_CATEGORIES_BY_PARENT(parentId))
    return response || []
  } catch (error) {
    console.error('Failed to fetch categories by parent:', error)
    return []
  }
}

// 카테고리 계층 구조 조회 (최상단까지)
export const getCategoryHierarchy = async (categoryId: number): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>(CATEGORY_ENDPOINTS.GET_CATEGORY_HIERARCHY(categoryId))
    return response || []
  } catch (error) {
    console.error('Failed to fetch category hierarchy:', error)
    return []
  }
}

// 카테고리 생성 (백엔드 API와 일치)
export const createCategory = async (data: CategoryCreateRequest): Promise<CategoryResponse> => {
  try {
    const response = await apiClient.post<CategoryResponse>('/api/v1/categories', data)
    return response
  } catch (error) {
    console.error('Failed to create category:', error)
    throw error
  }
}

// 기존 호환성을 위한 별칭 함수들
export const createTopCategory = async (data: { name: string }): Promise<CategoryResponse> => {
  return createCategory(data)
}

export const createSubCategory = async (data: { name: string; parentId: number }): Promise<CategoryResponse> => {
  return createCategory(data)
}
