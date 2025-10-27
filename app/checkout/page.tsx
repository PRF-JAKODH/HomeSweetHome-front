"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

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

  useEffect(() => {
    // TODO: API를 통해 장바구니 데이터 조회하도록 수정 필요
    // 현재는 빈 배열로 초기화
    setOrderItems([])

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

      // TODO: API를 통해 장바구니 수량 업데이트하도록 수정 필요
      // 로컬 스토리지 로직 제거

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

  const handlePayment = () => {
    if (!selectedAddress) {
      alert("배송지를 선택해주세요")
      return
    }

    const order = {
      orderId: `ORD${Date.now()}`,
      items: orderItems,
      address: addresses.find((addr) => addr.id === selectedAddress),
      paymentMethod,
      usedPoints: usePoints,
      totalAmount: finalPrice,
      orderDate: new Date().toISOString(),
    }

    localStorage.setItem("ohouse_last_order", JSON.stringify(order))

    // TODO: API를 통해 주문 완료 후 장바구니에서 해당 상품들 제거하도록 수정 필요
    // 로컬 스토리지 로직 제거

    router.push("/checkout/complete")
  }

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = totalPrice >= 50000 ? 0 : 3000
  const discount = usePoints
  const finalPrice = totalPrice + shippingFee - discount

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
                  <div className="flex items-center gap-3 rounded-lg border border-divider p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="font-medium text-foreground">신용카드</div>
                      <div className="text-sm text-text-secondary">모든 카드 사용 가능</div>
                    </label>
                  </div>
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
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary-dark text-white"
                onClick={handlePayment}
                disabled={!selectedAddress || orderItems.length === 0}
              >
                {finalPrice.toLocaleString()}원 결제하기
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
