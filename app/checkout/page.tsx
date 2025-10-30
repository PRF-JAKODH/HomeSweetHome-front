"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect } from "react"
import { loadTossPayments } from "@tosspayments/payment-sdk"
import { useRouter } from "next/navigation"
import { useAuthStore } from '@/stores/auth-store';
import axios from "axios"
import { Address, CartResponse, ScrollResponse, CreateOrderRequestDto, OrderItemDetail, OrderReadyResponseDto } from "@/types/order"


export default function CheckoutPage() {
  const router = useRouter()
  const [orderItems, setOrderItems] = useState<CartResponse[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [usePoints, setUsePoints] = useState<number>(0)
  const [availablePoints, setAvailablePoints] = useState<number>(5000)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const accessToken = useAuthStore((state) => state.accessToken);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    roadAddress: "",
    detailAddress: "",
    isDefault: false,
  })

  // 결제 계산 변수들
  const [finalPrice, setFinalPrice] = useState<number>(0) // 최종 결제 금액
  const [totalPrice, setTotalPrice] = useState<number>(0) // 상품 총 금액
  const [shippingFee, setShippingFee] = useState<number>(0)// 배송비
  const [discount, setDiscount] = useState<number>(0) // 할인 금액

  // 최종 결제 금액이 바뀌는 경우? -> 수량 변경, point 적용
  useEffect(() => {
    const totalPrice = orderItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
    const discount = usePoints // point
    setTotalPrice(totalPrice)
    setDiscount(discount)
  }, [orderItems, usePoints])

  // 최종 결제 금액 변경
  useEffect(() => {
    setFinalPrice(totalPrice + shippingFee - discount)
  }, [totalPrice, shippingFee, discount])

  // 결제 진행 상태
  const [isLoading, setIsLoading] = useState(false);


  // ---( 서버에서 장바구니 정보 가져오기 useEffect )---
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const fetchCartItems = async () => {
      if (!accessToken) {
        console.warn("로그인되지 않음, 장바구니 조회 스킵");
        return;
      }
      if (!apiUrl) {
        console.error('API URL이 설정되지 않았습니다.');
        return;
      }

      try {
        console.log("GET /api/v1/carts 호출 시작...");
        const response = await axios.get<ScrollResponse<CartResponse>>(
          `${apiUrl}/api/v1/carts`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { size: 100 }
          }
        );

        console.log("장바구니 응답:", response.data);
        setOrderItems(response.data.contents || []);

      } catch (error) {
        console.error("장바구니 조회 실패:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          router.push("/login");
        } else {
          alert("장바구니 정보를 불러오는 데 실패했습니다.");
        }
      }
    };

    const storedAddresses = localStorage.getItem("ohouse_addresses");
    if (storedAddresses) {
      const parsedAddresses = JSON.parse(storedAddresses);
      setAddresses(parsedAddresses);
      const defaultAddr = parsedAddresses.find((addr: Address) => addr.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    }

    fetchCartItems();

  }, [accessToken, router]);
  // --- (데이터 조회 useEffect 끝) ---


  // --- (수량 변경 핸들러 함수) ---
  const updateQuantity = (itemId: number, change: number) => {
    setOrderItems((prev) => {
      return prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          console.log("TODO: API로 수량 변경 필요", item.id, newQuantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  // --- (배송지 추가 핸들러 함수) ---
  const handleAddAddress = () => {
    if (!newAddress.roadAddress || !newAddress.name || !newAddress.phone) {
      alert("필수 정보를 입력해주세요")
      return
    }
    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
    }
    const updatedAddresses = [...addresses, address]
    setAddresses(updatedAddresses)
    localStorage.setItem("ohouse_addresses", JSON.stringify(updatedAddresses))
    setSelectedAddress(address.id)
    setShowAddressForm(false)
    setNewAddress({ name: "", phone: "", roadAddress: "", detailAddress: "", isDefault: false })
  }

  const openAddressSearch = () => {
    ; new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setNewAddress((prev) => ({ ...prev, roadAddress: data.roadAddress }))
      },
    }).open()
  }
  // --- (기존 핸들러 함수들 끝) ---

  // 결제창 SDK 사용 (위젯 제거)


  // --- ( 결제하기 버튼 눌렀을 때 함수 ) ---
  const handlePayment = async () => {
    // 버튼 다시 클릭 방지용 로딩 안내
    setIsLoading(true);

    // 기본 검증
    if (!selectedAddress) {
      alert("배송지를 선택해주세요")
      return;
    }
    const currentAddress = addresses.find((addr) => addr.id === selectedAddress);
    if (!currentAddress) {
      alert("선택된 배송지 정보를 찾을 수 없습니다.")
      return;
    }

    const orderReadyResponse = await createOrderAPI(currentAddress)
    console.log(orderReadyResponse)

    // DTO 파싱


    // Toss 결제창 띄우기 준비
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      alert("TOSS_CLIENT_KEY 환경 변수가 설정되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const tossPayments = await loadTossPayments(clientKey);
      // const orderId = 'ORDER-123'
      // const orderId = `ORDER-${Date.now()}`;
      // if ( orderReadyResponse?.orderId == null){

      // }
      const orderId = orderReadyResponse?.orderNumber ?? "error";
      // const orderName = orderItems.length > 0 ? `${orderItems[0].productName} 외 ${Math.max(orderItems.length - 1, 0)}건` : "주문 상품";
      const orderName = orderReadyResponse?.orderName ?? "error";
      const successUrl = `${window.location.origin}/checkout/success`;
      const failUrl = `${window.location.origin}/checkout/fail`;

      await tossPayments.requestPayment("CARD", {
        amount: finalPrice,
        orderId,
        orderName,
        customerName: currentAddress.name,
        successUrl,
        failUrl,
      });
      // 성공 시 결제창이 successUrl 로 이동
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };
  // --- (handlePayment 끝) ---

  // ---(서버 API 호출 ) ----
  const createOrderAPI = async (currentAddress: Address) => {
    const requestData: CreateOrderRequestDto = {
      orderItems: orderItems.map(item => ({
        skuId: item.skuId,
        quantity: item.quantity,
      })),
      recipientName: currentAddress.name,
      recipientPhone: currentAddress.phone,
      shippingAddress: `${currentAddress.roadAddress} ${currentAddress.detailAddress}`.trim(),
      shippingRequest: "",
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      console.log('API 1 요청 데이터:', requestData);
      const response = await axios.post<OrderReadyResponseDto>(
        `${apiUrl}/api/v1/orders`,
        requestData,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      console.log('API 1 응답 데이터:', response.data);
      const { orderId, orderNumber, totalAmount, username, orderItems } = response.data;
      const orderName = orderItems.length > 0 ? orderItems[0].productName : "주문 상품";
      return { orderName, orderNumber}

    } catch (error) {
      console.error('주문 생성 요청 실패:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`오류: ${error.response.data.message || '주문 생성 중 오류 발생'}`);
      } else {
        alert('주문 생성 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  }


  // --- (JSX 렌더링: 기존과 동일) ---
  return (
    <div className="min-h-screen bg-background">
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />

      <main className="mx-auto max-w-[1256px] px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">주문/결제</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">

            {/* 주문 상품 (기존과 동일) */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">주문 상품</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-divider last:border-0 last:pb-0">
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.productName}
                      className="h-20 w-20 rounded-lg object-cover bg-background-section"
                    />
                    <div className="flex-1">
                      <div className="mb-1 text-xs text-text-secondary">{item.brand}</div>
                      <h3 className="mb-1 text-sm font-medium text-foreground line-clamp-2">{item.productName}</h3>
                      <div className="text-xs text-text-secondary">옵션: {item.optionSummary}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-divider hover:bg-background-section"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>

                          </button>
                          <span className="text-sm text-foreground w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-divider hover:bg-background-section"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <span className="text-base font-bold text-foreground">
                          {(item.finalPrice * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 배송지 (기존과 동일) */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">배송지</h2>
                <Button variant="outline" size="sm" onClick={() => setShowAddressForm(!showAddressForm)}>
                  {showAddressForm ? "취소" : "새 배송지 추가"}
                </Button>
              </div>
              {showAddressForm && (
                <div className="mb-6 space-y-4 rounded-lg border border-divider p-4 bg-background-section">
                  <div>
                    <Label htmlFor="addr-name">받는 사람</Label>
                    <Input
                      id="addr-name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-phone">연락처</Label>
                    <Input
                      id="addr-phone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-road">도로명 주소</Label>
                    <div className="flex gap-2">
                      <Input
                        id="addr-road"
                        value={newAddress.roadAddress}
                        readOnly
                        placeholder="주소 검색을 클릭하세요"
                      />
                      <Button type="button" variant="outline" onClick={openAddressSearch}>
                        주소 검색
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="addr-detail">상세 주소</Label>
                    <Input
                      id="addr-detail"
                      value={newAddress.detailAddress}
                      onChange={(e) => setNewAddress({ ...newAddress, detailAddress: e.target.value })}
                      placeholder="상세 주소를 입력하세요"
                    />
                  </div>
                  <Button onClick={handleAddAddress} className="w-full bg-primary hover:bg-primary-dark text-white">
                    배송지 추가
                  </Button>
                </div>
              )}

              {addresses.length === 0 ? (
                <p className="text-center text-sm text-text-secondary py-8">등록된 배송지가 없습니다</p>
              ) : (
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="flex items-start gap-3 rounded-lg border border-divider p-4 hover:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value={addr.id} id={addr.id} />
                        <label htmlFor={addr.id} className="flex-1 cursor-pointer">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-medium text-foreground">{addr.name}</span>
                            {addr.isDefault && (
                              <span className="rounded bg-primary px-2 py-0.5 text-xs text-white">기본</span>
                            )}
                          </div>
                          <div className="text-sm text-text-secondary">{addr.phone}</div>
                          <div className="mt-1 text-sm text-foreground">
                            {addr.roadAddress} {addr.detailAddress}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </Card>

            {/* [제거] 결제 수단 Card (솔루션 1) */}

            {/* 포인트 사용 (기존과 동일) */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">포인트 사용</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">보유 포인트</span>
                  <span className="font-medium text-foreground">{availablePoints.toLocaleString()}P</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={usePoints}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), availablePoints, totalPrice)
                      setUsePoints(Math.max(0, value))
                    }}
                    placeholder="사용할 포인트"
                    min={0}
                    max={Math.min(availablePoints, totalPrice)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setUsePoints(Math.min(availablePoints, totalPrice))}
                    className="whitespace-nowrap"
                  >
                    전액 사용
                  </Button>
                </div>
                <p className="text-xs text-text-secondary">
                  최대 {Math.min(availablePoints, totalPrice).toLocaleString()}P까지 사용 가능
                </p>
              </div>
            </Card>
          </div>

          {/* 결제 정보 (sticky, 우측) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">결제 정보</h2>
              <div className="space-y-3 border-b border-divider pb-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">상품금액</span>
                  <span className="font-medium text-foreground">{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">배송비</span>
                  <span className="font-medium text-foreground">
                    {shippingFee === 0 ? "무료" : `${shippingFee.toLocaleString()}원`}
                  </span>
                </div>
                {usePoints > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">포인트 사용</span>
                    <span className="font-medium text-primary">-{usePoints.toLocaleString()}원</span>
                  </div>
                )}
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-bold text-foreground">최종 결제금액</span>
                <span className="text-2xl font-bold text-primary">{finalPrice.toLocaleString()}원</span>
              </div>
              <div className="mb-4 rounded-lg bg-background-section p-3 text-xs text-text-secondary">
                <p className="mb-1">• 주문 완료 시 {Math.floor(finalPrice * 0.01).toLocaleString()}P 적립</p>
                <p>• 결제 완료 후 취소/변경은 고객센터로 문의해주세요</p>
              </div>

              {/* 토스 위젯 UI는 오버레이에서 렌더링됩니다. */}

              {/* 결제하기 버튼 */}
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary-dark text-white"
                onClick={handlePayment}
                disabled={!selectedAddress || orderItems.length === 0 || isLoading}
              >
                {isLoading ? '처리 중...' : `${finalPrice.toLocaleString()}원 결제하기`}
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}