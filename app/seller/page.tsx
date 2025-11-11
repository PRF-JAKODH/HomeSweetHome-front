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
import { updateProductStatus } from "@/lib/api/products"
import { getSellerProducts, getProductStock } from "@/lib/api/products"
import { fetchSettlementByPeriod, fetchAllSettlements } from "@/api/sapi"
import { useAuthStore } from "@/stores/auth-store"
import { useRef } from "react"
import { Week } from "react-day-picker"


export type PeriodType = "all" | "daily" | "weekly" | "monthly" | "yearly"
export type SettlementStatus = "PENDING" | "CANCELED" | "COMPLETED"
export type DrillDownState = {
  level: "base" | "drilled"
  selectedPeriod: string | null
}

export default function SellerPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("products")
  const [period, setPeriod] = useState<PeriodType>("all")
  const [status, setStatus] = useState<SettlementStatus | "all">("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 29)),
    to: new Date(),
  })

  const [drillDown, setDrillDown] = useState<DrillDownState>({
    level: "base",
    selectedPeriod: null,
  })

  // 페이지
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [pageMeta, setPageMeta] = useState<{ page: number; totalPages: number; totalElements: number } | null>(null)

  // 정산
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const userId = isHydrated ? user?.id : undefined

  const [settlementData, setSettlementData] = useState<any[]>([])
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementError, setSettlementError] = useState<string | null>(null)

  const skipNextFetchRef = useRef(false)
  const PERIOD_PATH: Record<PeriodType, string> = {
    all: "all",
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    yearly: "yearly",
  }
  type ViewSnapshot = {
    period: PeriodType
    dateRange: { from: Date; to: Date }
    pageIndex: number
    pageSize: number
    status: typeof status
  }
  const prevViewRef = useRef<ViewSnapshot | null>(null)

  // const id = userId
  const start = dateRange.from
  const end = dateRange.to

  const toYMD = (d: Date) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString()
      .slice(0, 10)
  }

  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const eachDay = (from: Date, to: Date) => {
    const days: Date[] = [];
    const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const last = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    while (cur <= last) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  };
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const startOfWeek = (d: Date) => {
    // 월요일 시작(월=1, …, 일=0) 기준
    const day = d.getDay() === 0 ? 7 : d.getDay()
    const s = new Date(d)
    s.setHours(0, 0, 0, 0)
    s.setDate(s.getDate() - (day - 1))
    return s
  }
  const endOfWeek = (d: Date) => {
    const s = startOfWeek(d)
    const e = new Date(s)
    e.setDate(e.getDate() + 6)
    e.setHours(23, 59, 59, 999)
    return e
  }
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1)
  const endOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31)
  const handleSetPeriod = (next: PeriodType) => {
    const today = startOfDay(new Date());
    setPeriod(next)
    setPageIndex(0)
    if (next === "daily") {
      setDateRange({ from: today, to: today });
    }
    if (next === "weekly") {
      const from = startOfWeek(today)
      const to = endOfWeek(today)
      setDateRange({ from, to })
      return
    }
    if (next === "monthly") {
      const from = startOfMonth(today)
      const to = endOfMonth(today)
      setDateRange({ from, to })
      return
    }
    if (next === "yearly") {
      const from = startOfYear(today)
      const to = endOfYear(today)
      setDateRange({ from, to })
      return
    }
  }

  const normalize = (item: any, period: PeriodType) => {
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
    if (period === "all") {
      return { ...base }
    }
    if (period === "daily") {
      return {
        ...base,
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
    return {
      ...base,
      year: item.year ?? null,
    }
  }

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const isDailySingle = period === "daily" && sameDay(dateRange.from, dateRange.to);

  const summaryDefaults = {
    totalSales: 0,
    totalFee: 0,
    totalVat: 0,
    totalRefund: 0,
    totalSettlement: 0,
    totalCount: 0,
  }
  const isSingleBucket =
    (period === "daily" && sameDay(dateRange.from, dateRange.to)) ||
    (period === "weekly" && Array.isArray(settlementData) && settlementData.length === 1);


  const summaryData =
    !Array.isArray(settlementData) || settlementData.length === 0
      ? summaryDefaults
      : isSingleBucket
        ? settlementData[0] ?? summaryDefaults
        : settlementData.reduce((acc: any, r: any) => ({
          totalSales: acc.totalSales + (r.totalSales ?? 0),
          totalFee: acc.totalFee + (r.totalFee ?? 0),
          totalVat: acc.totalVat + (r.totalVat ?? 0),
          totalRefund: acc.totalRefund + (r.totalRefund ?? 0),
          totalSettlement: acc.totalSettlement + (r.totalSettlement ?? 0),
          totalCount: acc.totalCount + (r.totalCount ?? 0),
        }), { ...summaryDefaults });

  const endOfDay = (d: Date) => {
    const e = new Date(d)
    e.setHours(23, 59, 59, 999)
    return e
  }

  useEffect(() => {
    if (activeTab !== "settlement") return
    if (!isHydrated || userId === undefined) return
    if (!userId) return
    const id = userId

    // 페이지인지 판별
    function isPage<T>(v: any): v is { content: T[], number: number, size: number, totalElements: number, totalPages: number } {
      return v && Array.isArray(v.content) && typeof v.totalPages === 'number'
    }
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false
      return
    }
    async function getSettlement() {
      const fromForApi = new Date(dateRange.from)
      const toForApi = endOfDay(new Date(dateRange.to)) // 포함되도록

      setSettlementLoading(true)
      setSettlementError(null)

      try {
        if (period === "all") {
          const page = await fetchAllSettlements(
            id,
            fromForApi,
            toForApi,
            { page: pageIndex, size: pageSize },
            status
          )
          const list = Array.isArray(page?.content) ? page.content : Array.isArray(page) ? page : []
          setSettlementData(list)
          setPageMeta({
            page: page?.number ?? 0,
            totalPages: page?.totalPages ?? 0,
            totalElements: page?.totalElements ?? 0,
          })
          return
        }
        else if (period === "daily") {
          // 1) 기간이 '하루'면 단건 호출
          if (isSameDate(fromForApi, toForApi)) {
            const res = await fetchSettlementByPeriod(id, "daily", fromForApi, toForApi, { page: 0, size: 1 })
            const item = Array.isArray(res) ? res[0] : (res?.content?.[0] ?? res ?? {})
            const row = normalize({ ...item, date: toYMD(fromForApi) }, "daily")
            setSettlementData([row])
            setPageMeta(null)
          }

          // 2) 여러 날이면 하루씩 쪼개서 병렬 호출
          const days = eachDay(fromForApi, toForApi)
          const dailyList = await Promise.all(
            days.map(day =>
              fetchSettlementByPeriod(
                id,
                "daily",
                new Date(day),            // 00:00
                endOfDay(new Date(day)),  // 23:59:59.999
                { page: 0, size: 1 }
              )
            )
          )

          const rows = dailyList.map((res, idx) => {
            const item = Array.isArray(res) ? res[0] : (res?.content?.[0] ?? res ?? {})
            return normalize({ ...item, date: toYMD(days[idx]) }, "daily")
          })

          // 날짜 오름차순 정렬(보장용)
          // rows.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))

          setSettlementData(rows)
          setPageMeta(null)
          return
        }

        // weekly / monthly / yearly
        const res = await fetchSettlementByPeriod(id, period, fromForApi, toForApi, { page: pageIndex, size: pageSize })
        let rows: any[] = []
        let meta: { page: number; totalPages: number; totalElements: number } | null = null

        if (res?.content && Array.isArray(res.content)) {
          rows = res.content
          meta = { page: res.number, totalPages: res.totalPages, totalElements: res.totalElements }
        } else if (Array.isArray(res)) {
          rows = res
          meta = null
        } else if (res) {
          rows = [res]
          meta = null
        }

        setSettlementData(rows.map(x => normalize(x, period)))
        setPageMeta(meta)
      } catch (e: any) {
        setSettlementError(e?.message ?? "정산 데이터를 불러오지 못했습니다.")
      } finally {
        setSettlementLoading(false)
      }
    }
    getSettlement()
  }, [activeTab, dateRange, status, pageIndex, pageSize, period])

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

  const toMonthNumber = (v: string) => {
    if (!v) return NaN
    if (/^\d+$/.test(v)) return Number(v)
    const m = v.match(/(\d{1,2})월?$/) || v.match(/-(\d{1,2})$/)
    return m ? Number(m[1]) : NaN
  }
  // 1) 월의 주(월~일) 범위 만들기
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
  function toRows(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res?.content && Array.isArray(res.content)) return res.content;
    return [res];
  }
  if (!prevViewRef.current) {
    prevViewRef.current = {
      period,
      dateRange: { from: new Date(dateRange.from), to: new Date(dateRange.to) },
      pageIndex,
      pageSize,
      status,
    }
  }
  const handleDrillDown = async (selectedPeriod: string) => {
    console.log("드릴 다운 클릭 됌")
    if (!userId) return;
    let parsed: any = null
    try { parsed = JSON.parse(selectedPeriod) } catch { parsed = null }

    //  주별 → 일별
    if (parsed?.start && parsed?.end && userId) {
      const start = new Date(parsed.start)
      const end = new Date(parsed.end)
      setDateRange({ from: start, to: endOfDay(end) })
      setPageIndex(0)
      setPeriod("daily")
      setDrillDown({ level: "drilled", selectedPeriod })
    }
    // 월 타일 클릭(또는 select) 시
    const y = parsed?.year ?? dateRange.from.getFullYear();
    const mFromParsed = parsed?.month;
    const mFromText = toMonthNumber(selectedPeriod); // "2025-02" / "2월" 등에서 숫자 추출
    const m = mFromParsed ?? mFromText;
    if (m && !Number.isNaN(m)) {
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0);

      setSettlementLoading(true);
      try {
        // 서버가 해당 월 범위를 주별 집계로 돌려준다는 전제
        const res = await fetchSettlementByPeriod(userId, "weekly", first, last, { page: 0, size: pageSize });

        const rows = toRows(res).map((r: any) => {
          const startDate = r.weekStartDate ?? r.startDate ?? first;
          const endDate = r.weekEndDate ?? r.endDate ?? last;
          return { ...normalize(r, "weekly"), startDate, endDate };
        });
        const sorted = rows.sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        const finalRows = sorted.map((r, i) => ({
          ...r,
          // week: r.week ?? (i + 1),
        }));
        // rows.forEach((r, i) => { r.week = i + 1; });
        // setSettlementData(rows.map(r => normalize(r, "weekly")));
        setSettlementData(finalRows)

        // 상태 전환: 주간 탭 + 기간을 해당 월로 세팅
        setPeriod("weekly");
        setDateRange({ from: first, to: last });
        setDrillDown({ level: "drilled", selectedPeriod });
        setPageIndex(0);

        // 페이지 메타는 Page일 때만
        setPageMeta(
          res && typeof res?.totalPages === "number"
            ? { page: res.number ?? 0, totalPages: res.totalPages ?? 0, totalElements: res.totalElements ?? 0 }
            : null
        );
      } catch (e: any) {
        console.error(e);
        setSettlementError(e?.message ?? "해당 월의 주별 데이터를 불러오지 못했습니다.");
      } finally {
        setSettlementLoading(false);
      }
      return;
    }
  }

  const handleBackToBase = () => {
    const snap = prevViewRef.current
    setDrillDown({
      level: "base",
      selectedPeriod: null,
    })
    if (snap) {
      // ❗복원 시에는 handleSetPeriod를 쓰지 말고 직접 setPeriod
      // (handleSetPeriod는 daily/weekly 스냅을 다시 걸어버림)
      setPeriod(snap.period)
      setStatus(snap.status)
      setPageSize(snap.pageSize)
      setPageIndex(snap.pageIndex)
      setDateRange({
        from: new Date(snap.dateRange.from),
        to: new Date(snap.dateRange.to),
      })
      setPageMeta(null) // 페이지메타는 재조회되게 초기화
      prevViewRef.current = null
    } else {
      // 스냅샷이 없으면 안전하게 초기 상태로
      setPageIndex(0)
      setPageMeta(null)
    }
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
              setPeriod={handleSetPeriod}
              status={status}
              setStatus={setStatus}
              dateRange={dateRange}
              setDateRange={(r: { from?: Date | string; to?: Date | string } = {}) => {
                setPageIndex(0)
                setDateRange(prev => ({
                  from: r.from ? new Date(r.from) : prev.from,
                  to: r.to ? new Date(r.to) : prev.to,
                }))
              }}
            />

            {settlementLoading ? (
              <div className="text-sm text-muted-foreground">정산 데이터를 불러오는 중입니다...</div>
            ) : settlementError ? (
              <div className="text-sm text-red-500">{settlementError}</div>
            ) : (
              <>
                {period !== "all" && (<SettlementSummary
                  period={period}
                  status={status}
                  dateRange={dateRange}
                  data={summaryData
                    // Array.isArray(settlementData)
                    //   ? (settlementData[0] ?? { totalCount: 0 })
                    //   : (settlementData ?? { totalCount: 0 })
                  }
                />)}
                {pageMeta && pageMeta.totalPages > 0 && (
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageIndex <= 0}
                      onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                    >
                      이전
                    </Button>
                    <span className="text-sm">
                      {pageMeta.page + 1} / {pageMeta.totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageIndex >= pageMeta.totalPages - 1}
                      onClick={() => setPageIndex(p => Math.min(pageMeta.totalPages - 1, p + 1))}
                    >
                      다음
                    </Button>

                    <select
                      className="ml-2 border rounded px-2 py-1 text-sm"
                      value={pageSize}
                      onChange={(e) => { setPageIndex(0); setPageSize(Number(e.target.value)) }}
                    >
                      {[10, 20, 50].map(s => <option key={s} value={s}>{s}/페이지</option>)}
                    </select>
                  </div>
                )}
                <SettlementTable
                  period={period}
                  status={status}
                  dateRange={dateRange}
                  drillDown={drillDown}
                  onDrillDown={(handleDrillDown)}
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