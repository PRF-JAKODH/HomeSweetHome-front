/**
 * 장바구니 관련 커스텀 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  addToCart, 
  getCartItems, 
  updateCartItem, 
  deleteCartItem, 
  deleteCartItems, 
  clearCart 
} from '@/lib/api/cart'
import { CartRequest, Cart, CartResponse } from '@/types/api/cart'
import { ScrollResponse } from '@/types/api/common'

// 장바구니 쿼리 키
export const CART_QUERY_KEYS = {
  all: ['cart'] as const,
  list: () => [...CART_QUERY_KEYS.all, 'list'] as const,
} as const

/**
 * 장바구니 목록 조회 훅 (무한 스크롤)
 */
export const useCartItems = (cursorId?: number, size: number = 10) => {
  return useQuery({
    queryKey: [...CART_QUERY_KEYS.list(), cursorId, size],
    queryFn: () => getCartItems(cursorId, size),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

/**
 * 장바구니 목록 조회 훅 (기본 - 첫 페이지)
 */
export const useCart = () => {
  return useCartItems()
}

/**
 * 장바구니에 상품 추가 훅
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient()

  return useMutation<Cart, Error, CartRequest>({
    mutationFn: (cartRequest: CartRequest) => addToCart(cartRequest),
    onSuccess: () => {
      // 장바구니 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.list() })
    },
  })
}

/**
 * 장바구니 아이템 수량 수정 훅
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient()

  return useMutation<Cart, Error, { cartItemId: string; quantity: number }>({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      updateCartItem(cartItemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.list() })
    },
  })
}

/**
 * 장바구니 아이템 삭제 훅
 */
export const useDeleteCartItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartItemId: string) => deleteCartItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.list() })
    },
  })
}

/**
 * 장바구니 아이템들 일괄 삭제 훅 (선택된 아이템들)
 */
export const useDeleteCartItems = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartItemIds: number[]) => deleteCartItems(cartItemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.list() })
    },
  })
}

/**
 * 장바구니 전체 삭제 훅
 */
export const useClearCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.list() })
    },
  })
}
