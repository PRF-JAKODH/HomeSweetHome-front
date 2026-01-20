// --- (인터페이스 정의: 기존과 동일) ---
export interface Address {
    id: string
    name: string
    phone: string
    roadAddress: string
    detailAddress: string
    isDefault: boolean
}

export interface CartResponse {
    id: number;
    skuId: number;
    brand: string;
    productName: string;
    optionSummary: string;
    basePrice: number;
    discountRate: number;
    finalPrice: number;
    shippingPrice: number;
    quantity: number;
    totalPrice: number;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    productId: number;
}

export interface ScrollResponse<T> {
    contents: T[];
    nextCursor: number | null;
    totalElements?: number;
}

export interface OrderItemRequest {
    skuId: number;
    quantity: number;
}

export interface CreateOrderRequestDto {
    orderItems: OrderItemRequest[];
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingRequest: string;
}

export interface OrderItemDetail {
    orderItemId: number;
    imageUrl: string;
    brand: string;
    productName: string;
    optionName: string;
    basePrice: number;
    discountRate: number;
    shippingPrice: number;
    finalPrice: number;
    quantity: number;
}

export interface OrderReadyResponseDto {
    orderId: number;
    orderNumber: string;
    username: string;
    address: string;
    phoneNumber: string;
    orderItems: OrderItemDetail[];
    totalAmount: number;
    totalShippingPrice: number;
}

export interface MyOrder {
    orderId: number
    orderNumber: string
    orderDate: string
    productName: string
    productImage: string // imageUrl
    price: number
    orderStatus: string
    deliveryStatus: string
  }
  
  // 주문 상세 모달용
export type OrderDetail = {
    id: number; // (수정) orderId
    orderNumber: string;
    orderDate: string;
    status: string; // (수정) deliveryStatus
    statusText: string;
    
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    detailAddress: string; // (백엔드 DTO에 없으면 옵셔널 '?' 또는 빈 값 처리)
    pointsUsed: number;
    paymentMethod: string;

    orderItems: OrderDetailItemResponse[];
    
    totalAmount: number; // 최종 결제 금액
    totalShippingPrice: number; // 총 배송비
  }

export interface OrderDetailItemResponse {
    orderItemId: number;
    productName: string;
    productImage: string;
    optionName: string;
    price: number;
    quantity: number;
    sellerName: string;
    shippingFee: number;
}

export interface OrderDetailResponseDto {
    orderId: number;
    orderNumber: string;
    orderDate: string;
    orderStatus: string;
    deliveryStatus: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    paymentMethod: string;
    totalAmount: number;
    totalShippingPrice: number;
    usedPoint: number;
    orderItems: OrderDetailItemResponse[];
}
// --- (인터페이스 정의 끝) ---