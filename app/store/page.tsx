"use client"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronRight } from "lucide-react"

const categoryData = {
  furniture: {
    name: "가구",
    image: "/furniture-sofa.jpg",
    subCategories: {
      bedroom: {
        name: "침실가구",
        details: ["침대", "매트리스", "옷장", "화장대", "협탁"],
      },
      living: {
        name: "거실가구",
        details: ["소파", "거실장", "TV장", "테이블", "선반"],
      },
      dining: {
        name: "주방/식탁가구",
        details: ["식탁", "식탁의자", "주방수납", "홈바", "아일랜드"],
      },
      study: {
        name: "서재/사무가구",
        details: ["책상", "의자", "책장", "서랍장", "파티션"],
      },
    },
  },
  fabric: {
    name: "패브릭",
    image: "/fabric-cushions.jpg",
    subCategories: {
      bedding: {
        name: "침구",
        details: ["이불", "베개", "침대커버", "요", "패드"],
      },
      curtain: {
        name: "커튼/블라인드",
        details: ["암막커튼", "쉬어커튼", "블라인드", "롤스크린", "커튼봉"],
      },
      cushion: {
        name: "쿠션/방석",
        details: ["쿠션", "방석", "쿠션커버", "바디필로우", "목쿠션"],
      },
      carpet: {
        name: "러그/카펫",
        details: ["거실러그", "침실러그", "주방매트", "현관매트", "욕실매트"],
      },
    },
  },
  lighting: {
    name: "조명",
    image: "/table-lamp.jpg",
    subCategories: {
      ceiling: {
        name: "천장조명",
        details: ["직부등", "펜던트", "샹들리에", "레일조명", "매입등"],
      },
      stand: {
        name: "스탠드",
        details: ["테이블스탠드", "플로어스탠드", "책상스탠드", "무드등", "수유등"],
      },
      wall: {
        name: "벽등",
        details: ["벽등", "브라켓", "간접조명", "센서등", "비상등"],
      },
      outdoor: {
        name: "야외조명",
        details: ["정원등", "현관등", "벽부등", "가로등", "태양광등"],
      },
    },
  },
  storage: {
    name: "수납·정리",
    image: "/storage-drawer.jpg",
    subCategories: {
      closet: {
        name: "옷장수납",
        details: ["옷걸이", "수납박스", "서랍정리함", "옷커버", "압축팩"],
      },
      kitchen: {
        name: "주방수납",
        details: ["식기정리", "냉장고정리", "싱크대정리", "양념통", "밀폐용기"],
      },
      bathroom: {
        name: "욕실수납",
        details: ["선반", "바구니", "수납장", "걸이", "디스펜서"],
      },
      multi: {
        name: "다용도수납",
        details: ["수납박스", "바구니", "서랍장", "선반", "행거"],
      },
    },
  },
  deco: {
    name: "데코·식물",
    image: "/plant-pot.jpg",
    subCategories: {
      plant: {
        name: "식물",
        details: ["공기정화식물", "다육식물", "허브", "화분", "화분받침"],
      },
      frame: {
        name: "액자/포스터",
        details: ["액자", "포스터", "사진액자", "캔버스", "벽걸이"],
      },
      clock: {
        name: "시계",
        details: ["벽시계", "탁상시계", "스탠드시계", "알람시계", "무소음시계"],
      },
      candle: {
        name: "캔들/디퓨저",
        details: ["캔들", "디퓨저", "방향제", "인센스", "캔들워머"],
      },
    },
  },
}

