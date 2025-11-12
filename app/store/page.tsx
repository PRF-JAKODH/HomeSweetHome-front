"use client"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef, useMemo } from "react"
import { ChevronRight } from "lucide-react"
import { useTopCategories, useCategoriesByParent } from "@/lib/hooks/use-categories"
import { useInfiniteProductPreviews } from "@/lib/hooks/use-products"
import { Category } from "@/types/api/category"
import { ProductSortType } from "@/types/api/product"
import { useSearchParams, useRouter } from "next/navigation" // useRouter 추가


const COLOR_OPTIONS = [
  "화이트",
  "블랙",
  "브라운",
  "골드",
  "오렌지",
  "그린",
  "네이비",
  "핑크",
  "그레이",
  "베이지",
  "실버",
  "레드",
  "옐로우",
  "블루",
]

const COLOR_SWATCH_MAP: Record<string, string> = {
  화이트: "#FFFFFF",
  블랙: "#000000",
  브라운: "#8B4513",
  골드: "#D4AF37",
  오렌지: "#FF8A3D",
  그린: "#3CB371",
  네이비: "#253552",
  핑크: "#FFB6C1",
  그레이: "#A9A9A9",
  베이지: "#D9C7A3",
  실버: "#C0C0C0",
  레드: "#FF3B30",
  옐로우: "#FFD700",
  블루: "#1E90FF",
}

