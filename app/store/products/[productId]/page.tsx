"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock product data
const productData: Record<string, any> = {
  "1": {
    id: "1",
    images: ["/modern-minimalist-sofa.png", "/sofa-angle-2.jpg", "/sofa-detail.jpg", "/sofa-fabric-close-up.jpg"],
    brand: "모던하우스",
    name: "클래식 3인용 패브릭 소파",
    price: 389000,
    originalPrice: 590000,
    discountRate: 34,
    rating: 4.8,
    reviewCount: 1247,
    isFreeShipping: true,
    deliveryInfo: "오늘출발 (17시 이전 주문시)",
    category: {
      main: "가구",
      sub: "거실가구",
      detail: "소파",
    },
    productType: "options",
    options: [
      { name: "색상-블랙", additionalPrice: 0, stock: 15 },
      { name: "색상-화이트", additionalPrice: 0, stock: 8 },
      { name: "색상-그레이", additionalPrice: 0, stock: 0 },
      { name: "색상-베이지", additionalPrice: 5000, stock: 12 },
      { name: "색상-네이비", additionalPrice: 5000, stock: 20 },
    ],
    seller: {
      id: "seller_modern_house",
      name: "모던하우스",
    },
    description: `편안한 좌석감과 세련된 디자인이 돋보이는 3인용 패브릭 소파입니다.
    
고급 패브릭 소재로 제작되어 부드러운 촉감과 내구성을 동시에 갖추었습니다. 넉넉한 사이즈로 온 가족이 편안하게 앉을 수 있으며, 5가지 컬러 옵션으로 다양한 인테리어 스타일에 매치할 수 있습니다.

• 크기: 가로 210cm x 세로 85cm x 높이 80cm
• 소재: 프리미엄 패브릭, 고밀도 우레탄폼
• 컬러: 그레이, 베이지, 네이비, 브라운, 아이보리
• 무게: 약 45kg
• 원산지: 국내제작

조립이 간편하며, 다리 부분은 원목으로 제작되어 안정감이 뛰어납니다.`,
  },
  f1: {
    id: "f1",
    images: ["/modern-minimalist-sofa.png", "/sofa-angle-2.jpg", "/sofa-detail.jpg"],
    brand: "모던하우스",
    name: "클래식 3인용 패브릭 소파",
    price: 389000,
    originalPrice: 590000,
    discountRate: 34,
    rating: 4.8,
    reviewCount: 1247,
    isFreeShipping: true,
    deliveryInfo: "오늘출발 (17시 이전 주문시)",
    category: {
      main: "가구",
      sub: "거실가구",
      detail: "소파",
    },
    productType: "single",
    stock: 50,
    seller: {
      id: "seller_modern_house",
      name: "모던하우스",
    },
    description: "편안한 좌석감과 세련된 디자인이 돋보이는 3인용 패브릭 소파입니다.",
  },
}

// Mock reviews
const reviews = [
  {
    id: 1,
    author: "김**",
    rating: 5,
    date: "2025.01.10",
    content: "색상도 예쁘고 앉았을 때 푹신해서 너무 좋아요. 가성비 최고입니다!",
    images: ["/sofa-review-1.jpg"],
  },
  {
    id: 2,
    author: "이**",
    rating: 5,
    date: "2025.01.08",
    content: "배송도 빠르고 조립도 쉬웠어요. 거실 분위기가 확 바뀌었습니다.",
    images: [],
  },
  {
    id: 3,
    author: "박**",
    rating: 4,
    date: "2025.01.05",
    content: "전체적으로 만족스럽습니다. 다만 생각보다 크기가 커서 공간 확인 필수!",
    images: ["/sofa-review-2.jpg"],
  },
]

