/**
 * 상품 관련 타입 정의
 */

import { ApiResponse, ScrollResponse } from './common'

// 상품 기본 정보
export interface Product {
  id: string
  name: string
  description: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  images: string[]
  detailImageUrls?: string[] // 상세 이미지 URL 배열 추가
  thumbnail: string
  rating: number
  reviewCount: number
  isFreeShipping: boolean
  isInStock: boolean
  stockQuantity: number
  categoryId: string
  subCategoryId?: string
  tags: string[]
  specifications?: Record<string, any>
  sellerId?: number // 판매자 ID
  sellerName?: string // 판매자 이름
  createdAt: string
  updatedAt: string
}

// 옵션 그룹
export interface OptionGroup {
  groupName: string
  values: string[]
}

// SKU 정보
export interface SkuInfo {
  priceAdjustment: number
  stockQuantity: number
  optionIndexes: number[]
}

// 상품 생성 요청
export interface CreateProductRequest {
  categoryId: number
  name: string
  brand: string
  basePrice: number
  discountRate: number
  description: string
  shippingPrice: number
  optionGroups: OptionGroup[]
  skus: SkuInfo[]
}

// 상품 수정 요청
export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string
}

// 상품 목록 조회 요청
export interface GetProductsRequest {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  categoryId?: string
  subCategoryId?: string
  search?: string
}

// 상품 목록 응답
export type GetProductsResponse = ScrollResponse<Product>

// 상품 상세 조회 응답
export type GetProductResponse = ApiResponse<Product>

// 상품 생성 응답
export type CreateProductResponse = ApiResponse<Product>

// 상품 수정 응답
export type UpdateProductResponse = ApiResponse<Product>

// 상품 삭제 응답
export type DeleteProductResponse = ApiResponse<{ id: string }>

// 상품 정렬 타입
export type ProductSortType = 'LATEST' | 'PRICE_LOW' | 'PRICE_HIGH' | 'POPULAR' | 'RECOMMENDED'

// 상품 프리뷰 응답 (무한 스크롤용)
export interface ProductPreviewResponse {
  id: number
  categoryId: number
  sellerId: number
  name: string
  imageUrl: string
  detailImageUrls?: string[] // 상세 이미지 URL 배열 추가
  brand: string
  basePrice: number
  discountRate: number
  discountedPrice?: number // 서버에서 계산된 할인된 가격 추가
  description: string
  shippingPrice: number
  status: string
  averageRating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface RecentViewPreviewResponse {
  id: number
  name: string
  imageUrl: string | null
  basePrice: number | null
  discountRate: number | null
  discountedPrice: number | null
}

// 상품 프리뷰 조회 요청 파라미터
export interface GetProductPreviewsRequest {
  cursorId?: number
  nextCursor?: string // 인증된 사용자용 API에서 사용
  categoryId?: number
  limit?: number
  keyword?: string
  sortType?: ProductSortType
  minPrice?: number // 가격 필터 - 최소 가격
  maxPrice?: number // 가격 필터 - 최대 가격
}

export interface ProductFilterRequest {
  categoryId?: number
  keyword?: string
  optionFilters?: Record<string, string[]>
  rangeFilters?: Record<string, RangeFilter>
}

export interface RangeFilter {
  minValue?: number | null
  maxValue?: number | null
}

// 상품 프리뷰 조회 응답
export type GetProductPreviewsResponse = ScrollResponse<ProductPreviewResponse>

// 상품 통계
export interface ProductStats {
  totalProducts: number
  totalCategories: number
  averageRating: number
  totalReviews: number
}

// SKU 재고 응답
export interface SkuStockResponse {
  skuId: number
  stockQuantity: number
  priceAdjustment: number
  options: OptionCombinationResponse[]
}

// 옵션 조합 응답
export interface OptionCombinationResponse {
  groupName: string
  valueName: string
}

// 제품 재고 조회 응답
export type GetProductStockResponse = ApiResponse<SkuStockResponse[]>

// SKU 재고 업데이트 요청
export interface SkuStockUpdateRequest {
  skuId: number
  stockQuantity: number
  priceAdjustment?: number
}

// 상품 SKU 재고 업데이트 요청
export interface ProductSkuUpdateRequest {
  skus: SkuStockUpdateRequest[]
}

// 상품 상태 열거형
export enum ProductStatus {
  ON_SALE = 'ON_SALE', // 판매중
  OUT_OF_STOCK = 'OUT_OF_STOCK', // 품절
  SUSPENDED = 'SUSPENDED' // 판매 중지
}

// 상품 상태 업데이트 요청
export interface ProductStatusUpdateRequest {
  status: ProductStatus
}

// 상품 기본 정보 업데이트 요청
export interface ProductBasicInfoUpdateRequest {
  name: string
  brand: string
  basePrice: number
  discountRate: number
  description: string
  shippingPrice: number
}

// 상품 이미지 업데이트 요청
export interface ProductImageUpdateRequest {
  mainImage?: File
  detailImages?: File[]
  deleteDetailImageUrls?: string[]
}

// 판매자 상품 관리 응답
export interface ProductManageResponse {
  id: number
  name: string
  imageUrl: string
  categoryPath: string // "가구 > 거실가구 > 소파" 형식
  basePrice: number
  discountRate: number
  shippingPrice: number
  totalStock: number
  status: ProductStatus
  createdAt: string
}

// 판매자 상품 목록 조회 응답
export type GetSellerProductsResponse = ScrollResponse<ProductManageResponse>
