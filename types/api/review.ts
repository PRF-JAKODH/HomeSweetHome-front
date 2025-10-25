import { ScrollResponse } from './common'

export interface ProductReviewCreateRequest {
  rating: number // 1-5점
  comment: string
  image?: File // MultipartFile
}

export interface ProductReviewResponse {
  reviewId: number
  productId: number
  userId: number
  productName: string
  username: string
  rating: number
  comment: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface ProductReviewListResponse {
  data: ProductReviewResponse[]
  totalCount: number
  averageRating: number
}

export interface ProductReviewStatisticsResponse {
  productId: number
  totalCount: number
  averageRating: number
  ratingCounts: Record<number, number> // Map<Integer, Long> -> Record<number, number>
}
