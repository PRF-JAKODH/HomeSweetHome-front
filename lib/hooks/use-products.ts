import { useInfiniteQuery } from '@tanstack/react-query'
import { ProductSortType } from '@/types/api/product'
import { getProductPreviews } from '@/lib/api/products'

export const useInfiniteProductPreviews = (
  categoryId?: number,
  sortType: ProductSortType = 'LATEST',
  limit: number = 10,
  keyword?: string
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['product-previews', categoryId, sortType, limit, keyword],
    queryFn: ({ pageParam }) =>
      getProductPreviews({
        categoryId,
        limit,
        sortType,
        cursorId: pageParam,
        keyword: keyword || undefined,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.nextCursorId : undefined
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // 모든 페이지의 상품을 평탄화
  const products = data?.pages.flatMap((page) => page.contents) ?? []

  return {
    products,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    hasNext: hasNextPage ?? false,
    error,
    loadMore: fetchNextPage,
    refetch,
  }
}