"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Script from "next/script"

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
  const [user, setUser] = useState<any>(null)
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
    ;new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setProfileData((prev) => ({
          ...prev,
          roadAddress: data.roadAddress,
        }))
      },
    }).open()
  }

  const orderStatuses = [
    { id: "all", label: "전체" },
    { id: "ordered", label: "주문 완료" },
    { id: "shipping", label: "배송 중" },
    { id: "delivered", label: "배송 완료" },
    { id: "cancelled", label: "취소/반품" },
  ]

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

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: profileData.name,
      email: profileData.email,
      picture: profileData.profileImage,
    }
    localStorage.setItem("ohouse_user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    alert("프로필이 저장되었습니다.")
  }

  const handleSellerApplication = () => {
    if (!termsAgreed) {
      alert("판매자 등록 약관에 동의해주세요.")
      return
    }

    setUserType("seller")
    setSellerGrade("SILVER")
    localStorage.setItem("ohouse_user_type", "seller")
    localStorage.setItem("ohouse_seller_grade", "SILVER")
    alert("판매자 신청이 완료되었습니다!")
    setSelectedMenu("settings")
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
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">나의 쇼핑</h2>
              <p className="text-text-secondary">구매한 상품과 배송 상태를 확인하세요</p>
            </div>

            <div className="bg-gradient-to-r from-[#35C5F0] to-[#2BA3D4] rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/80 mb-1">보유 포인트</p>
                    <p className="text-3xl font-bold">{userPoints.toLocaleString()}P</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                  size="sm"
                  onClick={() => router.push("/profile/points")}
                >
                  포인트 내역
                </Button>
              </div>
            </div>

            {/* Order Status Filter */}
            <div className="flex gap-2 border-b border-divider overflow-x-auto">
              {orderStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setOrderFilter(status.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    orderFilter === status.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">주문 내역이 없습니다.</div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-divider rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <img
                        src={order.productImage || "/placeholder.svg"}
                        alt={order.productName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{order.productName}</h3>
                        <p className="text-lg font-bold text-foreground mb-2">{order.price.toLocaleString()}원</p>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>주문일: {order.orderDate}</span>
                          <span
                            className={`font-medium ${
                              order.status === "delivered"
                                ? "text-green-600"
                                : order.status === "shipping"
                                  ? "text-blue-600"
                                  : order.status === "cancelled"
                                    ? "text-red-600"
                                    : "text-orange-600"
                            }`}
                          >
                            {order.statusText}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewOrderDetail(order.id)}>
                          주문 상세
                        </Button>
                        {order.status === "delivered" && (
                          <Button variant="outline" size="sm">
                            리뷰 작성
                          </Button>
                        )}
                        {(order.status === "ordered" || order.status === "shipping") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            주문 취소
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )

      case "reviews":
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
                      <Button variant="outline" size="sm" onClick={() => handleEditReview(review)}>
                        수정
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )

      case "seller-apply":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">판매자 신청</h2>
              <p className="text-text-secondary">홈스윗홈에서 판매자로 활동하기 위한 신청 페이지입니다</p>
            </div>

            <div className="max-w-3xl space-y-6">
              {/* Terms and Conditions */}
              <div className="border border-divider rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">판매자 등록 약관</h3>
                <div className="bg-background-section rounded-lg p-4 max-h-96 overflow-y-auto space-y-4 text-sm text-foreground">
                  <div>
                    <h4 className="font-semibold mb-2">제1조 (목적)</h4>
                    <p className="text-text-secondary leading-relaxed">
                      본 약관은 홈스윗홈(이하 "회사")이 운영하는 온라인 마켓플레이스에서 판매자로 활동하고자 하는
                      자(이하 "판매자")와 회사 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">제2조 (판매자의 의무)</h4>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      1. 판매자는 상품 정보를 정확하게 등록하고, 허위 또는 과장된 정보를 제공하지 않아야 합니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      2. 판매자는 구매자의 주문에 대해 신속하고 정확하게 배송해야 하며, 배송 지연 시 구매자에게 사전
                      통지해야 합니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      3. 판매자는 구매자의 문의 및 불만사항에 성실히 응대해야 합니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed">
                      4. 판매자는 관련 법령 및 회사의 정책을 준수해야 합니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">제3조 (수수료 및 정산)</h4>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      1. 회사는 판매 금액의 10%를 수수료로 부과합니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      2. 정산은 매월 말일 기준으로 익월 15일에 진행됩니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed">
                      3. 정산 금액은 판매자가 등록한 계좌로 입금됩니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">제4조 (반품 및 환불)</h4>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      1. 판매자는 구매자의 정당한 반품 요청에 응해야 합니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      2. 상품의 하자 또는 오배송으로 인한 반품 배송비는 판매자가 부담합니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed">
                      3. 단순 변심으로 인한 반품 배송비는 구매자가 부담합니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">제5조 (계약 해지)</h4>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      1. 판매자는 언제든지 판매자 계약을 해지할 수 있습니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed mb-2">
                      2. 회사는 판매자가 본 약관을 위반한 경우 계약을 해지할 수 있습니다.
                    </p>
                    <p className="text-text-secondary leading-relaxed">
                      3. 계약 해지 시 미정산 금액은 정산 일정에 따라 지급됩니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">제6조 (개인정보 보호)</h4>
                    <p className="text-text-secondary leading-relaxed">
                      판매자는 구매자의 개인정보를 판매 및 배송 목적으로만 사용해야 하며, 제3자에게 제공하거나
                      유출해서는 안 됩니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">제7조 (분쟁 해결)</h4>
                    <p className="text-text-secondary leading-relaxed">
                      본 약관과 관련하여 분쟁이 발생한 경우, 회사와 판매자는 상호 협의하여 해결하며, 협의가 이루어지지
                      않을 경우 관할 법원의 판결에 따릅니다.
                    </p>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-start gap-3 pt-4 border-t border-divider">
                  <Checkbox
                    id="terms-agree"
                    checked={termsAgreed}
                    onCheckedChange={(checked) => setTermsAgreed(checked as boolean)}
                  />
                  <label htmlFor="terms-agree" className="text-sm text-foreground cursor-pointer leading-relaxed">
                    위 판매자 등록 약관을 모두 확인하였으며, 이에 동의합니다.
                  </label>
                </div>
              </div>

              {/* Application Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSellerApplication}
                  disabled={!termsAgreed}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  판매자 신청하기
                </Button>
                <Button variant="outline" onClick={() => setSelectedMenu("shopping")} size="lg">
                  취소
                </Button>
              </div>

              {/* Information Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">판매자 신청 안내</p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• 판매자 신청 후 즉시 판매자 기능을 이용하실 수 있습니다.</li>
                      <li>• 판매자 정보 메뉴에서 상품 등록 및 주문 관리가 가능합니다.</li>
                      <li>• 문의사항은 고객센터로 연락 주시기 바랍니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">설정</h2>
              <p className="text-text-secondary">프로필 정보를 수정하세요</p>
            </div>

            <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                <Label>사용자 유형</Label>
                <div className="flex items-center gap-3 p-4 bg-background-section rounded-lg border border-divider">
                  <div
                    className={`px-4 py-2 rounded-full font-medium ${
                      userType === "seller"
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {userType === "seller" ? "판매자" : "구매자"}
                  </div>
                </div>
              </div>

              {userType === "seller" && (
                <div className="space-y-2">
                  <Label>등급</Label>
                  <div className="flex items-center gap-3 p-4 bg-background-section rounded-lg border border-divider">
                    <div className={`px-4 py-2 rounded-full font-medium ${getGradeColor(sellerGrade)}`}>
                      {sellerGrade}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Image */}
              <div className="space-y-2">
                <Label>프로필 이미지</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-background-section overflow-hidden">
                    {profileData.profileImage ? (
                      <img
                        src={profileData.profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <Button variant="outline">이미지 변경</Button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="이름을 입력하세요"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="이메일을 입력하세요"
                />
              </div>

              {/* Birthdate */}
              <div className="space-y-2">
                <Label htmlFor="birthdate">생년월일</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={profileData.birthdate}
                  onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="roadAddress">주소</Label>
                <div className="flex gap-2">
                  <Input
                    id="roadAddress"
                    value={profileData.roadAddress}
                    placeholder="도로명 주소"
                    readOnly
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddressSearch}>
                    주소 검색
                  </Button>
                </div>
                <Input
                  id="detailAddress"
                  value={profileData.detailAddress}
                  onChange={(e) => setProfileData({ ...profileData, detailAddress: e.target.value })}
                  placeholder="상세 주소를 입력하세요"
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
                  저장
                </Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("ohouse_user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    setProfileData({
      name: userData.name || "",
      email: userData.email || "",
      birthdate: "",
      roadAddress: "",
      detailAddress: "",
      profileImage: userData.picture || "",
    })
    const storedUserType = localStorage.getItem("ohouse_user_type") as "buyer" | "seller" | null
    if (storedUserType) {
      setUserType(storedUserType)
    }
    const storedGrade = localStorage.getItem("ohouse_seller_grade") as SellerGrade | null
    if (storedGrade) {
      setSellerGrade(storedGrade)
    }
  }, [router])

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
                    className={`text-lg font-semibold ${
                      selectedOrder.status === "delivered"
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
                      {user.picture ? (
                        <img
                          src={user.picture || "/placeholder.svg"}
                          alt={user.name}
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
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-text-secondary">{user.email}</p>
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
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedMenu === item.id
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
