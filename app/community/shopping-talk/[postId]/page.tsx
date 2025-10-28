"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPost, getComments, createComment } from '@/lib/api/community'
import { formatRelativeTime } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  추천: "bg-primary/10 text-primary",
  질문: "bg-accent/10 text-accent",
  정보: "bg-green-500/10 text-green-600",
  후기: "bg-purple-500/10 text-purple-600",
}

export default function ShoppingTalkDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = Number(params.postId)
  const queryClient = useQueryClient()

  const [isLiked, setIsLiked] = useState(false)
  const [commentText, setCommentText] = useState("")

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

  const handleDM = () => {
    router.push(`/community/messages/${postData.authorId}`)
  }

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      createCommentMutation.mutate(commentText)
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
            <span className="text-sm text-text-secondary">{post.createdAt}</span>
            <span className="text-sm text-text-secondary">조회 {post.views}</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-6">{post.title}</h1>

          {/* Author Info */}
          <div className="flex items-center justify-between border-y border-divider py-4">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar || "/placeholder.svg"}
                alt={post.author}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-foreground">{post.author}</p>
                <p className="text-sm text-text-secondary">{post.createdAt}</p>
              </div>
            </div>
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

        {/* Post Content */}
        <div className="mb-8">
          <div className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">{post.content}</p>
          </div>
        </div>

        {/* Post Actions */}
        <div className="mb-8 flex items-center gap-4 border-y border-divider py-4">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? "text-red-500" : "text-text-secondary hover:text-foreground"
            }`}
          >
            <svg className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium">{isLiked ? post.likes + 1 : post.likes}</span>
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
            {mockComments.map((comment) => (
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
                    <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                    <button className="mt-2 flex items-center gap-1 text-xs text-text-secondary hover:text-foreground transition-colors">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
