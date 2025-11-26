"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInfiniteChatRooms } from '@/lib/hooks/use-chat-rooms'
import type { CommunityPost, CommunityPostSearchResponse } from '@/types/api/community'
import { CommunitySortType } from '@/types/api/community'
import { useRouter, useSearchParams } from "next/navigation"
import { ChatRoomSortType } from '@/types/api/chat'
import { searchCommunityPosts } from "@/lib/api/search"

// 정렬 옵션 타입 정의
type SortOption = {
  label: string
  sortType: CommunitySortType
}
export enum ChatRoomType {
  INDIVIDUAL = "INDIVIDUAL",
  GROUP = "GROUP",
}

export interface RoomListCommonResponseDto {
  roomId: number
  roomName: string
  roomType: ChatRoomType
  memberCount: number

  // 상대방 정보 (개인 채팅방용)
  partnerId: number | null
  partnerName: string | null
  thumbnailUrl: string | null

  // 마지막 메시지 관련
  lastMessage: string | null
  lastMessageAt: string | null 
  lastMessageId: number | null
  lastMessageIsRead: boolean | null
}

/**
 * 시간을 상대적 표현으로 변환하는 유틸 함수
 */
function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return "최근 활동 없음"

  const now = new Date()
  const messageTime = new Date(isoString)
  const diffMs = now.getTime() - messageTime.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return "방금 전"
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  
  return messageTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
}

// 정렬 옵션들
const sortOptions: SortOption[] = [
  { label: "최신순", sortType: CommunitySortType.LATEST },
  { label: "조회수순", sortType: CommunitySortType.VIEW_COUNT },
  { label: "인기순", sortType: CommunitySortType.LIKE_COUNT },
]

const categories = [
  { id: "shopping-talk", name: "쇼핑수다", image: "/assorted-home-goods.png" },
  { id: "chat-rooms", name: "오늘의채팅방", image: "/nordic-style-chat.jpg" },
]

const mapPostToUI = (post: CommunityPost | CommunityPostSearchResponse) => ({
  id: post.postId,
  title: post.title,
  // 검색 응답에는 snippet만 있으므로 content/요약 우선순위 적용
  content: "content" in post ? post.content : (post as CommunityPostSearchResponse).snippet,
  // 검색 응답에는 authorName 이 없을 수 있음
  author: "authorName" in post ? (post as CommunityPost).authorName : "",
  createdAt: formatRelativeTime(post.createdAt),
  views: post.viewCount,
  likes: post.likeCount,
  comments: post.commentCount,
  category: post.category,
})

// 카테고리 배지 색상
const categoryColors: Record<string, string> = {
  추천: "bg-blue-600/15 text-blue-700 border border-blue-600/30",
  질문: "bg-orange-500/15 text-orange-700 border border-orange-500/30",
  정보: "bg-emerald-600/15 text-emerald-700 border border-emerald-600/30",
  후기: "bg-violet-600/15 text-violet-700 border border-violet-600/30",
}

