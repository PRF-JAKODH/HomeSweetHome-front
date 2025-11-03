/**
 * 게시글/댓글 CRUD 관련 Mutation 훅
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  createPost,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from '@/lib/api/community'
import type {
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '@/types/api/community'
import { toast } from 'sonner'

/**
 * 게시글 작성 훅
 */
export function useCreatePost() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostRequest) => createPost(data),
    onSuccess: () => {
      toast.success('게시글이 작성되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
      router.push('/community/shopping-talk')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '게시글 작성에 실패했습니다.'
      toast.error(message)
    },
  })
}

/**
 * 게시글 수정 훅
 */
export function useUpdatePost(postId: number) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePostRequest) => updatePost(postId, data),
    onSuccess: () => {
      toast.success('게시글이 수정되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['community-post', postId] })
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
      router.push(`/community/shopping-talk/${postId}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '게시글 수정에 실패했습니다.'
      toast.error(message)
    },
  })
}

/**
 * 게시글 삭제 훅
 */
export function useDeletePost(postId: number) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      toast.success('게시글이 삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
      router.push('/community/shopping-talk')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '게시글 삭제에 실패했습니다.'
      toast.error(message)
    },
  })
}

/**
 * 댓글 작성 훅
 */
export function useCreateComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(postId, data),
    onSuccess: () => {
      toast.success('댓글이 작성되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['community-post', postId] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '댓글 작성에 실패했습니다.'
      toast.error(message)
    },
  })
}

/**
 * 댓글 수정 훅
 */
export function useUpdateComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(postId, commentId, { content }),
    onSuccess: () => {
      toast.success('댓글이 수정되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '댓글 수정에 실패했습니다.'
      toast.error(message)
    },
  })
}

/**
 * 댓글 삭제 훅
 */
export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(postId, commentId),
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['community-post', postId] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '댓글 삭제에 실패했습니다.'
      toast.error(message)
    },
  })
}

/**
 * 댓글 좋아요 토글 훅
 */
export function useToggleCommentLike(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => toggleCommentLike(postId, commentId),
    onMutate: async (commentId: number) => {
      await queryClient.cancelQueries({ queryKey: ['community-comments', postId] })

      const previousComments = queryClient.getQueryData(['community-comments', postId])

      // Optimistic Update
      queryClient.setQueryData(['community-comments', postId], (old: any[]) => {
        if (!old) return old
        return old.map((comment) =>
          comment.commentId === commentId
            ? { ...comment, likeCount: comment.likeCount + 1 }
            : comment
        )
      })

      return { previousComments }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['community-comments', postId], context.previousComments)
      }
      toast.error('좋아요 처리에 실패했습니다.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] })
    },
  })
}
