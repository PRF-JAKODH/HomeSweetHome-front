"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart, useAddToCart, useDeleteCartItem, useDeleteCartItems, useUpdateCartQuantity } from "@/lib/hooks/use-cart"
import { CartResponse } from "@/types/api/cart"
import { useCheckoutStore } from '@/stores/checkout-store';

interface CartItem {
  id: string
  productId: string
  skuId: number // skuId 필드 추가
  name: string
  brand: string
  image: string
  price: number
  option: string
  quantity: number
  selected: boolean
  shippingPrice: number // 배송료 필드 추가
  basePrice: number // 원가 필드 추가
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [allSelected, setAllSelected] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)  
  // API 훅들
  const { data: cartData, isLoading, error } = useCart()
  const addToCartMutation = useAddToCart()
  const deleteCartItemMutation = useDeleteCartItem()
  const deleteCartItemsMutation = useDeleteCartItems()
  const updateCartQuantityMutation = useUpdateCartQuantity();

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

  // 최상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // API 데이터를 로컬 상태로 변환
  useEffect(() => {
    if (cartData?.contents) {
      const transformedItems: CartItem[] = cartData.contents.map((item: CartResponse) => ({
        id: item.id.toString(),
        productId: item.id.toString(), // 실제 API에서는 productId가 별도로 없으므로 id 사용
        skuId: item.skuId || item.id, // skuId가 null이면 id를 사용
        name: item.productName,
        brand: item.brand,
        image: item.imageUrl,
        price: item.finalPrice, // 할인된 최종 가격 사용
        option: (() => {
          // null, undefined, "null: null" 문자열 등을 모두 체크
          if (!item.optionSummary || 
              item.optionSummary === 'null' || 
              item.optionSummary === 'null: null' || 
              item.optionSummary.trim() === '') {
            return '기본 옵션'
          }
          return item.optionSummary
        })(),
        quantity: item.quantity,
        selected: true,
        shippingPrice: item.shippingPrice, // API에서 배송료 가져오기
        basePrice: item.basePrice, // API에서 원가 가져오기
      }))
      
      setCartItems(transformedItems)
    }
  }, [cartData])


  const updateCart = (items: CartItem[]) => {
    setCartItems(items)
  }

  const handleSelectAll = (checked: boolean) => {
    setAllSelected(checked)
    const updatedItems = cartItems.map((item) => ({ ...item, selected: checked }))
    updateCart(updatedItems)
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const updatedItems = cartItems.map((item) => (item.id === id ? { ...item, selected: checked } : item))
    updateCart(updatedItems)
    setAllSelected(updatedItems.every((item) => item.selected))
  }

  const handleQuantityChange = async (id: string, delta: number) => {
    const item = cartItems.find((item) => item.id === id)
    if (!item) return

    const newQuantity = Math.max(1, item.quantity + delta)
    
    // 수량이 0이 되면 아이템을 삭제
    if (newQuantity === 0) {
      deleteCartItemMutation.mutate(id)
      return
    }

    try {
      // (기존 'delete' + 'add' 로직 삭제)
      
      // ★ 'updateCartQuantityMutation' 훅 호출
      await updateCartQuantityMutation.mutateAsync({
        cartId: id,
        quantity: newQuantity
      });

    } catch (error: any) {
      console.error('수량 변경 실패:', error);
      
      let errorMessage = "수량 변경에 실패했습니다. 다시 시도해주세요."
      if (error?.response?.data?.message) {
        const backendMessage = error.response.data.message
        
        if (backendMessage.includes('CART_LIMIT_EXCEEDED_ERROR')) {
          errorMessage = "장바구니에 담을 수 있는 최대 수량은 10개입니다."
        } else {
          errorMessage = backendMessage
        }
      }
      alert(errorMessage);
    }
  }

  const handleRemoveItem = (id: string) => {
    setShowDeleteConfirm(id)
  }

  const confirmDelete = (id: string) => {
    deleteCartItemMutation.mutate(id, {
      onSuccess: () => {
        setShowDeleteConfirm(null)
      },
      onError: (error) => {
        console.error('장바구니 아이템 삭제 실패:', error)
        alert('상품을 삭제하는데 실패했습니다. 다시 시도해주세요.')
      }
    })
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  const handleRemoveSelected = () => {
    setShowDeleteConfirm('bulk')
  }

  const confirmBulkDelete = () => {
    const selectedIds = cartItems.filter((item) => item.selected).map((item) => parseInt(item.id))
    if (selectedIds.length > 0) {
      deleteCartItemsMutation.mutate(selectedIds, {
        onSuccess: () => {
          setShowDeleteConfirm(null)
        },
        onError: (error) => {
          console.error('선택된 장바구니 아이템들 삭제 실패:', error)
          alert('선택된 상품을 삭제하는데 실패했습니다. 다시 시도해주세요.')
          setShowDeleteConfirm(null)
        }
      })
    }
  }

  const selectedItems = cartItems.filter((item) => item.selected)
  
  // 상품금액 (원가의 합계)
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.basePrice * item.quantity, 0)
  
  // 배송비 합계
  const totalShippingFee = selectedItems.reduce((sum, item) => sum + item.shippingPrice * item.quantity, 0)
  
  // 할인 금액 계산 (원가 - 할인가)
  const totalDiscountAmount = selectedItems.reduce((sum, item) => {
    const originalPrice = item.basePrice
    const discountedPrice = item.price
    const discountAmount = (originalPrice - discountedPrice) * item.quantity
    return sum + discountAmount
  }, 0)
  
  // 총 결제금액 = 할인된 가격의 합 + 배송비
  const finalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + totalShippingFee

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }

    // 1. (수정) CartItem[] -> CartResponse[] 타입으로 다시 변환
    const itemsToCheckout: CartResponse[] = selectedItems.map((item: CartItem) => {
      // API에서 받아온 원본 데이터(cartData)를 찾아 누락된 값(discountRate 등)을 복원
      const originalCartResponse = cartData?.contents.find(c => c.id.toString() === item.id);

      return {
        id: parseInt(item.id), // CartResponse는 number 타입
        skuId: item.skuId,
        brand: item.brand,
        productName: item.name, // 'name' -> 'productName'
        optionSummary: item.option, // 'option' -> 'optionSummary'
        basePrice: item.basePrice,
        discountRate: originalCartResponse?.discountRate || 0, // 원본 데이터에서 복원
        finalPrice: item.price, // 'price' -> 'finalPrice'
        shippingPrice: item.shippingPrice,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity, // totalPrice 재계산
        imageUrl: item.image, // 'image' -> 'imageUrl'
        createdAt: originalCartResponse?.createdAt || new Date().toISOString(), // 원본 데이터에서 복원
        updatedAt: originalCartResponse?.updatedAt || new Date().toISOString(), // 원본 데이터에서 복원
      };
    });

    // 2. Zustand 스토어에 저장
    useCheckoutStore.getState().setItems(itemsToCheckout);
    router.push("/checkout");
  };
  

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-[1256px] px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold text-foreground">장바구니</h1>
          <Card className="p-16 text-center">
            <div className="mb-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-lg text-text-secondary">장바구니를 불러오는 중...</p>
          </Card>
        </main>
      </div>
    )
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-[1256px] px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold text-foreground">장바구니</h1>
          <Card className="p-16 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="mb-6 text-lg text-text-secondary">장바구니를 불러오는데 실패했습니다</p>
            <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary-dark text-white">
              다시 시도
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1256px] px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">장바구니</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">장바구니에 담긴 상품이 없어요</h2>
            <p className="text-gray-600 mb-8">원하는 상품을 담아보세요</p>
            <Button 
              onClick={() => router.push("/store")} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
            >
              상품 담으러 가기
            </Button>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* 왼쪽: 장바구니 아이템들 */}
            <div className="flex-1 space-y-6">
              {/* 전체 선택 및 삭제 */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="select-all" 
                      checked={allSelected} 
                      onCheckedChange={handleSelectAll} 
                    />
                    <label htmlFor="select-all" className="text-sm font-medium text-foreground cursor-pointer">
                      전체선택 ({cartItems.filter(item => item.selected).length}/{cartItems.length})
                    </label>
                  </div>
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRemoveSelected} 
                      disabled={cartItems.filter(item => item.selected).length === 0}
                    >
                      선택삭제
                    </Button>
                    
                    {/* 전체 선택 삭제 확인 팝업 */}
                    {showDeleteConfirm === 'bulk' && (
                      <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-80 z-10">
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">선택한 상품을 삭제하겠습니까?</h3>
                          <p className="text-sm text-gray-600 mb-6">
                            {cartItems.filter(item => item.selected).length}개의 상품이 삭제됩니다.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={cancelDelete}
                              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              취소
                            </button>
                            <button
                              onClick={confirmBulkDelete}
                              disabled={deleteCartItemsMutation.isPending}
                              className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                            >
                              {deleteCartItemsMutation.isPending ? "삭제 중..." : "삭제"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 장바구니 아이템 목록 */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-6">
                    <div className="flex gap-4">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        className="mt-1"
                      />
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-32 w-32 rounded-lg object-cover bg-background-section flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="mb-1 text-sm text-text-secondary">{item.brand}</div>
                        <h3 className="mb-3 text-lg font-medium text-foreground line-clamp-2">{item.name}</h3>
                        
                        {/* 옵션과 수량 테이블 */}
                        <div className="mb-4 rounded-lg bg-gray-50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground">
                                {(() => {
                                  // UI에서도 안전하게 처리
                                  if (!item.option || 
                                      item.option === 'null' || 
                                      item.option === 'null: null' || 
                                      item.option.trim() === '') {
                                    return '기본 옵션'
                                  }
                                  return item.option
                                })()}
                              </div>
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={deleteCartItemMutation.isPending}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-background hover:bg-divider text-text-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deleteCartItemMutation.isPending ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </button>
                              
                              {/* 삭제 확인 팝업 */}
                              {showDeleteConfirm === item.id && (
                                <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-80 z-10">
                                  <div className="text-center">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">이 상품을 삭제하겠습니까?</h3>
                                    <p className="text-sm text-gray-600 mb-6">1개의 상품이 삭제됩니다.</p>
                                    <div className="flex gap-3">
                                      <button
                                        onClick={cancelDelete}
                                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                                      >
                                        취소
                                      </button>
                                      <button
                                        onClick={() => confirmDelete(item.id)}
                                        disabled={deleteCartItemMutation.isPending}
                                        className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                                      >
                                        {deleteCartItemMutation.isPending ? "삭제 중..." : "삭제"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            {/* 가격 정보 */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <span className="text-text-secondary">
                                  단가: <span className="font-medium text-foreground">{item.price.toLocaleString()}원</span>
                                </span>
                                <span className="text-text-secondary">
                                  배송비: <span className="font-medium text-foreground">
                                    {item.shippingPrice === 0 ? "무료" : `${item.shippingPrice.toLocaleString()}원`}
                                  </span>
                                </span>
                              </div>
                            </div>
                            
                            {/* 수량 조절 및 총 가격 */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-divider rounded-lg bg-white">
                              <button
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={updateCartQuantityMutation.isPending || deleteCartItemMutation.isPending}
                                className="flex h-12 w-12 items-center justify-center text-foreground hover:bg-background-section transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {(updateCartQuantityMutation.isPending && updateCartQuantityMutation.variables?.cartId === item.id) ? "..." : "-"}
                              </button>

                              <span className="w-16 text-center font-medium text-foreground border-x border-divider flex items-center justify-center h-12">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={updateCartQuantityMutation.isPending || deleteCartItemMutation.isPending}
                                className="flex h-12 w-12 items-center justify-center text-foreground hover:bg-background-section transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {(updateCartQuantityMutation.isPending && updateCartQuantityMutation.variables?.cartId === item.id) ? "..." : "+"}
                              </button>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-foreground">
                                  {(item.price * item.quantity).toLocaleString()}원
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* 오른쪽: 주문 정보 */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">주문 정보</h2>
              <div className="space-y-3 border-b border-divider pb-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">상품금액</span>
                  <span className="font-medium text-foreground">{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">배송비</span>
                  <span className="font-medium text-foreground">
                    {totalShippingFee === 0 ? "무료" : `${totalShippingFee.toLocaleString()}원`}
                  </span>
                </div>
                {totalDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">총 할인 금액</span>
                    <span className="font-medium text-red-500">
                      -{totalDiscountAmount.toLocaleString()}원
                    </span>
                  </div>
                )}
                {totalPrice === 0 && (
                  <div className="text-xs text-gray-500">상품을 선택해주세요</div>
                )}
              </div>
              <div className="mb-6 flex items-center justify-between">
                <span className="text-base font-bold text-foreground">총 결제금액</span>
                <span className="text-2xl font-bold text-primary">{finalPrice.toLocaleString()}원</span>
              </div>
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary-dark text-white"
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
              >
                {selectedItems.length}개 상품 주문하기
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full mt-2 bg-transparent"
                onClick={() => router.push("/store")}
              >
                쇼핑 계속하기
              </Button>
              </div>
            </div>
          </div>
        )}

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