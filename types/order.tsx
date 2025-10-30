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
// --- (인터페이스 정의 끝) ---