const productsByCategory: Record<string, any[]> = {
  furniture: [
    {
      id: "f1",
      image: "/modern-minimalist-sofa.png",
      brand: "모던하우스",
      name: "클래식 3인용 패브릭 소파",
      price: 389000,
      originalPrice: 590000,
      discountRate: 34,
      rating: 4.8,
      reviewCount: 1247,
      isFreeShipping: true,
    },
    {
      id: "f2",
      image: "/wooden-dining-table.png",
      brand: "우드스토리",
      name: "원목 식탁 4인용",
      price: 298000,
      originalPrice: 450000,
      discountRate: 34,
      rating: 4.9,
      reviewCount: 892,
      isFreeShipping: true,
    },
    {
      id: "f3",
      image: "/storage-cabinet-white.jpg",
      brand: "심플라이프",
      name: "모던 수납장 화이트 3단",
      price: 159000,
      originalPrice: 220000,
      discountRate: 28,
      rating: 4.6,
      reviewCount: 521,
      isFreeShipping: true,
    },
    {
      id: "f4",
      image: "/modern-desk-chair.jpg",
      brand: "에르고체어",
      name: "인체공학 사무용 의자",
      price: 189000,
      originalPrice: 280000,
      discountRate: 33,
      rating: 4.7,
      reviewCount: 634,
      isFreeShipping: true,
    },
  ],
  fabric: [
    {
      id: "fb1",
      image: "/cozy-throw-blanket.jpg",
      brand: "코지홈",
      name: "프리미엄 극세사 블랭킷",
      price: 29900,
      originalPrice: 49900,
      discountRate: 40,
      rating: 4.8,
      reviewCount: 2134,
      isFreeShipping: true,
    },
    {
      id: "fb2",
      image: "/decorative-cushions.jpg",
      brand: "패브릭플러스",
      name: "북유럽 쿠션 커버 세트",
      price: 19900,
      originalPrice: 35000,
      discountRate: 43,
      rating: 4.6,
      reviewCount: 892,
      isFreeShipping: false,
    },
    {
      id: "fb3",
      image: "/curtain-set.jpg",
      brand: "윈도우스타일",
      name: "암막 커튼 세트",
      price: 45000,
      originalPrice: 78000,
      discountRate: 42,
      rating: 4.7,
      reviewCount: 456,
      isFreeShipping: true,
    },
    {
      id: "fb4",
      image: "/area-rug.jpg",
      brand: "러그앤매트",
      name: "거실용 대형 러그",
      price: 89000,
      originalPrice: 150000,
      discountRate: 41,
      rating: 4.8,
      reviewCount: 723,
      isFreeShipping: true,
    },
  ],
  lighting: [
    {
      id: "l1",
      image: "/modern-pendant-lamp.jpg",
      brand: "라이팅플러스",
      name: "북유럽 펜던트 조명",
      price: 89000,
      originalPrice: 129000,
      discountRate: 31,
      rating: 4.7,
      reviewCount: 634,
      isFreeShipping: false,
    },
    {
      id: "l2",
      image: "/modern-desk-lamp.png",
      brand: "스터디룸",
      name: "LED 스탠드 조명",
      price: 79000,
      originalPrice: 120000,
      discountRate: 34,
      rating: 4.7,
      reviewCount: 445,
      isFreeShipping: false,
    },
    {
      id: "l3",
      image: "/floor-lamp.jpg",
      brand: "라이팅플러스",
      name: "모던 플로어 스탠드",
      price: 129000,
      originalPrice: 189000,
      discountRate: 32,
      rating: 4.8,
      reviewCount: 567,
      isFreeShipping: true,
    },
    {
      id: "l4",
      image: "/wall-sconce.jpg",
      brand: "월라이트",
      name: "벽등 세트 2개입",
      price: 59000,
      originalPrice: 95000,
      discountRate: 38,
      rating: 4.6,
      reviewCount: 234,
      isFreeShipping: false,
    },
  ],
  storage: [
    {
      id: "s1",
      image: "/kitchen-organizer.png",
      brand: "키친플러스",
      name: "주방 수납 정리함",
      price: 35000,
      originalPrice: 52000,
      discountRate: 33,
      rating: 4.6,
      reviewCount: 312,
      isFreeShipping: false,
    },
    {
      id: "s2",
      image: "/closet-organizer.jpg",
      brand: "스토리지박스",
      name: "옷장 정리 수납함 세트",
      price: 42000,
      originalPrice: 68000,
      discountRate: 38,
      rating: 4.7,
      reviewCount: 891,
      isFreeShipping: true,
    },
    {
      id: "s3",
      image: "/drawer-divider.jpg",
      brand: "오거나이저",
      name: "서랍 칸막이 정리함",
      price: 18900,
      originalPrice: 29900,
      discountRate: 37,
      rating: 4.5,
      reviewCount: 456,
      isFreeShipping: false,
    },
    {
      id: "s4",
      image: "/storage-basket.jpg",
      brand: "바스켓홈",
      name: "라탄 수납 바구니 3종",
      price: 39000,
      originalPrice: 62000,
      discountRate: 37,
      rating: 4.8,
      reviewCount: 678,
      isFreeShipping: true,
    },
  ],
  deco: [
    {
      id: "d1",
      image: "/decorative-plant-pot.jpg",
      brand: "그린가든",
      name: "세라믹 화분 세트",
      price: 45000,
      originalPrice: 68000,
      discountRate: 34,
      rating: 4.9,
      reviewCount: 789,
      isFreeShipping: true,
    },
    {
      id: "d2",
      image: "/wall-art.jpg",
      brand: "아트프레임",
      name: "추상화 액자 3종 세트",
      price: 59000,
      originalPrice: 95000,
      discountRate: 38,
      rating: 4.7,
      reviewCount: 423,
      isFreeShipping: true,
    },
    {
      id: "d3",
      image: "/decorative-vase.jpg",
      brand: "데코플러스",
      name: "모던 세라믹 화병",
      price: 32000,
      originalPrice: 48000,
      discountRate: 33,
      rating: 4.6,
      reviewCount: 234,
      isFreeShipping: false,
    },
    {
      id: "d4",
      image: "/candle-holder.jpg",
      brand: "캔들라이트",
      name: "아로마 캔들 홀더 세트",
      price: 28000,
      originalPrice: 45000,
      discountRate: 38,
      rating: 4.8,
      reviewCount: 567,
      isFreeShipping: false,
    },
  ],
}

