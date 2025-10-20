import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { Heart, MessageCircle } from "lucide-react"

// Mock data for popular products
const popularProducts = [
  {
    id: "1",
    image: "/modern-minimalist-sofa.png",
    brand: "모던하우스",
    name: "클래식 3인용 패브릭 소파 / 5가지 컬러",
    price: 389000,
    originalPrice: 590000,
    discountRate: 34,
    rating: 4.8,
    reviewCount: 1247,
    isFreeShipping: true,
  },
  {
    id: "2",
    image: "/wooden-dining-table.png",
    brand: "우드스토리",
    name: "원목 식탁 4인용 / 북유럽 스타일",
    price: 298000,
    originalPrice: 450000,
    discountRate: 34,
    rating: 4.9,
    reviewCount: 892,
    isFreeShipping: true,
  },
  {
    id: "3",
    image: "/modern-pendant-lamp.jpg",
    brand: "라이팅플러스",
    name: "북유럽 펜던트 조명 / LED 전구 포함",
    price: 89000,
    originalPrice: 129000,
    discountRate: 31,
    rating: 4.7,
    reviewCount: 634,
    isFreeShipping: false,
  },
  {
    id: "4",
    image: "/storage-cabinet-white.jpg",
    brand: "심플라이프",
    name: "모던 수납장 / 화이트 3단 서랍장",
    price: 159000,
    originalPrice: 220000,
    discountRate: 28,
    rating: 4.6,
    reviewCount: 521,
    isFreeShipping: true,
  },
  {
    id: "5",
    image: "/cozy-throw-blanket.jpg",
    brand: "코지홈",
    name: "프리미엄 극세사 블랭킷 / 대형 사이즈",
    price: 29900,
    originalPrice: 49900,
    discountRate: 40,
    rating: 4.8,
    reviewCount: 2134,
    isFreeShipping: true,
  },
  {
    id: "6",
    image: "/modern-desk-lamp.png",
    brand: "스터디룸",
    name: "LED 스탠드 조명 / 무선충전 기능",
    price: 79000,
    originalPrice: 120000,
    discountRate: 34,
    rating: 4.7,
    reviewCount: 445,
    isFreeShipping: false,
  },
  {
    id: "7",
    image: "/decorative-plant-pot.jpg",
    brand: "그린가든",
    name: "세라믹 화분 세트 / 3종 구성",
    price: 45000,
    originalPrice: 68000,
    discountRate: 34,
    rating: 4.9,
    reviewCount: 789,
    isFreeShipping: true,
  },
  {
    id: "8",
    image: "/kitchen-organizer.png",
    brand: "키친플러스",
    name: "주방 수납 정리함 / 스테인리스",
    price: 35000,
    originalPrice: 52000,
    discountRate: 33,
    rating: 4.6,
    reviewCount: 312,
    isFreeShipping: false,
  },
]

// Mock data for popular shopping talk posts
const popularShoppingTalk = [
  {
    id: "1",
    category: "추천",
    title: "10만원대 가성비 소파 추천해주세요!",
    author: "인테리어초보",
    comments: 45,
    likes: 128,
    time: "2시간 전",
  },
  {
    id: "2",
    category: "질문",
    title: "원목 식탁 관리 어떻게 하시나요?",
    author: "우드러버",
    comments: 32,
    likes: 89,
    time: "5시간 전",
  },
  {
    id: "3",
    category: "정보",
    title: "이번주 홈스윗홈 특가 정보 공유합니다",
    author: "알뜰쇼퍼",
    comments: 156,
    likes: 423,
    time: "1일 전",
  },
  {
    id: "4",
    category: "후기",
    title: "북유럽 스타일 조명 구매 후기",
    author: "조명덕후",
    comments: 28,
    likes: 67,
    time: "1일 전",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Banner */}
        <section className="bg-background-section">
          <div className="mx-auto max-w-[1256px] px-4 py-12 md:py-16">
            <div
              className="relative overflow-hidden rounded-lg p-8 md:p-12 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%A9%E1%84%82%E1%85%B3%E1%86%AF%E1%84%8B%E1%85%B4%E1%84%8C%E1%85%B5%E1%86%B8%E1%84%92%E1%85%A9%E1%86%B7%E1%84%92%E1%85%AA%E1%84%86%E1%85%A7%E1%86%AB-zTE8aWRABDUqMOc9x5WZPexW3IfuwZ.avif)",
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="relative z-10 max-w-xl">
                <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl text-balance">나만의 공간을 특별하게</h1>
                <p className="mb-6 text-base text-white/90 md:text-lg leading-relaxed">
                  1000만이 선택한 No.1 인테리어 필수앱
                  <br />
                  홈스윗<span className="text-primary">홈</span>에서 시작하세요
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Products */}
        <section className="py-12">
          <div className="mx-auto max-w-[1256px] px-4">
            {/* Section Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">오늘의 인기 상품</h2>
                <p className="text-sm text-text-secondary">지금 가장 많은 사람들이 선택한 상품</p>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary-dark">
                전체보기 →
              </Button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* Popular Shopping Talk */}
        <section className="py-12">
          <div className="mx-auto max-w-[1256px] px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">인기 쇼핑수다</h2>
                <p className="text-sm text-text-secondary">다양한 인테리어 정보를 나눠보세요</p>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary-dark" asChild>
                <a href="/community/shopping-talk">전체보기 →</a>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {popularShoppingTalk.map((post) => (
                <a
                  key={post.id}
                  href={`/community/shopping-talk/${post.id}`}
                  className="group block rounded-lg border border-divider bg-background p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {post.category}
                    </span>
                    <span className="text-xs text-text-secondary">{post.time}</span>
                  </div>
                  <h3 className="mb-2 text-base font-medium text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{post.author}</span>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-divider bg-background py-12">
        <div className="mx-auto max-w-[1256px] px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 text-xl font-bold">
                홈스윗<span className="text-primary">홈</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                1000만이 선택한
                <br />
                No.1 인테리어 필수앱
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-foreground">고객센터</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="/help" className="hover:text-foreground">
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-foreground">
                    1:1 문의
                  </a>
                </li>
                <li>
                  <a href="/notice" className="hover:text-foreground">
                    공지사항
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-foreground">회사소개</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="/about" className="hover:text-foreground">
                    회사소개
                  </a>
                </li>
                <li>
                  <a href="/recruit" className="hover:text-foreground">
                    채용정보
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-foreground">
                    이용약관
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-foreground">SNS</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-divider pt-8 text-xs text-text-secondary">
            © 2025 홈스윗홈. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
