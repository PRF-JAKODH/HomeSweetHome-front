import { useQuery } from '@tanstack/react-query'
import { getPosts } from '@/lib/api/community'
import type { GetPostsParams } from '@/types/api/community'

export function useCommunityPosts(params?: GetPostsParams) {
    return useQuery({
        queryKey: ['community-posts', params],
        queryFn: () => getPosts(params),
    })
}