import React from 'react'
import { Button } from '@/components/ui/button'

interface Review {
  id: number
  productName: string
  productImage: string
  rating: number
  content: string
  date: string
  images: string[]
}

interface ReviewsSectionProps {
  myReviews: Review[]
  onEditReview: (review: Review) => void
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
            <div key={review.id} className="border border-divider rounded-lg p-4">
              <div className="flex gap-4 mb-4">
                <img
                  src={review.productImage || "/placeholder.svg"}
                  alt={review.productName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{review.productName}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-text-secondary">{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-foreground mb-3">{review.content}</p>
              {review.images.length > 0 && (
                <div className="flex gap-2">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img || "/placeholder.svg"}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
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
