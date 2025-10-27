"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getMyReviews, updateProductReview } from "@/lib/api/reviews"
import { ProductReviewResponse, ProductReviewUpdateRequest } from "@/types/api/review"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Script from "next/script"
import { useUser } from "@/hooks/use-user"
import { ShoppingSection } from "@/app/profile/shopping-section"
import { ReviewsSection } from "@/app/profile/reviews-section"
import { SellerApplySection } from "@/app/profile/seller-apply-section"
import { SettingsSection } from "@/app/profile/settings-section"

type SellerGrade = "VVIP" | "VIP" | "GOLD" | "SILVER"

type OrderDetail = {
  id: number
  orderNumber: string
  productName: string
  productImage: string
  price: number
  orderDate: string
  status: string
  statusText: string
  // Order details
  customerName: string
  customerPhone: string
  customerEmail: string
  shippingAddress: string
  detailAddress: string
  option: string
  quantity: number
  shippingFee: number
  sellerName: string
  pointsUsed: number
  paymentMethod: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { fetchUser, editUserInfo, makeSeller, user } = useUser()
  const [selectedMenu, setSelectedMenu] = useState("shopping")
  const [orderFilter, setOrderFilter] = useState("all")
  const [userPoints, setUserPoints] = useState(15000)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer")
  const [sellerGrade, setSellerGrade] = useState<SellerGrade>("SILVER")
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)

  const [editReviewDialogOpen, setEditReviewDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<ProductReviewResponse | null>(null)
  const [editReviewRating, setEditReviewRating] = useState(0)
  const [editReviewContent, setEditReviewContent] = useState("")
  const [editReviewImages, setEditReviewImages] = useState<string[]>([])
  const [hoveredEditRating, setHoveredEditRating] = useState(0)


  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    roadAddress: "",
    detailAddress: "",
    profileImage: "",
  })

  const [myOrders, setMyOrders] = useState<OrderDetail[]>([
    {
      id: 1,
      orderNumber: "20250110-001",
      productName: "모던 미니멀 소파",
      productImage: "/modern-minimalist-sofa.png",
      price: 890000,
      orderDate: "2025-01-10",
      status: "delivered",
      statusText: "배송 완료",
      customerName: "홍길동",
      customerPhone: "010-1234-5678",
      customerEmail: "hong@example.com",
      shippingAddress: "서울특별시 강남구 테헤란로 123",
      detailAddress: "456호",
      option: "그레이 / 3인용",
      quantity: 1,
      shippingFee: 0,
      sellerName: "모던가구",
      pointsUsed: 10000,
      paymentMethod: "신용카드",
    },
    {
      id: 2,
      orderNumber: "20250108-002",
      productName: "원목 다이닝 테이블",
      productImage: "/wooden-dining-table.png",
      price: 450000,
      orderDate: "2025-01-08",
      status: "shipping",
      statusText: "배송 중",
      customerName: "홍길동",
      customerPhone: "010-1234-5678",
      customerEmail: "hong@example.com",
      shippingAddress: "서울특별시 강남구 테헤란로 123",
      detailAddress: "456호",
      option: "-",
      quantity: 1,
      shippingFee: 3000,
      sellerName: "우드스토리",
      pointsUsed: 5000,
      paymentMethod: "네이버페이",
    },
    {
      id: 3,
      orderNumber: "20250105-003",
      productName: "모던 펜던트 조명",
      productImage: "/modern-pendant-lamp.jpg",
      price: 120000,
      orderDate: "2025-01-05",
      status: "ordered",
      statusText: "주문 완료",
      customerName: "홍길동",
      customerPhone: "010-1234-5678",
      customerEmail: "hong@example.com",
      shippingAddress: "서울특별시 강남구 테헤란로 123",
      detailAddress: "456호",
      option: "블랙 / 중형",
      quantity: 2,
      shippingFee: 2500,
      sellerName: "라이팅플러스",
      pointsUsed: 0,
      paymentMethod: "카카오페이",
    },
  ])

  const handleAddressSearch = () => {
    ; new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setProfileData((prev) => ({
          ...prev,
          roadAddress: data.roadAddress,
        }))
      },
    }).open()
  }


  const [myReviews, setMyReviews] = useState<ProductReviewResponse[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  const handleCancelOrder = (orderId: number) => {
    setSelectedOrderId(orderId)
    setCancelDialogOpen(true)
  }

  const confirmCancelOrder = () => {
    if (!cancelReason.trim()) {
      alert("취소 사유를 입력해주세요.")
      return
    }

    setMyOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === selectedOrderId ? { ...order, status: "cancelled", statusText: "취소/반품" } : order,
      ),
    )

    setCancelDialogOpen(false)
    setCancelReason("")
    setSelectedOrderId(null)
    alert("주문이 취소되었습니다.")
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

  const filteredOrders = orderFilter === "all" ? myOrders : myOrders.filter((order) => order.status === orderFilter)

  const handleSaveProfile = async () => {
    if (!user) return

    const updatedUser = {
      ...user,
      profileImageUrl: profileData.profileImage,
      address: `${profileData.roadAddress}/${profileData.detailAddress}`,
    }

    const success = await editUserInfo(updatedUser)
    if (success) {
      alert("프로필이 저장되었습니다.")
    } else {
      alert("프로필 저장에 실패했습니다. 다시 시도해주세요.")
    }
  }

  const handleSellerApplication = async () => {
    if (!termsAgreed) {
      alert("판매자 등록 약관에 동의해주세요.")
      return
    }

    const success = await makeSeller()
    if (success) {
      setUserType("seller")
      setSellerGrade("SILVER")
      localStorage.setItem("ohouse_user_type", "seller")
      localStorage.setItem("ohouse_seller_grade", "SILVER")
      alert("판매자 신청이 완료되었습니다!")
      setSelectedMenu("settings")
    } else {
      alert("판매자 신청에 실패했습니다. 다시 시도해주세요.")
    }
  }

  const getGradeColor = (grade: SellerGrade) => {
    switch (grade) {
      case "VVIP":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      case "VIP":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "GOLD":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
      case "SILVER":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const handleViewOrderDetail = (orderId: number) => {
    const order = myOrders.find((o) => o.id === orderId)
    if (order) {
      setSelectedOrder(order)
      setOrderDetailOpen(true)
    }
  }

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

  const renderContent = () => {
    switch (selectedMenu) {
      case "shopping":
        return (
          <ShoppingSection
            userPoints={userPoints}
            orderFilter={orderFilter}
            setOrderFilter={setOrderFilter}
            filteredOrders={filteredOrders}
            onViewOrderDetail={handleViewOrderDetail}
            onCancelOrder={handleCancelOrder}
            onNavigateToPoints={() => router.push("/profile/points")}
          />
        )

      case "reviews":
        return (
          <ReviewsSection
            myReviews={myReviews}
            onEditReview={handleEditReview}
          />
        )

      case "seller-apply":
        return (
          <SellerApplySection
            termsAgreed={termsAgreed}
            setTermsAgreed={setTermsAgreed}
            onSellerApplication={handleSellerApplication}
            onCancel={() => setSelectedMenu("shopping")}
          />
        )

      case "settings":
        return (
          <SettingsSection
            profileData={profileData}
            setProfileData={setProfileData}
            onAddressSearch={handleAddressSearch}
            onSaveProfile={handleSaveProfile}
            onCancel={() => router.push("/")}
          />
        )

      default:
        return null
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await fetchUser()
      console.log(userData)
      if (userData) {
        const addressStr = userData.address || ''
        const parts = addressStr.split('/')
        const road = parts[0] || ''
        const detail = parts[1] || ''
        setProfileData(prev => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phoneNumber || "",  
          birthdate: String(userData.birthDate ?? ''),
          roadAddress: road,
          detailAddress: detail,
          profileImage: userData.profileImageUrl || "/placeholder.svg",
        }))
      }
    }
    fetchUserData()

    const storedUserType = localStorage.getItem("ohouse_user_type") as "buyer" | "seller" | null
    if (storedUserType) {
      setUserType(storedUserType)
    }

    const storedGrade = localStorage.getItem("ohouse_seller_grade") as SellerGrade | null
    if (storedGrade) {
      setSellerGrade(storedGrade)
    }
  }, [router])

  // 리뷰 메뉴 선택 시 리뷰 데이터 가져오기
  useEffect(() => {
    if (selectedMenu === "reviews") {
      fetchMyReviews()
    }
  }, [selectedMenu])

  if (!user) {
    return null
  }
  return (
    <>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />

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

      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">주문 상세</DialogTitle>
            <DialogDescription>주문 번호: {selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-background-section rounded-lg">
                <div>
                  <p className="text-sm text-text-secondary mb-1">주문 상태</p>
                  <p
                    className={`text-lg font-semibold ${selectedOrder.status === "delivered"
                        ? "text-green-600"
                        : selectedOrder.status === "shipping"
                          ? "text-blue-600"
                          : selectedOrder.status === "cancelled"
                            ? "text-red-600"
                            : "text-orange-600"
                      }`}
                  >
                    {selectedOrder.statusText}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary mb-1">주문 일시</p>
                  <p className="text-lg font-semibold text-foreground">{selectedOrder.orderDate}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border border-divider rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-lg mb-3">주문자 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">이름</p>
                    <p className="text-foreground font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">연락처</p>
                    <p className="text-foreground font-medium">{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary mb-1">이메일</p>
                    <p className="text-foreground font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-divider rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-lg mb-3">배송지 정보</h3>
                <div>
                  <p className="text-sm text-text-secondary mb-1">주소</p>
                  <p className="text-foreground font-medium">{selectedOrder.shippingAddress}</p>
                  <p className="text-foreground font-medium">{selectedOrder.detailAddress}</p>
                </div>
              </div>

              {/* Order Product */}
              <div className="border border-divider rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-lg mb-3">주문 상품</h3>
                <div className="flex gap-4">
                  <img
                    src={selectedOrder.productImage || "/placeholder.svg"}
                    alt={selectedOrder.productName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-foreground">{selectedOrder.productName}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-text-secondary">옵션</p>
                        <p className="text-foreground font-medium">{selectedOrder.option}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">수량</p>
                        <p className="text-foreground font-medium">{selectedOrder.quantity}개</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">배송비</p>
                        <p className="text-foreground font-medium">
                          {selectedOrder.shippingFee === 0 ? "무료" : `${selectedOrder.shippingFee.toLocaleString()}원`}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-secondary">판매자</p>
                        <p className="text-foreground font-medium">{selectedOrder.sellerName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border border-divider rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-lg mb-3">결제 정보</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">상품 금액</span>
                    <span className="text-foreground font-medium">{selectedOrder.price.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">배송비</span>
                    <span className="text-foreground font-medium">
                      {selectedOrder.shippingFee === 0 ? "무료" : `${selectedOrder.shippingFee.toLocaleString()}원`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">포인트 사용</span>
                    <span className="text-red-600 font-medium">-{selectedOrder.pointsUsed.toLocaleString()}P</span>
                  </div>
                  <div className="border-t border-divider pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">최종 결제 금액</span>
                      <span className="text-xl font-bold text-primary">
                        {(selectedOrder.price + selectedOrder.shippingFee - selectedOrder.pointsUsed).toLocaleString()}
                        원
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-text-secondary">결제 수단</span>
                    <span className="text-foreground font-medium">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 취소</DialogTitle>
            <DialogDescription>주문을 취소하겠습니까?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">취소 사유</Label>
              <Textarea
                id="cancelReason"
                placeholder="취소 사유를 입력해주세요"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={confirmCancelOrder} className="bg-red-600 hover:bg-red-700 text-white">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1256px] px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                <div className="mb-6 pb-6 border-b border-divider">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-background-section overflow-hidden">
                      {profileData.profileImage ? (
                        <img
                          src={profileData.profileImage || "/placeholder.svg"}
                          alt={profileData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm1-13a1 1 0 10-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{profileData.name || user?.name}</p>
                      <p className="text-sm text-text-secondary">{profileData.email || user?.email}</p>
                    </div>
                  </div>
                </div>
                {[
                  { id: "shopping", label: "나의 쇼핑" },
                  { id: "reviews", label: "나의 리뷰" },
                  ...(userType === "buyer" ? [{ id: "seller-apply", label: "판매자 신청" }] : []),
                  { id: "settings", label: "설정" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMenu(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedMenu === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-background-section"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">{renderContent()}</main>
          </div>
        </div>
      </div>
    </>
  )
}