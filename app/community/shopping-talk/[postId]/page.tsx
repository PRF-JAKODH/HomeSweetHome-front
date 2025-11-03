"use client"

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PostHeader } from '@/components/community/post-detail/post-header'
import { PostContent } from '@/components/community/post-detail/post-content'
import { PostActions } from '@/components/community/post-detail/post-actions'
import { CommentSection } from '@/components/community/comment/comment-section'
import { usePostDetail } from '@/lib/hooks/use-post-detail'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { useIsAuthor } from '@/lib/hooks/use-current-user'
import {
  useDeletePost,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useToggleCommentLike,
} from '@/lib/hooks/use-post-mutations'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

export default function ShoppingTalkDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = Number(params.postId)

  // 현재 사용자 정보
  const { userId, isAuthenticated } = useCurrentUser()

  // 게시글 데이터
  const {
    post,
    comments,
    isPostLiked,
    isLoading,
    toggleLike,
    isTogglingLike,
  } = usePostDetail(postId)

  // 게시글 작성자 확인
  const { isAuthor } = useIsAuthor(post?.authorId)

  // Mutations
  const deletePostMutation = useDeletePost(postId)
  const createCommentMutation = useCreateComment(postId)
  const updateCommentMutation = useUpdateComment(postId)
  const deleteCommentMutation = useDeleteComment(postId)
  const toggleCommentLikeMutation = useToggleCommentLike(postId)

  // Handlers
  const handleEdit = () => {
    router.push(`/community/shopping-talk/${postId}/edit`)
  }

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePostMutation.mutate()
    }
  }

  const handleDM = async () => {
    try {
      const accessToken = useAuthStore.getState().accessToken
      const myId = useAuthStore.getState().user?.id

      if (!myId || !accessToken) {
        alert("로그인이 필요합니다.")
        router.push("/login")
        return
      }

      const res = await fetch("/api/chat/rooms/individual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ targetId: post?.authorId }),
      })

      if (!res.ok) throw new Error(`채팅방 생성 실패 (${res.status})`)

      const data = await res.json()
      router.push(`/messages/${data.roomId}?username=${post?.authorName}`)
    } catch (err) {
      console.error("❌ DM 생성 실패:", err)
      alert("채팅방 생성 중 오류가 발생했습니다.")
    }
  }

  const handleCreateComment = (content: string) => {
    createCommentMutation.mutate({ content })
  }

  const handleUpdateComment = (commentId: number, content: string) => {
    updateCommentMutation.mutate({ commentId, content })
  }

  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId)
  }

  const handleLikeComment = (commentId: number) => {
    toggleCommentLikeMutation.mutate(commentId)
  }

  // Loading state
  if (isLoading || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">게시글을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[800px] px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">목록으로</span>
        </button>

        {/* Post Header */}
        <PostHeader
          category={post.category}
          title={post.title}
          authorName={post.authorName}
          createdAt={formatRelativeTime(post.createdAt)}
          viewCount={post.viewCount}
          isAuthor={isAuthor}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDM={handleDM}
          isDeleting={deletePostMutation.isPending}
        />

        {/* Post Content */}
        <PostContent content={post.content} images={post.imagesUrl} />

        {/* Post Actions */}
        <PostActions
          likes={post.likeCount}
          comments={post.commentCount}
          isLiked={isPostLiked}
          isAuthenticated={isAuthenticated}
          onLikeToggle={toggleLike}
          isTogglingLike={isTogglingLike}
        />

        {/* Comment Section */}
        <CommentSection
          comments={comments.map(comment => ({
            ...comment,
            createdAt: formatRelativeTime(comment.createdAt),
          }))}
          currentUserId={userId}
          isAuthenticated={isAuthenticated}
          onCreateComment={handleCreateComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onLikeComment={handleLikeComment}
          isCreating={createCommentMutation.isPending}
        />
      </div>
    </div>
  )
}
