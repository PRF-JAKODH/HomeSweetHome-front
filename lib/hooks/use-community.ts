import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getPosts } from '@/lib/api/community'
import type { GetPostsParams } from '@/types/api/community'

export function useCommunityPosts(params?: GetPostsParams) {
    return useQuery({
        queryKey: ['community-posts', params],
        queryFn: () => getPosts(params),
    })
}

export function useInfiniteCommunityPosts(params?: Omit<GetPostsParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: ['community-posts-infinite', params],
        queryFn: ({ pageParam = 0 }) => getPosts({ ...params, page: pageParam }),
        getNextPageParam: (lastPage) => {
            // 마지막 페이지가 아니면 다음 페이지 번호 반환
            return lastPage.last ? undefined : lastPage.number + 1
        },
        initialPageParam: 0,
    })
}