"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Package, User, Ban, Play, ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SettlementFilters from "@/components/settlement-filters"
import SettlementSummary from "@/components/settlement-summary"
import SettlementTable from "@/components/settlement-table"
import { ProductManageResponse, ProductStatus, SkuStockResponse } from "@/types/api/product"
import { getSellerProducts, getProductStock } from "@/lib/api/products"
import { fetchSettlementByPeriod } from "@/api/sapi"
import { useAuthStore } from "@/stores/auth-store"
import { updateProductStatus } from "@/lib/api/products"
import { Week } from "react-day-picker"

export type PeriodType = "daily" | "weekly" | "monthly" | "yearly"
export type SettlementStatus = "pending" | "canceled" | "completed"
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
    from: new Date(),
    to: new Date(),
  })

  const [drillDown, setDrillDown] = useState<DrillDownState>({
    level: "base",
    selectedPeriod: null,
  })


  // 정산
  const user = useAuthStore((s) => s.user)
  console.log(`user: ${user}`);

  const isHydrated = useAuthStore((s) => s.isHydrated)

  const userId = isHydrated ? user?.id : undefined

  console.log("🪪 auth store:", { user, isHydrated })
  console.log("🆔 userId:", user?.id)

  const [settlementData, setSettlementData] = useState<any[]>([])
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementError, setSettlementError] = useState<string | null>(null)

  // 서버에서 인증 상태를 검증하고 최신화
  // useEffect(() => {
  //   console.log("💾 zustand:", { isHydrated })
  // }, [ isHydrated])

  const PERIOD_PATH: Record<PeriodType, string> = {
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    yearly: "yearly",
  }

  useEffect(() => {
    // 1) 아예 조건부터 박아버리기
    if (activeTab !== "settlement") return
    if (!isHydrated) return
    if (!userId) return

    // Nullable 해제
    const id = userId

    // 2) 날짜는 로컬 기준으로
    const selectedDate = dateRange.from
      ? new Date(dateRange.from.getTime() - dateRange.from.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0]
      : new Date().toISOString().split("T")[0]
    console.log("selectedData ===>", selectedDate)
    async function getSettlement() {
      setSettlementLoading(true)
      setSettlementError(null)

      try {
        const res = await fetchSettlementByPeriod(id, period, selectedDate)
        const list = Array.isArray(res) ? res.map(normalize) : [normalize(res)]
        setSettlementData(list)
      } catch (error: any) {
        setSettlementError(error.message ?? "정산 데이터를 불러오지 못합니다")
      } finally {
        setSettlementLoading(false)
      }
    }

    getSettlement()
  }, [activeTab, dateRange, status])


  const normalize = (item: any) => {
    if (!item) return {}

    const base = {
      totalSales: item.totalSales ?? 0,
      totalFee: item.totalFee ?? 0,
      totalVat: item.totalVat ?? 0,
      totalRefund: item.totalRefund ?? 0,
      totalSettlement: item.totalSettlement ?? 0,
      totalCount: item.totalCount ?? 0,
      settlementStatus: item.settlementStatus ?? null,
      settlementDate: item.settlementDate ?? null,
      completedRate: item.completedRate ?? 0,
      growthRate: item.growthRate ?? 0,
    }

    if (period === "daily") {
      return {
        ...base,
        // 백: orderedAt → 프론트: date 로 통일
        date: item.orderedAt ?? item.settlementDate ?? item.date ?? null,
        settlementDate: item.settlementDate ?? null,
      }
    }

    if (period === "weekly") {
      return {
        ...base,
        year: item.year ?? null,
        month: item.month ?? null,
        week: item.week ?? null,
        // 백: weekStartDate / weekEndDate → 프론트: startDate / endDate
        startDate: item.weekStartDate ?? null,
        endDate: item.weekEndDate ?? null,
      }
    }
    if (period === "monthly") {
      return {
        ...base,
        year: item.year ?? null,
        month: item.month ?? null,
      }
    }

    // yearly
    return {
      ...base,
      year: item.year ?? null,
    }
  }
  const [orderStatusFilter, setOrderStatusFilter] = useState("전체")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedProductOptions, setSelectedProductOptions] = useState<any>(null)
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedProductStock, setSelectedProductStock] = useState<{
    product: ProductManageResponse
    stockData: SkuStockResponse[]
  } | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [showEditOptionsModal, setShowEditOptionsModal] = useState(false)
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<ProductManageResponse | null>(null)


  // 정산 상태
  const getSettlementStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700"
      case "PENDING":
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
        return "정산 진행중"
      case "CANCELED":
        return "정산 취소"
      default:
        return status
    }
  }

  const [orders, setOrders] = useState<any[]>([])

  const [products, setProducts] = useState<ProductManageResponse[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  // 판매자 상품 목록 조회
  const fetchSellerProducts = async () => {
    setProductsLoading(true)
    setProductsError(null)
    try {
      const startDate = dateRange.from ? dateRange.from.toISOString().split('T')[0] : undefined
      const endDate = dateRange.to ? dateRange.to.toISOString().split('T')[0] : undefined

      const response = await getSellerProducts(startDate, endDate)
      setProducts(response)
    } catch (error) {
      console.error('상품 목록 조회 실패:', error)
      setProductsError('상품 목록을 불러오는데 실패했습니다.')
    } finally {
      setProductsLoading(false)
    }
  }

  // 날짜 범위 변경 시 상품 목록 다시 조회
  useEffect(() => {
    if (activeTab === "products") {
      fetchSellerProducts()
    }
  }, [dateRange, activeTab])

  const handleDeleteProduct = (productId: number) => {
    if (confirm("정말 이 상품을 삭제하시겠습니까?")) {
      alert("상품이 삭제되었습니다.")
    }
  }

  const handleStopSelling = async (productId: number) => {
    if (confirm("이 상품의 판매를 중지하시겠습니까?")) {
      try {
        await updateProductStatus(productId.toString(), ProductStatus.SUSPENDED)
        // 성공 시 로컬 상태 업데이트
        setProducts(products.map((product) => (product.id === productId ? { ...product, status: ProductStatus.SUSPENDED } : product)))
        alert("상품 판매가 중지되었습니다.")
        // 목록 새로고침
        await fetchSellerProducts()
      } catch (error) {
        console.error('판매 중지 실패:', error)
        alert("판매 중지에 실패했습니다. 다시 시도해주세요.")
      }
    }
  }

  const handleStartSelling = async (productId: number) => {
    if (confirm("이 상품의 판매를 시작하시겠습니까?")) {
      try {
        await updateProductStatus(productId.toString(), ProductStatus.ON_SALE)
        // 성공 시 로컬 상태 업데이트
        setProducts(products.map((product) => (product.id === productId ? { ...product, status: ProductStatus.ON_SALE } : product)))
        alert("상품 판매가 시작되었습니다.")
        // 목록 새로고침
        await fetchSellerProducts()
      } catch (error) {
        console.error('판매 시작 실패:', error)
        alert("판매 시작에 실패했습니다. 다시 시도해주세요.")
      }
    }
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

  // API에서 이미 날짜 필터링을 하므로 클라이언트 사이드 필터링 제거
  const filteredProducts = products

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

  // 옵션별 재고 조회
  const handleShowStockOptions = async (product: ProductManageResponse) => {
    setStockLoading(true)
    try {
      const stockData = await getProductStock(product.id.toString())
      console.log('재고 조회 응답:', stockData) // 디버깅용

      // 단일 옵션 제품인 경우 단일 옵션 재고만 표시
      const processedStockData = Array.isArray(stockData) ? stockData : []

      setSelectedProductStock({
        product,
        stockData: processedStockData
      })
      setShowStockModal(true)
    } catch (error) {
      console.error('재고 조회 실패:', error)
      alert('재고 정보를 불러오는데 실패했습니다.')
    } finally {
      setStockLoading(false)
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-500"
    if (stock < 5) return "text-orange-500"
    return "text-foreground"
  }

  const getTotalStock = (product: ProductManageResponse) => {
    return product.totalStock
  }
  // 클릭된 값이 "2025-11월" 이든 "11" 이든 다 숫자 11로 바꿔줌

  // 1) 월 텍스트 -> 숫자
  const toMonthNumber = (v: string) => {
    if (!v) return NaN
    if (/^\d+$/.test(v)) return Number(v)
    const m = v.match(/(\d{1,2})월?$/) || v.match(/-(\d{1,2})$/)
    return m ? Number(m[1]) : NaN
  }
  // 1) 월의 주(월~일) 범위 만들기 (컴포넌트 밖/위에 두면 재사용 좋아요)
  function listWeeksOfMonth(year: number, month: number) {
    const first = new Date(year, month - 1, 1)
    const last = new Date(year, month, 0) // 해당 월 말일

    const firstWeekStart = (() => {
      const d = new Date(first)
      const dow = d.getDay() === 0 ? 7 : d.getDay() // Sun=0 → 7
      d.setDate(d.getDate() - (dow - 1)) // 월요일
      return d
    })()

    const toYmd = (x: Date) =>
      `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`

    const weeks: { start: string; end: string; rep: string }[] = []
    for (let s = new Date(firstWeekStart); s <= last; s.setDate(s.getDate() + 7)) {
      const e = new Date(s); e.setDate(e.getDate() + 6) // 일요일
      weeks.push({
        start: toYmd(new Date(s)),
        end: toYmd(e),
        rep: toYmd(new Date(s)), // weekly API에 넣을 대표일(주 시작일)
      })
    }
    return weeks
  }

  const handleDrillDown = async (selectedPeriod: string) => {
    console.log("드릴 다운 클릭 됌")
    let parsed: any = null
    try { parsed = JSON.parse(selectedPeriod) } catch { parsed = null }

    // ✅ 주별 → 일별
    if (parsed?.start && parsed?.end && userId) {
      const start = new Date(parsed.start)
      const end = new Date(parsed.end)
      const days: string[] = []
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(d.toISOString().slice(0, 10))
      }

      setSettlementLoading(true)
      try {
        const dailyList = await Promise.all(
          days.map((day) => fetchSettlementByPeriod(userId, "daily", day))
        )

        const normalized = dailyList.map((res, idx) => ({
          date: days[idx],
          totalSales: res?.totalSales ?? 0,
          totalFee: res?.totalFee ?? 0,
          totalVat: res?.totalVat ?? 0,
          totalRefund: res?.totalRefund ?? 0,
          totalSettlement: res?.totalSettlement ?? 0,
          totalCount: res?.totalCount ?? 0,
          settlementStatus: res?.settlementStatus ?? null,
        }))

        setSettlementData(normalized)
        setPeriod("daily")
        setDrillDown({ level: "drilled", selectedPeriod })
      } catch (e: any) {
        console.error(e)
        setSettlementError("선택한 주의 일별 데이터를 불러오지 못했습니다.")
      } finally {
        setSettlementLoading(false)
      }
      return
    }

    // ✅ 월별 → 주별 (주별→일별과 동일한 Promise.all 패턴)
    if ((parsed?.year || parsed?.month) && userId) {
      const year = parsed?.year ?? dateRange.from.getFullYear()
      const month = parsed?.month ?? toMonthNumber(selectedPeriod)

      if (!month || Number.isNaN(month)) {
        console.warn("월 파싱 실패:", selectedPeriod)
        return
      }

      // 1) 이 달의 주 대표일(월요일) 목록 생성
      const weekRanges = listWeeksOfMonth(year, month)

      setSettlementLoading(true)
      try {
        // 2) 각 주 대표일로 weekly 요약 병렬 호출
        const weeklyList = await Promise.all(
          weekRanges.map((w) => fetchSettlementByPeriod(userId, "weekly", w.rep))
        )

        // 3) 응답 + 주 경계 결합, 널 방어 및 정렬
        const normalized = weeklyList.map((res, idx) => {
          const w = weekRanges[idx]
          return {
            year,
            month,
            week: res?.week ?? idx + 1,
            startDate: res?.weekStartDate ?? res?.startDate ?? w.start,
            endDate: res?.weekEndDate ?? res?.endDate ?? w.end,
            totalSales: res?.totalSales ?? 0,
            totalFee: res?.totalFee ?? 0,
            totalVat: res?.totalVat ?? 0,
            totalRefund: res?.totalRefund ?? 0,
            totalSettlement: res?.totalSettlement ?? 0,
            totalCount: res?.totalCount ?? 0,
            completedRate: res?.completedRate ?? 0,
          }
        }).sort((a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )

        setSettlementData(normalized)
        setPeriod("weekly")
        setDrillDown({ level: "drilled", selectedPeriod })
      } catch (e: any) {
        console.error(e)
        setSettlementError(e?.message ?? "해당 월의 주별 데이터를 불러오지 못했습니다.")
      } finally {
        setSettlementLoading(false)
      }
      return
    }
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
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "products"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-foreground"
              }`}
          >
            재고 목록
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "stats"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-foreground"
              }`}
          >
            주문 목록
          </button>
          <button
            onClick={() => setActiveTab("settlement")}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "settlement"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-foreground"
              }`}
          >
            정산
          </button>
        </div>

        {activeTab === "products" && (
          <div>
            {productsLoading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">상품 목록을 불러오는 중...</p>
              </Card>
            ) : productsError ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-text-tertiary mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-red-600">오류가 발생했습니다</h3>
                <p className="text-text-secondary mb-6">{productsError}</p>
                <Button
                  onClick={fetchSellerProducts}
                  variant="outline"
                  className="mr-2"
                >
                  다시 시도
                </Button>
                <Button
                  onClick={() => router.push("/seller/products/create")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  상품 등록하기
                </Button>
              </Card>
            ) : products.length === 0 ? (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchSellerProducts}
                      disabled={productsLoading}
                    >
                      {productsLoading ? "조회 중..." : "조회"}
                    </Button>
                    <div className="ml-auto text-sm text-text-secondary">
                      총 <span className="font-semibold text-foreground">{filteredProducts.length}</span> 상품
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full min-w-[1400px]">
                    <thead className="bg-background-section">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium w-20">이미지</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-48">상품명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-52">카테고리</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-32">가격</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-28">할인율</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-24">재고</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-24">배송</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-28">등록일</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-20">상태</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-20">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-background-section/50 cursor-pointer"
                          onClick={(e) => {
                            // 버튼이나 관리 영역 클릭 시에는 상세 페이지로 이동하지 않음
                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('td:last-child')) {
                              return
                            }
                            router.push(`/store/products/${product.id}`)
                          }}
                        >
                          <td className="px-4 py-3 w-20">
                            <div className="relative w-16 h-16 rounded overflow-hidden">
                              <Image
                                src={product.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 w-48">
                            <div className="font-medium line-clamp-2">{product.name}</div>
                          </td>
                          <td className="px-4 py-3 w-52">
                            <div className="text-sm text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis" title={product.categoryPath}>{product.categoryPath}</div>
                          </td>
                          <td className="px-4 py-3 w-32">
                            <div className="space-y-1">
                              {product.discountRate > 0 && (
                                <div className="text-xs text-text-secondary line-through">
                                  {/* ₩{product.basePrice.toLocaleString()} */}
                                </div>
                              )}
                              {/* <div className="font-semibold text-sm">₩{Math.round(product.basePrice * (1 - product.discountRate / 100)).toLocaleString()}</div> */}
                            </div>
                          </td>
                          <td className="px-4 py-3 w-28">
                            {product.discountRate > 0 ? (
                              <span className="text-sm font-semibold text-red-500">{product.discountRate}%</span>
                            ) : (
                              <span className="text-sm text-text-secondary">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 w-24">
                            <div className="space-y-1">
                              <div className={`font-medium text-sm ${getStockColor(product.totalStock)}`}>
                                {product.totalStock}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShowStockOptions(product)}
                                disabled={stockLoading}
                                className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                              >
                                {stockLoading ? "조회 중..." : "옵션별 보기"}
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3 w-24">
                            {/* <span className="text-sm">{product.shippingPrice === 0 ? "무료배송" : `₩${product.shippingPrice.toLocaleString()}`}</span> */}
                          </td>
                          <td className="px-4 py-3 w-28">
                            {/* <span className="text-sm text-text-secondary whitespace-nowrap">{new Date(product.createdAt).toLocaleDateString()}</span> */}
                          </td>
                          <td className="px-4 py-3 w-20">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${product.status === ProductStatus.ON_SALE
                                ? "bg-green-100 text-green-700"
                                : product.status === ProductStatus.OUT_OF_STOCK
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {product.status === ProductStatus.ON_SALE ? "판매중" :
                                product.status === ProductStatus.OUT_OF_STOCK ? "판매 중지" : "품절"}
                            </span>
                          </td>
                          <td className="px-4 py-3 w-20">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProductForEdit(product)
                                  setShowEditOptionsModal(true)
                                }}
                                className="text-xs px-1 py-1"
                                title="수정"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              {product.status === ProductStatus.SUSPENDED ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent text-xs px-2 py-1"
                                  onClick={() => handleStartSelling(product.id)}
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  판매하기
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 bg-transparent text-xs px-2 py-1"
                                  onClick={() => handleStopSelling(product.id)}
                                  title="판매 중지"
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
                        <td className="px-4 py-3 text-sm font-medium">{order.quantity}</td>
                        <td className="px-4 py-3 text-sm font-mono font-semibold">
                          {/* ₩{order.orderAmount.toLocaleString()} */}
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

        {/* 정산 */}
        {activeTab === "settlement" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">정산 조회</h2>
              <div className="flex items-center gap-4 text-sm text-text-secondary">

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

            {settlementLoading ? (
              <div className="text-sm text-muted-foreground">정산 데이터를 불러오는 중입니다...</div>
            ) : settlementError ? (
              <div className="text-sm text-red-500">{settlementError}</div>
            ) : (
              <>
                <SettlementSummary
                  period={period}
                  status={status}
                  dateRange={dateRange}
                  data={
                    Array.isArray(settlementData)
                      ? (settlementData[0] ?? { totalCount: 0 })
                      : (settlementData ?? { totalCount: 0 })
                  }
                />
                <SettlementTable
                  period={period}
                  status={status}
                  dateRange={dateRange}
                  drillDown={drillDown}
                  onDrillDown={handleDrillDown}
                  onBackToBase={handleBackToBase}
                  data={settlementData}
                />
              </>
            )}
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
                          {/* {option.additionalPrice > 0 ? `+₩${option.additionalPrice.toLocaleString()}` : "-"} */}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${getStockColor(option.stock)}`}>{option.stock}</span>
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

      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>옵션별 재고 상세</DialogTitle>
            <DialogDescription>{selectedProductStock?.product.name}</DialogDescription>
          </DialogHeader>
          {selectedProductStock && (
            <div className="space-y-4">
              {stockLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-text-secondary">재고 정보를 불러오는 중...</p>
                </div>
              ) : selectedProductStock.stockData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">재고 정보가 없습니다.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-background-section sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">SKU ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">옵션 조합</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">추가 금액</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">재고</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedProductStock.stockData.map((sku, idx) => (
                        <tr key={sku.skuId || idx}>
                          <td className="px-4 py-3 text-sm font-mono">{sku.skuId}</td>
                          <td className="px-4 py-3 text-sm">
                            {sku.options && sku.options.length > 0 && sku.options.some(opt => opt.groupName && opt.valueName) ? (
                              <div className="space-y-1">
                                {sku.options
                                  .filter(opt => opt.groupName && opt.valueName)
                                  .map((option, optIdx) => (
                                    <div key={optIdx} className="text-xs">
                                      <span className="font-medium">{option.groupName}:</span> {option.valueName}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <span className="text-text-tertiary">단일 옵션</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            {/* {sku.priceAdjustment > 0 ? `+₩${sku.priceAdjustment.toLocaleString()}` : "-"} */}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${getStockColor(sku.stockQuantity)}`}>
                              {sku.stockQuantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Button onClick={() => setShowStockModal(false)} className="w-full bg-primary hover:bg-primary/90">
                닫기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 수정 옵션 선택 모달 */}
      <Dialog open={showEditOptionsModal} onOpenChange={setShowEditOptionsModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>수정 옵션 선택</DialogTitle>
          </DialogHeader>
          {selectedProductForEdit && (
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowEditOptionsModal(false)
                  router.push(`/seller/products/${selectedProductForEdit.id}/edit`)
                }}
                className="w-full bg-primary hover:bg-primary/90"
                variant="default"
              >
                <Edit className="w-4 h-4 mr-2" />
                기본 정보 수정
              </Button>
              <Button
                onClick={() => {
                  setShowEditOptionsModal(false)
                  router.push(`/seller/products/${selectedProductForEdit.id}/stock`)
                }}
                className="w-full"
                variant="outline"
              >
                <Package className="w-4 h-4 mr-2" />
                옵션 재고 수정
              </Button>
              <Button
                onClick={() => {
                  setShowEditOptionsModal(false)
                  router.push(`/seller/products/${selectedProductForEdit.id}/images`)
                }}
                className="w-full"
                variant="outline"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                이미지 수정
              </Button>
              <Button
                onClick={() => setShowEditOptionsModal(false)}
                className="w-full"
                variant="ghost"
              >
                취소
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}