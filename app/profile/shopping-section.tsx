import React from 'react'
import { Button } from '@/components/ui/button'
import { MyOrder } from '@/types/order'

// interface OrderDetail {
//   id: number
//   orderNumber: string
//   productName: string
//   productImage: string
//   price: number
//   orderDate: string
//   status: string
//   statusText: string
// }

interface ShoppingSectionProps {
  userPoints: number
  orderFilter: string
  setOrderFilter: (filter: string) => void
  filteredOrders: (MyOrder & { status: string; statusText: string })[]
  onViewOrderDetail: (orderId: number) => void
  onCancelOrder: (orderId: number) => void
  onNavigateToPoints: () => void
}

const orderStatuses = [
  { id: "all", label: "전체" },
  { id: "ordered", label: "주문완료" },
  { id: "shipping", label: "배송중" },
  { id: "delivered", label: "배송완료" },
  { id: "cancelled", label: "취소" },
]

export const ShoppingSection: React.FC<ShoppingSectionProps> = ({
  userPoints,
  orderFilter,
  setOrderFilter,
  filteredOrders,
  onViewOrderDetail,
  onCancelOrder,
  onNavigateToPoints,
}) => {
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
            onClick={onNavigateToPoints}
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
              key={order.orderId}
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
                  <Button variant="outline" size="sm" onClick={() => onViewOrderDetail(order.orderId)}>
                    주문 상세
                  </Button>
                  {order.status === "delivered" && (
                    <>
                    <Button variant="outline" size="sm">
                      리뷰 작성
                    </Button>
                    <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onCancelOrder(order.orderId)}
                  >
                    주문 취소
                  </Button>
                  </>
                  )}
                  {(order.status === "ordered" || order.status === "shipping") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onCancelOrder(order.orderId)}
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
}
