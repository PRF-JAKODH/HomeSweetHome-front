"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { clearRecentSearches, deleteRecentSearchKeyword, getRecentSearches, getSearchAutocomplete } from "@/lib/api/products"
import { useAuthStore } from "@/stores/auth-store"

interface SearchModalProps {
  keyword: string
  onKeywordChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onSearchWithKeyword?: (keyword: string) => void
  onClose: () => void
}

// 하이라이트 처리 컴포넌트
function HighlightedText({ text }: { text: string }) {
  // <b> 태그를 <strong>으로 변환하여 하이라이트 처리
  const parts = text.split(/(<b>.*?<\/b>)/g)
  
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('<b>') && part.endsWith('</b>')) {
          const highlightedText = part.replace(/<\/?b>/g, '')
          return (
            <strong key={index} className="font-bold text-gray-900">
              {highlightedText}
            </strong>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

export function SearchModal({ keyword, onKeywordChange, onSubmit, onSearchWithKeyword, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([])
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 50)

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !showAutocomplete) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("keydown", handleGlobalKeyDown)
    }
  }, [onClose, showAutocomplete])

  // 최근 검색어 로드
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

  // 자동 완성 API 호출 (Debounce)
  useEffect(() => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const trimmedKeyword = keyword.trim()
    
    // 2글자 미만이면 자동 완성 숨김
    if (trimmedKeyword.length < 2) {
      setAutocompleteResults([])
      setShowAutocomplete(false)
      setSelectedIndex(-1)
      return
    }

    // Debounce: 300ms 후 API 호출
    const timer = setTimeout(async () => {
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      setIsLoadingAutocomplete(true)
      setShowAutocomplete(true)

      try {
        const results = await getSearchAutocomplete(trimmedKeyword)
        if (!controller.signal.aborted) {
          setAutocompleteResults(results)
          setSelectedIndex(-1)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("자동 완성을 불러오지 못했습니다.", error)
          setAutocompleteResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingAutocomplete(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [keyword])

  const handleKeywordClick = (value: string) => {
    // <b> 태그 제거하여 실제 검색어만 사용
    const cleanValue = value.replace(/<\/?b>/g, '')
    onKeywordChange(cleanValue)
    setShowAutocomplete(false)
    inputRef.current?.focus()
  }

  const handleAutocompleteSelect = useCallback((selectedKeyword: string) => {
    const cleanValue = selectedKeyword.replace(/<\/?b>/g, '')
    onKeywordChange(cleanValue)
    setShowAutocomplete(false)
    // 검색 실행 - 선택한 검색어를 직접 사용
    if (onSearchWithKeyword) {
      onSearchWithKeyword(cleanValue)
    } else {
      // fallback: 기존 방식
      const syntheticEvent = {
        preventDefault: () => {},
        currentTarget: inputRef.current?.closest('form') || null,
      } as React.FormEvent<HTMLFormElement>
      onSubmit(syntheticEvent)
    }
  }, [onKeywordChange, onSubmit, onSearchWithKeyword])

  const handleKeywordRemove = async (value: string) => {
    try {
      await deleteRecentSearchKeyword(value)
      setRecentSearches((prev) => prev.filter((item) => item !== value))
    } catch (error) {
      console.error("최근 검색어를 삭제하지 못했습니다.", error)
    }
  }

  // 키보드 네비게이션 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 자동 완성이 표시되지 않거나 결과가 없으면 기본 동작 허용
    if (!showAutocomplete || autocompleteResults.length === 0) {
      if (e.key === "Escape") {
        onClose()
      }
      // Enter 키는 form submit으로 처리되도록 허용
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        // 선택된 항목이 있을 때만 자동 완성 결과 사용
        if (selectedIndex >= 0 && selectedIndex < autocompleteResults.length) {
          handleAutocompleteSelect(autocompleteResults[selectedIndex])
        } else {
          // 선택된 항목이 없으면 입력한 검색어로 검색 (form submit)
          setShowAutocomplete(false)
          onSubmit(e as any)
        }
        break
      case "Escape":
        e.preventDefault()
        setShowAutocomplete(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-white/18 px-4 py-40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-black/10 bg-white/48 p-8 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="space-y-10">
          <div className="group relative pb-5">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="브랜드, 상품 등을 검색하세요"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (autocompleteResults.length > 0 && keyword.trim().length >= 2) {
                    setShowAutocomplete(true)
                  }
                }}
                className="h-14 w-full appearance-none rounded-2xl border border-gray-300 bg-white/38 pr-12 text-[32px] font-semibold text-gray-900 placeholder:text-gray-500 transition-all duration-200 focus-visible:border-gray-900 focus-visible:shadow-[0_0_0_3px_rgba(0,0,0,0.25)] focus-visible:ring-0 focus-visible:outline-none tracking-tight"
              />
              <button
                type="button"
                onClick={() => {
                  onKeywordChange("")
                  setShowAutocomplete(false)
                  setAutocompleteResults([])
                }}
                className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full text-gray-400 transition hover:text-gray-900 ${
                  keyword ? "flex h-7 w-7 items-center justify-center" : "hidden"
                }`}
                aria-label="검색어 지우기"
              >
                ×
              </button>
              
              {/* 자동 완성 드롭다운 */}
              {showAutocomplete && keyword.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg z-50">
                  {isLoadingAutocomplete ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      검색 중...
                    </div>
                  ) : autocompleteResults.length > 0 ? (
                    <ul className="py-2">
                      {autocompleteResults.map((result, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            onClick={() => handleAutocompleteSelect(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full px-4 py-3 text-left text-base hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                              selectedIndex === index ? "bg-gray-100" : ""
                            }`}
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <Search className="w-4 h-4 text-gray-500" />
                            </div>
                            <HighlightedText text={result} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      검색 결과가 없습니다
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 block h-1 rounded-full bg-black/20 transition-colors group-focus-within:bg-black" />
          </div>
          {!showAutocomplete && isAuthenticated && recentSearches.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">최근 검색어</h3>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await clearRecentSearches()
                      setRecentSearches([])
                    } catch (error) {
                      console.error("최근 검색어를 초기화하지 못했습니다.", error)
                    }
                  }}
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
                    className="group/recent flex items-center gap-2 rounded-full border border-gray-200 bg-white/55 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                  >
                    <span className="truncate max-w-[160px]">{item}</span>
                    <span
                      onClick={(event) => {
                        event.stopPropagation()
                        handleKeywordRemove(item)
                      }}
                      className="text-gray-400 transition group-hover/recent:text-white"
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </form>
      </div>
    </div>
  )
}

