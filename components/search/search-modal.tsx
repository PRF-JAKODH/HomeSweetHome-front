"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getRecentSearches } from "@/lib/api/products"
import { useAuthStore } from "@/stores/auth-store"

interface SearchModalProps {
  keyword: string
  onKeywordChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export function SearchModal({ keyword, onKeywordChange, onSubmit, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 50)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    let active = true
    if (!isAuthenticated) {
      setRecentSearches([])
      return
    }

    ;(async () => {
      try {
        const recent = await getRecentSearches()
        if (active) {
          setRecentSearches(recent ?? [])
        }
      } catch (error) {
        console.error("최근 검색어를 불러오지 못했습니다.", error)
        if (active) {
          setRecentSearches([])
        }
      }
    })()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  const handleKeywordClick = (value: string) => {
    onKeywordChange(value)
    inputRef.current?.focus()
  }

  const handleKeywordRemove = (value: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== value))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 px-4 py-40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-white/70 p-8 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="space-y-10">
          <div className="group relative pb-5">
            <Input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="브랜드, 상품 등을 검색하세요"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              className="h-16 w-full appearance-none rounded-[28px] border border-transparent bg-transparent pr-12 text-[32px] font-semibold text-gray-900 placeholder:text-gray-500 transition-all duration-200 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(53,197,240,0.35)] focus-visible:ring-0 focus-visible:outline-none tracking-tight"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => onKeywordChange("")}
                className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-gray-600"
                aria-label="검색어 지우기"
              >
                ×
              </button>
            )}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 block h-1 rounded-full bg-primary/40 transition-colors group-focus-within:bg-primary" />
          </div>
          {isAuthenticated && recentSearches.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">최근 검색어</h3>
                <button
                  type="button"
                  onClick={() => setRecentSearches([])}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  지우기
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleKeywordClick(item)}
                    className="group/recent flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="truncate max-w-[160px]">{item}</span>
                    <span
                      onClick={(event) => {
                        event.stopPropagation()
                        handleKeywordRemove(item)
                      }}
                      className="text-gray-400 transition group-hover/recent:text-primary"
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </form>
      </div>
    </div>
  )
}

