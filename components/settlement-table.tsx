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
}

export function SettlementTable({
  period,
  status,
  dateRange,
  drillDown,
  onDrillDown,
  onBackToBase,
}: SettlementTableProps) {
  const isDateInRange = (dateStr: string) => {
    const date = new Date(dateStr)
    return date >= dateRange.from && date <= dateRange.to
  }

  const dailyData = [
    {
      date: "2024-10-15",
      product: "모던 패브릭 소파",
      productPrice: 1800000,
      vat: 180000,
      fee: 148500,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-10-22",
    },
    {
      date: "2024-10-15",
      product: "원목 다이닝 테이블",
      productPrice: 850000,
      vat: 85000,
      fee: 70125,
      refund: 0,
      status: "confirmed" as const,
      settlementDate: "2024-10-22",
    },
    {
      date: "2024-10-14",
      product: "북유럽 스타일 책장",
      productPrice: 450000,
      vat: 45000,
      fee: 37125,
      refund: 0,
      status: "carried-over" as const,
      settlementDate: "2024-10-21",
    },
    {
      date: "2024-10-13",
      product: "LED 스탠드 조명",
      productPrice: 90000,
      vat: 9000,
      fee: 7425,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-10-20",
    },
    {
      date: "2024-10-10",
      product: "라탄 바구니 세트",
      productPrice: 65000,
      vat: 6500,
      fee: 5363,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-10-17",
    },
    {
      date: "2024-10-08",
      product: "미니멀 벽시계",
      productPrice: 45000,
      vat: 4500,
      fee: 3713,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-10-15",
    },
    {
      date: "2024-10-05",
      product: "세라믹 화분 3종",
      productPrice: 120000,
      vat: 12000,
      fee: 9900,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-10-12",
    },
    {
      date: "2024-10-03",
      product: "우드 행거",
      productPrice: 180000,
      vat: 18000,
      fee: 14850,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-10-10",
    },
    {
      date: "2024-09-28",
      product: "빈티지 거울",
      productPrice: 320000,
      vat: 32000,
      fee: 26400,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-10-05",
    },
    {
      date: "2024-09-25",
      product: "패브릭 쿠션 커버",
      productPrice: 35000,
      vat: 3500,
      fee: 2888,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-10-02",
    },
    {
      date: "2024-09-20",
      product: "대리석 트레이",
      productPrice: 85000,
      vat: 8500,
      fee: 7013,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-09-27",
    },
    {
      date: "2024-09-15",
      product: "스칸디나비안 러그",
      productPrice: 280000,
      vat: 28000,
      fee: 23100,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-09-22",
    },
    {
      date: "2024-09-10",
      product: "아크릴 수납함",
      productPrice: 55000,
      vat: 5500,
      fee: 4538,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-09-17",
    },
    {
      date: "2024-09-05",
      product: "인테리어 포스터 세트",
      productPrice: 48000,
      vat: 4800,
      fee: 3960,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-09-12",
    },
    {
      date: "2024-08-28",
      product: "원목 선반",
      productPrice: 195000,
      vat: 19500,
      fee: 16088,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-09-04",
    },
    {
      date: "2024-08-20",
      product: "모던 테이블 램프",
      productPrice: 125000,
      vat: 12500,
      fee: 10313,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-08-27",
    },
    {
      date: "2024-08-15",
      product: "북유럽 의자",
      productPrice: 380000,
      vat: 38000,
      fee: 31350,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-08-22",
    },
    {
      date: "2024-08-10",
      product: "유리 화병",
      productPrice: 42000,
      vat: 4200,
      fee: 3465,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-08-17",
    },
    {
      date: "2024-08-05",
      product: "메탈 선반",
      productPrice: 165000,
      vat: 16500,
      fee: 13613,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-08-12",
    },
    {
      date: "2024-07-25",
      product: "라운드 사이드 테이블",
      productPrice: 220000,
      vat: 22000,
      fee: 18150,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-08-01",
    },
    {
      date: "2024-07-18",
      product: "우드 트레이",
      productPrice: 58000,
      vat: 5800,
      fee: 4785,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-07-25",
    },
    {
      date: "2024-07-10",
      product: "패브릭 수납박스",
      productPrice: 38000,
      vat: 3800,
      fee: 3135,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-07-17",
    },
    {
      date: "2024-07-05",
      product: "인더스트리얼 조명",
      productPrice: 145000,
      vat: 14500,
      fee: 11963,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-07-12",
    },
    {
      date: "2024-06-28",
      product: "모던 벽걸이 선반",
      productPrice: 98000,
      vat: 9800,
      fee: 8085,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-07-05",
    },
    {
      date: "2024-06-20",
      product: "세라믹 접시 세트",
      productPrice: 72000,
      vat: 7200,
      fee: 5940,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-06-27",
    },
    {
      date: "2024-06-15",
      product: "원목 옷걸이",
      productPrice: 28000,
      vat: 2800,
      fee: 2310,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-06-22",
    },
    {
      date: "2024-06-10",
      product: "북유럽 스툴",
      productPrice: 185000,
      vat: 18500,
      fee: 15263,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-06-17",
    },
    {
      date: "2023-12-28",
      product: "크리스마스 장식 세트",
      productPrice: 95000,
      vat: 9500,
      fee: 7838,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2024-01-04",
    },
    {
      date: "2023-12-20",
      product: "겨울 담요",
      productPrice: 135000,
      vat: 13500,
      fee: 11138,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2023-12-27",
    },
    {
      date: "2023-12-15",
      product: "캔들 홀더 세트",
      productPrice: 68000,
      vat: 6800,
      fee: 5610,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2023-12-22",
    },
    {
      date: "2023-12-10",
      product: "우드 트리 장식",
      productPrice: 88000,
      vat: 8800,
      fee: 7260,
      refund: 0,
      status: "completed" as const,
      settlementDate: "2023-12-17",
    },
  ]

  const weeklyData = [
    {
      week: "1주차 (10/01 - 10/07)",
      orderCount: 85,
      completedCount: 60,
      pendingCount: 20,
      cancelledCount: 5,
      totalAmount: 28500000,
      vat: 2850000,
      fee: 2351250,
      refund: 500000,
    },
    {
      week: "2주차 (10/08 - 10/14)",
      orderCount: 92,
      completedCount: 68,
      pendingCount: 18,
      cancelledCount: 6,
      totalAmount: 31200000,
      vat: 3120000,
      fee: 2574000,
      refund: 300000,
    },
    {
      week: "3주차 (10/15 - 10/21)",
      orderCount: 78,
      completedCount: 55,
      pendingCount: 19,
      cancelledCount: 4,
      totalAmount: 26800000,
      vat: 2680000,
      fee: 2211000,
      refund: 450000,
    },
    {
      week: "4주차 (10/22 - 10/28)",
      orderCount: 88,
      completedCount: 62,
      pendingCount: 21,
      cancelledCount: 5,
      totalAmount: 29500000,
      vat: 2950000,
      fee: 2433750,
      refund: 200000,
    },
    {
      week: "1주차 (09/01 - 09/07)",
      orderCount: 82,
      completedCount: 58,
      pendingCount: 19,
      cancelledCount: 5,
      totalAmount: 27800000,
      vat: 2780000,
      fee: 2293500,
      refund: 400000,
    },
    {
      week: "2주차 (09/08 - 09/14)",
      orderCount: 89,
      completedCount: 65,
      pendingCount: 18,
      cancelledCount: 6,
      totalAmount: 30500000,
      vat: 3050000,
      fee: 2516250,
      refund: 350000,
    },
    {
      week: "3주차 (09/15 - 09/21)",
      orderCount: 76,
      completedCount: 54,
      pendingCount: 17,
      cancelledCount: 5,
      totalAmount: 26200000,
      vat: 2620000,
      fee: 2161500,
      refund: 500000,
    },
    {
      week: "4주차 (09/22 - 09/28)",
      orderCount: 85,
      completedCount: 60,
      pendingCount: 20,
      cancelledCount: 5,
      totalAmount: 28900000,
      vat: 2890000,
      fee: 2384250,
      refund: 300000,
    },
    {
      week: "1주차 (08/01 - 08/07)",
      orderCount: 90,
      completedCount: 66,
      pendingCount: 19,
      cancelledCount: 5,
      totalAmount: 31000000,
      vat: 3100000,
      fee: 2557500,
      refund: 450000,
    },
    {
      week: "2주차 (08/08 - 08/14)",
      orderCount: 87,
      completedCount: 63,
      pendingCount: 18,
      cancelledCount: 6,
      totalAmount: 29800000,
      vat: 2980000,
      fee: 2458500,
      refund: 380000,
    },
    {
      week: "3주차 (08/15 - 08/21)",
      orderCount: 94,
      completedCount: 70,
      pendingCount: 19,
      cancelledCount: 5,
      totalAmount: 32500000,
      vat: 3250000,
      fee: 2681250,
      refund: 420000,
    },
    {
      week: "4주차 (08/22 - 08/28)",
      orderCount: 81,
      completedCount: 57,
      pendingCount: 19,
      cancelledCount: 5,
      totalAmount: 27500000,
      vat: 2750000,
      fee: 2268750,
      refund: 350000,
    },
  ]

  const monthlyData = [
    {
      month: "1월",
      orderCount: 320,
      completedCount: 245,
      pendingCount: 60,
      cancelledCount: 15,
      totalAmount: 115000000,
      vat: 11500000,
      fee: 9487500,
      refund: 1500000,
      changeRate: 12.5,
    },
    {
      month: "2월",
      orderCount: 285,
      completedCount: 220,
      pendingCount: 50,
      cancelledCount: 15,
      totalAmount: 98000000,
      vat: 9800000,
      fee: 8085000,
      refund: 1200000,
      changeRate: -14.8,
    },
    {
      month: "3월",
      orderCount: 350,
      completedCount: 270,
      pendingCount: 65,
      cancelledCount: 15,
      totalAmount: 128000000,
      vat: 12800000,
      fee: 10560000,
      refund: 1800000,
      changeRate: 30.6,
    },
    {
      month: "4월",
      orderCount: 310,
      completedCount: 240,
      pendingCount: 55,
      cancelledCount: 15,
      totalAmount: 112000000,
      vat: 11200000,
      fee: 9240000,
      refund: 1400000,
      changeRate: -12.5,
    },
    {
      month: "5월",
      orderCount: 340,
      completedCount: 265,
      pendingCount: 60,
      cancelledCount: 15,
      totalAmount: 125000000,
      vat: 12500000,
      fee: 10312500,
      refund: 1600000,
      changeRate: 11.6,
    },
    {
      month: "6월",
      orderCount: 330,
      completedCount: 255,
      pendingCount: 60,
      cancelledCount: 15,
      totalAmount: 120000000,
      vat: 12000000,
      fee: 9900000,
      refund: 1500000,
      changeRate: -4.0,
    },
    {
      month: "7월",
      orderCount: 315,
      completedCount: 245,
      pendingCount: 55,
      cancelledCount: 15,
      totalAmount: 118000000,
      vat: 11800000,
      fee: 9735000,
      refund: 1450000,
      changeRate: -1.7,
    },
    {
      month: "8월",
      orderCount: 352,
      completedCount: 275,
      pendingCount: 62,
      cancelledCount: 15,
      totalAmount: 130000000,
      vat: 13000000,
      fee: 10725000,
      refund: 1700000,
      changeRate: 10.2,
    },
    {
      month: "9월",
      orderCount: 332,
      completedCount: 260,
      pendingCount: 57,
      cancelledCount: 15,
      totalAmount: 122000000,
      vat: 12200000,
      fee: 10065000,
      refund: 1550000,
      changeRate: -6.2,
    },
    {
      month: "10월",
      orderCount: 343,
      completedCount: 268,
      pendingCount: 60,
      cancelledCount: 15,
      totalAmount: 126000000,
      vat: 12600000,
      fee: 10395000,
      refund: 1600000,
      changeRate: 3.3,
    },
    {
      month: "11월",
      orderCount: 365,
      completedCount: 285,
      pendingCount: 65,
      cancelledCount: 15,
      totalAmount: 135000000,
      vat: 13500000,
      fee: 11137500,
      refund: 1750000,
      changeRate: 7.1,
    },
    {
      month: "12월",
      orderCount: 380,
      completedCount: 295,
      pendingCount: 70,
      cancelledCount: 15,
      totalAmount: 142000000,
      vat: 14200000,
      fee: 11715000,
      refund: 1850000,
      changeRate: 5.2,
    },
  ]

  const yearlyData = [
    {
      year: "2021년",
      orderCount: 2850,
      completedCount: 2200,
      pendingCount: 520,
      cancelledCount: 130,
      totalAmount: 980000000,
      vat: 98000000,
      fee: 80850000,
      refund: 12000000,
    },
    {
      year: "2022년",
      orderCount: 3420,
      completedCount: 2680,
      pendingCount: 590,
      cancelledCount: 150,
      totalAmount: 1250000000,
      vat: 125000000,
      fee: 103125000,
      refund: 15000000,
    },
    {
      year: "2023년",
      orderCount: 3890,
      completedCount: 3050,
      pendingCount: 650,
      cancelledCount: 190,
      totalAmount: 1480000000,
      vat: 148000000,
      fee: 122100000,
      refund: 18000000,
    },
    {
      year: "2024년",
      orderCount: 4120,
      completedCount: 3250,
      pendingCount: 680,
      cancelledCount: 190,
      totalAmount: 1580000000,
      vat: 158000000,
      fee: 130350000,
      refund: 19000000,
    },
  ]

  const filterByStatus = (item: any) => {
    if (status === "all") return true
    if (period === "daily") return item.status === status
    return true
  }

  const getDisplayData = () => {
    console.log(
      "[v0] Filtering table data for date range:",
      dateRange.from.toISOString(),
      "to",
      dateRange.to.toISOString(),
    )

    switch (period) {
      case "daily":
        return dailyData.filter((item) => filterByStatus(item) && isDateInRange(item.date))
      case "weekly":
        return weeklyData
      case "monthly":
        return monthlyData
      case "yearly":
        return yearlyData
      default:
        return dailyData.filter((item) => isDateInRange(item.date))
    }
  }

  const displayData = getDisplayData()

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

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`
  }

  const getStatusBadge = (status: SettlementStatus) => {
    const statusMap = {
      "carried-over": { label: "지급 이월", variant: "secondary" as const },
      confirmed: { label: "확정", variant: "secondary" as const },
      completed: { label: "완료", variant: "default" as const }, // Blue button style
    }
    return statusMap[status]
  }

  const calculateSettlement = (item: any) => {
    return item.totalAmount + item.vat - item.fee - item.refund
  }

  const downloadExcel = () => {
    const csvContent = [
      period === "daily"
        ? ["날짜", "상품명", "상품가격", "부가세", "수수료", "환불", "정산금액", "정산예정일", "상태"]
        : period === "weekly"
          ? ["주차", "주문건수", "완료", "보류", "취소", "총금액", "부가세", "수수료", "환불", "정산금액"]
          : period === "monthly"
            ? ["월", "주문건수", "완료", "보류", "취소", "총금액", "부가세", "수수료", "환불", "정산금액", "증감률"]
            : ["년도", "주문건수", "완료", "보류", "취소", "총금액", "부가세", "수수료", "환불", "정산금액"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `정산내역_${period}_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {drillDown.level === "drilled" && (
            <Button variant="ghost" size="sm" onClick={onBackToBase}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle>
            {drillDown.level === "drilled" ? `${drillDown.selectedPeriod} 상세 내역` : "정산 내역 상세"}
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={downloadExcel}>
          <Download className="mr-2 h-4 w-4" />
          엑셀 다운로드
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {period === "daily" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>거래일</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead className="text-right">상품가격</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                  <TableHead>정산예정일</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, index: number) => {
                  const settlementAmount = item.productPrice + item.vat - item.fee - item.refund
                  const statusInfo = getStatusBadge(item.status)

                  return (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.productPrice)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.vat)}</TableCell>
                      <TableCell className="text-right text-destructive">-{formatCurrency(item.fee)}</TableCell>
                      <TableCell className="text-right text-destructive">
                        {item.refund > 0 ? `-${formatCurrency(item.refund)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(settlementAmount)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{item.settlementDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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
                  <TableHead>주차</TableHead>
                  <TableHead className="text-right">주문건수</TableHead>
                  <TableHead className="text-right">완료</TableHead>
                  <TableHead className="text-right">보류</TableHead>
                  <TableHead className="text-right">취소</TableHead>
                  <TableHead className="text-right">총금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, index: number) => {
                  const settlementAmount = calculateSettlement(item)

                  return (
                    <TableRow
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => drillDown.level === "base" && onDrillDown(item.week)}
                    >
                      <TableCell className="font-medium">{item.week}</TableCell>
                      <TableCell className="text-right">{item.orderCount}건</TableCell>
                      <TableCell className="text-right text-green-600">{item.completedCount}건</TableCell>
                      <TableCell className="text-right text-yellow-600">{item.pendingCount}건</TableCell>
                      <TableCell className="text-right text-red-600">{item.cancelledCount}건</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.vat)}</TableCell>
                      <TableCell className="text-right text-destructive">-{formatCurrency(item.fee)}</TableCell>
                      <TableCell className="text-right text-destructive">
                        {item.refund > 0 ? `-${formatCurrency(item.refund)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(settlementAmount)}</TableCell>
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
                  <TableHead>월</TableHead>
                  <TableHead className="text-right">주문건수</TableHead>
                  <TableHead className="text-right">완료</TableHead>
                  <TableHead className="text-right">보류</TableHead>
                  <TableHead className="text-right">취소</TableHead>
                  <TableHead className="text-right">총금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                  <TableHead className="text-right">전월 대비</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, index: number) => {
                  const settlementAmount = calculateSettlement(item)

                  return (
                    <TableRow
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => drillDown.level === "base" && onDrillDown(item.month)}
                    >
                      <TableCell className="font-medium">{item.month}</TableCell>
                      <TableCell className="text-right">{item.orderCount}건</TableCell>
                      <TableCell className="text-right text-green-600">{item.completedCount}건</TableCell>
                      <TableCell className="text-right text-yellow-600">{item.pendingCount}건</TableCell>
                      <TableCell className="text-right text-red-600">{item.cancelledCount}건</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.vat)}</TableCell>
                      <TableCell className="text-right text-destructive">-{formatCurrency(item.fee)}</TableCell>
                      <TableCell className="text-right text-destructive">
                        {item.refund > 0 ? `-${formatCurrency(item.refund)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(settlementAmount)}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.changeRate >= 0 ? "text-green-600" : "text-red-600"}>
                          {item.changeRate >= 0 ? "+" : ""}
                          {item.changeRate}%
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
                  <TableHead>년도</TableHead>
                  <TableHead className="text-right">주문건수</TableHead>
                  <TableHead className="text-right">완료</TableHead>
                  <TableHead className="text-right">보류</TableHead>
                  <TableHead className="text-right">취소</TableHead>
                  <TableHead className="text-right">총금액</TableHead>
                  <TableHead className="text-right">부가세</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">환불</TableHead>
                  <TableHead className="text-right">정산금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item: any, index: number) => {
                  const settlementAmount = calculateSettlement(item)

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.year}</TableCell>
                      <TableCell className="text-right">{item.orderCount}건</TableCell>
                      <TableCell className="text-right text-green-600">{item.completedCount}건</TableCell>
                      <TableCell className="text-right text-yellow-600">{item.pendingCount}건</TableCell>
                      <TableCell className="text-right text-red-600">{item.cancelledCount}건</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.vat)}</TableCell>
                      <TableCell className="text-right text-destructive">-{formatCurrency(item.fee)}</TableCell>
                      <TableCell className="text-right text-destructive">
                        {item.refund > 0 ? `-${formatCurrency(item.refund)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(settlementAmount)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {drillDown.level === "base" && (period === "weekly" || period === "monthly") && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            행을 클릭하면 상세 내역을 확인할 수 있습니다
          </div>
        )}

        <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-2">정산 금액 계산 방식 (SM-007)</p>
          <p className="text-muted-foreground">정산금액 = (상품 가격 + 부가세 10%) - 수수료 - 환불금액</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SettlementTable
