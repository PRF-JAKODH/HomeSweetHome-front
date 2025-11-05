"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useInfiniteCommunityPosts } from '@/lib/hooks/use-community'
import type { CommunityPost } from '@/types/api/community'
import { formatRelativeTime } from '@/lib/utils'
import { extractKeywords, getKeywordStyle } from '@/lib/utils/keyword-extractor'

// 정렬 옵션 타입 정의
type SortOption = {
  label: string
  sort: 'createdAt' | 'viewCount' | 'likeCount'
  direction: 'asc' | 'desc'
}

// 정렬 옵션들
const sortOptions: SortOption[] = [
  { label: "최신순", sort: "createdAt", direction: "desc" },
  { label: "조회수순", sort: "viewCount", direction: "desc" },
  { label: "인기순", sort: "likeCount", direction: "desc" },
]

const categories = [
  { id: "shopping-talk", name: "쇼핑수다", image: "/shopping-talk-icon-new.png" },
  { id: "chat-rooms", name: "오늘의채팅방", image: "/chat-room-icon-new.png" },
]

const mapPostToUI = (post: CommunityPost) => ({
  id: post.postId,
  title: post.title,
  content: post.content,
  author: post.authorName,
  createdAt: formatRelativeTime(post.createdAt),
  views: post.viewCount,
  likes: post.likeCount,
  comments: post.commentCount,
  category: post.category,  // 카테고리 (백엔드에서 받아옴)
  keywords: extractKeywords(post.title, post.content, 3)  // 제목과 내용에서 자동으로 키워드 추출
})

const chatRooms = [
  {
    id: 1,
    name: "거실 인테리어 고민방",
    category: "🛋️ 거실",
    participants: 234,
    lastMessage: "소파 배치 어떻게 하셨나요?",
    lastMessageTime: "방금 전",
    thumbnail: "/living-room-chat.jpg",
  },
  {
    id: 2,
    name: "주방 꾸미기 모임",
    category: "🍳 주방",
    participants: 189,
    lastMessage: "수납 아이디어 공유해요!",
    lastMessageTime: "5분 전",
    thumbnail: "/kitchen-chat.jpg",
  },
  {
    id: 3,
    name: "북유럽 스타일 러버",
    category: "🌲 북유럽",
    participants: 456,
    lastMessage: "이케아 신상 나왔어요",
    lastMessageTime: "10분 전",
    thumbnail: "/nordic-style-chat.jpg",
  },
  {
    id: 4,
    name: "미니멀 인테리어",
    category: "⚪ 미니멀",
    participants: 312,
    lastMessage: "화이트 톤 추천 부탁드려요",
    lastMessageTime: "30분 전",
    thumbnail: "/minimal-chat.jpg",
  },
  {
    id: 5,
    name: "DIY 프로젝트 공유",
    category: "🔨 DIY",
    participants: 567,
    lastMessage: "선반 만들기 성공했어요!",
    lastMessageTime: "1시간 전",
    thumbnail: "/diy-chat.jpg",
  },
  {
    id: 6,
    name: "식물 키우기 초보방",
    category: "🌿 식물",
    participants: 423,
    lastMessage: "몬스테라 물주기 주기가...",
    lastMessageTime: "2시간 전",
    thumbnail: "/plant-chat.jpg",
  },
]

// 카테고리 배지 색상
const categoryColors: Record<string, string> = {
  추천: "bg-blue-600/15 text-blue-700 border border-blue-600/30",
  질문: "bg-orange-500/15 text-orange-700 border border-orange-500/30",
  정보: "bg-emerald-600/15 text-emerald-700 border border-emerald-600/30",
  후기: "bg-violet-600/15 text-violet-700 border border-violet-600/30",
}

