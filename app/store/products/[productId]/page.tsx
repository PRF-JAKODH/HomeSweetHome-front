"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProduct, getProductStock, getProductPreviews } from "@/lib/api/products"
import { getCategoryHierarchy } from "@/lib/api/categories"
import { getProductReviews, getProductReviewStatistics, createProductReview } from "@/lib/api/reviews"
import { useAddToCart } from "@/lib/hooks/use-cart"
import { Product, SkuStockResponse, ProductPreviewResponse } from "@/types/api/product"
import { Category } from "@/types/api/category"
import { ProductReviewResponse, ProductReviewStatisticsResponse } from "@/types/api/review"
import { ProductCard } from "@/components/product-card"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"



import apiClient from "@/lib/api"

// UI에서 사용하는 확장된 상품 타입
interface ExtendedProduct extends Product {
  productType?: "single" | "options"
  stock?: number
  deliveryInfo?: string
  // API 응답 필드들
  imageUrl?: string
  basePrice?: number
  shippingPrice?: number
  discountedPrice?: number // 서버에서 계산된 할인된 가격
  detailImageUrls?: string[] // 상세 이미지 URL 배열
  category?: {
    main: string
    sub: string
    detail: string
  }
  seller?: { // nullable
    id: string
    name: string
  }
  options?: Array<{
    name: string
    additionalPrice: number
    stock: number
  }>
}


