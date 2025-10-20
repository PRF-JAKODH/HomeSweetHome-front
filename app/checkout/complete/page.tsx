"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Order {
  orderId: string
  items: any[]
  address: any
  paymentMethod: string
  usedPoints: number
  totalAmount: number
  orderDate: string
}

export default function CheckoutCompletePage() {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const storedOrder = localStorage.getItem("ohouse_last_order")
    if (storedOrder) {
      setOrder(JSON.parse(storedOrder))
      setTimeout(() => setShowSuccess(true), 100)
    } else {
      router.push("/")
    }
  }, [router])

  if (!order) return null

  const earnedPoints = Math.floor(order.totalAmount * 0.01)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[600px] px-4 py-16">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full bg-primary transition-all duration-500 ${
                showSuccess ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
            >
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">주문이 완료되었습니다!</h1>
          <p className="text-base text-text-secondary">주문해주셔서 감사합니다</p>
        </div>

        <Card className="p-6 mb-4 border-2 border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-divider">
              <span className="text-sm font-medium text-text-secondary">주문번호</span>
              <span className="font-mono font-bold text-base text-foreground">{order.orderId}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-divider">
              <span className="text-sm font-medium text-text-secondary">주문일시</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(order.orderDate).toLocaleString("ko-KR")}
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-divider">
              <span className="text-base font-medium text-text-secondary">결제금액</span>
              <span className="text-2xl font-bold text-primary">{order.totalAmount.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.96-7-5.54-7-10V8.3l7-3.11 7 3.11V10c0 4.46-3.14 9.04-7 10z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-sm font-medium text-foreground">적립 포인트</span>
              </div>
              <span className="text-lg font-bold text-primary">+{earnedPoints.toLocaleString()}P</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-base font-bold text-foreground">배송지 정보</h2>
          </div>
          <div className="space-y-2 text-sm bg-background-section rounded-lg p-4">
            <div className="flex">
              <span className="w-20 font-medium text-text-secondary">받는 사람</span>
              <span className="text-foreground font-medium">{order.address?.name}</span>
            </div>
            <div className="flex">
              <span className="w-20 font-medium text-text-secondary">연락처</span>
              <span className="text-foreground">{order.address?.phone}</span>
            </div>
            <div className="flex">
              <span className="w-20 font-medium text-text-secondary">주소</span>
              <span className="text-foreground">
                {order.address?.roadAddress} {order.address?.detailAddress}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-base font-bold text-foreground">주문 상품</h2>
          </div>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-3 pb-3 border-b border-divider last:border-0 last:pb-0">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover bg-background-section border border-divider"
                />
                <div className="flex-1">
                  <div className="text-xs text-text-secondary mb-1">{item.brand}</div>
                  <div className="text-sm font-medium text-foreground line-clamp-2 mb-1">{item.name}</div>
                  <div className="text-xs text-text-secondary">
                    {item.option} / 수량: {item.quantity}개
                  </div>
                </div>
                <div className="text-base font-bold text-foreground">
                  {(item.price * item.quantity).toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/profile?tab=shopping")}
            className="border-2 hover:border-primary hover:text-primary"
          >
            주문 내역 보기
          </Button>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-dark text-white font-bold"
            onClick={() => router.push("/")}
          >
            홈으로 가기
          </Button>
        </div>

        <div className="mt-6 rounded-lg bg-background-section p-4 text-sm text-text-secondary">
          <p className="mb-2 font-medium text-foreground">안내사항</p>
          <ul className="space-y-1 text-xs">
            <li>• 주문 내역은 마이페이지에서 확인하실 수 있습니다</li>
            <li>• 배송은 영업일 기준 2-3일 소요됩니다</li>
            <li>• 배송 관련 문의는 고객센터로 연락해주세요</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
