"use client"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { useTopCategories, useCategoriesByParent } from "@/lib/hooks/use-categories"
import { useInfiniteProductPreviews } from "@/lib/hooks/use-products"
import { Category } from "@/types/api/category"
import { ProductSortType } from "@/types/api/product"


export default function StorePage() {
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null)
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [isClient, setIsClient] = useState(false)
  const [sortType, setSortType] = useState<ProductSortType>('LATEST')

  // 최상단 카테고리 조회
  const { data: topCategories = [], isLoading: topCategoriesLoading, error: topCategoriesError } = useTopCategories()
  
  // 선택된 카테고리의 하위 카테고리 조회
  const { data: subCategories = [], isLoading: subCategoriesLoading } = useCategoriesByParent(selectedMainCategory!)
  
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
  } = useInfiniteProductPreviews(currentCategoryId || undefined, sortType, 12)

  useEffect(() => {
    setIsClient(true)
  }, [])


  const handleMainCategoryChange = (categoryId: number) => {
    setSelectedMainCategory(categoryId)
    setSelectedSubCategory(null)
    setSelectedSubSubCategory(null)
  }

  const handleSubCategoryChange = (subCategoryId: number) => {
    setSelectedSubCategory(subCategoryId)
    setSelectedSubSubCategory(null)
  }

  const handleSubSubCategoryChange = (subSubCategoryId: number) => {
    setSelectedSubSubCategory(subSubCategoryId)
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-8">
            {/* 왼쪽 사이드바 - 카테고리 */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">카테고리</h3>
                
                {/* 카테고리 경로 표시 */}
                {categoryPath && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <button 
                        onClick={() => setSelectedMainCategory(null)}
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
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between font-medium text-base ${
                          selectedMainCategory === category.id
                            ? "bg-primary text-white"
                            : "bg-background text-foreground hover:bg-background-section"
                        }`}
                      >
                        <span>{category.name}</span>
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform ${
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
                                    className={`w-full text-left px-3 py-2 rounded-md text-base transition-all flex items-center justify-between font-medium ${
                                      selectedSubCategory === subCategory.id
                                        ? "bg-primary/20 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background-section"
                                    }`}
                                  >
                                    <span>{subCategory.name}</span>
                                    <ChevronRight 
                                      className={`h-3 w-3 transition-transform ${
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
                                            className={`w-full text-left px-2 py-1 rounded text-sm transition-all font-medium ${
                                              selectedSubCategory === subSubCategory.id
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
            <div className="lg:col-span-3">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {categoryPath ? `${categoryPath} 상품` : '전체 상품'}
                </h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={sortType === 'POPULAR' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="text-sm"
                    onClick={() => setSortType('POPULAR')}
                  >
                    인기순
                  </Button>
                  <Button 
                    variant={sortType === 'LATEST' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="text-sm"
                    onClick={() => setSortType('LATEST')}
                  >
                    최신순
                  </Button>
                  <Button 
                    variant={sortType === 'PRICE_ASC' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="text-sm"
                    onClick={() => setSortType('PRICE_ASC')}
                  >
                    낮은가격순
                  </Button>
                  <Button 
                    variant={sortType === 'PRICE_DESC' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="text-sm"
                    onClick={() => setSortType('PRICE_DESC')}
                  >
                    높은가격순
                  </Button>
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
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">해당 카테고리에 상품이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    {products.map((product) => {
                      // 할인가 계산
                      const finalPrice = product.discountRate > 0 
                        ? Math.round(product.basePrice * (1 - product.discountRate / 100))
                        : product.basePrice
                      
                      return (
                        <ProductCard
                          key={product.id}
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

              {/* 더보기 버튼 */}
              {products.length > 0 && hasNext && (
                <div className="mt-8 text-center">
                  <Button 
                    onClick={loadMore} 
                    disabled={isLoadingMore}
                    variant="outline"
                    className="px-8"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        로딩 중...
                      </>
                    ) : (
                      '더보기'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