export default function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<ExtendedProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSkus, setSelectedOptions] = useState<Record<string, string>>({})
  const [currentPrice, setCurrentPrice] = useState(0)
  const [currentStock, setCurrentStock] = useState(0)
  const [stockData, setStockData] = useState<SkuStockResponse[]>([])
  const [selectedSku, setSelectedSku] = useState<SkuStockResponse | null>(null)
  const [categoryHierarchy, setCategoryHierarchy] = useState<Category[]>([])

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewContent, setReviewContent] = useState("")
  const [reviewImages, setReviewImages] = useState<string[]>([])
  const [userReviews, setUserReviews] = useState<ProductReviewResponse[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewsTotalCount, setReviewsTotalCount] = useState(0)
  const [reviewStatistics, setReviewStatistics] = useState<ProductReviewStatisticsResponse | null>(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [showCartSuccess, setShowCartSuccess] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState<ProductPreviewResponse[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(false)

  // 장바구니 API 훅
  const addToCartMutation = useAddToCart()

  // 옵션 그룹 추출 함수
  const getOptionGroups = () => {
    if (!stockData || stockData.length === 0) return {}
    
    const groups: Record<string, string[]> = {}
    stockData.forEach(sku => {
      sku.options.forEach(option => {
        // null 옵션은 제외
        if (option.groupName && option.valueName) {
          if (!groups[option.groupName]) {
            groups[option.groupName] = []
          }
          if (!groups[option.groupName].includes(option.valueName)) {
            groups[option.groupName].push(option.valueName)
          }
        }
      })
    })
    return groups
  }

  // 최상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // 선택된 옵션으로 SKU 찾기
  const findSelectedSku = () => {
    if (!stockData || stockData.length === 0) return null
    
    return stockData.find(sku => {
      return sku.options.every(option => {
        // null 옵션은 항상 매치
        if (!option.groupName || !option.valueName) {
          return true
        }
        return selectedSkus[option.groupName] === option.valueName
      })
    }) || null
  }

  // API에서 상품 데이터 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 상품 정보와 재고 정보를 먼저 가져오기
        const [productResponse, stockResponse] = await Promise.all([
          getProduct(resolvedParams.productId),
          getProductStock(resolvedParams.productId).catch(() => ({ data: [] })) // 재고 API 실패 시 빈 배열로 fallback
        ])
        
        // API 응답 구조에 따라 데이터 추출
        const productData = (productResponse.data || productResponse) as any
        const stockData = Array.isArray(stockResponse) ? stockResponse : (stockResponse.data || [])
        
        // 카테고리 계층 구조 가져오기
        const categoryResponse = await getCategoryHierarchy(productData.categoryId || 1).catch(() => [])
        
        // API 응답 구조 확인을 위한 로깅
        console.log('Product data:', productData)
        console.log('Stock data:', stockData)
        console.log('detailImageUrls:', productData.detailImageUrls)
        console.log('images:', productData.images)
        
        // API 응답을 UI에서 사용할 수 있는 형태로 변환
        const transformedProduct: ExtendedProduct = {
          ...productData,
          // 이미지 배열 처리 - API에서 imageUrl과 detailImageUrls을 받으면 images 배열로 변환
          images: (() => {
            const baseImages = productData.images || (productData.imageUrl ? [productData.imageUrl] : [])
            const detailImages = productData.detailImageUrls || []
            const finalImages = [...baseImages, ...detailImages]
            console.log('Final images array:', finalImages)
            return finalImages
          })(),
          thumbnail: productData.thumbnail || productData.imageUrl || '',
          // 기존 UI에서 사용하는 추가 필드들
          productType: stockData.length > 1 ? "options" as const : "single" as const,
          stock: productData.stockQuantity || 0,
          deliveryInfo: productData.shippingPrice === 0 ? "무료배송" : `배송비 ${productData.shippingPrice?.toLocaleString()}원`,
          category: categoryResponse.length > 0 ? {
            main: categoryResponse[0]?.name || "카테고리",
            sub: categoryResponse[1]?.name || "서브카테고리",
            detail: categoryResponse[2]?.name || categoryResponse[categoryResponse.length - 1]?.name || "상세카테고리"
          } : undefined,
          seller: productData.sellerId ? {
            id: String(productData.sellerId),
            name: productData.sellerName || "판매자"
          } : undefined,
          options: stockData.map(sku => ({
            name: sku.options
              .filter(opt => opt.groupName && opt.valueName) // null 옵션 제외
              .map(opt => `${opt.groupName}: ${opt.valueName}`)
              .join(', ') || '기본 옵션',
            additionalPrice: sku.priceAdjustment,
            stock: sku.stockQuantity
          }))
        }
        
        setProduct(transformedProduct)
        setStockData(stockData)
        setCategoryHierarchy(categoryResponse)
        // 서버에서 계산된 할인된 가격 사용 (discountedPrice가 없으면 기존 로직 사용)
        const serverDiscountedPrice = productData.discountedPrice
        if (serverDiscountedPrice !== undefined && serverDiscountedPrice !== null) {
          setCurrentPrice(serverDiscountedPrice)
        } else {
          // fallback: 기존 클라이언트 계산 로직
          const originalPrice = productData.basePrice || productData.price || 0
          const discountRate = productData.discountRate || 0
          const discountedPrice = originalPrice * (1 - discountRate / 100)
          setCurrentPrice(discountedPrice)
        }
        
        // 첫 번째 SKU를 기본 선택으로 설정
        if (stockData && stockData.length > 0) {
          setSelectedSku(stockData[0])
          setCurrentStock(stockData[0].stockQuantity || 0)
        } else {
          // 재고 데이터가 없는 경우 기본 상품 재고 사용
          setSelectedSku(null)
          setCurrentStock(productData.stockQuantity || 0)
        }
      } catch (err) {
        console.error('상품 조회 실패:', err)
        setError('상품을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [resolvedParams.productId])

  // 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true)
        const reviewsResponse = await getProductReviews(resolvedParams.productId)
        console.log('리뷰 응답:', reviewsResponse)
        console.log('리뷰 데이터:', reviewsResponse?.contents)
        // 응답 구조에 따라 수정
        const reviews = reviewsResponse?.contents || []
        console.log('최종 리뷰 데이터:', reviews)
        setUserReviews(reviews)
        // totalCount는 통계 API에서 가져오므로 여기서는 설정하지 않음
      } catch (err) {
        console.error('리뷰 조회 실패:', err)
        // 리뷰 조회 실패 시 빈 배열로 초기화
        setUserReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }

    if (resolvedParams.productId) {
      fetchReviews()
    }
  }, [resolvedParams.productId])

  // 리뷰 통계 데이터 가져오기
  useEffect(() => {
    const fetchReviewStatistics = async () => {
      try {
        const statisticsResponse = await getProductReviewStatistics(resolvedParams.productId)
        console.log('리뷰 통계:', statisticsResponse)
        setReviewStatistics(statisticsResponse)
        setReviewsTotalCount(statisticsResponse.totalCount)
      } catch (err) {
        console.error('리뷰 통계 조회 실패:', err)
        setReviewStatistics(null)
      }
    }

    if (resolvedParams.productId) {
      fetchReviewStatistics()
    }
  }, [resolvedParams.productId])

  // 추천 상품 데이터 가져오기
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (!product?.categoryId) return
      
      try {
        setRecommendedLoading(true)
        const response = await getProductPreviews({
          categoryId: Number(product.categoryId),
          limit: 8, // 추천 상품 8개
          sortType: 'LATEST'
        })
        
        // 현재 상품을 제외한 상품들만 필터링
        const filteredProducts = response.contents.filter(p => p.id !== Number(product.id))
        setRecommendedProducts(filteredProducts.slice(0, 6)) // 최대 6개만 표시
      } catch (err) {
        console.error('추천 상품 조회 실패:', err)
        setRecommendedProducts([])
      } finally {
        setRecommendedLoading(false)
      }
    }

    if (product?.categoryId) {
      fetchRecommendedProducts()
    }
  }, [product?.categoryId, product?.id])

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

  useEffect(() => {
    if (product && product.productType === "options") {
      const selectedSkuData = findSelectedSku()
      setSelectedSku(selectedSkuData)
      
      if (selectedSkuData) {
        // 서버에서 제공하는 discountedPrice를 우선 사용, 없으면 클라이언트 계산
        const serverDiscountedPrice = (product as any).discountedPrice
        let basePrice = 0
        
        if (serverDiscountedPrice !== undefined && serverDiscountedPrice !== null) {
          basePrice = serverDiscountedPrice
        } else {
          // fallback: 클라이언트 계산
          const originalPrice = product.basePrice || product.price || 0
          const discountRate = product.discountRate || 0
          basePrice = originalPrice * (1 - discountRate / 100)
        }
        
        const additionalPrice = selectedSkuData.priceAdjustment || 0
        const totalPrice = basePrice + additionalPrice
        
        setCurrentPrice(totalPrice)
        setCurrentStock(selectedSkuData.stockQuantity)
      }
    } else if (product && product.productType === "single") {
      // 서버에서 제공하는 discountedPrice를 우선 사용, 없으면 클라이언트 계산
      const serverDiscountedPrice = (product as any).discountedPrice
      if (serverDiscountedPrice !== undefined && serverDiscountedPrice !== null) {
        setCurrentPrice(serverDiscountedPrice)
      } else {
        // fallback: 클라이언트 계산
        const originalPrice = product.basePrice || product.price || 0
        const discountRate = product.discountRate || 0
        const discountedPrice = originalPrice * (1 - discountRate / 100)
        setCurrentPrice(discountedPrice)
      }
      setCurrentStock(product.stockQuantity || 0)
      setSelectedSku(stockData && stockData.length > 0 ? stockData[0] : null)
    }
  }, [selectedSkus, product, stockData])

  // 수량이 재고를 초과하지 않도록 제한
  useEffect(() => {
    if (selectedSku && quantity > selectedSku.stockQuantity) {
      setQuantity(selectedSku.stockQuantity)
    }
  }, [selectedSku, quantity])

  const handleAddToCart = async () => {
    if (!product) return
    
    if (product.productType === "options" && !selectedSku) {
      alert("옵션을 선택해주세요.")
      return
    }

    if (selectedSku?.stockQuantity === 0) {
      alert("품절된 상품입니다.")
      return
    }

    try {
      // 백엔드 API를 통해 장바구니에 상품 추가
      await addToCartMutation.mutateAsync({
        skuId: selectedSku?.skuId || 0, // SKU ID (옵션이 없는 경우 0 또는 기본값)
        quantity: quantity
      })

      setShowCartSuccess(true)
    } catch (error: any) {
      console.error('장바구니 추가 실패:', error)
      
      // 백엔드에서 보내는 에러 메시지에 따라 적절한 알림 표시
      let errorMessage = "장바구니에 상품을 담는데 실패했습니다. 다시 시도해주세요."
      
      if (error?.response?.data?.message) {
        const backendMessage = error.response.data.message
        
        if (backendMessage.includes('CART_LIMIT_EXCEEDED_ERROR')) {
          errorMessage = "장바구니에 담을 수 있는 최대 수량은 10개입니다."
        } else if (backendMessage.includes('CART_ITEM_TYPE_LIMIT_EXCEEDED_ERROR')) {
          errorMessage = "장바구니에 담을 수 있는 최대 상품 종류는 10개입니다."
        } else {
          errorMessage = backendMessage
        }
      }
      
      alert(errorMessage)
    }
  }

  const handleBuyNow = () => {
    if (!product) return
    
    if (product.productType === "options" && !selectedSku) {
      alert("옵션을 선택해주세요.")
      return
    }

    if (selectedSku?.stockQuantity === 0) {
      alert("품절된 상품입니다.")
      return
    }

    const checkoutItem = {
      id: `${product.id}-${selectedSku?.skuId || "single"}-${Date.now()}`,
      productId: product.id,
      skuId: selectedSku?.skuId,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      price: currentPrice,
      quantity: quantity,
      selected: true,
      option: product.productType === "options" ? selectedSku : null,
    }

    localStorage.setItem("ohouse_checkout_items", JSON.stringify([checkoutItem]))
    router.push("/checkout")
  }
  
