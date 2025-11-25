/**
 * 장바구니 관련 API 타입 정의
 */

// 장바구니 생성 요청 DTO
export interface CartRequest {
  skuId: number
  quantity: number
}

// 장바구니 응답 DTO (백엔드 Cart DTO와 일치)
export interface Cart {
  id: number
  userId: number
  skuId: number
  quantity: number
  createdAt: string
  updatedAt: string
}

// 장바구니 아이템 상세 정보
export interface CartItemDetail {
  id: string
  userId: string
  skuId: number
  quantity: number
  product: {
    id: string
    name: string
    brand: string
    image: string
    price: number
  }
  sku: {
    id: number
    option: string
    stock: number
  }
  createdAt: string
  updatedAt: string
}

// 장바구니 목록 조회 응답 (실제 API 구조에 맞춤)
export interface CartResponse {
  id: number
  skuId: number // skuId 필드 추가
  brand: string
  productName: string
  optionSummary: string
  basePrice: number
  discountRate: number
  finalPrice: number
  shippingPrice: number
  quantity: number
  totalPrice: number
  imageUrl: string
  createdAt: string
  updatedAt: string
  priceAdjustment: number
  productId: number
}

export interface DeleteCartItemsRequest {
  cartIds: number[]
}

// 장바구니 개수 응답
export interface CartCountResponse {
  cartCount: number
}
