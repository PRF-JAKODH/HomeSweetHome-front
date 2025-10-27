"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Package, User, Ban, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SettlementFilters from "@/components/settlement-filters"
import SettlementSummary from "@/components/settlement-summary"
import SettlementTable from "@/components/settlement-table"

export type PeriodType = "daily" | "weekly" | "monthly" | "yearly"
export type SettlementStatus = "carried-over" | "confirmed" | "completed"
export type DrillDownState = {
  level: "base" | "drilled"
  selectedPeriod: string | null
}

export default function SellerPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("products")
  const [period, setPeriod] = useState<PeriodType>("daily")
  const [status, setStatus] = useState<SettlementStatus | "all">("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    level: "base",
    selectedPeriod: null,
  })
  const [orderStatusFilter, setOrderStatusFilter] = useState("전체")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedProductOptions, setSelectedProductOptions] = useState<any>(null)
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())
  const [showOptionsModal, setShowOptionsModal] = useState(false) // Declare the variable here

  const settlementRecords = [
    {
      id: 1,
      status: "COMPLETED",
      salesAmount: 3200000,
      commission: 320000,
      vat: 32000,
      refundAmount: 0,
      settlementAmount: 2848000,
      settlementDate: "2025-10-15",
    },
    {
      id: 2,
      status: "COMPLETED",
      salesAmount: 4100000,
      commission: 410000,
      vat: 41000,
      refundAmount: 150000,
      settlementAmount: 3499000,
      settlementDate: "2025-10-14",
    },
    {
      id: 3,
      status: "HOLD",
      salesAmount: 5150000,
      commission: 515000,
      vat: 51500,
      refundAmount: 0,
      settlementAmount: 4583500,
      settlementDate: "2025-10-13",
    },
    {
      id: 4,
      status: "COMPLETED",
      salesAmount: 2800000,
      commission: 280000,
      vat: 28000,
      refundAmount: 200000,
      settlementAmount: 2292000,
      settlementDate: "2025-10-12",
    },
    {
      id: 5,
      status: "CANCELED",
      salesAmount: 1500000,
      commission: 150000,
      vat: 15000,
      refundAmount: 1500000,
      settlementAmount: 0,
      settlementDate: "2025-10-11",
    },
  ]

  const totalOrders = settlementRecords.length
  const totalSales = settlementRecords.reduce((sum, record) => sum + record.salesAmount, 0)
  const totalCommission = settlementRecords.reduce((sum, record) => sum + record.commission, 0)
  const totalVat = settlementRecords.reduce((sum, record) => sum + record.vat, 0)
  const totalRefund = settlementRecords.reduce((sum, record) => sum + record.refundAmount, 0)
  const totalSettlement = settlementRecords.reduce((sum, record) => sum + record.settlementAmount, 0)

  const getSettlementStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700"
      case "HOLD":
        return "bg-orange-100 text-orange-700"
      case "CANCELED":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getSettlementStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "정산 완료"
      case "HOLD":
        return "정산 보류"
      case "CANCELED":
        return "정산 취소"
      default:
        return status
    }
  }

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: "ORD-20251016-001",
      productName: "모던 미니멀 소파",
      productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100",
      customerName: "김철수",
      customerPhone: "010-1234-5678",
      customerAddress: "서울특별시 강남구 테헤란로 123",
      customerDetailAddress: "101동 1001호",
      orderAmount: 360000,
      orderDate: "2025-10-16 14:30",
      deliveryStatus: "주문 완료",
      option: null, // null for single product
      quantity: 2,
    },
    {
      id: 2,
      orderNumber: "ORD-20251016-002",
      productName: "우드 다이닝 테이블",
      productImage: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=100",
      customerName: "이영희",
      customerPhone: "010-2345-6789",
      customerAddress: "서울특별시 서초구 서초대로 456",
      customerDetailAddress: "202동 502호",
      orderAmount: 272000,
      orderDate: "2025-10-16 11:20",
      deliveryStatus: "배송 준비 중",
      option: "오크 / 4인용",
      quantity: 1,
    },
    {
      id: 3,
      orderNumber: "ORD-20251015-003",
      productName: "모던 미니멀 소파",
      productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100",
      customerName: "박민수",
      customerPhone: "010-3456-7890",
      customerAddress: "경기도 성남시 분당구 판교역로 789",
      customerDetailAddress: "A동 1203호",
      orderAmount: 360000,
      orderDate: "2025-10-15 16:45",
      deliveryStatus: "배송 중",
      option: null,
      quantity: 1,
    },
    {
      id: 4,
      orderNumber: "ORD-20251015-004",
      productName: "북유럽 스타일 책장",
      productImage: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=100",
      customerName: "최지은",
      customerPhone: "010-4567-8901",
      customerAddress: "서울특별시 송파구 올림픽로 321",
      customerDetailAddress: "B동 805호",
      orderAmount: 180000,
      orderDate: "2025-10-15 09:15",
      deliveryStatus: "배송 완료",
      option: null,
      quantity: 1,
    },
    {
      id: 5,
      orderNumber: "ORD-20251014-005",
      productName: "우드 다이닝 테이블",
      productImage: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=100",
      customerName: "정수진",
      customerPhone: "010-5678-9012",
      customerAddress: "인천광역시 연수구 송도과학로 654",
      customerDetailAddress: "C동 1504호",
      orderAmount: 272000,
      orderDate: "2025-10-14 13:50",
      deliveryStatus: "배송 완료",
      option: "월넛 / 6인용",
      quantity: 1,
    },
    {
      id: 6,
      orderNumber: "ORD-20251014-006",
      productName: "모던 미니멀 소파",
      productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100",
      customerName: "강동원",
      customerPhone: "010-6789-0123",
      customerAddress: "서울특별시 마포구 월드컵북로 987",
      customerDetailAddress: "D동 2101호",
      orderAmount: 360000,
      orderDate: "2025-10-14 10:30",
      deliveryStatus: "배송 중",
      option: null,
      quantity: 3,
    },
  ])

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "모던 미니멀 소파",
      mainImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
      category: "가구 > 거실가구 > 소파",
      originalPrice: 450000,
      discountRate: 20,
      finalPrice: 360000,
      stock: 15,
      shipping: "무료배송",
      status: "판매중",
      productType: "single" as const,
      createdAt: "2025-10-15",
    },
    {
      id: 2,
      name: "우드 다이닝 테이블",
      mainImage: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
      category: "가구 > 주방가구 > 식탁",
      originalPrice: 320000,
      discountRate: 15,
      finalPrice: 272000,
      shipping: "3,000원",
      status: "판매중",
      productType: "options" as const,
      createdAt: "2025-10-14",
      options: [
        { name: "오크 / 4인용", additionalPrice: 0, stock: 8 },
        { name: "오크 / 6인용", additionalPrice: 50000, stock: 3 },
        { name: "월넛 / 4인용", additionalPrice: 30000, stock: 5 },
        { name: "월넛 / 6인용", additionalPrice: 80000, stock: 0 },
      ],
    },
    {
      id: 3,
      name: "북유럽 스타일 책장",
      mainImage: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400",
      category: "가구 > 수납가구 > 책장",
      originalPrice: 180000,
      discountRate: 0,
      finalPrice: 180000,
      stock: 0,
      shipping: "무료배송",
      status: "품절",
      productType: "single" as const,
      createdAt: "2025-10-13",
    },
  ])

  const handleDeleteProduct = (productId: number) => {
    if (confirm("정말 이 상품을 삭제하시겠습니까?")) {
      alert("상품이 삭제되었습니다.")
    }
  }

  const handleStopSelling = (productId: number) => {
    if (confirm("이 상품의 판매를 중지하시겠습니까?")) {
      setProducts(products.map((product) => (product.id === productId ? { ...product, status: "판매 중지" } : product)))
      alert("상품 판매가 중지되었습니다.")
    }
  }

  const handleStartSelling = (productId: number) => {
    if (confirm("이 상품의 판매를 시작하시겠습니까?")) {
      setProducts(products.map((product) => (product.id === productId ? { ...product, status: "판매중" } : product)))
      alert("상품 판매가 시작되었습니다.")
    }
  }

  const menuItems = [
    {
      title: "정책 처리",
      subItems: ["정산 주기"],
    },
    {
      title: "수수료 관리",
      subItems: ["수수료 설정"],
    },
    {
      title: "정산 계산",
      subItems: ["지급액 자동 산출", "지급 현황 분류"],
    },
    {
      title: "정산 조회",
      subItems: ["정산 조회", "엑셀 다운로드"],
    },
  ]

  const settlementDetails = {
    "지급액 자동 산출": {
      code: "AD-003",
      description: "(총 매출액) - (판매 수수료)로 최종 지급액 계산한다.",
    },
    "지급 현황 분류": {
      code: "AD-004",
      description: "지급 완료된 내역을 조회한다.",
    },
    "엑셀 다운로드": {
      code: "AD-006",
      description: "조회된 내역 엑셀로 다운로드할 수 있다.",
    },
    "정산 주기": {
      code: "AD-001",
      description: "월별로 정산주기 설정한다.(정립일 기준 D+N일)",
    },
    "수수료 설정": {
      code: "AD-002",
      description: "단일 수수료로 설정한다.",
    },
    "정산 조회": {
      code: "AD-007",
      description: "일별/주별/월별/년별로 내역 조회할 수 있다.",
    },
  }

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, deliveryStatus: newStatus } : order)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "주문 완료":
        return "bg-blue-100 text-blue-700"
      case "배송 준비 중":
        return "bg-yellow-100 text-yellow-700"
      case "배송 중":
        return "bg-purple-100 text-purple-700"
      case "배송 완료":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredOrders =
    orderStatusFilter === "전체" ? orders : orders.filter((order) => order.deliveryStatus === orderStatusFilter)

  const handleShowCustomerInfo = (order: any) => {
    setSelectedCustomer(order)
    setShowCustomerModal(true)
  }

  const filteredProducts =
    dateRange.from || dateRange.to
      ? products.filter((product) => {
          const productDate = new Date(product.createdAt)
          return productDate >= dateRange.from && productDate <= dateRange.to
        })
      : products

  const toggleProductOptions = (productId: number) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const handleShowOptions = (product: any) => {
    setSelectedProductOptions(product)
    setShowOptionsModal(true)
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-500"
    if (stock < 5) return "text-orange-500"
    return "text-foreground"
  }

  const getTotalStock = (product: any) => {
    if (product.productType === "single") {
      return product.stock
    }
    return product.options.reduce((sum: number, opt: any) => sum + opt.stock, 0)
  }

  const handleDrillDown = (selectedPeriod: string) => {
    setDrillDown({
      level: "drilled",
      selectedPeriod,
    })
  }

  const handleBackToBase = () => {
    setDrillDown({
      level: "base",
      selectedPeriod: null,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1256px] px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">판매자 정보</h1>
          {activeTab === "products" && (
            <Button onClick={() => router.push("/seller/products/create")} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              상품 등록
            </Button>
          )}
        </div>

        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "products"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            재고 목록
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "stats"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            주문 목록
          </button>
          <button
            onClick={() => setActiveTab("settlement")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "settlement"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            정산
          </button>
        </div>

        {activeTab === "products" && (
          <div>
            {products.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-text-tertiary mb-4" />
                <h3 className="text-lg font-semibold mb-2">등록된 상품이 없습니다</h3>
                <p className="text-text-secondary mb-6">첫 상품을 등록하고 판매를 시작해보세요!</p>
                <Button
                  onClick={() => router.push("/seller/products/create")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  상품 등록하기
                </Button>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="p-4 border-b bg-background-section">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">등록일 조회:</span>
                    <input
                      type="date"
                      value={dateRange.from.toISOString().split("T")[0]}
                      onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <span className="text-sm">~</span>
                    <input
                      type="date"
                      value={dateRange.to.toISOString().split("T")[0]}
                      onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange({
                          from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                          to: new Date(),
                        })
                      }}
                    >
                      초기화
                    </Button>
                    <div className="ml-auto text-sm text-text-secondary">
                      총 <span className="font-semibold text-foreground">{filteredProducts.length}</span>개 상품
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-background-section">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">이미지</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">상품명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">카테고리</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">가격</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">할인율</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">재고</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">배송</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">등록일</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-background-section/50">
                          <td className="px-4 py-3">
                            <div className="relative w-16 h-16 rounded overflow-hidden">
                              <Image
                                src={product.mainImage || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium line-clamp-2 max-w-xs">{product.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-text-secondary">{product.category}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {product.discountRate > 0 && (
                                <div className="text-xs text-text-secondary line-through">
                                  ₩{product.originalPrice.toLocaleString()}
                                </div>
                              )}
                              <div className="font-semibold">₩{product.finalPrice.toLocaleString()}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {product.discountRate > 0 ? (
                              <span className="text-sm font-semibold text-red-500">{product.discountRate}%</span>
                            ) : (
                              <span className="text-sm text-text-secondary">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {product.productType === "single" ? (
                              <span className={`font-medium ${getStockColor(product.stock)}`}>{product.stock}개</span>
                            ) : (
                              <div className="space-y-1">
                                <div className={`font-medium ${getStockColor(getTotalStock(product))}`}>
                                  {getTotalStock(product)}개
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShowOptions(product)}
                                  className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                                >
                                  옵션별 보기
                                </Button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">{product.shipping}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-text-secondary">{product.createdAt}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                product.status === "판매중"
                                  ? "bg-green-100 text-green-700"
                                  : product.status === "판매 중지"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                수정
                              </Button>
                              {product.status === "판매 중지" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
                                  onClick={() => handleStartSelling(product.id)}
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  판매하기
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 bg-transparent"
                                  onClick={() => handleStopSelling(product.id)}
                                >
                                  <Ban className="w-3 h-3 mr-1" />
                                  판매 중지
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-text-secondary">
                    <Package className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
                    <p>선택한 기간에 등록된 상품이 없습니다.</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">주문 관리</h3>
                  <span className="text-sm text-text-secondary">
                    총 주문 수: <span className="font-semibold text-foreground">{orders.length}건</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={orderStatusFilter === "전체" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderStatusFilter("전체")}
                  >
                    전체
                  </Button>
                  <Button
                    variant={orderStatusFilter === "주문 완료" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderStatusFilter("주문 완료")}
                  >
                    주문 완료
                  </Button>
                  <Button
                    variant={orderStatusFilter === "배송 준비 중" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderStatusFilter("배송 준비 중")}
                  >
                    배송 준비 중
                  </Button>
                  <Button
                    variant={orderStatusFilter === "배송 중" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderStatusFilter("배송 중")}
                  >
                    배송 중
                  </Button>
                  <Button
                    variant={orderStatusFilter === "배송 완료" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderStatusFilter("배송 완료")}
                  >
                    배송 완료
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-background-section">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">주문번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">상품</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">옵션</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">주문금액</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">주문일시</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">배송상태</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">구매자 정보</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-background-section/50">
                        <td className="px-4 py-3 text-sm font-mono">{order.orderNumber}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={order.productImage || "/placeholder.svg"}
                                alt={order.productName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-sm line-clamp-2">{order.productName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {order.option ? (
                            <span className="text-text-secondary">{order.option}</span>
                          ) : (
                            <span className="text-text-tertiary">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{order.quantity}개</td>
                        <td className="px-4 py-3 text-sm font-mono font-semibold">
                          ₩{order.orderAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{order.orderDate}</td>
                        <td className="px-4 py-3">
                          <select
                            value={order.deliveryStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-3 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getStatusColor(
                              order.deliveryStatus,
                            )}`}
                          >
                            <option value="주문 완료">주문 완료</option>
                            <option value="배송 준비 중">배송 준비 중</option>
                            <option value="배송 중">배송 중</option>
                            <option value="배송 완료">배송 완료</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowCustomerInfo(order)}
                            className="flex items-center gap-1"
                          >
                            <User className="w-3 h-3" />
                            확인
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                  <Package className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
                  <p>해당 상태의 주문이 없습니다.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "settlement" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">정산 조회</h2>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="font-mono bg-background-section px-3 py-1 rounded">AD-007</span>
                <span>일별/주별/월별/년별로 내역 조회할 수 있다.</span>
              </div>
            </div>

            <SettlementFilters
              period={period}
              setPeriod={setPeriod}
              status={status}
              setStatus={setStatus}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

            <SettlementSummary period={period} status={status} dateRange={dateRange} />

            <SettlementTable
              period={period}
              status={status}
              dateRange={dateRange}
              drillDown={drillDown}
              onDrillDown={handleDrillDown}
              onBackToBase={handleBackToBase}
            />
          </div>
        )}
      </div>

      <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>구매자 정보</DialogTitle>
            <DialogDescription>주문번호: {selectedCustomer?.orderNumber}</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">구매자 이름</label>
                  <p className="mt-1 text-base font-medium">{selectedCustomer.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">연락처</label>
                  <p className="mt-1 text-base font-medium">{selectedCustomer.customerPhone}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">배송지 주소</label>
                <div className="mt-1 p-3 bg-background-section rounded-lg">
                  <p className="text-base">{selectedCustomer.customerAddress}</p>
                  <p className="text-base text-text-secondary mt-1">{selectedCustomer.customerDetailAddress}</p>
                </div>
              </div>

              <Button onClick={() => setShowCustomerModal(false)} className="w-full bg-primary hover:bg-primary/90">
                닫기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>옵션별 재고</DialogTitle>
            <DialogDescription>{selectedProductOptions?.name}</DialogDescription>
          </DialogHeader>
          {selectedProductOptions && selectedProductOptions.options && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-background-section">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">옵션명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">추가 금액</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">재고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedProductOptions.options.map((option: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm">{option.name}</td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {option.additionalPrice > 0 ? `+₩${option.additionalPrice.toLocaleString()}` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${getStockColor(option.stock)}`}>{option.stock}개</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={() => setShowOptionsModal(false)} className="w-full bg-primary hover:bg-primary/90">
                닫기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
