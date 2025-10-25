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
