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

type FilterProductPreviewsParams = {
  cursorId?: number
  limit?: number
  sortType?: ProductSortType
  filters: ProductFilterRequest
}

// 옵션 필터 기반 상품 프리뷰 조회
export const filterProductPreviews = async ({
  cursorId,
  limit,
  sortType,
  filters,
}: FilterProductPreviewsParams): Promise<GetProductPreviewsResponse> => {
  const payload: ProductFilterRequest = {}

  if (typeof filters.categoryId === 'number') {
    payload.categoryId = filters.categoryId
  }

  if (filters.keyword) {
    payload.keyword = filters.keyword
  }

  if (filters.optionFilters && Object.keys(filters.optionFilters).length > 0) {
    payload.optionFilters = filters.optionFilters
  }

  if (filters.rangeFilters && Object.keys(filters.rangeFilters).length > 0) {
    payload.rangeFilters = filters.rangeFilters as Record<string, RangeFilter>
  }

  const response = await apiClient.post<GetProductPreviewsResponse>(
    PRODUCT_ENDPOINTS.FILTER_PRODUCT_PREVIEWS,
    payload,
    {
      params: {
        cursorId,
        limit,
        sortType,
      },
    },
  )

  return response.data ?? (response as unknown as GetProductPreviewsResponse)
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
