import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProductReviewResponse, ProductReviewUpdateRequest } from '@/types/api/review'
import { getMyReviews, updateProductReview } from '@/lib/api/reviews'

interface ReviewsSectionProps {
  // 기존 props는 제거하고 내부에서 관리
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = () => {
  const router = useRouter()
  const [myReviews, setMyReviews] = useState<ProductReviewResponse[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  
  // 리뷰 수정 관련 상태
  const [editReviewDialogOpen, setEditReviewDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<ProductReviewResponse | null>(null)
  const [editReviewRating, setEditReviewRating] = useState(0)
  const [editReviewContent, setEditReviewContent] = useState("")
  const [editReviewImages, setEditReviewImages] = useState<string[]>([])
  const [hoveredEditRating, setHoveredEditRating] = useState(0)

  // 내 리뷰 데이터 가져오기
  const fetchMyReviews = async () => {
    setReviewsLoading(true)
    setReviewsError(null)
    try {
      const response = await getMyReviews()
      setMyReviews(response.contents)
    } catch (error) {
      console.error('리뷰 조회 실패:', error)
      setReviewsError('리뷰를 불러오는데 실패했습니다.')
    } finally {
      setReviewsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 리뷰 데이터 가져오기
  useEffect(() => {
    fetchMyReviews()
  }, [])

  // 제품 상세 페이지로 이동하는 함수
  const handleProductClick = (productId: number) => {
    router.push(`/store/products/${productId}`)
  }

  const handleEditReview = (review: ProductReviewResponse) => {
    setSelectedReview(review)
    setEditReviewRating(review.rating)
    setEditReviewContent(review.comment)
    
    // 기존 이미지가 있는 경우 표시
    if (review.reviewImageUrl) {
      setEditReviewImages([review.reviewImageUrl])
    } else {
      // 이미지가 없는 경우 빈 배열로 설정
      setEditReviewImages([])
    }
    
    setEditReviewDialogOpen(true)
  }

  const handleEditReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0] // 첫 번째 파일만 사용
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditReviewImages([reader.result as string]) // 기존 이미지를 대체
      }
      reader.readAsDataURL(file)
    }
  }

  // Base64 문자열을 File 객체로 변환하는 헬퍼 함수
  const base64ToFile = (base64String: string, filename: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        // Base64 문자열이 유효한지 확인
        if (!base64String || typeof base64String !== 'string') {
          throw new Error('Invalid base64 string')
        }

        const arr = base64String.split(',')
        if (arr.length !== 2) {
          throw new Error('Invalid data URL format')
        }

        // Data URL 형식인지 확인
        if (!arr[0].startsWith('data:')) {
          throw new Error('Not a valid data URL')
        }

        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
        
        // Base64 데이터가 유효한지 확인
        const base64Data = arr[1]
        if (!base64Data || base64Data.length === 0) {
          throw new Error('Empty base64 data')
        }

        const bstr = atob(base64Data)
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        const file = new File([u8arr], filename, { type: mime })
        resolve(file)
      } catch (error) {
        console.error('Base64 to File conversion error:', error)
        reject(error)
      }
    })
  }

  const handleSaveEditedReview = async () => {
    if (editReviewRating === 0) {
      alert("별점을 선택해주세요.")
      return
    }
    if (!editReviewContent.trim()) {
      alert("리뷰 내용을 입력해주세요.")
      return
    }

    if (!selectedReview) return

    try {
      let imageFile: File
      
      if (editReviewImages.length > 0 && editReviewImages[0]) {
        // 이미지가 Data URL 형식인지 확인
        if (editReviewImages[0].startsWith('data:')) {
          try {
            // Base64 이미지를 File 객체로 변환
            imageFile = await base64ToFile(editReviewImages[0], 'review-image.jpg')
          } catch (base64Error) {
            console.error('이미지 변환 실패:', base64Error)
            // 이미지 변환 실패 시 빈 파일로 대체
            imageFile = new File([], 'empty.jpg', { type: 'image/jpeg' })
          }
        } else {
          // 일반 URL인 경우 빈 파일로 처리 (기존 이미지 유지)
          imageFile = new File([], 'empty.jpg', { type: 'image/jpeg' })
        }
      } else {
        // 이미지가 없을 때는 빈 파일 생성 (백엔드에서 필수 필드이므로)
        imageFile = new File([], 'empty.jpg', { type: 'image/jpeg' })
      }
      
      const reviewData: ProductReviewUpdateRequest = {
        rating: editReviewRating,
        comment: editReviewContent,
        image: imageFile
      }

      const updatedReview = await updateProductReview(selectedReview.reviewId, reviewData)
      
      setMyReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.reviewId === selectedReview.reviewId 
            ? { ...updatedReview, productName: review.productName } // 기존 productName 보존
            : review
        )
      )

      setEditReviewDialogOpen(false)
      setSelectedReview(null)
      setEditReviewRating(0)
      setEditReviewContent("")
      setEditReviewImages([])
      alert("리뷰가 수정되었습니다.")
    } catch (error: any) {
      console.error('리뷰 수정 실패:', error)
      alert("리뷰 수정에 실패했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">나의 리뷰</h2>
          <p className="text-text-secondary">작성한 리뷰를 확인하고 관리하세요</p>
        </div>

        {/* 로딩 상태 */}
        {reviewsLoading && (
          <div className="text-center py-12 text-text-secondary">리뷰를 불러오는 중...</div>
        )}

        {/* 에러 상태 */}
        {reviewsError && (
          <div className="text-center py-12 text-red-600">{reviewsError}</div>
        )}

        {/* Reviews List */}
        {!reviewsLoading && !reviewsError && (
          <div className="space-y-4">
            {myReviews.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">작성한 리뷰가 없습니다.</div>
            ) : (
              myReviews.map((review) => (
                <div key={review.reviewId} className="border border-divider rounded-lg p-4">
                  {/* 헤더: 제품 정보와 수정 버튼 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* 제품 사진 */}
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={review.productImageUrl || "/placeholder.svg"}
                          alt={review.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* 제품명과 별점 */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold text-foreground mb-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleProductClick(review.productId)}
                        >
                          {review.productName}
                        </h3>
                        <div className="flex items-center gap-2">
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
                    </div>
                    {/* 수정 버튼 - 오른쪽 위 */}
                    <Button variant="outline" size="sm" onClick={() => handleEditReview(review)}>
                      수정
                    </Button>
                  </div>

                  {/* 리뷰 사진 - 댓글 위에 표시 */}
                  {review.reviewImageUrl && (
                    <div className="flex gap-2 mb-3">
                      <img
                        src={review.reviewImageUrl || "/placeholder.svg"}
                        alt="리뷰 이미지"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* 리뷰 댓글 */}
                  <p className="text-foreground">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 리뷰 수정 다이얼로그 */}
      <Dialog open={editReviewDialogOpen} onOpenChange={setEditReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">리뷰 수정</DialogTitle>
            <DialogDescription>{selectedReview?.productName}</DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6 py-4">
              {/* Star Rating */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">별점</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditReviewRating(star)}
                      onMouseEnter={() => setHoveredEditRating(star)}
                      onMouseLeave={() => setHoveredEditRating(0)}
                      className="text-3xl transition-colors"
                    >
                      <span
                        className={star <= (hoveredEditRating || editReviewRating) ? "text-sky-400" : "text-gray-300"}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  {editReviewRating > 0 && (
                    <span className="ml-2 text-sm text-text-secondary">{editReviewRating}점</span>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">리뷰 내용</label>
                <Textarea
                  value={editReviewContent}
                  onChange={(e) => setEditReviewContent(e.target.value)}
                  placeholder="상품에 대한 솔직한 리뷰를 작성해주세요."
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">사진 첨부 (선택, 최대 1장)</label>
                <div className="flex flex-wrap gap-3">
                  {editReviewImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`리뷰 이미지 ${index + 1}`}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditReviewImages(editReviewImages.filter((_, i) => i !== index))}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-white hover:bg-foreground/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {editReviewImages.length < 1 && (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-divider bg-background-section hover:bg-background-section/80">
                      <svg
                        className="mb-1 h-6 w-6 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-text-secondary">{editReviewImages.length}/1</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditReviewImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditReviewDialogOpen(false)
                setSelectedReview(null)
                setEditReviewRating(0)
                setEditReviewContent("")
                setEditReviewImages([])
              }}
            >
              취소
            </Button>
            <Button onClick={handleSaveEditedReview} className="bg-primary hover:bg-primary/90 text-white">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
