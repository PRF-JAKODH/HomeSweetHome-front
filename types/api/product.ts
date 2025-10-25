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
  createdAt: string
  updatedAt: string
}

// 상품 생성 요청
export interface CreateProductRequest {
  name: string
  description: string
  brand: string
  price: number
  originalPrice?: number
  images: string[]
  categoryId: string
  subCategoryId?: string
  stockQuantity: number
  isFreeShipping: boolean
  tags?: string[]
  specifications?: Record<string, any>
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
export type ProductSortType = 'LATEST' | 'PRICE_LOW' | 'PRICE_HIGH' | 'POPULAR'

// 상품 프리뷰 응답 (무한 스크롤용)
export interface ProductPreviewResponse {
  id: number
  categoryId: number
  sellerId: number
  name: string
  imageUrl: string
  brand: string
  basePrice: number
  discountRate: number
  description: string
  shippingPrice: number
  status: string
  averageRating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

// 상품 프리뷰 조회 요청 파라미터
export interface GetProductPreviewsRequest {
  cursorId?: number
  categoryId?: number
  limit?: number
  keyword?: string
  sortType?: ProductSortType
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
