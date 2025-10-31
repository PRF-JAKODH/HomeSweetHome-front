"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react" // useCallback으로 메모이제이션
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
import { useAuthStore } from "@/stores/auth-store"
import { apiClient } from "@/lib/api/client"
import axios from "axios"
import { OrderDetailResponseDto, MyOrder, OrderDetail } from "@/types/order"

type SellerGrade = "VVIP" | "VIP" | "GOLD" | "SILVER"


export default function ProfilePage() {
  const router = useRouter()
  const { fetchUser, makeSeller, uploadUserProfile, user } = useUser()
  const accessToken = useAuthStore((state) => state.accessToken);
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

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    roadAddress: "",
    detailAddress: "",
    profileImage: "",
    profileImageFile: null as File | null,
  })

  const [myOrders, setMyOrders] = useState<MyOrder[]>([])

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
        order.orderId === selectedOrderId ? { ...order, orderStatus: "CANCELED", deliveryStatus: "CANCELED" } : order
      ),
    )
    setCancelDialogOpen(false)
    setCancelReason("")
    setSelectedOrderId(null)
    alert("주문이 취소되었습니다.")
  }

  const getStatusText = (orderStatus: string, deliveryStatus: string): string => {
    if (orderStatus === 'FAILED' || deliveryStatus === 'CANCELLED') return '취소/환불';
    if (orderStatus === 'PENDING') return '결제 대기중';
    if (orderStatus === 'COMPLETED') {
        if (deliveryStatus === 'BEFORE_SHIPMENT') return '배송 준비중';
        if (deliveryStatus === 'DELIVERING') return '배송 중';
        if (deliveryStatus === 'DELIVERED') return '배송 완료';
    }
    return '상태 확인중'; // 기본값
};

  const filteredOrders = myOrders
  .map(order => ({
    ...order,
    status: order.deliveryStatus,
    statusText: getStatusText(order.orderStatus, order.deliveryStatus)
  }))
  .filter((order) => {
    if (orderFilter === "all") return true;
    if (orderFilter === "cancelled") return order.deliveryStatus === "CANCELLED";
    if (orderFilter === "ordered") return order.deliveryStatus === "BEFORE_SHIPMENT";
    if (orderFilter === "shipping") return order.deliveryStatus === "DELIVERING";
    if (orderFilter === "delivered") return order.deliveryStatus === "DELIVERED";
    return false;
  });

  const handleSaveProfile = async () => {
    if (!user) return

    // 백엔드 @RequestPart("request") UpdateUserRequest에 맞춰 JSON 구성
    const requestPayload = {
      name: profileData.name,
      email: profileData.email,
      phoneNumber: profileData.phone,
      birthDate: profileData.birthdate || '',
      address: `${profileData.roadAddress}/${profileData.detailAddress}`,
    }

    const formData = new FormData()
    formData.append('request', new Blob([JSON.stringify(requestPayload)], { type: "application/json" }))
    if (profileData.profileImageFile) {
      const originalFile = profileData.profileImageFile
      const mimeType = originalFile.type || 'image/jpeg'
      const typeExt = mimeType.includes('/') ? mimeType.split('/')[1] : ''
      const nameExt = originalFile.name.includes('.') ? originalFile.name.split('.').pop() || '' : ''
      const ext = (typeExt || nameExt || 'jpg').toLowerCase()
      const renamedFile = new File([originalFile], `profile.${ext}` , { type: mimeType })
      formData.append('profileImage', renamedFile)
    }

    const success = await uploadUserProfile(formData)
    if (success) {
      alert('프로필이 저장되었습니다.')
    } else {
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.')
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

  const handleViewOrderDetail = async (orderId: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || !accessToken) {
      alert("API 주소 또는 로그인 정보가 없습니다.");
      return;
    }

    try {
      // 1. 백엔드 API 2 (주문 상세 조회) 호출
      // (수정) API 응답 타입을 백엔드 DTO와 일치하는 'OrderDetailResponseDto'로 수정
      console.log(`GET /api/v1/orders/${orderId} 호출 시작...`);
      const backendData = await apiClient.get<OrderDetailResponseDto>(
        `${apiUrl}/api/v1/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      console.log("주문 상세 응답:", backendData);
      
      // 2. 백엔드 DTO(backendData)를 프론트엔드 모달 타입(OrderDetail)으로 변환
      
      // (임시) 상세 모달은 대표 상품 1개만 보여준다고 가정 (기존 Mock 데이터 기준)
      // TODO: 모달 UI가 여러 상품(orderItems)을 표시하도록 수정 필요
      const firstItem = backendData.orderItems[0]; 
      
      const orderForModal: OrderDetail = {
        id: backendData.orderId,
        orderNumber: backendData.orderNumber,
        orderDate: backendData.orderDate,
        
        // --- (수정) 백엔드 DTO의 실제 상태값으로 status/statusText 생성 ---
        status: backendData.deliveryStatus, 
        statusText: getStatusText(backendData.orderStatus, backendData.deliveryStatus),
        
        // --- (수정) 백엔드 데이터로 채우기 ---
        customerName: backendData.customerName,
        customerPhone: backendData.customerPhone,
        customerEmail: backendData.customerEmail,
        shippingAddress: backendData.shippingAddress,
        detailAddress: "", // (백엔드 DTO에 detailAddress가 없으므로 빈 값 처리)
        paymentMethod: backendData.paymentMethod,
        pointsUsed: backendData.usedPoint,
        
        // --- (수정) 첫 번째 아이템 정보로 모달 채우기 (임시) ---
        productName: firstItem?.productName || "상품 정보 없음",
        productImage: firstItem?.productImage || "/placeholder.svg",
        price: backendData.totalAmount, // (모달 UI와 협의 필요 - 상품금액? 총결제금액?)
        option: firstItem?.optionName || "-",
        quantity: firstItem?.quantity || 0,
        shippingFee: backendData.totalShippingPrice, // 상품별 배송비가 아닌 총 배송비로 우선 대체
        sellerName: firstItem?.sellerName || "-",
      };

      setSelectedOrder(orderForModal); // 3. 상태 저장
      setOrderDetailOpen(true); // 4. 모달 열기

    } catch (error) {
      console.error("주문 상세 조회 실패:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`오류: ${error.response.data.message || '주문 상세 정보를 불러오는 데 실패했습니다.'}`);
      } else {
        alert('주문 상세 조회 중 알 수 없는 오류가 발생했습니다.');
      }
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
        return <ReviewsSection />

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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // --- 나의 주문 목록 조회 ---
    const fetchMyOrders = async () => {
      if (!accessToken || !apiUrl) {
        if (!accessToken) console.warn("로그인되지 않음, 주문 목록 조회 스킵");
        return;
      }
      try {
        console.log("GET /api/v1/orders 호출 시작...");
        const response = await apiClient.get<MyOrder[]>(
          `${apiUrl}/api/v1/orders`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        console.log("주문 목록 응답:", response);
        setMyOrders(response);
      } catch (error) {
        console.error("주문 목록 조회 실패:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
           alert("세션이 만료되었습니다. 다시 로그인해주세요.");
           router.push("/login");
        } else {
           alert("주문 목록을 불러오는 데 실패했습니다.");
        }
      }
    };

    const fetchUserData = async () => {
      try {
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
            profileImageFile: null,
          }))
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error)
        // 에러가 발생해도 페이지는 표시하도록 함
      }
    }
    fetchUserData();
    fetchMyOrders();

    const storedUserType = localStorage.getItem("ohouse_user_type") as "buyer" | "seller" | null
    if (storedUserType) {
      setUserType(storedUserType)
    }

    const storedGrade = localStorage.getItem("ohouse_seller_grade") as SellerGrade | null
    if (storedGrade) {
      setSellerGrade(storedGrade)
    }
  }, [router, accessToken]);

  // 리뷰 관련 useEffect 제거 - ReviewsSection에서 처리

  // 로딩 상태 표시 (선택사항)
  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p>사용자 정보를 불러오는 중...</p>
  //       </div>
  //     </div>
  //   )
  // }
  return (
    <>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />

      {/* 리뷰 수정 다이얼로그 제거 - ReviewsSection에서 처리 */}

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
                      <p className="font-semibold text-foreground">{profileData.name || user?.name || "사용자"}</p>
                      <p className="text-sm text-text-secondary">{profileData.email || user?.email || "이메일을 불러오는 중..."}</p>
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