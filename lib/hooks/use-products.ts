import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ProductPreviewResponse,
  GetProductPreviewsRequest,
  ProductSortType,
} from '@/types/api/product'
import { getProductPreviews } from '@/lib/api/products'

export const useInfiniteProductPreviews = (
  categoryId?: number,
  sortType: ProductSortType = 'LATEST',
  limit: number = 10,
  keyword?: string
) => {
  const [allProducts, setAllProducts] = useState<ProductPreviewResponse[]>([])
  const [cursorId, setCursorId] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['product-previews', categoryId, sortType, limit, keyword],
    queryFn: () =>
      getProductPreviews({
        categoryId,
        limit,
        sortType,
        cursorId: cursorId ?? undefined,
        keyword: keyword || undefined,
      }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!data) return

    if (cursorId === null) {
      // 첫 로드
      setAllProducts(data.contents)
    } else {
      // 추가 로드
      setAllProducts(prev => [...prev, ...data.contents])
    }

    setCursorId(data.nextCursorId)
    setHasNext(data.hasNext)
    setIsLoadingMore(false)
  }, [data])

  const loadMore = useCallback(() => {
    if (hasNext && !isLoadingMore && data?.nextCursorId) {
      setIsLoadingMore(true)
      setCursorId(data.nextCursorId)
    }
  }, [hasNext, isLoadingMore, data?.nextCursorId])

  const reset = useCallback(() => {
    setAllProducts([])
    setCursorId(null)
    setHasNext(true)
    setIsLoadingMore(false)
  }, [])

  useEffect(() => {
    reset()
    refetch()
  }, [categoryId, sortType, keyword, reset, refetch])

  return {
    products: allProducts,
    isLoading,
    isLoadingMore,
    hasNext,
    error,
    loadMore,
    reset,
    refetch,
  }
}