const handleChatWithSeller = async () => {

  console.log("🟦 userData:", userData)
  console.log("🟨 accessToken:", userData?.accessToken)

  if (!product) return

  if (!isAuthenticated) {
      toast({
        title: "로그인 필요",
        description: "로그인이 필요한 서비스입니다.",
        variant: "destructive"
      })
      router.push("/login")
      return

  try {

    const response = await apiClient.post("http://localhost:8080/api/chat/rooms/individual", {
      targetId: Number(product.seller?.id)
    })
    console.log(" 채팅방 생성 응답:", response.data)

    //  서버 응답에서 roomId 추출
    const { roomId, alreadyExists } = response.data

    if(alreadyExists) {
      console.log(`이미 존재하는 채팅방 (roomId: ${roomId})`)
    } else {
      console.log(`새 채팅방 생성(roomId: ${roomId})`)
    }

    // 채팅방 페이지로 이동
    router.push(`/community/chat-rooms/${roomId}?username=${product.seller?.name || "판매자"}`)

  } catch (error: any) {
    console.error("❌ 채팅방 생성 실패:", error)
    alert("채팅방을 생성하는데 실패했습니다.")
  }
}



  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0] // 첫 번째 파일만 사용
      const reader = new FileReader()
      reader.onloadend = () => {
        setReviewImages([reader.result as string]) // 기존 이미지를 대체
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      alert("별점을 선택해주세요.")
      return
    }
    if (!reviewContent.trim()) {
      alert("리뷰 내용을 입력해주세요.")
      return
    }

    setSubmittingReview(true)
    try {
      let imageFile: File
      
      if (reviewImages.length > 0) {
        // Base64 이미지를 File 객체로 변환
        imageFile = await base64ToFile(reviewImages[0], 'review-image.jpg')
      } else {
        // 이미지가 없을 때는 빈 파일 생성 (백엔드에서 필수 필드이므로)
        imageFile = new File([], 'empty.jpg', { type: 'image/jpeg' })
      }
      
      const reviewData = {
        rating: reviewRating,
        comment: reviewContent,
        image: imageFile
      }

      const newReview = await createProductReview(resolvedParams.productId, reviewData)
      
      setUserReviews([newReview, ...userReviews])
      setShowReviewForm(false)
      setReviewRating(0)
      setReviewContent("")
      setReviewImages([])
      alert("리뷰가 등록되었습니다.")
    } catch (error: any) {
      console.error('리뷰 등록 실패:', error)
      
      // 409 에러 (이미 리뷰 작성한 경우) 처리
      if (error?.response?.status === 409) {
        alert(error?.response?.data?.message || "이미 해당 상품에 대한 리뷰를 작성했습니다.")
      } else {
        alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.")
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  // Base64 문자열을 File 객체로 변환하는 헬퍼 함수
  const base64ToFile = (base64String: string, filename: string): Promise<File> => {
    return new Promise((resolve) => {
      const arr = base64String.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const file = new File([u8arr], filename, { type: mime })
      resolve(file)
    })
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-[1256px] px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-text-secondary">상품 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 에러 상태
  if (error && !product) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-[1256px] px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="mb-4 text-lg text-red-500">{error}</p>
              <Button onClick={() => window.location.reload()}>다시 시도</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 상품이 없는 경우
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-[1256px] px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="mb-4 text-lg text-text-secondary">상품을 찾을 수 없습니다.</p>
              <Button onClick={() => router.push('/store')}>쇼핑몰로 돌아가기</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1256px] px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-foreground transition-all duration-200 hover:bg-background-section px-3 py-2 rounded-lg hover:shadow-sm group"
        >
          <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="transition-colors duration-200">뒤로가기</span>
        </button>

        {/* Category Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
          <span 
            className="hover:text-foreground cursor-pointer"
            onClick={() => router.push('/store')}
          >
            홈
          </span>
          {categoryHierarchy.length > 0 ? (
            categoryHierarchy.map((category, index) => (
              <div key={category.id} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <span 
                  className={`cursor-pointer hover:text-foreground ${
                    index === categoryHierarchy.length - 1 
                      ? "text-foreground font-medium" 
                      : "hover:text-foreground"
                  }`}
                  onClick={() => {
                    if (index < categoryHierarchy.length - 1) {
                      // 현재 카테고리로 이동
                      router.push(`/store?category=${category.id}`)
                    }
                  }}
                >
                  {category.name}
                </span>
              </div>
            ))
          ) : (
            <>
              <ChevronRight className="h-4 w-4" />
              <span 
                className="hover:text-foreground cursor-pointer"
                onClick={() => router.push('/store')}
              >
                {product.category?.main || "카테고리"}
              </span>
              <ChevronRight className="h-4 w-4" />
              <span 
                className="hover:text-foreground cursor-pointer"
                onClick={() => router.push('/store')}
              >
                {product.category?.sub || "서브카테고리"}
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{product.category?.detail || "상세카테고리"}</span>
            </>
          )}
        </div>

        {/* Product Main Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="flex gap-4 h-[500px]">
            {/* Thumbnail Images - Left Side */}
            <div className="flex flex-col gap-2 w-20 flex-shrink-0">
              {(product.images || [product.thumbnail]).map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index ? "border-primary" : "border-gray-200"
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

            {/* Main Image - Right Side */}
            <div className="flex-1 h-full overflow-hidden rounded-lg bg-background-section">
              <img
                src={product.images?.[selectedImage] || product.thumbnail || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Brand */}
            <div 
              className="mb-2 text-sm font-medium text-text-secondary cursor-pointer hover:text-primary transition-colors"
              onClick={() => router.push(`/store?keyword=${encodeURIComponent(product.brand)}`)}
            >
              {product.brand}
            </div>

            {/* Product Name */}
            <h1 className="mb-4 text-2xl font-bold text-foreground leading-relaxed">{product.name}</h1>

            {/* Rating & Reviews */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-sky-400 text-lg">★</span>
                <span className="font-bold text-foreground">
                  {reviewStatistics ? reviewStatistics.averageRating.toFixed(1) : (product.rating || 0)}
                </span>
              </div>
              <span className="text-sm text-text-secondary">
                리뷰 {(reviewsTotalCount > 0 ? reviewsTotalCount : (product.reviewCount || 0)).toLocaleString()}개
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 border-y border-divider py-6">
              <div className="mb-2 flex items-center gap-3">
                {product.discountRate && product.discountRate > 0 && (
                  <span className="text-3xl font-bold text-sky-500">{product.discountRate}%</span>
                )}
                <span className="text-3xl font-bold text-red-500">
                  {(product.discountedPrice || currentPrice).toLocaleString()}원
                </span>
              </div>
              {product.basePrice && product.basePrice > (product.discountedPrice || currentPrice) && (
                <div className="text-base text-text-secondary line-through">
                  {product.basePrice.toLocaleString()}원
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">배송</span>
                <div className="flex items-center gap-2">
                  {product.shippingPrice === 0 ? (
                    <span className="text-sm font-bold text-foreground">무료배송</span>
                  ) : (
                    <span className="text-sm font-bold text-foreground">배송비 {product.shippingPrice?.toLocaleString()}원</span>
                  )}
                </div>
              </div>
            </div>

            {/* Option Selection */}
            {product.productType === "options" && stockData && stockData.length > 0 && Object.keys(getOptionGroups()).length > 0 && (
              <div className="mb-6">
                {Object.entries(getOptionGroups()).map(([groupName, values]) => (
                  <div key={groupName} className="mb-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-foreground">{groupName}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {values.map(value => {
                        const isSelected = selectedSkus[groupName] === value
                        const isAvailable = stockData.some(sku => 
                          sku.options.some(opt => opt.groupName === groupName && opt.valueName === value) &&
                          sku.stockQuantity > 0
                        )
                        
                        return (
                          <button
                            key={value}
                            onClick={() => {
                              setSelectedOptions(prev => ({
                                ...prev,
                                [groupName]: value
                              }))
                            }}
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-primary bg-primary text-white'
                                : isAvailable
                                ? 'border-gray-300 bg-white text-foreground hover:border-primary hover:bg-primary/5'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {product.productType === "single" && selectedSku && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-medium">재고:</span>
                  <span
                    className={`font-medium ${
                      selectedSku.stockQuantity === 0 ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    {selectedSku.stockQuantity === 0 ? "품절" : `${selectedSku.stockQuantity}개`}
                  </span>
                </div>
              </div>
            )}

            {/* Selected Option Box */}
            {selectedSku && (
              <div className="mb-6 rounded-lg bg-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {selectedSku.options
                        .filter(opt => opt.groupName && opt.valueName) // null 옵션 제외
                        .map(opt => `${opt.groupName}: ${opt.valueName}`)
                        .join(', ') || '기본 옵션'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOptions({})
                      setSelectedSku(null)
                      setQuantity(1)
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-background hover:bg-divider text-text-secondary hover:text-foreground transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  {/* 추가 금액 및 재고 정보 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      {selectedSku.priceAdjustment !== 0 && (
                        <span className="text-text-secondary">
                          추가금액: <span className={`font-medium ${selectedSku.priceAdjustment > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {selectedSku.priceAdjustment > 0 ? '+' : ''}{selectedSku.priceAdjustment.toLocaleString()}원
                          </span>
                        </span>
                      )}
                      <span className="text-text-secondary">
                        재고: <span className="font-medium text-foreground">{selectedSku.stockQuantity}개</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* 수량 조절 및 총 가격 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-divider rounded-lg bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-12 w-12 items-center justify-center text-foreground hover:bg-background-section transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1 || selectedSku?.stockQuantity === 0}
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-medium text-foreground border-x border-divider flex items-center justify-center h-12">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedSku?.stockQuantity || 0, quantity + 1))}
                        className="flex h-12 w-12 items-center justify-center text-foreground hover:bg-background-section transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity >= (selectedSku?.stockQuantity || 0) || selectedSku?.stockQuantity === 0}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {(currentPrice * quantity).toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Total Price */}
            <div className="mb-6 rounded-lg bg-background-section p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">총 상품금액</span>
                <span className="text-2xl font-bold text-foreground">
                  {product.productType === "options" && !selectedSku ? 
                    "0원" : 
                    (currentPrice * quantity).toLocaleString() + "원"
                  }
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
                  disabled={selectedSku?.stockQuantity === 0 || (product.productType === "options" && !selectedSku) || addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? "담는 중..." : "장바구니"}
                </Button>
                <Button
                  size="lg"
                  className={`flex-1 ${
                    selectedSku?.stockQuantity === 0 || (product.productType === "options" && !selectedSku)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-primary hover:bg-primary-dark text-white"
                  }`}
                  onClick={handleBuyNow}
                  disabled={selectedSku?.stockQuantity === 0 || (product.productType === "options" && !selectedSku)}
                >
                  {selectedSku?.stockQuantity === 0 ? "품절" : 
                   (product.productType === "options" && !selectedSku) ? "옵션을 선택해주세요" : "바로구매"}
                </Button>
              </div>

              {/* 장바구니 담기 성공 알림 */}
              {showCartSuccess && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-full">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">장바구니에 상품이 담겼습니다!</h3>
                    <p className="text-sm text-gray-600 mb-6">장바구니로 이동하시겠습니까?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCartSuccess(false)}
                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        계속 쇼핑
                      </button>
                      <button
                        onClick={() => router.push('/cart')}
                        className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        장바구니 보기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2 bg-transparent"
                onClick={handleChatWithSeller}
              >
                <MessageCircle className="h-5 w-5" />
                판매자 1:1 문의하기
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">상품 상세</h2>
          <Card className="p-8">
            <div className="whitespace-pre-line text-sm text-foreground leading-relaxed">
              {product.description || "상품 상세 정보가 없습니다."}
            </div>
          </Card>
        </section>

        {/* Recommended Products */}
        <section className="mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">추천 상품</h2>
            <p className="text-sm text-text-secondary mt-1">같은 카테고리의 다른 상품들을 확인해보세요</p>
          </div>

          {recommendedLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">추천 상품을 불러오는 중...</p>
              </div>
            </div>
          ) : recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {recommendedProducts.map((recommendedProduct) => {
                // 할인가 계산
                const finalPrice = recommendedProduct.discountRate > 0 
                  ? Math.round(recommendedProduct.basePrice * (1 - recommendedProduct.discountRate / 100))
                  : recommendedProduct.basePrice
                
                return (
                  <ProductCard
                    key={recommendedProduct.id}
                    id={recommendedProduct.id.toString()}
                    name={recommendedProduct.name}
                    price={finalPrice}
                    originalPrice={recommendedProduct.discountRate > 0 ? recommendedProduct.basePrice : undefined}
                    image={recommendedProduct.imageUrl}
                    brand={recommendedProduct.brand}
                    rating={recommendedProduct.averageRating}
                    reviewCount={recommendedProduct.reviewCount}
                    isFreeShipping={recommendedProduct.shippingPrice === 0}
                    shippingPrice={recommendedProduct.shippingPrice}
                    discountRate={recommendedProduct.discountRate}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary">추천 상품이 없습니다.</p>
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="mt-16">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                리뷰 <span className="text-primary">({reviewsTotalCount > 0 ? reviewsTotalCount.toLocaleString() : (product.reviewCount || 0).toLocaleString()})</span>
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                {showReviewForm ? "취소" : "리뷰 남기기"}
              </Button>
            </div>

            <div className="flex gap-8 items-center mt-4 p-4 border rounded-lg bg-background">
              {/* Left side: Average Rating and Stars */}
              <div className="flex flex-col items-center min-w-[120px]">
                {reviewStatistics && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-2xl text-sky-400">★</span>
                      ))}
                    </div>
                    <span className="text-3xl font-bold text-foreground">{reviewStatistics.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Right side: Rating Distribution Bar Chart */}
              <div className="flex-1 space-y-2">
                {reviewStatistics && [5, 4, 3, 2, 1].map((rating) => {
                  const count = reviewStatistics.ratingCounts[rating] || 0;
                  const totalReviewsForPercentage = reviewStatistics.totalCount > 0 ? reviewStatistics.totalCount : 1;
                  const percentage = (count / totalReviewsForPercentage) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="w-8 text-sm text-text-secondary">{rating}점</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-10 text-right text-sm text-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
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
                      <span className={star <= (hoveredRating || reviewRating) ? "text-sky-400" : "text-gray-300"}>
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
                <label className="mb-2 block text-sm font-medium text-foreground">사진 첨부 (선택, 최대 1장)</label>
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
                  {reviewImages.length < 1 && (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-divider bg-background-section hover:bg-background-section/80">
                      <svg
                        className="mb-1 h-6 w-6 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-text-secondary">{reviewImages.length}/1</span>
                      <input
                        type="file"
                        accept="image/*"
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
                <Button 
                  onClick={handleSubmitReview} 
                  disabled={submittingReview}
                  className="bg-primary hover:bg-primary-dark text-white disabled:opacity-50"
                >
                  {submittingReview ? "등록 중..." : "리뷰 등록"}
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {                userReviews.map((review) => (
                  <Card key={review.reviewId} className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* 사용자 프로필 이미지 */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.username)}&background=random&color=fff&size=40`}
                              alt={review.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">{review.username}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-sm ${i < review.rating ? "text-sky-400" : "text-gray-300"}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-text-secondary">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                {review.reviewImageUrl && (
                  <div className="flex gap-2 mb-3">
                    <img
                      src={review.reviewImageUrl}
                      alt="리뷰 이미지"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </div>
                )}
                <p className="mb-3 text-sm text-foreground leading-relaxed">{review.comment}</p>
              </Card>
            ))}
          </div>
        </section>

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
