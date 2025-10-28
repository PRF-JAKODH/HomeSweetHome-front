"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

// 토스페이먼츠 SDK
import { loadPaymentWidget, PaymentWidgetInstance, ANONYMOUS } from '@tosspayments/payment-widget-sdk';

// 인터페이스 구간
interface CartItem {
  id: string
  productId: string
  name: string
  brand: string
  image: string
  price: number
  option: string
  quantity: number
}

interface Address {
  id: string
  name: string
  phone: string
  roadAddress: string
  detailAddress: string
  isDefault: boolean
}

// API 요청/응답 타입 정의

// 백엔드의 CreateOrderRequest DTO 안에 있는 OrderItemRequest 부분과 데이터 구조를 정확히 맞추기 위함.
// 개별 상품 정보의 타입을 정의함.
// 결제 페이지에서 '결제하기' 버튼을 눌렀을 때 사용됨.
interface OrderItemRequest{
  productId: string;
  quantity: number;
}

// 백엔드의 CreateOrderRequest.java 레코드와 데이터 구조를 1:1로 일치시키기 위해 만들었음.
// API계약(Contract)
// 결제 페이지에서 '결제하기' 버튼을 눌렀을 때 사용됨.
interface CreateOrderRequestDto {
  orderItems: OrderItemRequest[];
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingRequest: string;
}

// 백엔드의 OrderReadyResponse.java 레코드와 데이터 구조를 1:1로 일치시키기 위해 만들었음.
// 백엔드의 주문 생성 API 호출이 성공한 직후 사용됨.
// 백엔드에서 주문 생성 성공했고, 이 정보로 결제창을 띄우라고 알려주는 응답 양식.
interface OrderReadyResponseDto {
  merchantUid: string;
  orderName: string;
  totalAmount: number;
}

export default function CheckoutPage() {
  const router = useRouter()
  const [orderItems, setOrderItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("card")
  const [usePoints, setUsePoints] = useState<number>(0)
  const [availablePoints, setAvailablePoints] = useState<number>(5000)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    roadAddress: "",
    detailAddress: "",
    isDefault: false,
  })

  // 토스
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null); // 위젯 인스턴스 Ref 추가
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null); // 결제수단 위젯 Ref 추가
  const agreementWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderAgreement']> | null>(null); // 이용약관 위젯 Ref 추가



  // API 호출 같은 시간이 걸리는 비동기 작업이 진행중임을 사용자에게 알리기 위함. 중복 요청을 방지하기 위해 필요.
  // isLoading(상태 변수), isLoading이 true면 '결제하기' 버튼 비활성화, 버튼 텍스트를 '처리중...'으로 바꿈
  // isLoading이 false면 버튼을 활성화, 버튼 텍스트를 원래대로 ("결제하기") 표시.
  // setIsLoading: isLoading의 상태 변수의 값을 변경하는 함수.
  // handlePayment 함수가 시작될 때(API 호출 직전) setIsLoading(true)를 호출하여 로딩 상태로 만듬
  // API 호출이 완료되면 setIsLoading(false)를 호출하여 로딩 상태를 해제함.
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    const storedCart = localStorage.getItem("ohouse_cart")
    if (storedCart) {
      const cart = JSON.parse(storedCart)
      const selected = cart.filter((item: CartItem & { selected: boolean }) => item.selected)
      setOrderItems(selected)
    }

    const storedAddresses = localStorage.getItem("ohouse_addresses")
    if (storedAddresses) {
      const parsedAddresses = JSON.parse(storedAddresses)
      setAddresses(parsedAddresses)
      const defaultAddr = parsedAddresses.find((addr: Address) => addr.isDefault)
      if (defaultAddr) setSelectedAddress(defaultAddr.id)
    }
  }, [])

  const updateQuantity = (itemId: string, change: number) => {
    setOrderItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change)
          return { ...item, quantity: newQuantity }
        }
        return item
      })

      const storedCart = localStorage.getItem("ohouse_cart")
      if (storedCart) {
        const cart = JSON.parse(storedCart)
        const updatedCart = cart.map((item: CartItem & { selected: boolean }) => {
          const updatedItem = updated.find((u) => u.id === item.id)
          if (updatedItem) {
            return { ...item, quantity: updatedItem.quantity }
          }
          return item
        })
        localStorage.setItem("ohouse_cart", JSON.stringify(updatedCart))
      }

      return updated
    })
  }

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
    ;new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setNewAddress((prev) => ({ ...prev, roadAddress: data.roadAddress }))
      },
    }).open()
  }

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = totalPrice >= 50000 ? 0 : 3000
  const discount = usePoints
  const finalPrice = totalPrice + shippingFee - discount

