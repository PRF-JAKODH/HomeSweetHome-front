import { apiClient } from './client'
import { ProductReviewCreateRequest, ProductReviewUpdateRequest, ProductReviewResponse, ProductReviewStatisticsResponse } from '@/types/api/review'
import { ScrollResponse } from '@/types/api/common'
import { REVIEW_ENDPOINTS } from './endpoints'

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

  const response = await apiClient.get<ScrollResponse<ProductReviewResponse>>(`${REVIEW_ENDPOINTS.GET_PRODUCT_REVIEWS(productId)}?${params}`)
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
    REVIEW_ENDPOINTS.CREATE_PRODUCT_REVIEW(productId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data || response
}

/**
 * 리뷰 삭제
 */
export const deleteProductReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(REVIEW_ENDPOINTS.DELETE_PRODUCT_REVIEW(reviewId))
}

/**
 * 상품 리뷰 통계 조회
 */
export const getProductReviewStatistics = async (productId: string): Promise<ProductReviewStatisticsResponse> => {
  const response = await apiClient.get<ProductReviewStatisticsResponse>(REVIEW_ENDPOINTS.GET_PRODUCT_REVIEW_STATISTICS(productId))
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

  const response = await apiClient.get<ScrollResponse<ProductReviewResponse>>(`${REVIEW_ENDPOINTS.GET_MY_REVIEWS}?${params}`)
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
    REVIEW_ENDPOINTS.UPDATE_PRODUCT_REVIEW(reviewId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data || response
}
