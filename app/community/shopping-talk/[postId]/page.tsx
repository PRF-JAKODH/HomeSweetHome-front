"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPost, getComments, createComment, deletePost, updateComment, deleteComment, togglePostLike, getPostLikeStatus, toggleCommentLike, getCommentLikeStatus, increaseViewCount } from '@/lib/api/community'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const categoryColors: Record<string, string> = {
  추천: "bg-primary/10 text-primary",
  질문: "bg-accent/10 text-accent",
  정보: "bg-green-500/10 text-green-600",
  후기: "bg-purple-500/10 text-purple-600",
}

// ✅ JWT 디코딩 함수
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

export default function ShoppingTalkDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = Number(params.postId)
  const queryClient = useQueryClient()

  // ✅ 현재 로그인한 사용자 (JWT에서 추출)
  const accessToken = useAuthStore((state) => state.accessToken)
  const currentUserId = accessToken ? Number(parseJwt(accessToken)?.sub) : null

  const [commentText, setCommentText] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentText, setEditingCommentText] = useState("")

  // ✅ 게시글 조회 API
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['community-post', postId],
    queryFn: () => getPost(postId),
    enabled: !isNaN(postId)
  })

  // ✅ 댓글 목록 조회 API
  const { data: comments = [] } = useQuery({
    queryKey: ['community-comments', postId],
    queryFn: () => getComments(postId),
    enabled: !isNaN(postId)
  })

  // ✅ 게시글 좋아요 상태 조회
  const { data: isPostLiked = false } = useQuery({
    queryKey: ['post-like-status', postId],
    queryFn: () => getPostLikeStatus(postId),
    enabled: !isNaN(postId) && !!accessToken
  })

  // ✅ 조회수 증가 (페이지 로드 시 한 번만 실행)
  useEffect(() => {
    if (!isNaN(postId)) {
      increaseViewCount(postId)
        .then(() => {
          // 조회수 증가 후 게시글 데이터 다시 불러오기
          queryClient.invalidateQueries({ queryKey: ['community-post', postId] })
          queryClient.invalidateQueries({ queryKey: ['community-posts'], refetchType: 'all' })
        })
        .catch(err => console.error('조회수 증가 실패:', err))
    }
  }, [postId, queryClient])

  // ✅ 댓글 작성 API
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] })
      setCommentText("")
    },
    onError: (error) => {
      console.error('댓글 작성 실패:', error)
      alert('댓글 작성에 실패했습니다.')
    }
  })

  // ✅ 게시글 삭제 API
  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      alert('게시글이 삭제되었습니다.')
      router.push('/community/shopping-talk')
    },
    onError: (error) => {
      console.error('게시글 삭제 실패:', error)
      alert('게시글 삭제에 실패했습니다.')
    }
  })

  // ✅ 댓글 수정 API
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(postId, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] })
      setEditingCommentId(null)
      setEditingCommentText("")
    },
    onError: (error) => {
      console.error('댓글 수정 실패:', error)
      alert('댓글 수정에 실패했습니다.')
    }
  })

  // ✅ 댓글 삭제 API
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] })
      alert('댓글이 삭제되었습니다.')
    },
    onError: (error) => {
      console.error('댓글 삭제 실패:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  })

  // ✅ 게시글 좋아요 토글 API
  const togglePostLikeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-like-status', postId] })
      queryClient.invalidateQueries({ queryKey: ['community-post', postId] })
    },
    onError: (error) => {
      console.error('좋아요 처리 실패:', error)
      alert('좋아요 처리에 실패했습니다.')
    }
  })

  // ✅ 댓글 좋아요 토글 API
  const toggleCommentLikeMutation = useMutation({
    mutationFn: (commentId: number) => toggleCommentLike(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] })
    },
    onError: (error) => {
      console.error('댓글 좋아요 처리 실패:', error)
      alert('댓글 좋아요 처리에 실패했습니다.')
    }
  })

  // ✅ API 데이터를 기존 UI 형식으로 변환
  const postData = post ? {
    id: String(post.postId),
    category: "일반",
    title: post.title,
    content: post.content,
    author: post.authorName,
    authorId: String(post.authorId),
    authorAvatar: "/user-avatar-1.png",
    createdAt: formatRelativeTime(post.createdAt),
    views: post.viewCount,
    likes: post.likeCount,
    bookmarks: 0,
    comments: post.commentCount,
  } : null

  const mockComments = comments.map(comment => ({
    id: comment.commentId,
    author: comment.authorName,
    authorId: comment.authorId,
    avatar: "/user-avatar-1.png",
    content: comment.content,
    createdAt: formatRelativeTime(comment.createdAt),
    likes: comment.likeCount,
  }))

  if (postLoading || !postData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">게시글을 불러오는 중...</p>
      </div>
    )
  }

  // ✅ 본인 게시글 확인
  const isMyPost = currentUserId === post?.authorId

  // 디버깅용 로그
  console.log('accessToken:', accessToken)
  console.log('currentUserId:', currentUserId, typeof currentUserId)
  console.log('post?.authorId:', post?.authorId, typeof post?.authorId)
  console.log('isMyPost:', isMyPost)

  const handleDM = () => {
    router.push(`/community/messages/${postData.authorId}`)
  }

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      createCommentMutation.mutate(commentText)
    }
  }

  // ✅ 삭제 핸들러
  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePostMutation.mutate()
    }
  }

  // ✅ 수정 핸들러
  const handleEdit = () => {
    router.push(`/community/shopping-talk/${postId}/edit`)
  }

  // ✅ 댓글 수정 시작
  const handleEditComment = (commentId: number, content: string) => {
    setEditingCommentId(commentId)
    setEditingCommentText(content)
  }

  // ✅ 댓글 수정 취소
  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentText("")
  }

  // ✅ 댓글 수정 제출
  const handleSubmitEditComment = (commentId: number) => {
    if (editingCommentText.trim()) {
      updateCommentMutation.mutate({ commentId, content: editingCommentText })
    }
  }

  // ✅ 댓글 삭제
  const handleDeleteComment = (commentId: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteCommentMutation.mutate(commentId)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[800px] px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">목록으로</span>
        </button>

        {/* Post Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                categoryColors[post.category] || "bg-gray-100 text-gray-600"
              }`}
            >
              {post.category}
            </span>
            <span className="text-sm text-text-secondary">{postData.createdAt}</span>
            <span className="text-sm text-text-secondary">조회 {postData.views}</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-6">{post.title}</h1>

          {/* Author Info */}
          <div className="flex items-center justify-between border-y border-divider py-4">
            <div className="flex items-center gap-3">
              <img
                src={postData.authorAvatar || "/placeholder.svg"}
                alt={postData.author}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-foreground">{postData.author}</p>
                <p className="text-sm text-text-secondary">{postData.createdAt}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* ✅ 수정/삭제 버튼 */}
              {isMyPost && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="text-sm"
                  >
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deletePostMutation.isPending}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    {deletePostMutation.isPending ? '삭제 중...' : '삭제'}
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleDM} className="gap-2 bg-transparent">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                DM
              </Button>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-8">
          <div className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">{post.content}</p>
          </div>
        </div>

        {/* Post Actions */}
        <div className="mb-8 flex items-center gap-4 border-y border-divider py-4">
          <button
            onClick={() => togglePostLikeMutation.mutate()}
            disabled={togglePostLikeMutation.isPending || !accessToken}
            className={`flex items-center gap-2 transition-colors ${
              isPostLiked ? "text-red-500" : "text-text-secondary hover:text-foreground"
            } ${!accessToken ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg className="h-6 w-6" fill={isPostLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium">{postData.likes}</span>
          </button>

          <div className="flex items-center gap-2 text-text-secondary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">{post.comments}</span>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-foreground">
            댓글 <span className="text-primary">{mockComments.length}</span>
          </h2>

          {/* Comment Input */}
          <div className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="w-full rounded-lg border border-divider bg-background p-4 text-sm text-foreground placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                댓글 작성
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.map((comment) => {
              const isMyComment = currentUserId === comment.authorId
              const isEditing = editingCommentId === comment.id

              return (
                <div key={comment.id} className="border-b border-divider pb-4 last:border-0">
                  <div className="mb-2 flex items-start gap-3">
                    <img
                      src={comment.avatar || "/placeholder.svg"}
                      alt={comment.author}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-medium text-foreground">{comment.author}</span>
                        <span className="text-xs text-text-secondary">{comment.createdAt}</span>
                      </div>

                      {/* ✅ 수정 모드 */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="w-full rounded-lg border border-divider bg-background p-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSubmitEditComment(comment.id)}
                              disabled={!editingCommentText.trim() || updateCommentMutation.isPending}
                              className="text-xs"
                            >
                              {updateCommentMutation.isPending ? '수정 중...' : '수정 완료'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEditComment}
                              className="text-xs"
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>

                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => toggleCommentLikeMutation.mutate(comment.id)}
                              disabled={toggleCommentLikeMutation.isPending || !accessToken}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                !accessToken ? "opacity-50 cursor-not-allowed text-text-secondary" : "text-text-secondary hover:text-foreground"
                              }`}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              <span>{comment.likes}</span>
                            </button>

                            {/* ✅ 본인 댓글에만 수정/삭제 버튼 표시 */}
                            {isMyComment && (
                              <>
                                <button
                                  onClick={() => handleEditComment(comment.id, comment.content)}
                                  className="text-xs text-text-secondary hover:text-foreground transition-colors"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  disabled={deleteCommentMutation.isPending}
                                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