export default function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState("chat-rooms")
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]) // 기본값: 최신순
  const observerTarget = useRef<HTMLDivElement>(null)

  // 🔄 API에서 게시글 데이터 가져오기 (무한 스크롤)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteCommunityPosts({
    size: 10,
    sort: selectedSort.sort,
    direction: selectedSort.direction
  })

  // Intersection Observer를 사용한 무한 스크롤 구현
  useEffect(() => {
    // 쇼핑수다 탭이 아니면 observer 설정 안 함
    if (selectedTab !== "shopping-talk") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          console.log('[무한스크롤] 다음 페이지 로딩 시작')
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // 하단 100px 전부터 로딩 시작
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
      console.log('[무한스크롤] Observer 설정 완료', { hasNextPage, isFetchingNextPage })
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [selectedTab, hasNextPage, isFetchingNextPage, fetchNextPage])

  // 모든 페이지의 게시글을 하나의 배열로 합치기
  const allPosts = data?.pages.flatMap((page) => page.content) ?? []

  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="border-b border-divider bg-background py-8">
          <div className="mx-auto max-w-[1256px] px-4">
            <h2 className="mb-6 text-2xl font-bold text-foreground">커뮤니티</h2>

            {/* Horizontal Scrollable Categories - Same style as Store */}
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((category) => {
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedTab(category.id)}
                      className={`group flex flex-col items-center gap-3 flex-shrink-0 transition-all ${selectedTab === category.id ? "opacity-100" : "opacity-60 hover:opacity-80"
                        }`}
                    >
                      <div
                        className={`flex h-24 w-24 items-center justify-center rounded-full bg-background-section transition-all ${selectedTab === category.id ? "ring-2 ring-primary" : ""
                          }`}
                      >
                        <img
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          className="h-16 w-16 object-contain transition-transform group-hover:scale-110"
                        />
                      </div>
                      <span
                        className={`text-sm font-medium transition-colors ${selectedTab === category.id ? "text-primary" : "text-foreground"
                          }`}
                      >
                        {category.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="mx-auto max-w-[1256px] px-4">
            {selectedTab === "shopping-talk" && (
              <div>
                {/* Header with write button */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">쇼핑수다</h3>
                    <p className="mt-1 text-sm text-text-secondary">가구, 인테리어 쇼핑 정보를 나누는 공간</p>
                  </div>
                  <a href="/community/shopping-talk/create">
                    <Button className="bg-primary hover:bg-primary/90">글쓰기</Button>
                  </a>
                </div>

                {/* Sort Options */}
                <div className="flex gap-2 mb-6">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.label}
                      variant={selectedSort.label === option.label ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSort(option)}
                      className="text-sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {isLoading && (
                    <div className="text-center py-8 text-text-secondary">
                      로딩 중...
                    </div>
                  )}
                  {allPosts.map((post: CommunityPost) => {
                    const uiPost = mapPostToUI(post)
                    // 첫 번째 이미지를 썸네일로 사용
                    const thumbnail = post.imagesUrl?.[0]
                    // S3 URL 정리
                    const cleanThumbnail = thumbnail ?
                      thumbnail.split('/').slice(0, 4).join('/') + '/' + thumbnail.split('/').pop() :
                      null

                    return (
                      <a
                        key={uiPost.id}
                        href={`/community/shopping-talk/${uiPost.id}`}
                        className="block bg-background border border-divider rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          {/* Category Badge */}
                          {uiPost.category && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start ${categoryColors[uiPost.category] || "bg-gray-100 text-gray-600"}`}
                            >
                              {uiPost.category}
                            </span>
                          )}

                          {/* Post Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h2 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                                {uiPost.title}
                              </h2>
                              {/* Auto Keywords - 제목 옆에 표시 */}
                              {uiPost.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getKeywordStyle(keyword)}`}
                                >
                                  #{keyword}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-text-secondary line-clamp-2 mb-3">{uiPost.content}</p>

                            {/* Post Meta */}
                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                              <span className="font-medium text-foreground">{uiPost.author}</span>
                              <span>{uiPost.createdAt}</span>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                  {uiPost.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                    />
                                  </svg>
                                  {uiPost.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                  </svg>
                                  {uiPost.comments}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Thumbnail Image */}
                          {cleanThumbnail && (
                            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-surface">
                              <img
                                src={cleanThumbnail}
                                alt={uiPost.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  if (target.src !== thumbnail) {
                                    target.src = thumbnail
                                  } else {
                                    target.style.display = 'none'
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </a>
                    )
                  })}

                  {/* 무한 스크롤 트리거 - observer target은 항상 렌더링 */}
                  <div ref={observerTarget} className="py-8">
                    {isFetchingNextPage && (
                      <div className="text-center text-sm text-text-secondary flex items-center justify-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        더 불러오는 중...
                      </div>
                    )}
                    {!isFetchingNextPage && !hasNextPage && allPosts.length > 0 && (
                      <div className="text-center text-text-secondary text-sm">
                        모든 게시글을 불러왔습니다
                      </div>
                    )}
                    {!isLoading && allPosts.length === 0 && (
                      <div className="text-center py-12 text-text-secondary">
                        게시글이 없습니다
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "chat-rooms" && (
              <div>
                {/* Header with create button */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">오늘의채팅방</h3>
                    <p className="mt-1 text-sm text-text-secondary">관심사가 같은 사람들과 실시간으로 소통하세요</p>
                  </div>
                  <a href="/community/chat/create">
                    <Button className="bg-primary hover:bg-primary/90">채팅방 만들기</Button>
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {chatRooms.map((room) => (
                    <a
                      key={room.id}
                      href={`/community/chat-rooms/${room.id}`}
                      className="block rounded-lg border border-divider bg-background overflow-hidden transition-all hover:border-primary hover:shadow-md"
                    >
                      <div className="aspect-video overflow-hidden bg-background-section">
                        <img
                          src={room.thumbnail || "/placeholder.svg?height=200&width=400"}
                          alt={room.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-sm font-medium text-primary">{room.category}</span>
                          <span className="text-xs text-text-secondary">
                            <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            {room.participants}명
                          </span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">{room.name}</h3>
                        <div className="flex items-center justify-between text-sm text-text-secondary">
                          <p className="line-clamp-1 flex-1">{room.lastMessage}</p>
                          <span className="ml-2 flex-shrink-0">{room.lastMessageTime}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}