"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { PeriodType, SettlementStatus } from "@/app/seller/page"
import { useEffect } from "react"

interface SettlementFiltersProps {
  period: PeriodType
  setPeriod: (period: PeriodType) => void
  status: SettlementStatus | "all"
  setStatus: (status: SettlementStatus | "all") => void
  dateRange: { from: Date; to: Date }
  setDateRange: (range: { from: Date; to: Date }) => void
}

export function SettlementFilters({
  period,
  setPeriod,
  status,
  setStatus,
  dateRange,
  setDateRange,
}: SettlementFiltersProps) {

  useEffect(() => {
    const today = new Date()
    console.log("today:${today}", today);

    if (period === "daily") {
      // 오늘 하루
      setDateRange({ from: today, to: today })
      console.log(`setDateRange: ${setDateRange}`, setDateRange);

      return
    }

    if (period === "weekly") {
      // 이번 주 (월~일) 기준으로 만들기
      const day = today.getDay() // 0=일, 1=월 ...
      const diffToMonday = (day + 6) % 7 // 월=0
      const start = new Date(today)
      start.setDate(today.getDate() - diffToMonday)
      start.setHours(0, 0, 0, 0)
      console.log(`start:${start}`, start);

      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      setDateRange({ from: start, to: end })
      console.log(`end:${end}`, end);
      return
    } if (period === "monthly") {
      // 이번 달 1일 ~ 말일
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      setDateRange({ from: start, to: end })
      console.log(`start: ${start} end: ${end}`, start, end);
      return
    }

    if (period === "yearly") {
      // 올해 1/1 ~ 12/31
      const start = new Date(today.getFullYear(), 0, 1)
      const end = new Date(today.getFullYear(), 11, 31)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      setDateRange({ from: start, to: end })

      console.log(`start: ${start} end: ${end}`, start, end);
      return
    }
  }, [period])

  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="period">정산 조회</Label>
          {/* <p>토글 선택시 </p> */}
          <Select value={period} onValueChange={(value) => {
            const typed = value as PeriodType
            setPeriod(typed)
            if (typed != "daily") { setStatus("all") }
          }
          }>
            <SelectTrigger id="period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">일별</SelectItem>
              <SelectItem value="weekly">주별</SelectItem>
              <SelectItem value="monthly">월별</SelectItem>
              <SelectItem value="yearly">연별</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* {
          period == "daily" && (<div className="space-y-2">
            <Label htmlFor="status">정산 상태</Label>
            <div style={{ display: period === "daily" ? "block" : "none" }}>
              <Select value={status} onValueChange={(value) => setStatus(value as SettlementStatus | "all")}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">진행중</SelectItem>
                  <SelectItem value="confirmed">완료</SelectItem>
                  <SelectItem value="canceled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>)
        } */}

        <div className="space-y-2">
          <Label>조회 기간</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                disabled
                aria-disabled="true"
                className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
              >
                <div className="mr-2 h-4 w-4" >
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "PPP", { locale: ko })} - {format(dateRange.to, "PPP", { locale: ko })}
                    </>
                  ) : (
                    format(dateRange.from, "PPP", { locale: ko })
                  )
                ) : (
                  <span>날짜 선택</span>
                )}</div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{ from: dateRange?.from, to: dateRange?.to }}
                onSelect={(range) => {
                  if (range?.from) {
                    setDateRange({
                      from: range.from,
                      to: range.to || range.from,
                    })
                  }
                }}
                numberOfMonths={2}
                locale={ko}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  )
}

export default SettlementFilters