// --- 클라이언트 키로 위젯 인스턴스 생성 (페이지 로드 시) ---
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      console.error('TOSS_CLIENT_KEY가 설정되지 않았습니다.');
      return;
    }

    // 비동기 함수 즉시 실행
    (async () => {
      try {
        // 결제위젯 인스턴스 생성
        const paymentWidget = await loadPaymentWidget(clientKey, ANONYMOUS); // 비회원 customerKey

        // 결제위젯 렌더링 (결제 금액 표시) - *옵셔널*: 금액을 미리 보여주고 싶다면 사용
         const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
           "#payment-widget", // 결제위젯 영역 렌더링 위치 (div id)
           { value: finalPrice }, // 최종 결제 금액 (UI 표시용, 실제 결제 금액은 requestPayment에서 설정)
           { variantKey: "DEFAULT" } // 위젯 스타일 variantKey (개발자센터 설정)
         );
         paymentMethodsWidgetRef.current = paymentMethodsWidget;

        // 이용약관 렌더링 - *필수*
        // @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
        const agreementWidget = paymentWidget.renderAgreement(
          '#agreement', // 이용약관 영역 렌더링 위치 (div id)
          { variantKey: 'DEFAULT' } // 약관 스타일 variantKey
        );
        agreementWidgetRef.current = agreementWidget;


        paymentWidgetRef.current = paymentWidget;
      } catch (error) {
        console.error("결제 위젯 로드 실패:", error);
        alert("결제 위젯을 불러오는 중 오류가 발생했습니다.");
      }
    })();
  }, [finalPrice]);



  // 시간이 걸리는 작업을 기다려야 하기 때문에 await를 사용하기 위해 async사용(백엔드 응답이 오기도 전에 실행되면 에러)(순서대로)
  // 백엔드 API 호출, 토스 결제창 호출
  const handlePayment = async () => {
    // 유효성 검사
    // 사용자가 '결제하기' 버튼을 클릭했을 때, 배송지를 선택했는지 확인하는 유효성 검사.
    if (!selectedAddress) {
      alert("배송지를 선택해주세요")
      return;
    }

    // 선택된 배송지 ID(selectedAddress)가 현재 보유하고 있는 배송지 목록(address)안에 존재하지 않는 비정상적인 상황을 대비한 안전장치
    // 데이터 일관성 확인, 오류 방지
    const currentAddress = addresses.find((addr) => addr.id === selectedAddress);
    if (!currentAddress) {
      alert ("선택된 배송지 정보를 찾을 수 없습니다.")
      return;
    }

    // API 요청을 시작하기 전에 로딩 상태를 활성화하고, 백엔드 서버 주소를 안전하게 가져오는 부분
    // handlePayment 함수가 시작되는 맨 앞부분에서 사용됨. API 요청을 보내기 전에 로딩 상태를 설정하고, 요청을 보낼 대상 URL을 준비하는 필수 단계
    // NEXT_PUBLIC_API_URL은 Spring Boot 서버의 주소(localhost:8080)를 저장하기 위해 정의한 환경 변수 이름.
    // Next.js에서는 브라우저에서 접근 가능한 환경 변수 이름 앞에 NEXT_PUBLIC을 붙임.
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      alert('API URL 환경 변수가 설정되지 않았습니다.')
      setIsLoading(false);
      return;
    }

    // --- 백엔드 API 1 요청 데이터 준비 ---

    // 주문 생성(API 1) 호출하기 직전에, 프론트엔드의 현재 상태(장바구니 상품, 선택된 배송지)를 백엔드가 이해할 수 있는 데이터 형식(CreateOrderRequestDto)
    // 으로 변환하는 부분.
    // 프론트는 도로명 주소(roadAddress)와 상세 주소(detailAddress)를 따로 관리하지만, 백엔드는 하나의 shippingAddress필드로 받길 원함.
    // trim()을 이용하여 두 주소를 합쳐서 하나의 문자열로 만들어줌
    // handlePayment 함수 안에서 실행됨.
    // 결제하기 버튼을 누르고, 배송지, API URL이 있는지 등의 기본 검증이 끝난 후 이 코드가 실행됨.
    const requestData: CreateOrderRequestDto = {
      orderItems: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      recipientName: currentAddress.name,
      recipientPhone: currentAddress.phone,
      shippingAddress: `${currentAddress.roadAddress} ${currentAddress.detailAddress}`.trim(), // 주소 조합
      shippingRequest: "",
    };

    try {
      // --- 백엔드 API 1 호출 ---
      console.log('API 1 요청 데이터:', requestData);
      const response = await axios.post<OrderReadyResponseDto>(
        `${apiUrl}/api/v1/orders`,
        requestData
        // (인증 필요 시 헤더 추가)
      );
      console.log('API 1 응답 데이터:', response.data);

      const { merchantUid, orderName, totalAmount } = response.data;

      // --- 성공 시, 토스 결제 요청 함수 호출 (3단계에서 구현) ---
      // TODO: 백엔드가 계산한 finalPrice(totalAmount)와 현재 finalPrice가 다른 경우 처리?
      // 우선 백엔드 값을 사용
      await requestTossPayment(merchantUid, orderName, totalAmount, currentAddress.name);

      // --- 주문 완료 후 처리 (임시 로직 제거) ---
      // localStorage.setItem("ohouse_last_order", JSON.stringify(order)) // <- 백엔드가 처리하므로 제거
      // const storedCart = localStorage.getItem("ohouse_cart") ... // <- 결제 성공 후 처리
      // router.push("/checkout/complete") // <- 결제 성공 후 처리

    } catch (error) {
      console.error('주문 생성 요청 실패:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`오류: ${error.response.data.message || '주문 생성 중 오류 발생'}`);
      } else {
        alert('주문 생성 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  //--requestTossPayment--
  const requestTossPayment = async (merchantUid: string, orderName: string, totalAmount: number, customerName: string) => {
    const paymentWidget = paymentWidgetRef.current;
    const agreementStatus = await agreementWidgetRef.current?.getAgreementStatus(); // 이용약관 동의 상태 확인

    // 필수 정보 및 약관 동의 확인
    if (!paymentWidget) {
      alert('결제 위젯이 로드되지 않았습니다.');
      return;
    }
     if (agreementStatus?.agreedRequiredTerms !== true) {
      alert("필수 이용약관에 동의해주세요.");
      return;
    }


    try {
      setIsLoading(true); // 토스 결제창 호출 직전 로딩 시작
      console.log('토스 결제 요청 실행:', { merchantUid, orderName, totalAmount, customerName });
      // ------ 결제창 띄우기 ------
      await paymentWidget.requestPayment({
        orderId: merchantUid,       // 백엔드 API 1 응답의 merchantUid
        orderName: orderName,       // 백엔드 API 1 응답의 orderName
        customerName: customerName, // 고객 이름
        successUrl: `${window.location.origin}/checkout/success`, // 성공 시 돌아올 URL (4단계 페이지)
        failUrl: `${window.location.origin}/checkout/fail`,     // 실패 시 돌아올 URL
      });
      // 성공/실패 처리는 successUrl/failUrl 페이지에서 백엔드 API 2를 호출하여 진행됨
    } catch (error) {
      console.error("토스 결제 요청 에러:", error);
      alert("결제 요청 중 오류가 발생했습니다.");
      setIsLoading(false); // 결제창 띄우기 실패 시 로딩 해제
    }
      // 결제창이 성공적으로 뜨면, 사용자가 닫거나 성공/실패 페이지로 이동하기 전까지 isLoading은 true 유지
  };


  return (
    <div className="min-h-screen bg-background">
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />

      <main className="mx-auto max-w-[1256px] px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">주문/결제</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">주문 상품</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-divider last:border-0 last:pb-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover bg-background-section"
                    />
                    <div className="flex-1">
                      <div className="mb-1 text-xs text-text-secondary">{item.brand}</div>
                      <h3 className="mb-1 text-sm font-medium text-foreground line-clamp-2">{item.name}</h3>
                      <div className="text-xs text-text-secondary">옵션: {item.option}</div>
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
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Address */}
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

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">결제 수단</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {/* <div className="flex items-center gap-3 rounded-lg border border-divider p-4 hover:border-primary cursor-pointer"> */}
                    {/* <RadioGroupItem value="card" id="card" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div> */}
                    {/* <label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="font-medium text-foreground">신용카드</div>
                      <div className="text-sm text-text-secondary">모든 카드 사용 가능</div>
                    </label> */}
                  {/* </div> */}
                  <div className="flex items-center gap-3 rounded-lg border border-divider p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="naverpay" id="naverpay" />
                    <img src="/naverpay-logo.png" alt="네이버페이" className="h-10 w-10 rounded-lg object-cover" />
                    <label htmlFor="naverpay" className="flex-1 cursor-pointer">
                      <div className="font-medium text-foreground">네이버페이</div>
                      <div className="text-sm text-text-secondary">간편결제</div>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-divider p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="tosspay" id="tosspay" />
                    <img src="/tosspay-logo.png" alt="토스페이" className="h-10 w-auto object-contain" />
                    <label htmlFor="tosspay" className="flex-1 cursor-pointer">
                      <div className="font-medium text-foreground">토스페이</div>
                      <div className="text-sm text-text-secondary">간편결제</div>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-divider p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="kakaopay" id="kakaopay" />
                    <img src="/kakaopay-logo.png" alt="카카오페이" className="h-10 w-auto object-contain" />
                    <label htmlFor="kakaopay" className="flex-1 cursor-pointer">
                      <div className="font-medium text-foreground">카카오페이</div>
                      <div className="text-sm text-text-secondary">간편결제</div>
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </Card>

            {/* Points */}
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

          {/* Right Column - Payment Summary */}
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

              {/* 토스 이용약관 위젯 렌더링 */}
              <div id="payment-widget" className="my-4" />
              <div id="agreement" className="my-4"/>

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
