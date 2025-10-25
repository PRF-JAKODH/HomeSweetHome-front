/**
 * 상품 관련 API 함수들
 */

import { apiClient } from './client'
import { PRODUCT_ENDPOINTS } from './endpoints'
import {
  Product,
  GetProductsRequest,
  GetProductsResponse,
  GetProductResponse,
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  DeleteProductResponse,
  ProductStats,
  ProductPreviewResponse,
  GetProductPreviewsRequest,
  GetProductPreviewsResponse,
  SkuStockResponse,
  GetProductStockResponse,
} from '@/types/api/product'
import { ApiResponse } from '@/types/api/common'

// 상품 목록 조회
export const getProducts = async (params?: GetProductsRequest): Promise<GetProductsResponse> => {
  return apiClient.get<GetProductsResponse>(PRODUCT_ENDPOINTS.GET_PRODUCTS, {
    params,
  })
}

// 상품 상세 조회
export const getProduct = async (id: string): Promise<GetProductResponse> => {
  return apiClient.get<Product>(PRODUCT_ENDPOINTS.GET_PRODUCT(id))
}

// 상품 생성
export const createProduct = async (data: CreateProductRequest): Promise<CreateProductResponse> => {
  return apiClient.post<Product>(PRODUCT_ENDPOINTS.CREATE_PRODUCT, data)
}

// 상품 수정
export const updateProduct = async (data: UpdateProductRequest): Promise<UpdateProductResponse> => {
  const { id, ...updateData } = data
  return apiClient.put<Product>(PRODUCT_ENDPOINTS.UPDATE_PRODUCT(id), updateData)
}

// 상품 삭제
export const deleteProduct = async (id: string): Promise<DeleteProductResponse> => {
  return apiClient.delete<{ id: string }>(PRODUCT_ENDPOINTS.DELETE_PRODUCT(id))
}

// 상품 검색
export const searchProducts = async (query: string, params?: Omit<GetProductsRequest, 'search'>): Promise<GetProductsResponse> => {
  return apiClient.get<GetProductsResponse>(PRODUCT_ENDPOINTS.SEARCH_PRODUCTS, {
    params: { ...params, query },
  })
}

// 카테고리별 상품 조회
export const getProductsByCategory = async (categoryId: string, params?: Omit<GetProductsRequest, 'categoryId'>): Promise<GetProductsResponse> => {
  return apiClient.get<GetProductsResponse>(PRODUCT_ENDPOINTS.GET_PRODUCTS_BY_CATEGORY(categoryId), {
    params,
  })
}

// 하위 카테고리별 상품 조회
export const getProductsBySubCategory = async (subCategoryId: string, params?: Omit<GetProductsRequest, 'subCategoryId'>): Promise<GetProductsResponse> => {
  return apiClient.get<GetProductsResponse>(PRODUCT_ENDPOINTS.GET_PRODUCTS_BY_SUBCATEGORY(subCategoryId), {
    params,
  })
}

// 상품 프리뷰 조회 (무한 스크롤)
export const getProductPreviews = async (params: GetProductPreviewsRequest = {}): Promise<GetProductPreviewsResponse> => {
  return apiClient.get<GetProductPreviewsResponse>(PRODUCT_ENDPOINTS.GET_PRODUCT_PREVIEWS, { params })
}

// 상품 통계 조회
export const getProductStats = async (): Promise<ApiResponse<ProductStats>> => {
  return apiClient.get<ProductStats>(PRODUCT_ENDPOINTS.GET_PRODUCT_STATS)
}

// 상품 재고 조회
export const getProductStock = async (productId: string): Promise<GetProductStockResponse> => {
  return apiClient.get<SkuStockResponse[]>(PRODUCT_ENDPOINTS.GET_PRODUCT_STOCK(productId))
}
