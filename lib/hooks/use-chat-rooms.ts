import { useInfiniteQuery } from '@tanstack/react-query'
import { searchChatRooms } from '@/lib/api/search'
import { ChatRoomSortType, SearchChatRoomsRequest } from '@/types/api/chat'
import { useAuthStore } from '@/stores/auth-store'

export const useInfiniteChatRooms = (
  keyword?: string,
  sortType: ChatRoomSortType = ChatRoomSortType.LATEST,
  limit: number = 20
) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['chat-rooms', keyword, sortType, limit, isAuthenticated],
    queryFn: ({ pageParam }) => {
      const params: SearchChatRoomsRequest = {
        nextCursor: pageParam as string | null | undefined,
        keyword: keyword?.trim() || undefined,
        sortType,
        limit,
      }
      return searchChatRooms(params)
    },
    initialPageParam: undefined as string | null | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) {
        return undefined
      }
      
      // nextCursor가 있으면 사용, 없으면 undefined 반환
      const nextCursor = lastPage.nextCursor
      if (nextCursor === null || nextCursor === undefined) {
        return undefined
      }
      
      return nextCursor
    },
    enabled: isHydrated && isAuthenticated, // 인증된 상태에서만 쿼리 실행
    staleTime: 1 * 60 * 1000, // 1분
  })

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  }
}

