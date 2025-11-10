"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Calendar, ChevronLeft } from "lucide-react"
import type { PeriodType, SettlementStatus, DrillDownState } from "@/app/seller/page"

interface SettlementTableProps {
  period: PeriodType
  status: SettlementStatus | "all"
  dateRange: { from: Date; to: Date }
  drillDown: DrillDownState
  onDrillDown: (selectedPeriod: string) => void
  onBackToBase: () => void
  data: any[]
  loading?: boolean
  error?: string | null
}
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
    case "PENDING":
      return "정산 진행중"
    case "CANCELED":
      return "정산 취소"
    default:
      return status
  }
}
// 일시에서 T제거
const formatDateTime = (v: string | Date | null | undefined) => {
  if (!v) return "-";
  // 문자열이면: T를 공백으로 치환
  if (typeof v === "string") {
    // 이미 'YYYY-MM-DD HH:mm:ss' 형태면 그대로, ISO면 T만 공백으로
    return v.includes("T") ? v.replace("T", " ") : v;
  }
  // Date 객체면 YYYY-MM-DD HH:mm:ss 로 변환
  const d = v instanceof Date ? v : new Date(v);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export function SettlementTable({
  period,
  status,
  dateRange,
  drillDown,
  onDrillDown,
  onBackToBase,
  data,
  loading = false,
  error = null
}: SettlementTableProps) {
  console.log("[TABLE] data 그대로:", data)
  console.log("[TABLE] rows:", Array.isArray(data) ? data : [data])
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>정산 내역 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">정산 데이터를 불러오는 중입니다... </div>
        </CardContent>
      </Card>
    )
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>정산 내역 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }
  const toNum = (v: any): number => {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (v == null || v === "") return 0
    const n = Number(v)
    return Number.isNaN(n) ? 0 : n
  }

  const formatCurrency = (v: any) => {
    const n = toNum(v)
    return `₩${n.toLocaleString()}`
  }
  const rows: any[] = Array.isArray(data) ? data : data ? [data] : []

  const isDateInRange = (dateStr: string) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    return date >= dateRange.from && date <= dateRange.to
  }

  const filterByStatus = (item: any) => {
    if (status === "all") return true
    if (period === "daily") return item.status === status
    return true
  }

  const sameOrBetween = (target: Date, from: Date, to: Date) => {
    // 날짜만 비교 (시분초 버리기)
    const t = new Date(target.getFullYear(), target.getMonth(), target.getDate())
    const f = new Date(from.getFullYear(), from.getMonth(), from.getDate())
    const tt = new Date(to.getFullYear(), to.getMonth(), to.getDate())
    return t >= f && t <= tt
  }
  const displayData =
    // period === "daily"
    //   ? rows.filter((item) => {
    //     if (!item) return false
    //     const d = item.orderedAt ?? item.settlementDate ?? item.orderedAt
    //     if (!d) return false
    //     const dt = new Date(d)
    //     return sameOrBetween(dt, dateRange.from, dateRange.to)
    //   })
    //   : rows
    period === "daily"
      ? rows
      : rows

  if (displayData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>정산 내역 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">선택한 날짜 범위에 해당하는 데이터가 없습니다.</div>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: SettlementStatus) => {
    const key = String(status ?? "").toLowerCase()
    if (key === "PENDING") return { label: "정산 진행중", variant: "default" as const }
    if (key === "COMPLETED") return { label: "정산 완료", variant: "secondary" as const }
    if (key === "CANCELED") return { label: "정산 취소", variant: "destructive" as const }
    return { label: status ?? "-", variant: "outline" as const }
  }


  const calcSettlementAmount = (item: any) => {
    if (item.totalSettlement != null) return toNum(item.totalSettlement)
    if (item.totalSettlementAmount != null) return toNum(item.totalSettlementAmount)

    const salesAmount = toNum(item.totalSales ?? item.salesAmount)
    const vat = toNum(item.vat ?? item.totalVat)
    const fee = toNum(item.totalFee ?? item.fee)
    const refundAmount = toNum(item.totalRefund ?? item.refundAmount)

    if (item.totalSettlement != null) return toNum(item.totalSettlement)
    if (item.totalSettlementAmount != null) return toNum(item.totalSettlementAmount)
    return salesAmount + vat - fee - refundAmount
  }
  const getWeekLabel = (item: any, idx: number) => {
    const y = item.year ?? null
    const m = item.month ?? null
    const w = Number(item.week)

    // 1) 주차 숫자가 정상(1~5)이면 그대로 표시
    if (Number.isFinite(w) && w >= 1 && w <= 5) {
      if (y != null && m != null) return `${y}년 ${m}월 ${w}주차`
      return `${w}주차`
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {drillDown.level === "drilled" && (
            <button onClick={onBackToBase} className="p-1 rounded hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <CardTitle>정산 내역 상세</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {period === "all" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문 일시</TableHead>
                  <TableHead>주문 번호</TableHead>
                  <TableHead className="text-right">상품명</TableHead>
                  <TableHead className="text-right">판매금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산 금액</TableHead>
                  <TableHead className="text-left">정산 일시</TableHead>
                  <TableHead>정산 상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, i: number) => {
                  const settlementAmount = calcSettlementAmount(item)
                  const badge = getStatusBadge(item.settlementStatus ?? item.status)
                  const orderedAt = item.orderedAt ?? item.date ?? ""

                  return (
                    <TableRow key={i}>
                      <TableCell>{formatDateTime(orderedAt)}</TableCell>
                      <TableCell className="font-mono">{item.orderNumber ?? "-"}</TableCell>
                      <TableCell className="text-right">{item.productName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.salesAmount ?? item.totalSales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.vat ?? item.totalVat)}</TableCell>
                      <TableCell className="text-right">-{formatCurrency(item.fee ?? item.totalFee)}</TableCell>
                      <TableCell className="text-right">
                        {toNum(item.refundAmount ?? item.totalRefund) > 0
                          ? `-${formatCurrency(item.refundAmount ?? item.totalRefund)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(settlementAmount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDateTime(item.settlementDate ?? item.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSettlementStatusColor(item.settlementStatus ?? item.status)}`}>{getSettlementStatusLabel(item.settlementStatus ?? item.status)}</span>
                      </TableCell>
                      {/* <Badge className={getSettlementStatusColor(item.settlementStatus ?? item.status)} variant={badge.variant}>{badge.label}</Badge> */}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          {period === "daily" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문 일시</TableHead>
                  <TableHead className="text-right">총 주문건수</TableHead>
                  <TableHead className="text-right">총 판매금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                  <TableHead>정산 일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, i: number) => {
                  const settlementAmount = calcSettlementAmount(item)
                  return (
                    <TableRow key={i}>
                      <TableCell>{item.date ?? item.settlementDate ?? item.orderedAt}</TableCell>
                      <TableCell className="text-right">
                        {toNum(item.totalOrders ?? item.totalCount).toLocaleString()}건
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalSales ?? item.salesAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalVat ?? item.vat)}</TableCell>
                      <TableCell className="text-right">-{formatCurrency(item.totalFee ?? item.fee)}</TableCell>
                      <TableCell className="text-right">
                        {toNum(item.totalRefund ?? item.refundAmount) > 0
                          ? `-${formatCurrency(item.totalRefund ?? item.refundAmount)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(settlementAmount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{item.settlementDate ?? item.date}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {period === "weekly" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">정산 기간</TableHead>
                  <TableHead className="text-right">총 주문건수</TableHead>
                  <TableHead className="text-right">총 판매금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, i: number) => {
                  const settlementAmount = calcSettlementAmount(item)
                  const start = item.weekStartDate ?? item.startDate
                  const end = item.weekEndDate ?? item.endDate
                  const month = item.month ? String(item.month).padStart(2, "0") : "--"

                  return (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => drillDown.level === "base" && onDrillDown(JSON.stringify({
                        start,
                        end,
                      }))}
                    >
                      <TableCell className="text-left">
                        {getWeekLabel(item, i)}
                        ({start && end ? `${start} ~ ${end}` : "-"})
                      </TableCell>
                      <TableCell className="text-right">
                        {toNum(item.totalOrders ?? item.totalCount).toLocaleString()}건
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.totalSales)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalVat ?? item.vat)}</TableCell>
                      <TableCell className="text-right">-{formatCurrency(item.totalFee ?? item.fee)}</TableCell>
                      <TableCell className="text-right">
                        {toNum(item.totalRefund ?? item.refundAmount) > 0
                          ? `-${formatCurrency(item.totalRefund ?? item.refundAmount)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(settlementAmount)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {period === "monthly" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">정산 기간</TableHead>
                  <TableHead className="text-right">총 주문 건수</TableHead>
                  <TableHead className="text-right">총 판매금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                  <TableHead className="text-right">전월 대비</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, i: number) => {
                  const settlementAmount = calcSettlementAmount(item)
                  const month = item.month ? String(item.month).padStart(2, "0") : "--"
                  return (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => drillDown.level === "base" && onDrillDown(JSON.stringify({ year: item.year, month: item.month }))}
                    >
                      <TableCell>{item.year ? `${item.year}년 ${month}월` : month}</TableCell>
                      <TableCell className="text-right">
                        {toNum(item.totalCount).toLocaleString()}건
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.totalSales)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalVat ?? item.vat)}</TableCell>
                      <TableCell className="text-right">-{formatCurrency(item.totalFee ?? item.fee)}</TableCell>
                      <TableCell className="text-right">
                        {toNum(item.totalRefund ?? item.refundAmount) > 0
                          ? `-${formatCurrency(item.totalRefund ?? item.refundAmount)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(settlementAmount)}</TableCell>
                      <TableCell className="text-right">
                        <span className={(item.growthRate ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                          {(item.growthRate ?? 0) >= 0 ? "+" : ""}
                          {toNum(item.growthRate ?? 0)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {period === "yearly" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">정산 기간</TableHead>
                  <TableHead className="text-right">총 주문 건수</TableHead>
                  <TableHead className="text-right">총 판매금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, i: number) => {
                  const settlementAmount = calcSettlementAmount(item)
                  return (
                    <TableRow key={i}>
                      <TableCell>{item.year ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        {toNum(item.totalOrders ?? item.totalCount).toLocaleString()}건
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.totalSales ?? item.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalVat ?? item.vat)}</TableCell>
                      <TableCell className="text-right">-{formatCurrency(item.totalFee ?? item.fee)}</TableCell>
                      <TableCell className="text-right">
                        {toNum(item.totalRefund ?? item.refundAmount) > 0
                          ? `-${formatCurrency(item.totalRefund ?? item.refundAmount)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(settlementAmount)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SettlementTable
