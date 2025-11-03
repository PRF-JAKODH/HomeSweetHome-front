import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Receipt, Percent, FileText } from "lucide-react"
import type { PeriodType, SettlementStatus } from "@/app/seller/page"

interface BackendSettlementDto {
  orderedAt?: string
  totalSales?: number | string
  totalFee?: number | string
  totalVat?: number | string
  totalRefund?: number | string
  totalSettlement?: number | string
  totalCount?: number | string
  completedRate?: number | string
  growthRate?: number | string
}

export type SettlementSummaryData = BackendSettlementDto

interface SettlementSummaryProps {
  period: PeriodType
  status: SettlementStatus | "all"
  dateRange: { from: Date; to: Date }
  data: SettlementSummaryData | SettlementSummaryData[]
}

export function SettlementSummary({ period, dateRange, data }: SettlementSummaryProps) {
  // 1) 백 응답이 배열일 수도 있으니까 통일
  const raw: BackendSettlementDto =
    Array.isArray(data) ? data[0] ?? {} : data ?? {}

  // 2) 숫자 변환 함수 (백이 string으로 줄 수도 있으니까)
  const num = (v: number | string | undefined | null): number => {
    if (typeof v === "number") return v
    if (typeof v === "string") return Number(v) || 0
    return 0
  }

  // 3) 백 키 → 프론트에서 바로 쓰는 안전한 객체
  const safe = {
    totalCount: num(raw.totalCount),
    totalSales: num(raw.totalSales),
    totalFee: num(raw.totalFee),
    totalVat: num(raw.totalVat),
    totalRefund: num(raw.totalRefund),
    totalSettlement: num(raw.totalSettlement),
    completedRate: num(raw.completedRate),
    growthRate: num(raw.growthRate),
  }

  const getPeriodLabel = () => {
    switch (period) {
      case "daily":
        return "일별"
      case "weekly":
        return "주별"
      case "monthly":
        return "월별"
      case "yearly":
        return "연별"
      default:
        return "조회"
    }
  }

  const cards = [
    // {
    //   title: `총 주문 건수 (${getPeriodLabel()})`,
    //   value: safe.totalCount.toLocaleString(),
    //   icon: FileText,
    //   color: "text-blue-600",
    // },
    {
      title: "총 판매 금액",
      value: `₩${safe.totalSales.toLocaleString()}`,
      description: "판매한 금액",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "부가세",
      value: `₩${safe.totalVat.toLocaleString()}`,
      description: "판매금액의 10%",
      icon: Receipt,
      color: "text-purple-600",
    },
    {
      title: "수수료",
      value: `₩${safe.totalFee.toLocaleString()}`,
      description: "",
      icon: Percent,
      color: "text-orange-600",
    },
    {
      title: "환불 금액",
      value: `₩${safe.totalRefund.toLocaleString()}`,
      description: "환불이 된 경우에만",
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "최종 정산 금액",
      value: `₩${safe.totalSettlement.toLocaleString()}`,
      description: "(판매+부가세) - 수수료 - 환불",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ]

  if (period === "monthly") {
    cards.push({
      title: "전월 대비",
      value: `${safe.growthRate > 0 ? "+" : ""}${safe.growthRate}%`,
      description: "증감률",
      icon: safe.growthRate > 0 ? TrendingUp : TrendingDown,
      color: safe.growthRate > 0 ? "text-green-600" : "text-red-600",
    })
  }

  if (period === "daily" || period === "weekly") {
    cards.push({
      title: "정산 완료율",
      value: `${safe.completedRate}%`,
      description: `${safe.totalCount}건 기준`,
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              {item.description ? (
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default SettlementSummary
