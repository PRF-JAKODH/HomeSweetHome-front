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
import { useCheckoutStore } from '@/stores/checkout-store'

export default function CheckoutPage() {
  const router = useRouter()
  
  const orderItems = useCheckoutStore((state) => state.items);
  
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

  const [finalPrice, setFinalPrice] = useState<number>(0)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)

  useEffect(() => {
    const totalPrice = orderItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
    const discount = usePoints
    setTotalPrice(totalPrice)
    setDiscount(discount)
  }, [orderItems, usePoints])

  useEffect(() => {
    setFinalPrice(totalPrice + shippingFee - discount)
  }, [totalPrice, shippingFee, discount])

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedAddresses = localStorage.getItem("ohouse_addresses");
    if (storedAddresses) {
      const parsedAddresses = JSON.parse(storedAddresses);
      setAddresses(parsedAddresses);
      const defaultAddr = parsedAddresses.find((addr: Address) => addr.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    }
    
    // (Zustand 스토어가 sessionStorage에서 orderItems를 자동으로 불러옴)
    // (API 호출 및 localStorage 로직 모두 제거)
    
  }, []); // 의존성 배열 비우기

  const updateQuantity = (itemId: number, change: number) => {
    const currentItems = useCheckoutStore.getState().items;
    const updatedItems = currentItems.map((item) => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        console.log("TODO: API로 수량 변경 필요 (checkout 페이지)", item.id, newQuantity);
        return {...item, quantity: newQuantity};
      }
      return item;
    });
    useCheckoutStore.getState().setItems(updatedItems);
  };

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

  const handlePayment = async () => {
    setIsLoading(true);

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

    const orderId = orderReadyResponse?.orderNumber ?? "error";
    const orderName = orderReadyResponse?.orderName ?? "error";
    const totalAmount = orderReadyResponse?.totalAmount;
    const customerName = orderReadyResponse?.username ?? currentAddress.name;

    if (totalAmount === undefined) {
        alert("주문 생성에 실패했거나, 응답이 올바르지 않습니다.");
        setIsLoading(false);
        return;
    }
    console.log(orderReadyResponse)

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      alert("TOSS_CLIENT_KEY 환경 변수가 설정되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const tossPayments = await loadTossPayments(clientKey);
      const successUrl = `${window.location.origin}/checkout/success`;
      const failUrl = `${window.location.origin}/checkout/fail`;

      await tossPayments.requestPayment("CARD", {
        amount: totalAmount,
        orderId,
        orderName,
        customerName: customerName,
        successUrl,
        failUrl,
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

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
      return { orderName, orderNumber, totalAmount, username }

    } catch (error) {
      console.error('주문 생성 요청 실패:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`오류: ${error.response.data.message || '주문 생성 중 오류 발생'}`);
      } else {
        alert('주문 생성 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />

      <main className="mx-auto max-w-[1256px] px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">주문/결제</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">

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