// Related products
const relatedProducts = [
  {
    id: "2",
    image: "/wooden-dining-table.png",
    brand: "우드스토리",
    name: "원목 식탁 4인용",
    price: 298000,
    discountRate: 34,
  },
  {
    id: "3",
    image: "/modern-pendant-lamp.jpg",
    brand: "라이팅플러스",
    name: "북유럽 펜던트 조명",
    price: 89000,
    discountRate: 31,
  },
  {
    id: "4",
    image: "/storage-cabinet-white.jpg",
    brand: "심플라이프",
    name: "모던 수납장 화이트 3단",
    price: 159000,
    discountRate: 28,
  },
  {
    id: "5",
    image: "/cozy-throw-blanket.jpg",
    brand: "코지홈",
    name: "프리미엄 극세사 블랭킷",
    price: 29900,
    discountRate: 40,
  },
]

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const router = useRouter()
  const product = productData[params.productId] || productData["1"]
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [currentPrice, setCurrentPrice] = useState(product.price)
  const [currentStock, setCurrentStock] = useState(product.productType === "single" ? product.stock : 0)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewContent, setReviewContent] = useState("")
  const [reviewImages, setReviewImages] = useState<string[]>([])
  const [userReviews, setUserReviews] = useState(reviews)

  useEffect(() => {
    if (product.productType === "options" && selectedOption) {
      const option = product.options.find((opt: any) => opt.name === selectedOption)
      if (option) {
        setCurrentPrice(product.price + option.additionalPrice)
        setCurrentStock(option.stock)
      }
    } else if (product.productType === "single") {
      setCurrentPrice(product.price)
      setCurrentStock(product.stock)
    }
  }, [selectedOption, product])

  const handleAddToCart = () => {
    if (product.productType === "options" && !selectedOption) {
      alert("옵션을 선택해주세요.")
      return
    }

    if (currentStock === 0) {
      alert("품절된 상품입니다.")
      return
    }

    const cartItem = {
      id: `${product.id}-${selectedOption || "single"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      price: currentPrice,
      quantity: quantity,
      selected: true,
      option: product.productType === "options" ? selectedOption : null,
    }

    const storedCart = localStorage.getItem("ohouse_cart")
    const cart = storedCart ? JSON.parse(storedCart) : []
    cart.push(cartItem)
    localStorage.setItem("ohouse_cart", JSON.stringify(cart))

    window.dispatchEvent(new Event("cartUpdated"))

    alert("장바구니에 상품이 담겼습니다.")
  }

  const handleBuyNow = () => {
    if (product.productType === "options" && !selectedOption) {
      alert("옵션을 선택해주세요.")
      return
    }

    if (currentStock === 0) {
      alert("품절된 상품입니다.")
      return
    }

    const checkoutItem = {
      id: `${product.id}-${selectedOption || "single"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      price: currentPrice,
      quantity: quantity,
      selected: true,
      option: product.productType === "options" ? selectedOption : null,
    }

    localStorage.setItem("ohouse_checkout_items", JSON.stringify([checkoutItem]))
    router.push("/checkout")
  }

  const handleChatWithSeller = () => {
    const user = localStorage.getItem("ohouse_user")
    if (!user) {
      alert("로그인이 필요한 서비스입니다.")
      router.push("/login")
      return
    }

    router.push(`/community/messages/${product.seller.id}`)
  }

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          if (newImages.length === files.length) {
            setReviewImages([...reviewImages, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      alert("별점을 선택해주세요.")
      return
    }
    if (!reviewContent.trim()) {
      alert("리뷰 내용을 입력해주세요.")
      return
    }

    const newReview = {
      id: Date.now(),
      author: "나",
      rating: reviewRating,
      date: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").slice(0, -1),
      content: reviewContent,
      images: reviewImages,
    }

    setUserReviews([newReview, ...userReviews])
    setShowReviewForm(false)
    setReviewRating(0)
    setReviewContent("")
    setReviewImages([])
    alert("리뷰가 등록되었습니다.")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1256px] px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로가기
        </button>

        {/* Category Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
          <span className="hover:text-foreground cursor-pointer">홈</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-foreground cursor-pointer">{product.category.main}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-foreground cursor-pointer">{product.category.sub}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{product.category.detail}</span>
        </div>

        {/* Product Main Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-background-section">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Brand */}
            <div className="mb-2 text-sm font-medium text-text-secondary">{product.brand}</div>

            {/* Product Name */}
            <h1 className="mb-4 text-2xl font-bold text-foreground leading-relaxed">{product.name}</h1>

            {/* Rating & Reviews */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-warning text-lg">★</span>
                <span className="font-bold text-foreground">{product.rating}</span>
              </div>
              <span className="text-sm text-text-secondary">리뷰 {product.reviewCount.toLocaleString()}개</span>
            </div>

            {/* Price */}
            <div className="mb-6 border-y border-divider py-6">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl font-bold text-secondary">{product.discountRate}%</span>
                <span className="text-3xl font-bold text-foreground">{currentPrice.toLocaleString()}원</span>
              </div>
              <div className="text-base text-text-secondary line-through">
                {product.originalPrice.toLocaleString()}원
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mb-6">
              <div className="mb-2 text-sm font-medium text-foreground">배송</div>
              <div className="flex items-center gap-2 text-sm">
                {product.isFreeShipping && (
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">무료배송</span>
                )}
                <span className="text-text-secondary">{product.deliveryInfo}</span>
              </div>
            </div>

            {/* Option Selection */}
            {product.productType === "options" && (
              <div className="mb-6">
                <div className="mb-3 text-sm font-medium text-foreground">옵션 선택</div>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="옵션을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.options.map((option: any) => (
                      <SelectItem key={option.name} value={option.name} disabled={option.stock === 0}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{option.name}</span>
                          <div className="flex items-center gap-2">
                            {option.additionalPrice > 0 && (
                              <span className="text-xs text-text-secondary">
                                (+{option.additionalPrice.toLocaleString()}원)
                              </span>
                            )}
                            {option.stock === 0 ? (
                              <span className="text-xs text-red-500 font-medium">품절</span>
                            ) : option.stock < 5 ? (
                              <span className="text-xs text-orange-500 font-medium">재고 {option.stock}개</span>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">재고 {option.stock}개</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedOption && (
                  <div className="mt-3 rounded-lg bg-background-section p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{selectedOption}</span>
                      <span
                        className={`font-medium ${
                          currentStock === 0 ? "text-red-500" : currentStock < 5 ? "text-orange-500" : "text-green-600"
                        }`}
                      >
                        {currentStock === 0 ? "품절" : `재고 ${currentStock}개`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {product.productType === "single" && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-medium">재고:</span>
                  <span
                    className={`font-medium ${
                      currentStock === 0 ? "text-red-500" : currentStock < 10 ? "text-orange-500" : "text-green-600"
                    }`}
                  >
                    {currentStock === 0 ? "품절" : `${currentStock}개`}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <div className="mb-3 text-sm font-medium text-foreground">수량</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-divider text-foreground hover:bg-background-section"
                  disabled={currentStock === 0}
                >
                  -
                </button>
                <span className="w-12 text-center font-medium text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-divider text-foreground hover:bg-background-section"
                  disabled={currentStock === 0}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-6 rounded-lg bg-background-section p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">총 상품금액</span>
                <span className="text-2xl font-bold text-foreground">
                  {(currentPrice * quantity).toLocaleString()}원
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-primary text-primary hover:bg-primary/10 bg-transparent"
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                >
                  장바구니
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary-dark text-white"
                  onClick={handleBuyNow}
                  disabled={currentStock === 0}
                >
                  {currentStock === 0 ? "품절" : "바로구매"}
                </Button>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2 bg-transparent"
                onClick={handleChatWithSeller}
              >
                <MessageCircle className="h-5 w-5" />
                판매자와 1:1 채팅하기
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">상품 상세</h2>
          <Card className="p-8">
            <div className="whitespace-pre-line text-sm text-foreground leading-relaxed">{product.description}</div>
          </Card>
        </section>

        {/* Reviews */}
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              리뷰 <span className="text-primary">({product.reviewCount.toLocaleString()})</span>
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? "취소" : "리뷰 작성하기"}
            </Button>
          </div>

          {showReviewForm && (
            <Card className="mb-6 p-6">
              <h3 className="mb-4 text-lg font-bold text-foreground">리뷰 작성</h3>

              {/* Star Rating */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-foreground">별점</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="text-3xl transition-colors"
                    >
                      <span className={star <= (hoveredRating || reviewRating) ? "text-warning" : "text-divider"}>
                        ★
                      </span>
                    </button>
                  ))}
                  {reviewRating > 0 && <span className="ml-2 text-sm text-text-secondary">{reviewRating}점</span>}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-foreground">리뷰 내용</label>
                <Textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="상품에 대한 솔직한 리뷰를 작성해주세요."
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">사진 첨부 (선택)</label>
                <div className="flex flex-wrap gap-3">
                  {reviewImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`리뷰 이미지 ${index + 1}`}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== index))}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-white hover:bg-foreground/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {reviewImages.length < 5 && (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-divider bg-background-section hover:bg-background-section/80">
                      <svg
                        className="mb-1 h-6 w-6 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-text-secondary">{reviewImages.length}/5</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReviewImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false)
                    setReviewRating(0)
                    setReviewContent("")
                    setReviewImages([])
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleSubmitReview} className="bg-primary hover:bg-primary-dark text-white">
                  리뷰 등록
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {userReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{review.author}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < review.rating ? "text-warning" : "text-divider"}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary">{review.date}</span>
                </div>
                <p className="mb-3 text-sm text-foreground leading-relaxed">{review.content}</p>
                {review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`리뷰 이미지 ${index + 1}`}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="outline">리뷰 더보기</Button>
          </div>
        </section>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">함께 보면 좋은 상품</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {relatedProducts.map((relatedProduct) => (
              <a
                key={relatedProduct.id}
                href={`/store/products/${relatedProduct.id}`}
                className="group block overflow-hidden rounded-lg bg-background transition-all hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-background-section">
                  <img
                    src={relatedProduct.image || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <div className="mb-1 text-xs text-text-secondary">{relatedProduct.brand}</div>
                  <h3 className="mb-2 line-clamp-2 text-sm font-medium text-foreground">{relatedProduct.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-secondary">{relatedProduct.discountRate}%</span>
                    <span className="text-sm font-bold text-foreground">{relatedProduct.price.toLocaleString()}원</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
