// import apiClient from "@/lib/api";
// type PageOpts = { page?: number; size?: number; sort?: string | string[] };

// export type PeriodType = "all" | "daily" | "weekly" | "monthly" | "yearly"

// // 전체 주문 건별 정산 내역 + 정산상태
// export async function fetchAllSettlements(
//   userId: number,
//   startDate: Date,
//   endDate: Date,
//   pageOpts: PageOpts = {},
//   settlementStatus?: "all" | "PENDING" | "CANCELED" | "COMPLETED"
// ) {
//   const toYmd = (d: Date) => {
//     const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
//     // const y = local.getFullYear();
//     // const m = String(local.getMonth() + 1).padStart(2, "0");
//     // const day = String(local.getDate()).padStart(2, "0");
//     // return `${y}-${m}-${day}`;
//     return local.toISOString().slice(0, 10)
//   };
//   // const endPlus = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1)
//   const params: Record<string, any> = {
//     startDate: toYmd(startDate),
//     endDate: toYmd(endDate),
//     ...(pageOpts.page !== undefined && { page: pageOpts.page }),
//     ...(pageOpts.size !== undefined && { size: pageOpts.size }),
//     ...(pageOpts.sort && { sort: pageOpts.sort }),
//   };

//   // 정산 상태
//   if (settlementStatus && settlementStatus !== "all") {
//     params.settlementStatus = settlementStatus
//   }

//   if (pageOpts.page !== undefined) params.page = pageOpts.page;
//   if (pageOpts.size !== undefined) params.size = pageOpts.size;
//   if (pageOpts.sort) params.sort = pageOpts.sort;

//   const res = await apiClient.get(`/api/v1/settlement/all/${userId}`, { params })
//   console.log("[All] response -> ", res.data);
//   return res.data
// }

// export async function fetchSettlementByPeriod(
//   userId: number,
//   period: PeriodType,
//   start: Date,
//   end: Date,
//   pageOpts: PageOpts = {},
// ) {
//   const toYmdLocal = (d: Date) => {
//     const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
//     // const y = local.getFullYear();
//     // const m = String(local.getMonth() + 1).padStart(2, "0");
//     // const day = String(local.getDate()).padStart(2, "0");
//     // return `${y}-${m}-${day}`;
//     return local.toISOString().slice(0, 10)
//   };
//   // 로컬 타임존 기준 YYYY-MM-DD 만들기 (UTC 밀림 방지)
//   const toYYYYMMDD = (dt: Date) => {
//     const y = dt.getFullYear();
//     const m = String(dt.getMonth() + 1).padStart(2, "0");
//     const d = String(dt.getDate()).padStart(2, "0");
//     return `${y}-${m}-${d}`;
//   };

//   // const baseStr = date && date.includes("T")
//   //   ? date.slice(0, 10)
//   //   : (date || toYYYYMMDD(new Date()));
//   // const base = new Date(baseStr);
//   // let startDate: string;
//   // let endDate: string

//   // if (period === "daily") {
//   //   const d = toYYYYMMDD(base);
//   //   startDate = d;
//   //   endDate = d;

//   // } else if (period === "weekly") {
//   //   // 주: 월요일~일요일
//   //   const day = base.getDay(); // 0=Sun..6=Sat
//   //   const monday = new Date(base);
//   //   monday.setDate(base.getDate() - ((day + 6) % 7));
//   //   const sunday = new Date(monday);
//   //   sunday.setDate(monday.getDate() + 6);
//   //   startDate = toYYYYMMDD(monday);
//   //   endDate = toYYYYMMDD(sunday);

//   // } else if (period === "monthly") {
//   //   const y = base.getFullYear();
//   //   const m = base.getMonth();
//   //   // startDate = `${y}-${String(m).padStart(2, "0")}-01`;
//   //   // endDate = `${y}-${String(m).padStart(2, "0")}-01`;
//   //   const first = new Date(y, m, 1);
//   //   const last = new Date(y, m + 1, 0);
//   //   startDate = toYYYYMMDD(first);
//   //   endDate = toYYYYMMDD(last);

