/**
 * 상품 관련 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Product,
  GetProductsRequest,
  CreateProductRequest,
  UpdateProductRequest,
  ProductPreviewResponse,
  GetProductPreviewsRequest,
  ProductSortType,
} from '@/types/api/product'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getProductsBySubCategory,
  getProductPreviews,
} from '@/lib/api/products'

// 상품 목록 조회 훅
export const useProducts = (params?: GetProductsRequest) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  })
}

// 상품 상세 조회 훅
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// 상품 검색 훅
export const useProductSearch = (query: string, params?: Omit<GetProductsRequest, 'search'>) => {
  return useQuery({
    queryKey: ['products', 'search', query, params],
    queryFn: () => searchProducts(query, params),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2분
  })
}

// 카테고리별 상품 조회 훅
export const useProductsByCategory = (categoryId: string, params?: Omit<GetProductsRequest, 'categoryId'>) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId, params],
    queryFn: () => getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  })
}

// 하위 카테고리별 상품 조회 훅
export const useProductsBySubCategory = (subCategoryId: string, params?: Omit<GetProductsRequest, 'subCategoryId'>) => {
  return useQuery({
    queryKey: ['products', 'subcategory', subCategoryId, params],
    queryFn: () => getProductsBySubCategory(subCategoryId, params),
    enabled: !!subCategoryId,
    staleTime: 5 * 60 * 1000,
  })
}

// 상품 생성 훅
export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => {
      // 상품 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// 상품 수정 훅
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateProductRequest) => updateProduct(data),
    onSuccess: (_, variables) => {
      // 상품 상세 및 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// 상품 삭제 훅
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      // 상품 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// 상품 프리뷰 조회 훅 (무한 스크롤)
export const useProductPreviews = (params: GetProductPreviewsRequest = {}) => {
  return useQuery({
    queryKey: ['product-previews', params],
    queryFn: () => getProductPreviews(params),
    staleTime: 2 * 60 * 1000, // 2분
    cacheTime: 5 * 60 * 1000, // 5분
  })
}

// 무한 스크롤용 상품 프리뷰 훅
export const useInfiniteProductPreviews = (
  categoryId?: number,
  sortType: ProductSortType = 'LATEST',
  limit: number = 10
) => {
  const [allProducts, setAllProducts] = useState<ProductPreviewResponse[]>([])
  const [cursorId, setCursorId] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { data, isLoading, error, refetch } = useProductPreviews({
    cursorId,
    categoryId,
    limit,
    sortType,
  })

  // 데이터가 로드되면 기존 목록에 추가
  useEffect(() => {
    if (data) {
      if (cursorId === null) {
        // 첫 로드
        setAllProducts(data.contents)
      } else {
        // 추가 로드
        setAllProducts(prev => [...prev, ...data.contents])
      }
      setCursorId(data.nextCursorId)
      setHasNext(data.hasNext)
      setIsLoadingMore(false)
    }
  }, [data, cursorId])

  // 더 많은 데이터 로드
  const loadMore = useCallback(() => {
    if (hasNext && !isLoadingMore && data?.nextCursorId) {
      setIsLoadingMore(true)
      setCursorId(data.nextCursorId)
    }
  }, [hasNext, isLoadingMore, data?.nextCursorId])

  // 초기화
  const reset = useCallback(() => {
    setAllProducts([])
    setCursorId(null)
    setHasNext(true)
    setIsLoadingMore(false)
  }, [])

  // 카테고리 변경 시 초기화
  useEffect(() => {
    reset()
  }, [categoryId, sortType, reset])

  return {
    products: allProducts,
    isLoading,
    isLoadingMore,
    hasNext,
    error,
    loadMore,
    reset,
    refetch,
  }
}