export default function CommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL에서 탭 정보 읽기 (없으면 기본값 "chat-rooms")
  const tabFromUrl = searchParams?.get("tab") || "chat-rooms"
  const [selectedTab, setSelectedTab] = useState(tabFromUrl)
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0])
  const observerTarget = useRef<HTMLDivElement>(null)
  
  // 초기 로드 시 URL에 탭 정보가 없으면 기본값 설정
  useEffect(() => {
    if (!searchParams?.get("tab")) {
      router.replace("/community?tab=chat-rooms", { scroll: false })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // URL의 탭 정보가 변경되면 state 업데이트
  useEffect(() => {
    const tab = searchParams?.get("tab") || "chat-rooms"
    if (tab !== selectedTab) {
      setSelectedTab(tab)
    }
  }, [searchParams, selectedTab])
  
  // 탭 변경 핸들러 (URL 업데이트)
  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId)
    router.push(`/community?tab=${tabId}`, { scroll: false })
  }
  
  // URL에서 검색 키워드 읽기
  const searchKeyword = searchParams?.get("keyword") || undefined
  
  // 검색 시에는 RECOMMENDED를 기본값으로, 일반 조회 시에는 LATEST를 기본값으로 사용
  const [chatRoomSortType, setChatRoomSortType] = useState<ChatRoomSortType>(() => {
    // 초기 마운트 시 검색어가 있으면 RECOMMENDED, 없으면 LATEST
    return searchKeyword ? ChatRoomSortType.RECOMMENDED : ChatRoomSortType.LATEST
  })
  
  // 검색어가 변경될 때만 정렬 타입 초기화 (사용자가 수동으로 변경한 경우는 유지)
  const prevSearchKeywordRef = useRef(searchKeyword)
  useEffect(() => {
    // 검색어가 실제로 변경된 경우에만 정렬 타입 초기화
    if (prevSearchKeywordRef.current !== searchKeyword) {
      const expectedSortType = searchKeyword ? ChatRoomSortType.RECOMMENDED : ChatRoomSortType.LATEST
      setChatRoomSortType(expectedSortType)
      prevSearchKeywordRef.current = searchKeyword
    }
  }, [searchKeyword])

  // 채팅방 목록 조회 (무한 스크롤)
  const {
    data: chatRoomsData,
    fetchNextPage: fetchNextChatRoomsPage,
    hasNextPage: hasNextChatRoomsPage,
    isFetchingNextPage: isFetchingNextChatRoomsPage,
    isLoading: isLoadingChatRooms,
  } = useInfiniteChatRooms(
    searchKeyword,
    chatRoomSortType,
    20
  )

  // 채팅방 데이터 평탄화
  const allChatRooms = chatRoomsData?.pages.flatMap((page) => page.contents) ?? []

  // 쇼핑수다 게시글 검색/조회 (무한 스크롤, 커뮤니티 검색 API 사용)
  const {
    data: postsData,
    fetchNextPage: fetchNextPostsPage,
    hasNextPage: hasNextPostsPage,
    isFetchingNextPage: isFetchingNextPostsPage,
    isLoading: isLoadingPosts,
  } = useInfiniteQuery({
    queryKey: ['community-posts-search', selectedSort.sortType, searchKeyword],
    queryFn: ({ pageParam }) =>
      searchCommunityPosts({
        nextCursor: pageParam as string | null | undefined,
        // 검색 키워드가 있으면 해당 키워드로 검색, 없으면 전체 조회
        keyword: searchKeyword,
        // 검색 시에는 RECOMMENDED, 그 외에는 선택된 정렬 조건 사용
        sortType: searchKeyword ? CommunitySortType.RECOMMENDED : selectedSort.sortType,
        limit: 10,
      }),
    initialPageParam: undefined as string | null | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) return undefined
      const nextCursor = lastPage.nextCursor
      if (nextCursor === null || nextCursor === undefined) return undefined
      return nextCursor
    },
  })

  // Intersection Observer를 사용한 무한 스크롤 구현 (쇼핑수다)
  useEffect(() => {
    if (selectedTab !== "shopping-talk") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPostsPage && !isFetchingNextPostsPage) {
          console.log('[무한스크롤] 다음 페이지 로딩 시작')
          fetchNextPostsPage()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
      console.log('[무한스크롤] Observer 설정 완료', { hasNextPostsPage, isFetchingNextPostsPage })
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [selectedTab, hasNextPostsPage, isFetchingNextPostsPage, fetchNextPostsPage])

  // Intersection Observer를 사용한 무한 스크롤 구현 (채팅방)
  const chatRoomObserverTarget = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (selectedTab !== "chat-rooms") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextChatRoomsPage && !isFetchingNextChatRoomsPage) {
          console.log('[채팅방 무한스크롤] 다음 페이지 로딩 시작')
          fetchNextChatRoomsPage()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    const currentTarget = chatRoomObserverTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [selectedTab, hasNextChatRoomsPage, isFetchingNextChatRoomsPage, fetchNextChatRoomsPage])

  // 모든 페이지의 게시글을 하나의 배열로 합치기
  const allPosts = postsData?.pages.flatMap((page) => page.contents) ?? []

  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="border-b border-divider bg-background py-8">
          <div className="mx-auto max-w-[1256px] px-4">
            <h2 className="mb-6 text-2xl font-bold text-foreground">커뮤니티</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => {
                const isSelected = selectedTab === category.id

                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => handleTabChange(category.id)}
                    className={`group relative flex items-center gap-6 rounded-3xl p-6 text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-white/90 border border-white/60 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] md:hover:-translate-y-1"
                        : "bg-white/60 border border-black/5 hover:bg-white/80 hover:shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)] md:hover:-translate-y-1"
                    } backdrop-blur-sm`}
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-300 shadow-inner">
                        <img
                          src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                        Homesweethome Community
                      </span>
                      <span className="text-xl font-bold text-foreground">
                        {category.name}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {category.id === "shopping-talk"
                          ? "가구·인테리어 쇼핑 정보를 나누고 이야기하는 공간"
                          : "주제별 채팅방에 참여해 실시간으로 소통해보세요"}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="mx-auto max-w-[1256px] px-4">
            {selectedTab === "shopping-talk" && (
              <div>
                <div className="mb-6 flex justify-end">
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
                  {isLoadingPosts && (
                    <div className="text-center py-8 text-text-secondary">
                      로딩 중...
                    </div>
                  )}
                  {allPosts.map((post: CommunityPost | CommunityPostSearchResponse) => {
                    const uiPost = mapPostToUI(post)
                    const thumbnail = (post as CommunityPost).imagesUrl?.[0]
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
                          {uiPost.category && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start ${categoryColors[uiPost.category] || "bg-gray-100 text-gray-600"}`}
                            >
                              {uiPost.category}
                            </span>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h2 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                                {uiPost.title}
                              </h2>
                            </div>
                            <p className="text-sm text-text-secondary line-clamp-2 mb-3">{uiPost.content}</p>

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

                  <div ref={observerTarget} className="py-8">
                    {isFetchingNextPostsPage && (
                      <div className="text-center text-sm text-text-secondary flex items-center justify-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        더 불러오는 중...
                      </div>
                    )}
                    {!isFetchingNextPostsPage && !hasNextPostsPage && allPosts.length > 0 && (
                      <div className="text-center text-text-secondary text-sm">
                        모든 게시글을 불러왔습니다
                      </div>
                    )}
                    {!isLoadingPosts && allPosts.length === 0 && (
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
                <div className="mb-6 flex items-center justify-between">
                  {searchKeyword ? (
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-foreground">
                        "{searchKeyword}" 검색 결과
                      </h2>
                      <button
                        onClick={() => {
                          const currentTab = searchParams?.get("tab") || "chat-rooms"
                          router.push(`/community?tab=${currentTab}`)
                        }}
                        className="text-sm text-text-secondary hover:text-foreground transition-colors"
                      >
                        ✕ 검색 초기화
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <a href="/community/chat/create">
                    <Button className="bg-primary hover:bg-primary/90">채팅방 만들기</Button>
                  </a>
                </div>

                {/* 로딩 상태 */}
                {isLoadingChatRooms ? (
                  <div className="text-center py-12 text-text-secondary">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    채팅방 목록을 불러오는 중...
                  </div>
                ) : allChatRooms.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary">
                    {searchKeyword ? "검색 결과가 없습니다" : "아직 생성된 채팅방이 없습니다"}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {allChatRooms.map((room) => (
                        <a
                          key={room.chatRoomId}
                          href={`/messages?roomId=${room.chatRoomId}&type=GROUP`}
                          className="block rounded-lg border border-divider bg-background overflow-hidden transition-all hover:border-primary hover:shadow-md"
                        >
                          <div className="aspect-video overflow-hidden bg-background-section">
                            <img
                              src={room.thumbnailUrl || "/placeholder.svg?height=200&width=400"}
                              alt={room.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="mb-2 text-base font-semibold text-foreground text-center">{room.name}</h3>
                            <div className="flex items-center justify-center text-sm text-text-secondary">
                              <span className="text-xs">
                                {formatRelativeTime(room.createdAt)}
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                    
                    {/* 무한 스크롤 감지 영역 */}
                    <div ref={chatRoomObserverTarget} className="py-8">
                      {isFetchingNextChatRoomsPage && (
                        <div className="text-center text-sm text-text-secondary flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          더 불러오는 중...
                        </div>
                      )}
                      {!isFetchingNextChatRoomsPage && !hasNextChatRoomsPage && allChatRooms.length > 0 && (
                        <div className="text-center text-text-secondary text-sm">
                          모든 채팅방을 불러왔습니다
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}