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
  ProductManageResponse,
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
  return apiClient.get<GetProductResponse>(PRODUCT_ENDPOINTS.GET_PRODUCT(id))
}

// 상품 생성
export const createProduct = async (
  productData: CreateProductRequest,
  mainImage: File,
  detailImages: File[]
): Promise<CreateProductResponse> => {
  const formData = new FormData()
  
  // 상품 데이터를 JSON으로 추가
  formData.append('product', JSON.stringify(productData))
  
  // 메인 이미지 추가
  formData.append('mainImage', mainImage)
  
  // 상세 이미지들 추가
  detailImages.forEach((image, index) => {
    formData.append('detailImages', image)
  })

  return apiClient.post<Product>(PRODUCT_ENDPOINTS.CREATE_PRODUCT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
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
  return apiClient.get<ApiResponse<ProductStats>>(PRODUCT_ENDPOINTS.GET_PRODUCT_STATS)
}

// 상품 재고 조회
export const getProductStock = async (productId: string): Promise<SkuStockResponse[]> => {
  const response = await apiClient.get<SkuStockResponse[]>(PRODUCT_ENDPOINTS.GET_PRODUCT_STOCK(productId))
  return response
}

// 판매자 상품 목록 조회
export const getSellerProducts = async (
  startDate?: string,
  endDate?: string
): Promise<ProductManageResponse[]> => {
  const params = new URLSearchParams()
  if (startDate) {
    params.append('startDate', startDate)
  }
  if (endDate) {
    params.append('endDate', endDate)
  }

  const response = await apiClient.get<ProductManageResponse[]>(`${PRODUCT_ENDPOINTS.GET_SELLER_PRODUCTS}?${params}`)
  return response
}
