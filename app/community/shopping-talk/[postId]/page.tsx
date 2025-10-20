"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

// Mock data - 실제로는 API에서 가져와야 함
const postData: Record<string, any> = {
  "1": {
    id: "1",
    category: "추천",
    title: "10만원대 가성비 소파 추천해주세요!",
    content: `거실 소파를 바꾸려고 하는데 예산이 넉넉하지 않아서요.
    
10만원대로 괜찮은 소파 있을까요? 2-3인용 정도면 좋을 것 같아요.

이케아나 온라인 쇼핑몰에서 괜찮은 제품 보신 분 계시면 추천 부탁드립니다!

내구성이 좋았으면 좋겠고, 색상은 그레이나 베이지 톤으로 찾고 있어요.`,
    author: "인테리어초보",
    authorId: "interior_beginner",
    authorAvatar: "/user-avatar-1.png",
    createdAt: "2시간 전",
    views: 234,
    likes: 128,
    bookmarks: 45,
    comments: 45,
  },
  "2": {
    id: "2",
    category: "질문",
    title: "원목 식탁 관리 어떻게 하시나요?",
    content: `원목 식탁을 처음 구매했는데 관리법을 잘 몰라서 질문드립니다.

오일칠은 얼마나 자주 해야 하나요? 그리고 어떤 오일을 사용하시나요?

물기가 묻었을 때는 바로 닦아야 한다고 들었는데, 다른 주의사항도 있을까요?

원목 가구 사용하시는 분들의 관리 팁이 궁금합니다!`,
    author: "목가구러버",
    authorId: "wood_lover",
    authorAvatar: "/diverse-user-avatar-set-2.png",
    createdAt: "5시간 전",
    views: 456,
    likes: 89,
    bookmarks: 32,
    comments: 32,
  },
  "3": {
    id: "3",
    category: "정보",
    title: "이번주 오늘의집 특가 정보 공유합니다",
    content: `이번주 오늘의집 특가 정보 정리해봤어요!

1. 북유럽 스타일 조명 - 40% 할인
2. 극세사 이불 세트 - 50% 할인
3. 주방 수납용품 - 30% 할인
4. 원목 선반 - 35% 할인

특가는 이번주 일요일까지라고 하니 관심있으신 분들은 서두르세요!

저는 조명이랑 이불 세트 주문했어요. 배송 오면 후기 올릴게요~`,
    author: "알뜰쇼퍼",
    authorId: "smart_shopper",
    authorAvatar: "/diverse-user-avatars-3.png",
    createdAt: "1일 전",
    views: 1234,
    likes: 423,
    bookmarks: 156,
    comments: 156,
  },
  "4": {
    id: "4",
    category: "후기",
    title: "북유럽 스타일 조명 구매 후기",
    content: `지난주에 주문한 북유럽 스타일 펜던트 조명 받았어요!

생각보다 훨씬 예쁘고 품질도 좋네요. 가격 대비 정말 만족스러워요.

설치도 어렵지 않았고, 조명 색상도 따뜻한 느낌이라 거실 분위기가 확 바뀌었어요.

같은 제품 고민하시는 분들께 추천드립니다!`,
    author: "조명덕후",
    authorId: "light_lover",
    authorAvatar: "/user-avatar-4.png",
    createdAt: "1일 전",
    views: 892,
    likes: 67,
    bookmarks: 28,
    comments: 28,
  },
}

const mockComments = [
  {
    id: 1,
    author: "가구쇼핑중",
    avatar: "/user-avatar-1.png",
    content: "저도 비슷한 고민 중이었는데 도움이 되네요!",
    createdAt: "1시간 전",
    likes: 5,
  },
  {
    id: 2,
    author: "인테리어마니아",
    avatar: "/diverse-user-avatar-set-2.png",
    content: "이케아 키빅 소파 추천드려요. 가성비 좋아요.",
    createdAt: "30분 전",
    likes: 12,
  },
  {
    id: 3,
    author: "홈스타일링",
    avatar: "/diverse-user-avatars-3.png",
    content: "온라인 쇼핑몰에서 구매하실 거면 후기 꼭 확인하세요!",
    createdAt: "15분 전",
    likes: 3,
  },
]

const categoryColors: Record<string, string> = {
  추천: "bg-primary/10 text-primary",
  질문: "bg-accent/10 text-accent",
  정보: "bg-green-500/10 text-green-600",
  후기: "bg-purple-500/10 text-purple-600",
}

export default function ShoppingTalkDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.postId as string

  const post = postData[postId]

  const [isLiked, setIsLiked] = useState(false)
  const [commentText, setCommentText] = useState("")

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">게시글을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const handleDM = () => {
    router.push(`/community/messages/${post.authorId}`)
  }

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      console.log("[v0] Submitting comment:", commentText)
      setCommentText("")
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
