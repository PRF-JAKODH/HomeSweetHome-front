import { useInfiniteQuery } from '@tanstack/react-query'
import { ProductSortType, RangeFilter } from '@/types/api/product'
import { getProductPreviews, filterProductPreviews, searchProductPreviewsAuthenticated } from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'

export const useInfiniteProductPreviews = (
  categoryId?: number,
  sortType: ProductSortType = 'LATEST',
  limit: number = 10,
  keyword?: string,
  optionFilters?: Record<string, string[]>,
  rangeFilters?: Record<string, RangeFilter>,
  minPrice?: number,
  maxPrice?: number
) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const sanitizedOptionFilters = optionFilters
    ? Object.entries(optionFilters).reduce<Record<string, string[]>>((acc, [key, values]) => {
        const filteredValues = (values ?? []).reduce<string[]>((valueAcc, value) => {
          if (!value) return valueAcc
          if (key === "전압") {
            const numeric = value.replace(/[^0-9]/g, "")
            if (numeric) {
              valueAcc.push(numeric)
            }
            return valueAcc
          }
          valueAcc.push(value)
          return valueAcc
        }, [])
        if (filteredValues.length > 0) {
          acc[key] = filteredValues
        }
        return acc
      }, {})
    : undefined

  const hasOptionFilters =
    sanitizedOptionFilters !== undefined && Object.keys(sanitizedOptionFilters).length > 0
  const optionFiltersKey = hasOptionFilters ? JSON.stringify(sanitizedOptionFilters) : null

  const sanitizedRangeFilters = rangeFilters
    ? Object.entries(rangeFilters).reduce<Record<string, RangeFilter>>((acc, [key, range]) => {
        if (!range) return acc
        const { minValue, maxValue } = range
        if (minValue == null && maxValue == null) {
          return acc
        }

        acc[key] = {
          minValue: minValue ?? undefined,
          maxValue: maxValue ?? undefined,
        }
        return acc
      }, {})
    : undefined

  const hasRangeFilters =
    sanitizedRangeFilters !== undefined && Object.keys(sanitizedRangeFilters).length > 0
  const rangeFiltersKey = hasRangeFilters ? JSON.stringify(sanitizedRangeFilters) : null

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['product-previews', categoryId, sortType, limit, keyword, optionFiltersKey, rangeFiltersKey, isAuthenticated, minPrice, maxPrice],
    queryFn: ({ pageParam }) => {
      if ((hasOptionFilters && sanitizedOptionFilters) || (hasRangeFilters && sanitizedRangeFilters)) {
        // 필터가 있는 경우 cursorId는 number만 사용
        const filterCursorId = typeof pageParam === 'number' ? pageParam : undefined
        return filterProductPreviews({
          cursorId: filterCursorId,
          limit,
          sortType,
          filters: {
            categoryId,
            keyword: keyword || undefined,
            optionFilters: sanitizedOptionFilters,
            rangeFilters: sanitizedRangeFilters,
          },
        })
      }

      // 인증된 사용자는 search API만 사용 (nextCursor 사용)
      if (isAuthenticated) {
        // 인증된 사용자 API는 nextCursor(String) 사용
        const authenticatedParams = {
          categoryId,
          limit,
          sortType,
          nextCursor: pageParam !== undefined && pageParam !== null ? (typeof pageParam === 'string' ? pageParam : pageParam.toString()) : undefined,
          keyword: keyword || undefined,
          minPrice: minPrice,
          maxPrice: maxPrice,
        }
        return searchProductPreviewsAuthenticated(authenticatedParams)
      }

      // 비인증 사용자는 previews API 사용 (cursorId 유지)
      const baseParams = {
        categoryId,
        limit,
        sortType,
        cursorId: typeof pageParam === 'number' ? pageParam : undefined,
        keyword: keyword || undefined,
      }
      return getProductPreviews(baseParams)
    },
    initialPageParam: undefined as number | string | undefined,
    getNextPageParam: (lastPage) => {
      // hasNext가 false이면 더 이상 페이지가 없음
      if (!lastPage.hasNext) {
        return undefined
      }
      
      // 인증된 사용자는 nextCursor(String) 사용
      if (isAuthenticated) {
        if (lastPage.nextCursor !== null && lastPage.nextCursor !== undefined && lastPage.nextCursor !== '') {
          return lastPage.nextCursor
        }
        // nextCursor가 없으면 undefined 반환
        return undefined
      }
      
      // 비인증 사용자는 nextCursorId(number) 사용
      if (lastPage.nextCursorId !== null && lastPage.nextCursorId !== undefined) {
        return lastPage.nextCursorId
      }
      
      return undefined
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    // hydration이 완료된 후에만 쿼리 실행 (인증 상태가 안정화될 때까지 대기)
    enabled: isHydrated,
  })

  // 모든 페이지의 상품을 평탄화하고 중복 제거
  const products = data?.pages.flatMap((page) => page.contents) ?? []
  
  // ID 기반 중복 제거
  const uniqueProducts = products.filter((product, index, self) =>
    index === self.findIndex((p) => p.id === product.id)
  )

  return {
    products: uniqueProducts,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    hasNext: hasNextPage ?? false,
    error,
    loadMore: fetchNextPage,
    refetch,
  }
}