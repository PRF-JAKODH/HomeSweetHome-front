import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Receipt, Percent, FileText } from "lucide-react"
import type { PeriodType, SettlementStatus } from "@/app/seller/page"

interface SettlementSummaryProps {
  period: PeriodType
  status: SettlementStatus | "all"
  dateRange: { from: Date; to: Date }
}

export function SettlementSummary({ period, status, dateRange }: SettlementSummaryProps) {
  const getSummaryDataByPeriod = () => {
    console.log("[v0] Filtering data for date range:", dateRange.from.toISOString(), "to", dateRange.to.toISOString())

    switch (period) {
      case "daily":
        return {
          totalOrders: 12,
          completedOrders: 10,
          pendingOrders: 1,
          cancelledOrders: 1,
          totalAmount: 980000,
          vat: 98000,
          fee: 73500,
          refundAmount: 35000,
          finalAmount: 969500,
          completionRate: 83.3,
        }
      case "weekly":
        return {
          totalOrders: 78,
          completedOrders: 71,
          pendingOrders: 4,
          cancelledOrders: 3,
          totalAmount: 6240000,
          vat: 624000,
          fee: 468000,
          refundAmount: 180000,
          finalAmount: 6216000,
          completionRate: 91.0,
        }
      case "monthly":
        return {
          totalOrders: 342,
          completedOrders: 312,
          pendingOrders: 18,
          cancelledOrders: 12,
          totalAmount: 27360000,
          vat: 2736000,
          fee: 2052000,
          refundAmount: 780000,
          finalAmount: 27264000,
          completionRate: 91.2,
          changeRate: 12.5,
        }
      case "yearly":
        return {
          totalOrders: 4104,
          completedOrders: 3744,
          pendingOrders: 216,
          cancelledOrders: 144,
          totalAmount: 328320000,
          vat: 32832000,
          fee: 24624000,
          refundAmount: 9360000,
          finalAmount: 327168000,
          completionRate: 91.2,
        }
    }
  }

  const summaryData = getSummaryDataByPeriod()

  const getPeriodLabel = () => {
    switch (period) {
      case "daily":
        return "일별"
      case "weekly":
        return "주별"
      case "monthly":
        return "월별"
      case "yearly":
        return "년별"
    }
  }

  const cards = [
    {
      title: `총 주문 건수 (${getPeriodLabel()})`,
      value: summaryData.totalOrders.toLocaleString(),
      description: `완료 ${summaryData.completedOrders} / 보류 ${summaryData.pendingOrders} / 취소 ${summaryData.cancelledOrders}`,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "총 거래 금액",
      value: `₩${summaryData.totalAmount.toLocaleString()}`,
      description: "상품 가격 합계",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "부가세 (10%)",
      value: `₩${summaryData.vat.toLocaleString()}`,
      description: "SM-009: 부가세 계산",
      icon: Receipt,
      color: "text-purple-600",
    },
    {
      title: "수수료",
      value: `₩${summaryData.fee.toLocaleString()}`,
      description: "플랫폼 수수료",
      icon: Percent,
      color: "text-orange-600",
    },
    {
      title: "환불 금액",
      value: `₩${summaryData.refundAmount.toLocaleString()}`,
      description: "SM-010: 환불 차감",
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "최종 정산 금액",
      value: `₩${summaryData.finalAmount.toLocaleString()}`,
      description: "SM-007: (거래+부가세) - 수수료 - 환불",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ]

  if (period === "monthly") {
    cards.push({
      title: "전월 대비",
      value: `${summaryData.changeRate > 0 ? "+" : ""}${summaryData.changeRate}%`,
      description: "증감률",
      icon: summaryData.changeRate > 0 ? TrendingUp : TrendingDown,
      color: summaryData.changeRate > 0 ? "text-green-600" : "text-red-600",
    })
  }

  if (period === "daily" || period === "weekly") {
    cards.push({
      title: "정산 완료율",
      value: `${summaryData.completionRate}%`,
      description: `${summaryData.completedOrders}/${summaryData.totalOrders} 건 완료`,
      icon: Percent,
      color: "text-blue-600",
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <Icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default SettlementSummary
