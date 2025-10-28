/**
 * 장바구니 API 클라이언트
 */

import { apiClient } from './client'
import { CART_ENDPOINTS } from './endpoints'
import { CartRequest, Cart, CartResponse, DeleteCartItemsRequest } from '@/types/api/cart'
import { ApiResponse, ScrollResponse } from '@/types/api/common'


/**
 * 장바구니에 상품 추가
 */
export const addToCart = async (cartRequest: CartRequest): Promise<Cart> => {
  const response = await apiClient.post(CART_ENDPOINTS.ADD_TO_CART, cartRequest)
  return response.data as Cart
}

/**
 * 장바구니 목록 조회 (무한 스크롤)
 */
export const getCartItems = async (
  cursorId?: number, 
  size: number = 10
): Promise<ScrollResponse<CartResponse>> => {
  const params = new URLSearchParams()
  if (cursorId) params.append('cursorId', cursorId.toString())
  params.append('size', size.toString())
  
  return await apiClient.get<ScrollResponse<CartResponse>>(`${CART_ENDPOINTS.GET_CART}?${params.toString()}`)
}

/**
 * 장바구니 아이템 삭제
 */
export const deleteCartItem = async (cartItemId: string): Promise<void> => {
  await apiClient.delete(CART_ENDPOINTS.DELETE_CART_ITEM(cartItemId))
  // 백엔드에서 null을 반환하므로 void로 처리
}

/**
 * 장바구니 아이템들 일괄 삭제 (선택된 아이템들)
 */
export const deleteCartItems = async (cartItemIds: number[]): Promise<void> => {
  const request: DeleteCartItemsRequest = { cartIds: cartItemIds }
  await apiClient.delete(CART_ENDPOINTS.DELETE_CART_ITEMS, { 
    data: request
  })
}

/**
 * 장바구니 전체 삭제
 */
export const clearCart = async (): Promise<ApiResponse<void>> => {
  return await apiClient.delete(CART_ENDPOINTS.CLEAR_CART)
}
