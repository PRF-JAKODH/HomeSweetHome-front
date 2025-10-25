/**
 * 카테고리 관련 커스텀 훅
 */

import { useQuery } from '@tanstack/react-query'
import { Category } from '@/types/api/category'
import {
  getTopCategories,
  getCategoriesByParent,
  getCategoryHierarchy,
} from '@/lib/api/categories'

// 최상단 카테고리 조회 훅
export const useTopCategories = () => {
  return useQuery({
    queryKey: ['categories', 'top'],
    queryFn: getTopCategories,
    staleTime: 15 * 60 * 1000, // 15분
  })
}

// 부모 ID로 하위 카테고리 조회 훅
export const useCategoriesByParent = (parentId: number) => {
  return useQuery({
    queryKey: ['categories', 'parent', parentId],
    queryFn: () => getCategoriesByParent(parentId),
    enabled: !!parentId,
    staleTime: 10 * 60 * 1000, // 10분
  })
}

// 카테고리 계층 구조 조회 훅 (최상단까지)
export const useCategoryHierarchy = (categoryId: number) => {
  return useQuery({
    queryKey: ['categories', 'hierarchy', categoryId],
    queryFn: () => getCategoryHierarchy(categoryId),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10분
  })
}
