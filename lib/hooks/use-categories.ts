/**
 * 카테고리 관련 커스텀 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Category, CategoryCreateRequest } from '@/types/api/category'
import {
  getTopCategories,
  getCategoriesByParent,
  getCategoryHierarchy,
  createCategory,
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

// 카테고리 생성 훅
export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoryCreateRequest) => createCategory(data),
    onSuccess: (newCategory) => {
      // 최상단 카테고리 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['categories', 'top'] })
      
      // 부모 카테고리가 있다면 해당 부모의 하위 카테고리 목록도 새로고침
      if (newCategory.parentId) {
        queryClient.invalidateQueries({ queryKey: ['categories', 'parent', newCategory.parentId] })
      }
      
      // 모든 카테고리 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
