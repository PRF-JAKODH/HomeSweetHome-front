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
    // const statusMap = {
    //   pending: { label: "정산 진행중", variant: "default" as const },
    //   completed: { label: "정산 완료", variant: "secondary" as const },
    //   canceled: { label: "정산 취소", variant: "secondary" as const }, // Blue button style
    // }
    // return statusMap[status]
    const key = (status ?? "").toLowerCase()
    if (key === "pending") return { label: "정산 진행중", variant: "default" as const }
    if (key === "completed" || key === "completed") return { label: "정산 완료", variant: "secondary" as const }
    if (key === "canceled") return { label: "정산 취소", variant: "destructive" as const }
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
          {period === "daily" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>거래일</TableHead>
                  <TableHead className="text-right">총 주문건수</TableHead>
                  <TableHead className="text-right">총 판매금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                  <TableHead>정산일</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, i: number) => {
                  const settlementAmount = calcSettlementAmount(item)
                  const statusKey = (item.status ?? item.settlementStatus ?? "").toLowerCase()
                  const statusLabel =
                    statusKey === "completed"
                      ? "정산 완료"
                      : statusKey === "pending"
                        ? "정산 진행중"
                        : statusKey === "canceled"
                          ? "정산 취소"
                          : "-"
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
                      <TableCell>{statusLabel}</TableCell>
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
                  <TableHead className="text-left">거래 기간</TableHead>
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
                  <TableHead className="text-left">거래 기간</TableHead>
                  {/* <TableHead className="text-right">주문건수</TableHead> */}
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
                      {/* <TableCell className="text-right">
                        {toNum(item.totalCount).toLocaleString()}건
                      </TableCell> */}
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
                  <TableHead className="text-left">거래 기간</TableHead>
                  {/* <TableHead className="text-right">주문 건수</TableHead> */}
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
                      {/* <TableCell className="text-right">
                        {toNum(item.totalOrders ?? item.totalCount).toLocaleString()}건
                      </TableCell> */}
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
