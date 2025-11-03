// ✅ 지금 컨트롤러 기준
// GET /api/v1/settlement/{period}/{userId}?date=...
// daily/weekly/월간/연간 전부 "객체 하나" 반환
import apiClient from "@/lib/api"

export type PeriodType = "daily" | "weekly" | "monthly" | "yearly"

export async function fetchSettlementByPeriod(
  userId: number,
  period: PeriodType,
  date: string,
) {
  const d = date && date.includes("T") ? date.slice(0, 10) : (date || new Date().toISOString().slice(0, 10))
  const res = await apiClient.get(`/api/v1/settlement/${period}/${userId}`, {
    params: { date: d },
  })
  console.log("[API] response ==>", res.data)
  return res.data   // 👈 이제 전부 객체
}

export const settlementApi = {
  byPeriod: fetchSettlementByPeriod,
  daily: (userId: number, date: string) =>
    fetchSettlementByPeriod(userId, "daily", date),
  weekly: (userId: number, date: string) =>
    fetchSettlementByPeriod(userId, "weekly", date),
  monthly: (userId: number, date: string) =>
    fetchSettlementByPeriod(userId, "monthly", date),
  yearly: (userId: number, date: string) =>
    fetchSettlementByPeriod(userId, "yearly", date),
}