const LIGHT_OPTIONS = ["50W", "60W", "80W", "120W", "150W", "180W"]
const BED_OPTIONS = ["USB포트추가", "조명추가", "서랍추가", "헤드조명", "수납추가", "헤드추가"]

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
  const [showColorFilter, setShowColorFilter] = useState(false)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showVoltageFilter, setShowVoltageFilter] = useState(false)
  const [selectedVoltages, setSelectedVoltages] = useState<string[]>([])
  const [showBedOptionFilter, setShowBedOptionFilter] = useState(false)
  const [selectedBedOptions, setSelectedBedOptions] = useState<string[]>([])
  const [showSizeFilter, setShowSizeFilter] = useState(false)
  const [widthRangeInput, setWidthRangeInput] = useState<{ min: string; max: string }>({ min: "", max: "" })
  const [heightRangeInput, setHeightRangeInput] = useState<{ min: string; max: string }>({ min: "", max: "" })
  const [selectedWidthRange, setSelectedWidthRange] = useState<{ min?: number; max?: number }>({})
  const [selectedHeightRange, setSelectedHeightRange] = useState<{ min?: number; max?: number }>({})
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  
  // 무한 스크롤을 위한 observer ref
  const observerTarget = useRef<HTMLDivElement>(null)
  const colorDropdownRef = useRef<HTMLDivElement>(null)
  const voltageDropdownRef = useRef<HTMLDivElement>(null)
  const bedOptionsDropdownRef = useRef<HTMLDivElement>(null)
  const sizeDropdownRef = useRef<HTMLDivElement>(null)
  
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
  
  const isLightingCategory = categoryNameTrail.includes("조명")
  const isBedCategory = categoryNameTrail.includes("침대")
  const isFabricCategory = categoryNameTrail.includes("패브릭")

  const optionFilters = useMemo(() => {
    const filters: Record<string, string[]> = {}
    if (selectedColors.length > 0) {
      filters["색상"] = selectedColors
    }
    if (selectedVoltages.length > 0) {
      filters["전압"] = selectedVoltages
    }
    if (selectedBedOptions.length > 0) {
      filters["옵션"] = selectedBedOptions
    }
    return Object.keys(filters).length > 0 ? filters : undefined
  }, [selectedColors, selectedVoltages, selectedBedOptions])

  const rangeFilters = useMemo(() => {
    const ranges: Record<string, { minValue?: number; maxValue?: number }> = {}
    if (selectedWidthRange.min !== undefined || selectedWidthRange.max !== undefined) {
      ranges["가로"] = {
        minValue: selectedWidthRange.min,
        maxValue: selectedWidthRange.max,
      }
    }
    if (selectedHeightRange.min !== undefined || selectedHeightRange.max !== undefined) {
      ranges["세로"] = {
        minValue: selectedHeightRange.min,
        maxValue: selectedHeightRange.max,
      }
    }
    return Object.keys(ranges).length > 0 ? ranges : undefined
  }, [selectedWidthRange, selectedHeightRange])

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
    rangeFilters,
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

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

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (showSortOptions && !(target as Element).closest('.sort-dropdown')) {
        setShowSortOptions(false)
      }
      if (showColorFilter && colorDropdownRef.current && !colorDropdownRef.current.contains(target)) {
        setShowColorFilter(false)
      }
      if (showVoltageFilter && voltageDropdownRef.current && !voltageDropdownRef.current.contains(target)) {
        setShowVoltageFilter(false)
      }
      if (
        showBedOptionFilter &&
        bedOptionsDropdownRef.current &&
        !bedOptionsDropdownRef.current.contains(target)
      ) {
        setShowBedOptionFilter(false)
      }
      if (showSizeFilter && sizeDropdownRef.current && !sizeDropdownRef.current.contains(target)) {
        setShowSizeFilter(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortOptions, showColorFilter, showVoltageFilter, showBedOptionFilter, showSizeFilter])

  useEffect(() => {
    if (!isLightingCategory && selectedVoltages.length > 0) {
      setSelectedVoltages([])
      setShowVoltageFilter(false)
    }
  }, [isLightingCategory, selectedVoltages.length])

  useEffect(() => {
    if (!isBedCategory && selectedBedOptions.length > 0) {
      setSelectedBedOptions([])
      setShowBedOptionFilter(false)
    }
  }, [isBedCategory, selectedBedOptions.length])

  useEffect(() => {
    if (!isFabricCategory) {
      setSelectedWidthRange({})
      setSelectedHeightRange({})
      setWidthRangeInput({ min: "", max: "" })
      setHeightRangeInput({ min: "", max: "" })
      setShowSizeFilter(false)
    }
  }, [isFabricCategory])

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

  const toggleColorSelection = (color: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(color)) {
        return prev.filter((item) => item !== color)
      }
      return [...prev, color]
    })
  }

  const clearSelectedColors = () => {
    setSelectedColors([])
  }

  const toggleVoltageSelection = (watt: string) => {
    setSelectedVoltages((prev) => {
      if (prev.includes(watt)) {
        return prev.filter((item) => item !== watt)
      }
      return [...prev, watt]
    })
  }

  const clearSelectedVoltages = () => {
    setSelectedVoltages([])
  }

  const toggleBedOptionSelection = (option: string) => {
    setSelectedBedOptions((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option)
      }
      return [...prev, option]
    })
  }

  const clearSelectedBedOptions = () => {
    setSelectedBedOptions([])
  }

  const applyWidthRange = () => {
    const min = widthRangeInput.min.trim() === "" ? undefined : Number(widthRangeInput.min)
    const max = widthRangeInput.max.trim() === "" ? undefined : Number(widthRangeInput.max)
    setSelectedWidthRange({ min, max })
  }

  const applyHeightRange = () => {
    const min = heightRangeInput.min.trim() === "" ? undefined : Number(heightRangeInput.min)
    const max = heightRangeInput.max.trim() === "" ? undefined : Number(heightRangeInput.max)
    setSelectedHeightRange({ min, max })
  }

  const clearSizeFilters = () => {
    setSelectedWidthRange({})
    setSelectedHeightRange({})
    setWidthRangeInput({ min: "", max: "" })
    setHeightRangeInput({ min: "", max: "" })
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
                      ? "bg-primary text-white"
                      : "bg-background text-foreground hover:bg-background-section"
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
                            ? "bg-primary text-white"
                            : "bg-background text-foreground hover:bg-background-section"
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
                                        ? "bg-primary/20 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background-section"
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
                                                ? "bg-primary/20 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-background-section"
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
                  {isFabricCategory && (
                    <div ref={sizeDropdownRef} className="relative">
                      <Button
                        variant={
                          selectedWidthRange.min !== undefined ||
                          selectedWidthRange.max !== undefined ||
                          selectedHeightRange.min !== undefined ||
                          selectedHeightRange.max !== undefined
                            ? "default"
                            : "outline"
                        }
                        size="default"
                        className={`flex items-center gap-2 ${
                          selectedWidthRange.min !== undefined ||
                          selectedWidthRange.max !== undefined ||
                          selectedHeightRange.min !== undefined ||
                          selectedHeightRange.max !== undefined
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : ""
                        }`}
                        onClick={() => {
                          setShowSizeFilter((prev) => !prev)
                          setWidthRangeInput({
                            min: selectedWidthRange.min !== undefined ? String(selectedWidthRange.min) : "",
                            max: selectedWidthRange.max !== undefined ? String(selectedWidthRange.max) : "",
                          })
                          setHeightRangeInput({
                            min: selectedHeightRange.min !== undefined ? String(selectedHeightRange.min) : "",
                            max: selectedHeightRange.max !== undefined ? String(selectedHeightRange.max) : "",
                          })
                        }}
                      >
                        사이즈
                        {(selectedWidthRange.min !== undefined ||
                          selectedWidthRange.max !== undefined ||
                          selectedHeightRange.min !== undefined ||
                          selectedHeightRange.max !== undefined) && (
                          <span className="rounded bg-primary-foreground/10 px-2 py-0.5 text-xs font-semibold text-primary-foreground md:text-xs">
                            {(selectedWidthRange.min !== undefined || selectedWidthRange.max !== undefined ? 1 : 0) +
                              (selectedHeightRange.min !== undefined || selectedHeightRange.max !== undefined ? 1 : 0)}
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 transition-transform ${showSizeFilter ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>

                      {showSizeFilter && (
                        <div className="absolute right-0 top-full z-20 mt-2 w-[400px] rounded-lg border border-gray-200 bg-white shadow-lg">
                          <div className="flex items-center justify-between border-b px-4 py-3">
                            <span className="text-sm font-semibold text-foreground">사이즈 범위</span>
                            <button
                              onClick={clearSizeFilters}
                              className="text-xs text-text-secondary hover:text-foreground"
                              type="button"
                            >
                              초기화
                            </button>
                          </div>
                          <div className="space-y-4 px-4 py-3">
                            <div>
                              <p className="mb-2 text-sm font-semibold text-foreground">가로</p>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={widthRangeInput.min}
                                  onChange={(e) => setWidthRangeInput((prev) => ({ ...prev, min: e.target.value }))}
                                  className="w-28 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                  placeholder="최소"
                                />
                                <span className="text-sm text-text-secondary">cm ~</span>
                                <input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={widthRangeInput.max}
                                  onChange={(e) => setWidthRangeInput((prev) => ({ ...prev, max: e.target.value }))}
                                  className="w-28 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                  placeholder="최대"
                                />
                                <span className="text-sm text-text-secondary">cm</span>
                                <Button
                                  size="sm"
                                  onClick={applyWidthRange}
                                  className="bg-gray-600 text-white hover:bg-gray-700"
                                  type="button"
                                >
                                  적용
                                </Button>
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-sm font-semibold text-foreground">세로</p>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={heightRangeInput.min}
                                  onChange={(e) => setHeightRangeInput((prev) => ({ ...prev, min: e.target.value }))}
                                  className="w-28 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                  placeholder="최소"
                                />
                                <span className="text-sm text-text-secondary">cm ~</span>
                                <input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={heightRangeInput.max}
                                  onChange={(e) => setHeightRangeInput((prev) => ({ ...prev, max: e.target.value }))}
                                  className="w-28 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                  placeholder="최대"
                                />
                                <span className="text-sm text-text-secondary">cm</span>
                                <Button
                                  size="sm"
                                  onClick={applyHeightRange}
                                  className="bg-gray-600 text-white hover:bg-gray-700"
                                  type="button"
                                >
                                  적용
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div ref={colorDropdownRef} className="relative">
                    <Button
                      variant={selectedColors.length > 0 ? "default" : "outline"}
                      size="default"
                      className={`flex items-center gap-2 ${
                        selectedColors.length > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                      }`}
                      onClick={() => setShowColorFilter((prev) => !prev)}
                    >
                      색상
                      {selectedColors.length > 0 && (
                        <span className="rounded bg-primary-foreground/10 px-2 py-0.5 text-xs font-semibold text-primary-foreground md:text-xs">
                          {selectedColors.length}
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 transition-transform ${showColorFilter ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>

                    {showColorFilter && (
                      <div className="absolute right-0 top-full z-20 mt-2 w-[290px] rounded-lg border border-gray-200 bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                          <span className="text-sm font-semibold text-foreground">색상 선택</span>
                          <button
                            onClick={clearSelectedColors}
                            className="text-xs text-text-secondary hover:text-foreground"
                            type="button"
                          >
                            초기화
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 px-4 py-3">
                          {COLOR_OPTIONS.map((color) => {
                            const isSelected = selectedColors.includes(color)
                            const swatchColor = COLOR_SWATCH_MAP[color] || "#E5E7EB"
                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => toggleColorSelection(color)}
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                                }`}
                              >
                                <span
                                  className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-gray-200"
                                  style={{ backgroundColor: swatchColor }}
                                ></span>
                                <span className="truncate">{color}</span>
                                <span className="ml-auto text-xs text-text-secondary">
                                  <input type="checkbox" readOnly checked={isSelected} />
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {isLightingCategory && (
                    <div ref={voltageDropdownRef} className="relative">
                      <Button
                        variant={selectedVoltages.length > 0 ? "default" : "outline"}
                        size="default"
                        className={`flex items-center gap-2 ${
                          selectedVoltages.length > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                        }`}
                        onClick={() => setShowVoltageFilter((prev) => !prev)}
                      >
                        전압
                        {selectedVoltages.length > 0 && (
                          <span className="rounded bg-primary-foreground/10 px-2 py-0.5 text-xs font-semibold text-primary-foreground md:text-xs">
                            {selectedVoltages.length}
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 transition-transform ${showVoltageFilter ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>

                      {showVoltageFilter && (
                        <div className="absolute right-0 top-full z-20 mt-2 w-60 rounded-lg border border-gray-200 bg-white shadow-lg">
                          <div className="flex items-center justify-between border-b px-4 py-3">
                            <span className="text-sm font-semibold text-foreground">전압 선택</span>
                            <button
                              onClick={clearSelectedVoltages}
                              className="text-xs text-text-secondary hover:text-foreground"
                              type="button"
                            >
                              초기화
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 px-4 py-3">
                            {LIGHT_OPTIONS.map((option) => {
                              const isSelected = selectedVoltages.includes(option)
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => toggleVoltageSelection(option)}
                                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                                    isSelected
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                                  }`}
                                >
                                  <span className="font-medium">{option}</span>
                                  <span className="ml-auto text-xs text-text-secondary">
                                    <input type="checkbox" readOnly checked={isSelected} />
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isBedCategory && (
                    <div ref={bedOptionsDropdownRef} className="relative">
                      <Button
                        variant={selectedBedOptions.length > 0 ? "default" : "outline"}
                        size="default"
                        className={`flex items-center gap-2 ${
                          selectedBedOptions.length > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                        }`}
                        onClick={() => setShowBedOptionFilter((prev) => !prev)}
                      >
                        옵션
                        {selectedBedOptions.length > 0 && (
                          <span className="rounded bg-primary-foreground/10 px-2 py-0.5 text-xs font-semibold text-primary-foreground md:text-xs">
                            {selectedBedOptions.length}
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 transition-transform ${showBedOptionFilter ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>

                      {showBedOptionFilter && (
                        <div className="absolute right-0 top-full z-20 mt-2 w-60 rounded-lg border border-gray-200 bg-white shadow-lg">
                          <div className="flex items-center justify-between border-b px-4 py-3">
                            <span className="text-sm font-semibold text-foreground">옵션 선택</span>
                            <button
                              onClick={clearSelectedBedOptions}
                              className="text-xs text-text-secondary hover:text-foreground"
                              type="button"
                            >
                              초기화
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 px-4 py-3">
                            {BED_OPTIONS.map((option) => {
                              const isSelected = selectedBedOptions.includes(option)
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => toggleBedOptionSelection(option)}
                                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                                    isSelected
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                                  }`}
                                >
                                  <span className="font-medium">{option}</span>
                                  <span className="ml-auto text-xs text-text-secondary">
                                    <input type="checkbox" readOnly checked={isSelected} />
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative sort-dropdown">
                    <Button
                      variant="outline"
                      size="default"
                      className="flex items-center gap-2 text-base text-gray-700 hover:bg-gray-50"
                      onClick={toggleSortOptions}
                    >
                      {getSortTypeLabel(sortType)}
                      <svg
                        className={`w-4 h-4 transition-transform ${showSortOptions ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>

                    {showSortOptions && (
                      <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                        <div className="p-2">
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={() => handleSortTypeChange("POPULAR")}
                              className={`flex items-center gap-2 rounded p-2 text-sm hover:bg-sky-100 ${
                                sortType === "POPULAR" ? "bg-sky-50 text-sky-600" : "text-gray-700"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full border-2 ${
                                  sortType === "POPULAR" ? "border-sky-600 bg-sky-600" : "border-gray-300"
                                }`}
                              ></div>
                              리뷰순
                            </button>
                            <button
                              onClick={() => handleSortTypeChange("LATEST")}
                              className={`flex items-center gap-2 rounded p-2 text-sm hover:bg-sky-100 ${
                                sortType === "LATEST" ? "bg-sky-50 text-sky-600" : "text-gray-700"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full border-2 ${
                                  sortType === "LATEST" ? "border-sky-600 bg-sky-600" : "border-gray-300"
                                }`}
                              ></div>
                              최신순
                            </button>
                            <button
                              onClick={() => handleSortTypeChange("PRICE_LOW")}
                              className={`flex items-center gap-2 rounded p-2 text-sm hover:bg-sky-100 ${
                                sortType === "PRICE_LOW" ? "bg-sky-50 text-sky-600" : "text-gray-700"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full border-2 ${
                                  sortType === "PRICE_LOW" ? "border-sky-600 bg-sky-600" : "border-gray-300"
                                }`}
                              ></div>
                              낮은가격순
                            </button>
                            <button
                              onClick={() => handleSortTypeChange("PRICE_HIGH")}
                              className={`flex items-center gap-2 rounded p-2 text-sm hover:bg-sky-100 ${
                                sortType === "PRICE_HIGH" ? "bg-sky-50 text-sky-600" : "text-gray-700"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full border-2 ${
                                  sortType === "PRICE_HIGH" ? "border-sky-600 bg-sky-600" : "border-gray-300"
                                }`}
                              ></div>
                              높은가격순
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(selectedColors.length > 0 ||
                selectedVoltages.length > 0 ||
                selectedBedOptions.length > 0 ||
                selectedWidthRange.min !== undefined ||
                selectedWidthRange.max !== undefined ||
                selectedHeightRange.min !== undefined ||
                selectedHeightRange.max !== undefined) && (
                <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                  <span className="font-medium text-primary">선택한 옵션</span>
                  {selectedColors.map((color) => (
                    <span
                      key={`color-${color}`}
                      className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow"
                    >
                      색상: {color}
                      <button
                        type="button"
                        className="text-xs text-text-secondary hover:text-destructive"
                        onClick={() => toggleColorSelection(color)}
                        aria-label={`${color} 선택 해제`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {selectedVoltages.map((volt) => (
                    <span
                      key={`volt-${volt}`}
                      className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow"
                    >
                      전압: {volt}
                      <button
                        type="button"
                        className="text-xs text-text-secondary hover:text-destructive"
                        onClick={() => toggleVoltageSelection(volt)}
                        aria-label={`${volt} 선택 해제`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {selectedBedOptions.map((option) => (
                    <span
                      key={`bed-${option}`}
                      className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow"
                    >
                      옵션: {option}
                      <button
                        type="button"
                        className="text-xs text-text-secondary hover:text-destructive"
                        onClick={() => toggleBedOptionSelection(option)}
                        aria-label={`${option} 선택 해제`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {(selectedWidthRange.min !== undefined || selectedWidthRange.max !== undefined) && (
                    <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow">
                      가로: {selectedWidthRange.min ?? "-"}cm ~ {selectedWidthRange.max ?? "-"}cm
                      <button
                        type="button"
                        className="text-xs text-text-secondary hover:text-destructive"
                        onClick={() => {
                          setSelectedWidthRange({})
                          setWidthRangeInput({ min: "", max: "" })
                        }}
                        aria-label="가로 선택 해제"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {(selectedHeightRange.min !== undefined || selectedHeightRange.max !== undefined) && (
                    <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow">
                      세로: {selectedHeightRange.min ?? "-"}cm ~ {selectedHeightRange.max ?? "-"}cm
                      <button
                        type="button"
                        className="text-xs text-text-secondary hover:text-destructive"
                        onClick={() => {
                          setSelectedHeightRange({})
                          setHeightRangeInput({ min: "", max: "" })
                        }}
                        aria-label="세로 선택 해제"
                      >
                        ×
                      </button>
                    </span>
                  )}
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