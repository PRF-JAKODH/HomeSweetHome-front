"use client"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { ChevronRight } from "lucide-react"
import { useTopCategories, useCategoriesByParent } from "@/lib/hooks/use-categories"
import { useInfiniteProductPreviews } from "@/lib/hooks/use-products"
import { Category } from "@/types/api/category"
import { ProductSortType } from "@/types/api/product"
import { useSearchParams, useRouter } from "next/navigation" // useRouter 추가


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
  
  // 무한 스크롤을 위한 observer ref
  const observerTarget = useRef<HTMLDivElement>(null)
  
  // URL에서 검색 키워드 가져오기
  const searchKeyword = searchParams.get('keyword') || ''
  
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
      case 'POPULAR': return '인기순'
      case 'LATEST': return '최신순'
      case 'PRICE_LOW': return '낮은가격순'
      case 'PRICE_HIGH': return '높은가격순'
      default: return '최신순'
    }
  }

  // 최상단 카테고리 조회
  const { data: topCategories = [], isLoading: topCategoriesLoading, error: topCategoriesError } = useTopCategories()
  
  // 선택된 카테고리의 하위 카테고리 조회
  const { data: subCategories = [], isLoading: subCategoriesLoading } = useCategoriesByParent(selectedMainCategory || 0)
  
  // 선택된 하위 카테고리의 하위 카테고리 조회 (3레벨)
  const subSubCategoryParentId = selectedSubCategory && subCategories.length > 0 ? selectedSubCategory : 0
  const { data: subSubCategories = [], isLoading: subSubCategoriesLoading } = useCategoriesByParent(subSubCategoryParentId)

  // 상품 조회 (무한 스크롤)
  const currentCategoryId = selectedSubSubCategory || selectedSubCategory || selectedMainCategory
  
  const { 
    products, 
    isLoading: productsLoading, 
    isLoadingMore, 
    hasNext, 
    error: productsError, 
    loadMore 
  } = useInfiniteProductPreviews(currentCategoryId || undefined, sortType, 12, searchKeyword)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showSortOptions && !target.closest('.sort-dropdown')) {
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

  const selectedCategory = topCategories.find(cat => cat.id === selectedMainCategory)
  const selectedSubCategoryData = subCategories.find(cat => cat.id === selectedSubCategory)
  const selectedSubSubCategoryData = subSubCategories.find(cat => cat.id === selectedSubSubCategory)
  
  const categoryPath = [
    selectedCategory?.name,
    selectedSubCategoryData?.name,
    selectedSubSubCategoryData?.name,
  ]
    .filter(Boolean)
    .join(" > ")

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
                {/* 카테고리 경로 표시 */}
                {categoryPath && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <button 
                        onClick={handleAllCategoriesClick}
                        className="hover:text-foreground transition-colors"
                      >
                        전체
                      </button>
                      {categoryPath.split(" > ").map((path, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span>{'>'}</span>
                          <span className="text-foreground">{path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {searchKeyword 
                      ? `"${searchKeyword}" 검색 결과` 
                      : categoryPath ? `${categoryPath} 상품` : '전체'
                    }
                  </h2>
                </div>
                <div className="relative sort-dropdown">
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="text-base flex items-center gap-2"
                    onClick={toggleSortOptions}
                  >
                    {getSortTypeLabel(sortType)}
                    <svg className={`w-4 h-4 transition-transform ${showSortOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  
                  {showSortOptions && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSortTypeChange('POPULAR')}
                            className={`flex items-center gap-2 p-2 rounded text-sm hover:bg-gray-100 ${
                              sortType === 'POPULAR' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              sortType === 'POPULAR' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}></div>
                            인기순
                          </button>
                          <button
                            onClick={() => handleSortTypeChange('LATEST')}
                            className={`flex items-center gap-2 p-2 rounded text-sm hover:bg-gray-100 ${
                              sortType === 'LATEST' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              sortType === 'LATEST' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}></div>
                            최신순
                          </button>
                          <button
                            onClick={() => handleSortTypeChange('PRICE_LOW')}
                            className={`flex items-center gap-2 p-2 rounded text-sm hover:bg-gray-100 ${
                              sortType === 'PRICE_LOW' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              sortType === 'PRICE_LOW' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}></div>
                            낮은가격순
                          </button>
                          <button
                            onClick={() => handleSortTypeChange('PRICE_HIGH')}
                            className={`flex items-center gap-2 p-2 rounded text-sm hover:bg-gray-100 ${
                              sortType === 'PRICE_HIGH' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              sortType === 'PRICE_HIGH' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}></div>
                            높은가격순
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
    </div>
  )
}