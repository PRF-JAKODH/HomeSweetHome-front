/**
 * 게시글 상세 페이지 전용 훅
 * - 게시글 데이터 페칭
 * - 댓글 데이터 페칭
 * - 좋아요 상태 관리
 * - 조회수 증가
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPost,
  getComments,
  togglePostLike,
  getPostLikeStatus,
  increaseViewCount,
} from '@/lib/api/community'
import { useCurrentUser } from './use-current-user'

export function usePostDetail(postId: number) {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useCurrentUser()

  // 게시글 조회
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useQuery({
    queryKey: ['community-post', postId],
    queryFn: () => getPost(postId),
    enabled: !isNaN(postId),
  })

  // 댓글 목록 조회
  const {
    data: comments = [],
    isLoading: commentsLoading,
  } = useQuery({
    queryKey: ['community-comments', postId],
    queryFn: () => getComments(postId),
    enabled: !isNaN(postId),
  })

  // 게시글 좋아요 상태
  const { data: isPostLiked = false } = useQuery({
    queryKey: ['post-like-status', postId],
    queryFn: () => getPostLikeStatus(postId),
    enabled: !isNaN(postId) && isAuthenticated,
  })

  // 좋아요 토글 (Optimistic Update)
  const toggleLikeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: async () => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({ queryKey: ['community-post', postId] })
      await queryClient.cancelQueries({ queryKey: ['post-like-status', postId] })

      const previousPost = queryClient.getQueryData(['community-post', postId])
      const previousLikeStatus = queryClient.getQueryData(['post-like-status', postId])

      // Optimistic Update
      queryClient.setQueryData(['post-like-status', postId], (old: boolean) => !old)
      queryClient.setQueryData(['community-post', postId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          likeCount: isPostLiked ? old.likeCount - 1 : old.likeCount + 1,
        }
      })

      return { previousPost, previousLikeStatus }
    },
    onError: (_error, _variables, context) => {
      // 실패 시 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(['community-post', postId], context.previousPost)
      }
      if (context?.previousLikeStatus !== undefined) {
        queryClient.setQueryData(['post-like-status', postId], context.previousLikeStatus)
      }
    },
    onSettled: () => {
      // 최종 데이터 동기화
      queryClient.invalidateQueries({ queryKey: ['community-post', postId] })
      queryClient.invalidateQueries({ queryKey: ['post-like-status', postId] })
    },
  })

  // 조회수 증가 (페이지 로드 시 1회만)
  useEffect(() => {
    if (!isNaN(postId)) {
      increaseViewCount(postId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['community-post', postId] })
        })
        .catch((err) => console.error('조회수 증가 실패:', err))
    }
  }, [postId, queryClient])

  return {
    post,
    comments,
    isPostLiked,
    isLoading: postLoading || commentsLoading,
    error: postError,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
  }
}
