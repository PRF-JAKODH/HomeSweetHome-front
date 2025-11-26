/**
 * 상품 관련 API 함수들
 */

import { apiClient } from './client'
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
  ProductFilterRequest,
  ProductSortType,
  RangeFilter,
  SkuStockResponse,
  GetProductStockResponse,
  ProductManageResponse,
  ProductStatus,
  ProductStatusUpdateRequest,
  ProductBasicInfoUpdateRequest,
  ProductImageUpdateRequest,
  SkuStockUpdateRequest,
  ProductSkuUpdateRequest,
  RecentViewPreviewResponse,
} from '@/types/api/product'
import { PRODUCT_ENDPOINTS } from './endpoints'
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

export const getProductDetailAuthenticated = async (id: string): Promise<GetProductResponse> => {
  return apiClient.get<GetProductResponse>(PRODUCT_ENDPOINTS.SEARCH_PRODUCT_DETAIL(id))
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

// 상품 프리뷰 조회 (무한 스크롤) - 비인증 사용자용 (옵션 필터 포함)
export const getProductPreviews = async (params: GetProductPreviewsRequest = {}): Promise<GetProductPreviewsResponse> => {
  // optionFilters를 "키:값" 형식의 배열로 변환
  const optionFiltersArray: string[] = []
  if (params.optionFilters && Object.keys(params.optionFilters).length > 0) {
    Object.entries(params.optionFilters).forEach(([key, values]) => {
      values.forEach((value) => {
        optionFiltersArray.push(`${key}:${value}`)
      })
    })
  }
  
  // API 파라미터 구성
  const apiParams: Record<string, any> = {
    ...(params.nextCursor !== undefined && params.nextCursor !== null ? { nextCursor: params.nextCursor } : {}),
    ...(params.categoryId !== undefined && params.categoryId !== null ? { categoryId: params.categoryId } : {}),
    ...(params.keyword ? { keyword: params.keyword } : {}),
    ...(params.sortType ? { sortType: params.sortType } : {}),
    ...(params.minPrice !== undefined && params.minPrice !== null ? { minPrice: params.minPrice } : {}),
    ...(params.maxPrice !== undefined && params.maxPrice !== null ? { maxPrice: params.maxPrice } : {}),
    ...(params.limit !== undefined ? { limit: params.limit } : {}),
    ...(optionFiltersArray.length > 0 ? { optionFilters: optionFiltersArray } : {}),
  }
  
  return apiClient.get<GetProductPreviewsResponse>(PRODUCT_ENDPOINTS.GET_PRODUCT_PREVIEWS, { params: apiParams })
}

export const searchProductPreviewsAuthenticated = async (
  params: GetProductPreviewsRequest = {}
): Promise<GetProductPreviewsResponse> => {
  // 인증된 사용자 API는 nextCursor(String) 사용, cursorId는 무시
  const { cursorId, optionFilters, ...restParams } = params
  
  // optionFilters를 "키:값" 형식의 배열로 변환
  const optionFiltersArray: string[] = []
  if (optionFilters && Object.keys(optionFilters).length > 0) {
    Object.entries(optionFilters).forEach(([key, values]) => {
      values.forEach((value) => {
        optionFiltersArray.push(`${key}:${value}`)
      })
    })
  }
  
  // nextCursor가 있으면 그대로 사용, 없으면 cursorId를 nextCursor로 변환
  const apiParams: Record<string, any> = {
    ...restParams,
    ...(params.nextCursor !== undefined ? { nextCursor: params.nextCursor } : 
        (cursorId !== undefined && cursorId !== null ? { nextCursor: cursorId.toString() } : {})),
    // minPrice, maxPrice가 있으면 포함
    ...(params.minPrice !== undefined && params.minPrice !== null ? { minPrice: params.minPrice } : {}),
    ...(params.maxPrice !== undefined && params.maxPrice !== null ? { maxPrice: params.maxPrice } : {}),
    // optionFilters가 있으면 배열로 포함
    ...(optionFiltersArray.length > 0 ? { optionFilters: optionFiltersArray } : {}),
  }
  
  return apiClient.get<GetProductPreviewsResponse>(PRODUCT_ENDPOINTS.SEARCH_AUTHENTICATED, { params: apiParams })
}

// filterProductPreviews 함수는 더 이상 사용하지 않음 (통합된 GET API 사용)

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

// 상품 상태 업데이트
export const updateProductStatus = async (
  productId: string,
  status: ProductStatus
): Promise<void> => {
  const request: ProductStatusUpdateRequest = { status }
  await apiClient.patch(PRODUCT_ENDPOINTS.UPDATE_PRODUCT_STATUS(productId), request)
}

// 상품 SKU 재고 업데이트
export const updateProductSkuStock = async (
  productId: string,
  skus: SkuStockUpdateRequest[]
): Promise<void> => {
  const request: ProductSkuUpdateRequest = { skus }
  await apiClient.patch(PRODUCT_ENDPOINTS.UPDATE_PRODUCT_SKU_STOCK(productId), request)
}

// 상품 기본 정보 업데이트
export const updateProductBasicInfo = async (
  productId: string,
  data: ProductBasicInfoUpdateRequest
): Promise<void> => {
  await apiClient.patch(PRODUCT_ENDPOINTS.UPDATE_PRODUCT(productId), data)
}

// 상품 이미지 업데이트
export const updateProductImages = async (
  productId: string,
  data: ProductImageUpdateRequest
): Promise<void> => {
  const formData = new FormData()
  
  if (data.mainImage) {
    formData.append('mainImage', data.mainImage)
  }
  
  if (data.detailImages) {
    data.detailImages.forEach((image) => {
      formData.append('detailImages', image)
    })
  }
  
  if (data.deleteDetailImageUrls) {
    data.deleteDetailImageUrls.forEach((url) => {
      formData.append('deleteDetailImageUrls', url)
    })
  }
  
  await apiClient.patch(PRODUCT_ENDPOINTS.UPDATE_PRODUCT_IMAGES(productId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 최근 본 상품 목록 조회
export const getRecentViews = async (): Promise<RecentViewPreviewResponse[]> => {
  const response = await apiClient.get<RecentViewPreviewResponse[]>(PRODUCT_ENDPOINTS.RECENT_VIEWS)

  // apiClient가 배열 자체를 반환하거나 { data } 형태로 감싸는 경우 모두 대응
  if (Array.isArray(response)) {
    return response
  }
  const data = (response as any)?.data
  return Array.isArray(data) ? data : []
}

// 최근 본 상품 단건 삭제
export const deleteRecentViewItem = async (id: number): Promise<void> => {
  await apiClient.delete(PRODUCT_ENDPOINTS.RECENT_VIEWS_DELETE_ONE, {
    params: { id },
  })
}
