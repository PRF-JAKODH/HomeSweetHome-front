"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PointsHistoryPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "earned" | "used">("all")

  const totalPoints = 15000

  const pointsHistory = [
    {
      id: 1,
      date: "2025-01-15",
      description: "상품 구매 적립",
      points: 890,
      type: "earned",
      balance: 15000,
    },
    {
      id: 2,
      date: "2025-01-14",
      description: "포인트 사용",
      points: -5000,
      type: "used",
      balance: 14110,
    },
    {
      id: 3,
      date: "2025-01-12",
      description: "리뷰 작성 적립",
      points: 500,
      type: "earned",
      balance: 19110,
    },
    {
      id: 4,
      date: "2025-01-10",
      description: "상품 구매 적립",
      points: 450,
      type: "earned",
      balance: 18610,
    },
    {
      id: 5,
      date: "2025-01-08",
      description: "포인트 사용",
      points: -3000,
      type: "used",
      balance: 18160,
    },
    {
      id: 6,
      date: "2025-01-05",
      description: "상품 구매 적립",
      points: 1200,
      type: "earned",
      balance: 21160,
    },
    {
      id: 7,
      date: "2025-01-03",
      description: "회원가입 축하 적립",
      points: 3000,
      type: "earned",
      balance: 19960,
    },
  ]

  const filteredHistory = filter === "all" ? pointsHistory : pointsHistory.filter((item) => item.type === filter)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1256px] px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로 가기
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">포인트 내역</h1>
          <p className="text-text-secondary">포인트 적립 및 사용 내역을 확인하세요</p>
        </div>

        {/* Total Points Card */}
        <div className="bg-gradient-to-r from-[#35C5F0] to-[#2BA3D4] rounded-xl p-8 text-white shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-white/80 mb-2">총 보유 포인트</p>
              <p className="text-5xl font-bold">{totalPoints.toLocaleString()}P</p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-divider mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              filter === "all" ? "text-primary border-b-2 border-primary" : "text-text-secondary hover:text-foreground"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter("earned")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              filter === "earned"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            적립
          </button>
          <button
            onClick={() => setFilter("used")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              filter === "used" ? "text-primary border-b-2 border-primary" : "text-text-secondary hover:text-foreground"
            }`}
          >
            사용
          </button>
        </div>

        {/* Points History List */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">포인트 내역이 없습니다.</div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-divider rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-text-secondary">{item.date}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.type === "earned" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.type === "earned" ? "적립" : "사용"}
                      </span>
                    </div>
                    <p className="text-foreground font-medium mb-1">{item.description}</p>
                    <p className="text-sm text-text-secondary">잔액: {item.balance.toLocaleString()}P</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${item.points > 0 ? "text-[#35C5F0]" : "text-red-600"}`}>
                      {item.points > 0 ? "+" : ""}
                      {item.points.toLocaleString()}P
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
