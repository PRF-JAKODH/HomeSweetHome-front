import React from 'react'
import { Button } from '@/components/ui/button'
import { ProductReviewResponse } from '@/types/api/review'

interface ReviewsSectionProps {
  myReviews: ProductReviewResponse[]
  onEditReview: (review: ProductReviewResponse) => void
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  myReviews,
  onEditReview,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">나의 리뷰</h2>
        <p className="text-text-secondary">작성한 리뷰를 확인하고 관리하세요</p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {myReviews.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">작성한 리뷰가 없습니다.</div>
        ) : (
          myReviews.map((review) => (
            <div key={review.reviewId} className="border border-divider rounded-lg p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground mb-2">{review.productName}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < review.rating ? "text-sky-400" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-text-secondary">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-foreground mb-3">{review.comment}</p>
              {review.imageUrl && (
                <div className="flex gap-2 mb-4">
                  <img
                    src={review.imageUrl || "/placeholder.svg"}
                    alt="리뷰 이미지"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEditReview(review)}>
                  수정
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
