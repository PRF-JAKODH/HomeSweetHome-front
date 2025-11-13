"use client"

import Image from "next/image"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef, useMemo } from "react"
import { ArrowDown, ArrowUp, Check, ChevronRight } from "lucide-react"
import { useTopCategories, useCategoriesByParent } from "@/lib/hooks/use-categories"
import { useInfiniteProductPreviews } from "@/lib/hooks/use-products"
import { Category } from "@/types/api/category"
import { ProductSortType, RangeFilter as ApiRangeFilter, RecentViewPreviewResponse } from "@/types/api/product"
import { useSearchParams, useRouter } from "next/navigation" // useRouter 추가
import MultiSelectFilterDropdown from "@/components/store/filters/multi-select-filter"
import RangeGroupFilterDropdown from "@/components/store/filters/range-group-filter"
import {
  storeFilterConfig,
  FilterConfig,
  MultiSelectFilterConfig,
  RangeGroupFilterConfig,
  RangeValue,
} from "./filter-config"
import { useStoreFilters } from "@/lib/hooks/use-store-filters"
import { deleteRecentViewItem, getRecentViews } from "@/lib/api/products"
import { useAuthStore } from "@/stores/auth-store"
import { CategoryHero } from "@/components/store/category-hero"

export default function StorePage() {
  const searchParams = useSearchParams()
  const router = useRouter() // router 추가
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null)
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [isClient, setIsClient] = useState(false)
  const [sortType, setSortType] = useState<ProductSortType>('LATEST')
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [recentViews, setRecentViews] = useState<RecentViewPreviewResponse[]>([])
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  // 무한 스크롤을 위한 observer ref
  const observerTarget = useRef<HTMLDivElement>(null)
  
  // URL에서 검색 키워드와 카테고리 ID 가져오기
  const searchKeyword = searchParams.get('keyword') || ''
  const categoryParam = searchParams.get('category')
  
  // 정렬 타입 변경 핸들러
  const handleSortTypeChange = (newSortType: ProductSortType) => {
    setSortType(newSortType)
    setShowSortOptions(false)
  }

  // 정렬 옵션 표시 토글
  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions)
  }

  // 정렬 타입별 표시명
  const getSortTypeLabel = (type: ProductSortType) => {
    switch (type) {
      case 'POPULAR': return '리뷰순'
      case 'LATEST': return '최신순'
      case 'PRICE_LOW': return '낮은가격순'
      case 'PRICE_HIGH': return '높은가격순'
      default: return '최신순'
    }
  }

  // 최상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // 최상단 카테고리 조회
  const { data: topCategories = [], isLoading: topCategoriesLoading, error: topCategoriesError } = useTopCategories()
  
  // 선택된 카테고리의 하위 카테고리 조회
  const { data: subCategories = [], isLoading: subCategoriesLoading } = useCategoriesByParent(selectedMainCategory || 0)
  
  // 선택된 하위 카테고리의 하위 카테고리 조회 (3레벨)
  const subSubCategoryParentId = selectedSubCategory && subCategories.length > 0 ? selectedSubCategory : 0
  const { data: subSubCategories = [], isLoading: subSubCategoriesLoading } = useCategoriesByParent(subSubCategoryParentId)

  const selectedCategory = topCategories.find((cat) => cat.id === selectedMainCategory)
  const selectedSubCategoryData = subCategories.find((cat) => cat.id === selectedSubCategory)
  const selectedSubSubCategoryData = subSubCategories.find((cat) => cat.id === selectedSubSubCategory)
  const categoryNameTrail = [
    selectedCategory?.name,
    selectedSubCategoryData?.name,
    selectedSubSubCategoryData?.name,
  ].filter((name): name is string => Boolean(name))

  // 상품 조회 (무한 스크롤)
  const currentCategoryId = selectedSubSubCategory || selectedSubCategory || selectedMainCategory
  
  const filtersToRender = useMemo<FilterConfig[]>(() => {
    const categoryFilters = storeFilterConfig.categoryFilters.flatMap((group) =>
      group.matchAny.some((name) => categoryNameTrail.includes(name)) ? group.filters : []
    )
    return [...storeFilterConfig.baseFilters, ...categoryFilters]
  }, [categoryNameTrail])

  const {
    selectedOptions,
    selectedRanges,
    optionFilters,
    rangeFilters,
    toggleOption,
    clearOption,
    setRangeValues,
    clearRange,
  } = useStoreFilters(filtersToRender)

  const optionConfigMap = useMemo(() => {
    const map = new Map<string, MultiSelectFilterConfig>()
    filtersToRender.forEach((filter) => {
      if (filter.type === "multi-select" || filter.type === "color") {
        map.set(filter.optionKey, filter)
      }
    })
    return map
  }, [filtersToRender])

  const rangeConfigMap = useMemo(() => {
    const map = new Map<string, { label: string; unit?: string }>()
    filtersToRender.forEach((filter) => {
      if (filter.type === "range-group") {
        filter.ranges.forEach((range) => {
          map.set(range.rangeKey, { label: range.label, unit: range.unit })
        })
      }
    })
    return map
  }, [filtersToRender])

  const selectedChips = useMemo(
    () =>
      [
        ...Array.from(optionConfigMap.entries()).flatMap(([optionKey, config]) => {
          const values = selectedOptions[optionKey] ?? []
          return values.map((value) => ({
            id: `${optionKey}-${value}`,
            label: `${config.label}: ${value}`,
            onRemove: () => toggleOption(optionKey, value),
          }))
        }),
        ...Array.from(rangeConfigMap.entries())
          .map(([rangeKey, config]) => {
            const value = selectedRanges[rangeKey]
            if (!value || (value.min === undefined && value.max === undefined)) {
              return null
            }

            return {
              id: `range-${rangeKey}`,
              label: `${config.label}: ${value.min ?? "-"}${config.unit ?? ""} ~ ${value.max ?? "-"}${config.unit ?? ""}`,
              onRemove: () => clearRange(rangeKey),
            }
          })
          .filter(Boolean) as { id: string; label: string; onRemove: () => void }[],
      ],
    [optionConfigMap, selectedOptions, toggleOption, rangeConfigMap, selectedRanges, clearRange]
  )

  const apiRangeFilters = useMemo(() => {
    if (!rangeFilters) return undefined
    return Object.entries(rangeFilters).reduce<Record<string, ApiRangeFilter>>((acc, [key, value]) => {
      acc[key] = {
        minValue: value.min,
        maxValue: value.max,
      }
      return acc
    }, {})
  }, [rangeFilters])

  const {
    products,
    isLoading: productsLoading,
    isLoadingMore,
    hasNext,
    error: productsError,
    loadMore,
  } = useInfiniteProductPreviews(
    currentCategoryId || undefined,
    sortType,
    12,
    searchKeyword,
    optionFilters,
    apiRangeFilters,
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setRecentViews([])
      return
    }

    let active = true
    ;(async () => {
      try {
        const views = await getRecentViews()
        if (active) {
          setRecentViews(Array.isArray(views) ? views.slice(0, 10) : [])
        }
      } catch (error) {
        console.error("최근 본 상품을 불러오지 못했습니다.", error)
        if (active) {
          setRecentViews([])
        }
      }
    })()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  // URL 파라미터로 카테고리 설정
  useEffect(() => {
    if (categoryParam && isClient) {
      const categoryId = parseInt(categoryParam)
      if (!isNaN(categoryId)) {
        setSelectedMainCategory(categoryId)
        setSelectedSubCategory(null)
        setSelectedSubSubCategory(null)
        setExpandedCategories(new Set([categoryId]))
      }
    }
  }, [categoryParam, isClient])

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollToTop(scrollTop > 300) // 300px 이상 스크롤 시 버튼 표시
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 정렬 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!showSortOptions) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.sort-dropdown')) {
        setShowSortOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortOptions])

  // 무한 스크롤 Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 타겟이 화면에 보이고, 더 불러올 데이터가 있으면 loadMore 호출
        if (entries[0].isIntersecting && hasNext && !isLoadingMore) {
          loadMore()
        }
      },
      {
        threshold: 0.1, // 10%만 보여도 트리거
        rootMargin: '100px', // 100px 전에 미리 로드
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNext, isLoadingMore, loadMore])

  // URL에서 검색 키워드 제거하는 함수
  const clearSearchKeyword = () => {
    if (searchKeyword) {
      router.push('/store') // 검색 키워드 없는 URL로 이동
    }
  }

  // "전체" 버튼 클릭 핸들러
  const handleAllCategoriesClick = () => {
    setSelectedMainCategory(null)
    setSelectedSubCategory(null)
    setSelectedSubSubCategory(null)
    setExpandedCategories(new Set()) // 모든 확장된 카테고리 닫기
    clearSearchKeyword() // 검색 키워드 제거
  }

  const handleMainCategoryChange = (categoryId: number) => {
    setSelectedMainCategory(categoryId)
    setSelectedSubCategory(null)
    setSelectedSubSubCategory(null)
    clearSearchKeyword() // 검색 키워드 제거
  }

  const handleSubCategoryChange = (subCategoryId: number) => {
    setSelectedSubCategory(subCategoryId)
    setSelectedSubSubCategory(null)
    clearSearchKeyword() // 검색 키워드 제거
  }

  const handleSubSubCategoryChange = (subSubCategoryId: number) => {
    setSelectedSubSubCategory(subSubCategoryId)
    clearSearchKeyword() // 검색 키워드 제거
  }

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const categoryPath = categoryNameTrail.join(" > ")
  const heroCategoryName =
    selectedCategory?.name ??
    selectedSubCategoryData?.name ??
    "전체"
  const hasCategorySelection =
    selectedMainCategory !== null || selectedSubCategory !== null || selectedSubSubCategory !== null

  const handleRecentViewRemove = async (id: number) => {
    try {
      await deleteRecentViewItem(id)
      setRecentViews((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("최근 본 상품을 삭제하지 못했습니다.", error)
    }
  }

  // 클라이언트 사이드에서만 렌더링
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (topCategoriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">카테고리를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (topCategoriesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">카테고리를 불러오는데 실패했습니다.</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="mx-auto max-w-[1256px] px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 py-6">
            {/* 왼쪽 사이드바 - 카테고리 */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {/* 전체 카테고리 버튼 */}
                <button
                  onClick={handleAllCategoriesClick}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all flex items-center justify-between font-medium text-base mb-2 ${
                    selectedMainCategory === null
                      ? "bg-gray-900 text-white"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span>전체</span>
                </button>

                {/* 상위 카테고리 목록 */}
                {topCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id)
                  
                  return (
                    <div key={category.id} className="space-y-1">
                      {/* 메인 카테고리 버튼 */}
                      <button
                        onClick={() => {
                          handleMainCategoryChange(category.id)
                          toggleCategory(category.id)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all flex items-center justify-between font-medium text-base ${
                          selectedMainCategory === category.id
                            ? "bg-gray-900 text-white"
                            : "bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        <span>{category.name}</span>
                        <ChevronRight 
                          className={`h-3 w-3 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {/* 하위 카테고리 (토글) */}
                      {isExpanded && selectedMainCategory === category.id && (
                        <div className="ml-4 space-y-1">
                          {subCategoriesLoading ? (
                            <div className="flex items-center justify-center py-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                          ) : subCategories.length > 0 ? (
                            subCategories.map((subCategory) => {
                              const isSubExpanded = expandedCategories.has(subCategory.id)
                              return (
                                <div key={subCategory.id} className="space-y-1">
                                  <button
                                    onClick={() => {
                                      handleSubCategoryChange(subCategory.id)
                                      toggleCategory(subCategory.id)
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-all flex items-center justify-between font-medium ${
                                      selectedSubCategory === subCategory.id
                                        ? "bg-gray-200 text-gray-900"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    <span>{subCategory.name}</span>
                                    <ChevronRight 
                                      className={`h-2.5 w-2.5 transition-transform ${
                                        isSubExpanded ? "rotate-90" : ""
                                      }`}
                                    />
                                  </button>

                                  {/* 하위의 하위 카테고리 (3레벨) */}
                                  {isSubExpanded && selectedSubCategory === subCategory.id && (
                                    <div className="ml-4 space-y-1">
                                      {subSubCategoriesLoading ? (
                                        <div className="flex items-center justify-center py-1">
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                        </div>
                                      ) : subSubCategories.length > 0 ? (
                                        subSubCategories.map((subSubCategory) => (
                                          <button
                                            key={subSubCategory.id}
                                            onClick={() => handleSubSubCategoryChange(subSubCategory.id)}
                                            className={`w-full text-left px-1.5 py-1 rounded text-xs transition-all font-medium ${
                                              selectedSubSubCategory === subSubCategory.id
                                                ? "bg-gray-200 text-gray-900"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`}
                                          >
                                            {subSubCategory.name}
                                          </button>
                                        ))
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              )
                            })
                          ) : null}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 오른쪽 - 상품 영역 */}
            <div className="lg:col-span-4">
              {searchKeyword ? (
                <CategoryHero categoryName={heroCategoryName} />
              ) : hasCategorySelection ? (
                <CategoryHero categoryName={heroCategoryName} />
              ) : (
                <CategoryHero variant="search" />
              )}
              {isAuthenticated && recentViews.length > 0 ? (
                <section className="mb-10 space-y-4">
                  <header className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">최근 본 상품</h3>
                  </header>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {recentViews.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <button
                          onClick={() => router.push(`/store/products/${item.id}`)}
                          className="flex flex-1 flex-col"
                        >
                          <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-1 px-3 py-3 text-left">
                            <p className="line-clamp-2 text-sm font-semibold text-gray-900">{item.name}</p>
                            <div className="space-y-1">
                              {typeof item.discountRate === "number" && item.discountRate > 0 && (
                                <span className="text-xs font-semibold text-primary">{item.discountRate}%</span>
                              )}
                              <p className="text-base font-bold text-gray-900">
                                {typeof item.discountedPrice === "number"
                                  ? `${item.discountedPrice.toLocaleString()}원`
                                  : typeof item.basePrice === "number"
                                    ? `${item.basePrice.toLocaleString()}원`
                                    : "가격 정보 없음"}
                              </p>
                              {typeof item.discountRate === "number" &&
                                item.discountRate > 0 &&
                                typeof item.basePrice === "number" && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {item.basePrice.toLocaleString()}원
                                  </p>
                                )}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRecentViewRemove(item.id)}
                          className="absolute right-2 top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-black/80 text-white text-sm transition hover:bg-black group-hover:flex"
                          aria-label="최근 본 상품에서 제거"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {searchKeyword ? `"${searchKeyword}" 검색 결과` : categoryPath ? `${categoryPath} 상품` : '전체'}
                  </h2>
                  {searchKeyword && (
                    <button
                      onClick={clearSearchKeyword}
                      className="text-sm text-text-secondary hover:text-foreground transition-colors"
                    >
                      ✕ 필터 초기화
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 md:ml-auto md:items-center">
                  {filtersToRender.map((filter) => {
                    if (filter.type === "range-group") {
                      const rangeFilter = filter as RangeGroupFilterConfig
                      const groupSelected = rangeFilter.ranges.reduce<Record<string, RangeValue | undefined>>(
                        (acc, range) => {
                          acc[range.rangeKey] = selectedRanges[range.rangeKey]
                          return acc
                        },
                        {}
                      )

                      return (
                        <RangeGroupFilterDropdown
                          key={filter.id}
                          config={rangeFilter}
                          selectedRanges={groupSelected}
                          onApplyRange={(rangeKey, values) => setRangeValues(rangeKey, values)}
                          onClearRange={(rangeKey) => clearRange(rangeKey)}
                          onClearGroup={() => rangeFilter.ranges.forEach((range) => clearRange(range.rangeKey))}
                        />
                      )
                    }

                    const multiFilter = filter as MultiSelectFilterConfig
                    const values = selectedOptions[multiFilter.optionKey] ?? []

                    return (
                      <MultiSelectFilterDropdown
                        key={filter.id}
                        config={multiFilter}
                        selectedValues={values}
                        onOptionToggle={(value) => toggleOption(multiFilter.optionKey, value)}
                        onClear={() => clearOption(multiFilter.optionKey)}
                      />
                    )
                  })}

                  <div className="relative sort-dropdown">
                    <Button
                      variant="ghost"
                      size="default"
                      className={`flex items-center gap-2 rounded-full bg-transparent px-2 py-1 text-sm font-medium transition-colors ${
                        showSortOptions ? "text-gray-900" : "text-gray-700 hover:text-gray-900"
                      }`}
                      onClick={toggleSortOptions}
                    >
                      {getSortTypeLabel(sortType)}
                      <span className="flex flex-col leading-none">
                        <ArrowUp className="h-4 w-4 -mb-1 text-gray-800" />
                        <ArrowDown className="h-4 w-4 text-gray-400" />
                      </span>
                    </Button>

                    {showSortOptions && (
                      <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                        <div className="py-1">
                          <button
                            onClick={() => handleSortTypeChange("POPULAR")}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                              sortType === "POPULAR"
                                ? "font-semibold text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            리뷰순
                            {sortType === "POPULAR" && <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleSortTypeChange("LATEST")}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                              sortType === "LATEST"
                                ? "font-semibold text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            최신순
                            {sortType === "LATEST" && <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleSortTypeChange("PRICE_LOW")}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                              sortType === "PRICE_LOW"
                                ? "font-semibold text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            낮은가격순
                            {sortType === "PRICE_LOW" && <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleSortTypeChange("PRICE_HIGH")}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                              sortType === "PRICE_HIGH"
                                ? "font-semibold text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            높은가격순
                            {sortType === "PRICE_HIGH" && <Check className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedChips.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                  <span className="font-medium text-primary">선택한 옵션</span>
                  {selectedChips.map((chip) => (
                    <span
                      key={chip.id}
                      className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow"
                    >
                      {chip.label}
                      <button
                        type="button"
                        className="text-xs text-text-secondary hover:text-destructive"
                        onClick={chip.onRemove}
                        aria-label={`${chip.label} 선택 해제`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 md:gap-6 auto-rows-fr">
                {productsLoading ? (
                  <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">상품을 불러오는 중...</p>
                  </div>
                ) : productsError ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-destructive mb-4">상품을 불러오는데 실패했습니다.</p>
                    <Button onClick={() => window.location.reload()}>다시 시도</Button>
                  </div>
                ) : !productsLoading && !productsError && products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">해당 카테고리에 상품이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    {products.map((product, index) => {
                      // 할인가 계산
                      const finalPrice = product.discountRate > 0 
                        ? Math.round(product.basePrice * (1 - product.discountRate / 100))
                        : product.basePrice
                      
                      return (
                        <ProductCard
                          key={`${product.id}-${index}`}
                          id={product.id.toString()}
                          name={product.name}
                          price={finalPrice}
                          originalPrice={product.discountRate > 0 ? product.basePrice : undefined}
                          image={product.imageUrl}
                          brand={product.brand}
                          rating={product.averageRating}
                          reviewCount={product.reviewCount}
                          isFreeShipping={product.shippingPrice === 0}
                          shippingPrice={product.shippingPrice}
                          discountRate={product.discountRate}
                        />
                      )
                    })}
                  </>
                )}
              </div>

              {/* 무한 스크롤 트리거 & 로딩 인디케이터 */}
              {!productsLoading && products.length > 0 && (
                <div ref={observerTarget} className="col-span-full py-8">
                  {isLoadingMore && (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  {!hasNext && !isLoadingMore && (
                    <p className="text-center text-muted-foreground">
                      모든 상품을 불러왔습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 스크롤 투 탑 버튼 */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary-dark text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
          aria-label="맨 위로 이동"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  )
}