"use client"

import React from "react"

type DateDividerProps = {
  date: string
  variant?: "default" | "line" | "badge" | "card"
}

export function DateDivider({ date, variant = "default" }: DateDividerProps) {
  // 기본 스타일
  if (variant === "default") {
    return (
      <div className="flex items-center justify-center my-6">
        <div className="px-4 py-2 bg-background-section rounded-full shadow-sm">
          <span className="text-sm font-medium text-text-secondary">
            {date}
          </span>
        </div>
      </div>
    )
  }

  // 라인이 있는 스타일 (카카오톡)
  if (variant === "line") {
    return (
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-divider"></div>
        <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
          {date}
        </span>
        <div className="flex-1 h-px bg-divider"></div>
      </div>
    )
  }

  // 뱃지 스타일
  if (variant === "badge") {
    return (
      <div className="flex justify-center my-6">
        <div className="px-4 py-1.5 bg-primary/10 rounded-full">
          <span className="text-xs font-semibold text-primary">
            {date}
          </span>
        </div>
      </div>
    )
  }

  // 카드 스타일
  if (variant === "card") {
    return (
      <div className="flex justify-center my-6">
        <div className="px-5 py-2 bg-background border border-divider rounded-xl shadow-sm">
          <span className="text-sm font-medium text-foreground">
            {date}
          </span>
        </div>
      </div>
    )
  }

  return null
}