//   // } else { // yearly
//   //   const y = base.getFullYear();
//   //   startDate = `${y}-01-01`;
//   //   endDate = `${y}-12-31`;
//   // }

//   // if (pageOpts.page !== undefined) page = pageOpts.page;
//   // if (pageOpts.size !== undefined) params.size = pageOpts.size;
//   // if (pageOpts.sort) params.sort = pageOpts.sort;

//   const params: Record<string, any> = {
//     startDate: toYmdLocal(start),
//     endDate: toYmdLocal(end),
//     ...(pageOpts.page !== undefined && { page: pageOpts.page }),
//     ...(pageOpts.size !== undefined && { size: pageOpts.size }),
//     ...(pageOpts.sort && { sort: pageOpts.sort }),
//   };
//   const res = await apiClient.get(`/api/v1/settlement/${period}/${userId}`, {
//     params
//   })
//   const data = res.data
//   if (Array.isArray(data)) return data
//   if (Array.isArray(data?.content)) return data.content
//   console.log("[API] response ==>", data)
//   return data ? [data] : []
// }

// // debugtest
// export const settlementApi = {
//   byPeriod: fetchSettlementByPeriod,
//   daily: (userId: number, date: string) =>
//     fetchSettlementByPeriod(userId, "daily", date),
//   weekly: (userId: number, date: string) =>
//     fetchSettlementByPeriod(userId, "weekly", date),
//   monthly: (userId: number, date: string) =>
//     fetchSettlementByPeriod(userId, "monthly", date),
//   yearly: (userId: number, date: string) =>
//     fetchSettlementByPeriod(userId, "yearly", date),
// }

import apiClient from "@/lib/api"

export type PeriodType = "all" | "daily" | "weekly" | "monthly" | "yearly"
type PageOpts = { page?: number; size?: number; sort?: string | string[] }

// ──────────────────────────────────────────────────────────────
// 공통: 문자열/Date 모두 안전하게 YYYY-MM-DD (로컬 기준)로 변환
export function toYmd(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input
  if (!(d instanceof Date) || Number.isNaN(d.valueOf())) {
    throw new Error("Invalid date passed to toYmd")
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// ──────────────────────────────────────────────────────────────
// ① 전체 주문건별 정산 내역 (상태 + 기간 + 페이지네이션)
export async function fetchAllSettlements(
  userId: number,
  startDate: Date | string,
  endDate: Date | string,
  pageOpts: PageOpts = {},
  settlementStatus?: "all" | "PENDING" | "CANCELED" | "COMPLETED"
) {
  const params: Record<string, any> = {
    startDate: toYmd(startDate),
    endDate: toYmd(endDate),
    ...(pageOpts.page !== undefined && { page: pageOpts.page }),
    ...(pageOpts.size !== undefined && { size: pageOpts.size }),
    ...(pageOpts.sort && { sort: pageOpts.sort }),
  }
  if (settlementStatus && settlementStatus !== "all") {
    params.settlementStatus = settlementStatus
  }
  const res = await apiClient.get(`/api/v1/settlement/all/${userId}`, { params })
  return res.data
}

// ② 일/주/월/연 집계 (기간 범위 + 페이지네이션)
export async function fetchSettlementByPeriod(
  userId: number,
  period: Exclude<PeriodType, "all">, // 집계는 all 제외
  from: Date | string,
  to: Date | string,
  pageOpts: PageOpts = {}
) {
  const params: Record<string, any> = {
    startDate: toYmd(from),
    endDate: toYmd(to),
    ...(pageOpts.page !== undefined && { page: pageOpts.page }),
    ...(pageOpts.size !== undefined && { size: pageOpts.size }),
    ...(pageOpts.sort && { sort: pageOpts.sort }),
  }
  const res = await apiClient.get(`/api/v1/settlement/${period}/${userId}`, { params })
  return res.data // Page<T> 또는 Array<T>
}