export default function StorePage() {
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("furniture")
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("")
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<string>("")

  const mainCategories = Object.keys(categoryData)
  const currentCategory = categoryData[selectedMainCategory as keyof typeof categoryData]
  const subCategories = currentCategory?.subCategories || {}
  const detailCategories = selectedSubCategory
    ? subCategories[selectedSubCategory as keyof typeof subCategories]?.details || []
    : []

  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedMainCategory(categoryId)
    setSelectedSubCategory("")
    setSelectedDetailCategory("")
  }

  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId)
    setSelectedDetailCategory("")
  }

  const categoryPath = [
    currentCategory?.name,
    selectedSubCategory && subCategories[selectedSubCategory as keyof typeof subCategories]?.name,
    selectedDetailCategory,
  ]
    .filter(Boolean)
    .join(" > ")

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Category Section */}
        <section className="border-b border-divider bg-background py-8">
          <div className="mx-auto max-w-[1256px] px-4">
            <h2 className="mb-6 text-2xl font-bold text-foreground">카테고리</h2>

            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {mainCategories.map((categoryId) => {
                  const category = categoryData[categoryId as keyof typeof categoryData]
                  return (
                    <button
                      key={categoryId}
                      onClick={() => handleMainCategoryChange(categoryId)}
                      className={`rounded-lg border-2 px-6 py-3 text-base font-semibold transition-all ${
                        selectedMainCategory === categoryId
                          ? "border-primary bg-primary text-white shadow-md"
                          : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {category.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {Object.keys(subCategories).length > 0 && (
              <div className="mb-4 ml-4">
                <div className="flex flex-wrap gap-2">
                  <ChevronRight className="mt-1.5 h-5 w-5 text-muted-foreground" />
                  {Object.entries(subCategories).map(([subId, subCategory]) => (
                    <button
                      key={subId}
                      onClick={() => handleSubCategoryChange(subId)}
                      className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
                        selectedSubCategory === subId
                          ? "bg-primary text-white shadow-sm"
                          : "bg-background-section text-foreground hover:bg-primary/10"
                      }`}
                    >
                      {subCategory.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {detailCategories.length > 0 && (
              <div className="ml-8">
                <div className="flex flex-wrap gap-2">
                  <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
                  {detailCategories.map((detail) => (
                    <button
                      key={detail}
                      onClick={() => setSelectedDetailCategory(detail)}
                      className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                        selectedDetailCategory === detail
                          ? "bg-primary text-white"
                          : "bg-background-section text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                      }`}
                    >
                      {detail}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12">
          <div className="mx-auto max-w-[1256px] px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">{categoryPath} 상품</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-sm">
                  인기순
                </Button>
                <Button variant="ghost" size="sm" className="text-sm">
                  최신순
                </Button>
                <Button variant="ghost" size="sm" className="text-sm">
                  낮은가격순
                </Button>
                <Button variant="ghost" size="sm" className="text-sm">
                  높은가격순
                </Button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {(productsByCategory[selectedMainCategory] || []).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Load More */}
            <div className="mt-12 flex justify-center">
              <Button variant="outline" size="lg" className="min-w-[200px] bg-transparent">
                더보기
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
