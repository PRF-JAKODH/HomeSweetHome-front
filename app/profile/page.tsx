"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const [selectedReview, setSelectedReview] = useState<any>(null)
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


  const [myReviews, setMyReviews] = useState([
    {
      id: 1,
      productName: "모던 미니멀 소파",
      productImage: "/modern-minimalist-sofa.png",
      rating: 5,
      content: "정말 만족스러운 제품입니다. 디자인도 예쁘고 앉았을 때 편안해요. 거실 분위기가 확 바뀌었습니다!",
      date: "2025-01-15",
      images: ["/sofa-review-1.jpg", "/sofa-review-2.jpg"],
    },
    {
      id: 2,
      productName: "원목 다이닝 테이블",
      productImage: "/wooden-dining-table.png",
      rating: 4,
      content: "원목 질감이 좋고 튼튼합니다. 다만 조립이 조금 어려웠어요.",
      date: "2025-01-12",
      images: [],
    },
  ])

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

  const handleEditReview = (review: any) => {
    setSelectedReview(review)
    setEditReviewRating(review.rating)
    setEditReviewContent(review.content)
    setEditReviewImages(review.images)
    setEditReviewDialogOpen(true)
  }

  const handleEditReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          if (newImages.length === files.length) {
            setEditReviewImages([...editReviewImages, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSaveEditedReview = () => {
    if (editReviewRating === 0) {
      alert("별점을 선택해주세요.")
      return
    }
    if (!editReviewContent.trim()) {
      alert("리뷰 내용을 입력해주세요.")
      return
    }

    setMyReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === selectedReview.id
          ? {
            ...review,
            rating: editReviewRating,
            content: editReviewContent,
            images: editReviewImages,
          }
          : review,
      ),
    )

    setEditReviewDialogOpen(false)
    setSelectedReview(null)
    setEditReviewRating(0)
    setEditReviewContent("")
    setEditReviewImages([])
    alert("리뷰가 수정되었습니다.")
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
                        className={star <= (hoveredEditRating || editReviewRating) ? "text-warning" : "text-divider"}
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
                <label className="mb-2 block text-sm font-medium text-foreground">사진 첨부 (선택)</label>
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
                  {editReviewImages.length < 5 && (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-divider bg-background-section hover:bg-background-section/80">
                      <svg
                        className="mb-1 h-6 w-6 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-text-secondary">{editReviewImages.length}/5</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
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