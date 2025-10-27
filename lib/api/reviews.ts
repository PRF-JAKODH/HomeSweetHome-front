import { apiClient } from './client'
import { ProductReviewCreateRequest, ProductReviewResponse, ProductReviewStatisticsResponse } from '@/types/api/review'
import { ScrollResponse } from '@/types/api/common'

/**
 * 상품 리뷰 목록 조회 (스크롤 페이징)
 */
export const getProductReviews = async (
  productId: string,
  cursorId?: number,
  limit: number = 10
): Promise<ScrollResponse<ProductReviewResponse>> => {
  const params = new URLSearchParams()
  if (cursorId) {
    params.append('cursorId', cursorId.toString())
  }
  params.append('limit', limit.toString())

  const response = await apiClient.get<ScrollResponse<ProductReviewResponse>>(`/api/v1/product/reviews/${productId}?${params}`)
  return response
}

/**
 * 상품 리뷰 등록
 */
export const createProductReview = async (
  productId: string, 
  reviewData: ProductReviewCreateRequest
): Promise<ProductReviewResponse> => {
  const formData = new FormData()
  formData.append('rating', reviewData.rating.toString())
  formData.append('comment', reviewData.comment)
  formData.append('image', reviewData.image)

  const response = await apiClient.post<ProductReviewResponse>(
    `/api/v1/product/reviews/${productId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response
}

/**
 * 리뷰 삭제
 */
export const deleteProductReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/product/reviews/${reviewId}`)
}

/**
 * 상품 리뷰 통계 조회
 */
export const getProductReviewStatistics = async (productId: string): Promise<ProductReviewStatisticsResponse> => {
  const response = await apiClient.get<ProductReviewStatisticsResponse>(`/api/v1/product/reviews/${productId}/statistics`)
  return response
}

/**
 * 내가 작성한 리뷰 목록 조회
 */
export const getMyReviews = async (
  cursorId?: number,
  limit: number = 10
): Promise<ScrollResponse<ProductReviewResponse>> => {
  const params = new URLSearchParams()
  if (cursorId) {
    params.append('cursorId', cursorId.toString())
  }
  params.append('limit', limit.toString())

  const response = await apiClient.get<ScrollResponse<ProductReviewResponse>>(`/api/v1/product/reviews/me?${params}`)
  return response
}

/**
 * 상품 리뷰 수정
 */
export const updateProductReview = async (
  reviewId: number,
  reviewData: ProductReviewUpdateRequest
): Promise<ProductReviewResponse> => {
  const formData = new FormData()
  formData.append('rating', reviewData.rating.toString())
  formData.append('comment', reviewData.comment)
  formData.append('image', reviewData.image)

  const response = await apiClient.patch<ProductReviewResponse>(
    `/api/v1/product/reviews/${reviewId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response
}
