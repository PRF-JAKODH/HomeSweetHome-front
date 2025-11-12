import { useInfiniteQuery } from '@tanstack/react-query'
import { ProductSortType, RangeFilter } from '@/types/api/product'
import { getProductPreviews, filterProductPreviews } from '@/lib/api/products'

export const useInfiniteProductPreviews = (
  categoryId?: number,
  sortType: ProductSortType = 'LATEST',
  limit: number = 10,
  keyword?: string,
  optionFilters?: Record<string, string[]>,
  rangeFilters?: Record<string, RangeFilter>
) => {
  const sanitizedOptionFilters = optionFilters
    ? Object.entries(optionFilters).reduce<Record<string, string[]>>((acc, [key, values]) => {
        const filteredValues = (values ?? []).filter((value) => Boolean(value))
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
    queryKey: ['product-previews', categoryId, sortType, limit, keyword, optionFiltersKey, rangeFiltersKey],
    queryFn: ({ pageParam }) => {
      if ((hasOptionFilters && sanitizedOptionFilters) || (hasRangeFilters && sanitizedRangeFilters)) {
        return filterProductPreviews({
          cursorId: pageParam,
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

      return getProductPreviews({
        categoryId,
        limit,
        sortType,
        cursorId: pageParam,
        keyword: keyword || undefined,
      })
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.nextCursorId : undefined
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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