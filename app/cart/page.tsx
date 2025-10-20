"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  selected: boolean
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [allSelected, setAllSelected] = useState(true)

  useEffect(() => {
    const storedCart = localStorage.getItem("ohouse_cart")
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
  }, [])

  const updateCart = (items: CartItem[]) => {
    setCartItems(items)
    localStorage.setItem("ohouse_cart", JSON.stringify(items))
  }

  const handleSelectAll = (checked: boolean) => {
    setAllSelected(checked)
    const updatedItems = cartItems.map((item) => ({ ...item, selected: checked }))
    updateCart(updatedItems)
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const updatedItems = cartItems.map((item) => (item.id === id ? { ...item, selected: checked } : item))
    updateCart(updatedItems)
    setAllSelected(updatedItems.every((item) => item.selected))
  }

  const handleQuantityChange = (id: string, delta: number) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
    )
    updateCart(updatedItems)
  }

  const handleRemoveItem = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id)
    updateCart(updatedItems)
  }

  const handleRemoveSelected = () => {
    const updatedItems = cartItems.filter((item) => !item.selected)
    updateCart(updatedItems)
  }

  const selectedItems = cartItems.filter((item) => item.selected)
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = totalPrice >= 50000 ? 0 : 3000
  const finalPrice = totalPrice + shippingFee

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1256px] px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">장바구니</h1>

        {cartItems.length === 0 ? (
          <Card className="p-16 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="mb-6 text-lg text-text-secondary">장바구니가 비어있습니다</p>
            <Button onClick={() => router.push("/store")} className="bg-primary hover:bg-primary-dark text-white">
              쇼핑 계속하기
            </Button>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Select All & Delete */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="select-all" checked={allSelected} onCheckedChange={handleSelectAll} />
                  <label htmlFor="select-all" className="text-sm font-medium text-foreground cursor-pointer">
                    전체선택 ({selectedItems.length}/{cartItems.length})
                  </label>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemoveSelected} disabled={selectedItems.length === 0}>
                  선택삭제
                </Button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-4">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      />
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-24 w-24 rounded-lg object-cover bg-background-section"
                      />
                      <div className="flex-1">
                        <div className="mb-1 text-xs text-text-secondary">{item.brand}</div>
                        <h3 className="mb-2 text-sm font-medium text-foreground line-clamp-2">{item.name}</h3>
                        <div className="mb-2 text-xs text-text-secondary">옵션: {item.option}</div>
                        <div className="text-lg font-bold text-foreground">{item.price.toLocaleString()}원</div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-text-secondary hover:text-foreground"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-divider text-foreground hover:bg-background-section"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-divider text-foreground hover:bg-background-section"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">주문 정보</h2>
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
                  {totalPrice > 0 && totalPrice < 50000 && (
                    <div className="text-xs text-primary">50,000원 이상 구매 시 무료배송</div>
                  )}
                </div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">총 결제금액</span>
                  <span className="text-2xl font-bold text-primary">{finalPrice.toLocaleString()}원</span>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  disabled={selectedItems.length === 0}
                  onClick={() => router.push("/checkout")}
                >
                  {selectedItems.length}개 상품 주문하기
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mt-2 bg-transparent"
                  onClick={() => router.push("/store")}
                >
                  쇼핑 계속하기
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
