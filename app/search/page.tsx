"use client"

import { useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { useInfiniteProductPreviews } from "@/lib/hooks/use-products"
import { useInfiniteChatRooms } from "@/lib/hooks/use-chat-rooms"
import { ChatRoomSortType } from "@/types/api/chat"
import { searchCommunityPosts } from "@/lib/api/search"
import { CommunitySortType, type CommunityPostSearchResponse } from "@/types/api/community"
import { CategoryHero } from "@/components/store/category-hero"
import { Star } from "lucide-react"

export default function UnifiedSearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const keyword = searchParams.get("keyword") || ""

  // 상품 검색 (첫 페이지만, RECOMMENDED)
  const {
    products: productResults = [],
    isLoading: productsLoading,
  } = useInfiniteProductPreviews(
    undefined,
    "RECOMMENDED",
    10,
    keyword || undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  )

  // 오늘의 채팅방 검색 (첫 페이지만, RECOMMENDED)
  const {
    data: chatRoomsData,
    isLoading: chatRoomsLoading,
  } = useInfiniteChatRooms(
    keyword || undefined,
    ChatRoomSortType.RECOMMENDED,
    10,
  )
  const chatRoomResults = useMemo(
    () => chatRoomsData?.pages.flatMap((page) => page.contents) ?? [],
    [chatRoomsData],
  )

  // 쇼핑수다(커뮤니티) 검색 (첫 페이지만, RECOMMENDED)
  const {
    data: communityData,
    isLoading: communitiesLoading,
  } = useInfiniteQuery({
    queryKey: ["unified-community-search", keyword],
    queryFn: ({ pageParam }) =>
      searchCommunityPosts({
        nextCursor: pageParam as string | null | undefined,
        keyword: keyword || undefined,
        sortType: CommunitySortType.RECOMMENDED,
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
  const communityResults: CommunityPostSearchResponse[] =
    communityData?.pages.flatMap((page) => page.contents) ?? []

  // ===== 공통 캐러셀 유틸 =====
  const PRODUCT_CHUNK_SIZE = 6
  const COMMUNITY_CHUNK_SIZE = 5
  const CHATROOM_CHUNK_SIZE = 5

  const productPages = useMemo(() => {
    const pages: typeof productResults[] = []
    for (let i = 0; i < productResults.length; i += PRODUCT_CHUNK_SIZE) {
      pages.push(productResults.slice(i, i + PRODUCT_CHUNK_SIZE))
    }
    return pages
  }, [productResults])
  const productTotalPages = productPages.length || 1
  const [productPageIndex, setProductPageIndex] = useState(0)

  const communityPages = useMemo(() => {
    const pages: CommunityPostSearchResponse[][] = []
    for (let i = 0; i < communityResults.length; i += COMMUNITY_CHUNK_SIZE) {
      pages.push(communityResults.slice(i, i + COMMUNITY_CHUNK_SIZE))
    }
    return pages
  }, [communityResults])
  const communityTotalPages = communityPages.length || 1
  const [communityPageIndex, setCommunityPageIndex] = useState(0)

  const chatRoomPages = useMemo(() => {
    const pages: typeof chatRoomResults[] = []
    for (let i = 0; i < chatRoomResults.length; i += CHATROOM_CHUNK_SIZE) {
      pages.push(chatRoomResults.slice(i, i + CHATROOM_CHUNK_SIZE))
    }
    return pages
  }, [chatRoomResults])
  const chatRoomTotalPages = chatRoomPages.length || 1
  const [chatRoomPageIndex, setChatRoomPageIndex] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1256px] px-4 py-8 space-y-12">
        {/* 통합 검색 히어로 */}
        <CategoryHero variant="unified-search" />

        {/* 1. 상품 섹션 */}
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">상품</h2>
              <p className="text-xs text-muted-foreground">
                관련 상품을 한 줄로 보여줍니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {productPages.length > 1 && (
                <div className="hidden items-center gap-2 md:flex">
                  <button
                    type="button"
                    onClick={() => setProductPageIndex((prev) => Math.max(prev - 1, 0))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    disabled={productPageIndex === 0}
                    aria-label="이전 상품"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setProductPageIndex((prev) =>
                        prev >= Math.max(productTotalPages - 1, 0) ? prev : prev + 1,
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    disabled={productPageIndex >= Math.max(productTotalPages - 1, 0)}
                    aria-label="다음 상품"
                  >
                    ›
                  </button>
                </div>
              )}
              {productResults.length > 0 && (
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() =>
                    router.push(
                      keyword.trim()
                        ? `/store?keyword=${encodeURIComponent(keyword.trim())}`
                        : "/store",
                    )
                  }
                >
                  더보기
                </button>
              )}
            </div>
          </header>

          {productsLoading ? (
            <div className="py-6 text-sm text-muted-foreground">상품을 불러오는 중...</div>
          ) : productResults.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">관련 상품이 없습니다.</div>
          ) : (
            <div className="overflow-hidden pb-2">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${productPageIndex * 100}%)` }}
              >
                {productPages.map((page, pageIndex) => (
                  <div
                    key={`product-page-${pageIndex}`}
                    className="flex w-full min-w-full justify-start gap-4"
                  >
                    {page.map((item) => (
                      <div
                        key={item.id}
                        className="w-[220px] flex-none group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <button
                          onClick={() => router.push(`/store/products/${item.id}`)}
                          className="flex flex-1 flex-col"
                        >
                          <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-1 px-3 py-3 text-left">
                            <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                              {item.name}
                            </p>
                            <div className="space-y-1">
                              {typeof item.discountRate === "number" && item.discountRate > 0 && (
                                <span className="text-xs font-semibold text-primary">
                                  {item.discountRate}%
                                </span>
                              )}
                              <p className="text-base font-bold text-gray-900">
                                {(() => {
                                  if (typeof item.basePrice === "number") {
                                    const finalPrice =
                                      typeof item.discountRate === "number" && item.discountRate > 0
                                        ? Math.round(item.basePrice * (1 - item.discountRate / 100))
                                        : item.basePrice
                                    return `${finalPrice.toLocaleString()}원`
                                  }
                                  return ""
                                })()}
                              </p>
                              {typeof item.discountRate === "number" &&
                                item.discountRate > 0 &&
                                typeof item.basePrice === "number" && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {item.basePrice.toLocaleString()}원
                                  </p>
                                )}
                            </div>
                            {/* 평점 및 리뷰 개수 */}
                            {typeof item.averageRating === "number" &&
                              typeof item.reviewCount === "number" && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-primary text-primary" />
                                  <span className="font-medium text-foreground">
                                    {item.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    ({item.reviewCount.toLocaleString()})
                                  </span>
                                </div>
                              )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 2. 쇼핑수다 섹션 */}
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">쇼핑수다</h2>
              <p className="text-xs text-muted-foreground">
                쇼핑 후기, 팁, 질문 글을 한 줄로 모아봤어요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {communityPages.length > 1 && (
                <div className="hidden items-center gap-2 md:flex">
                  <button
                    type="button"
                    onClick={() => setCommunityPageIndex((prev) => Math.max(prev - 1, 0))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    disabled={communityPageIndex === 0}
                    aria-label="이전 쇼핑수다"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCommunityPageIndex((prev) =>
                        prev >= Math.max(communityTotalPages - 1, 0) ? prev : prev + 1,
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    disabled={communityPageIndex >= Math.max(communityTotalPages - 1, 0)}
                    aria-label="다음 쇼핑수다"
                  >
                    ›
                  </button>
                </div>
              )}
              {communityResults.length > 0 && (
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() =>
                    router.push(
                      keyword.trim()
                        ? `/community?tab=shopping-talk&keyword=${encodeURIComponent(keyword.trim())}`
                        : `/community?tab=shopping-talk`,
                    )
                  }
                >
                  더보기
                </button>
              )}
            </div>
          </header>

          {communitiesLoading ? (
            <div className="py-6 text-sm text-muted-foreground">게시글을 불러오는 중...</div>
          ) : communityResults.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">관련 쇼핑수다 글이 없습니다.</div>
          ) : (
            <div className="overflow-hidden pb-2">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${communityPageIndex * 100}%)` }}
              >
                {communityPages.map((page, pageIndex) => (
                  <div
                    key={`community-page-${pageIndex}`}
                    className="flex w-full min-w-full justify-start gap-4"
                  >
                    {page.map((post) => (
                      <button
                        key={post.postId}
                        onClick={() => router.push(`/community/shopping-talk/${post.postId}`)}
                        className="min-w-[220px] max-w-[260px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <p className="mb-1 text-xs font-medium text-primary">
                          {post.category || "쇼핑수다"}
                        </p>
                        <p className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">
                          {post.title}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {post.snippet}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>조회 {post.viewCount}</span>
                          <span>좋아요 {post.likeCount}</span>
                          <span>댓글 {post.commentCount}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. 오늘의채팅방 섹션 */}
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">오늘의채팅방</h2>
              <p className="text-xs text-muted-foreground">
                지금 인기 있는 채팅방을 한 줄로 모아봤어요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {chatRoomPages.length > 1 && (
                <div className="hidden items-center gap-2 md:flex">
                  <button
                    type="button"
                    onClick={() => setChatRoomPageIndex((prev) => Math.max(prev - 1, 0))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    disabled={chatRoomPageIndex === 0}
                    aria-label="이전 채팅방"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setChatRoomPageIndex((prev) =>
                        prev >= Math.max(chatRoomTotalPages - 1, 0) ? prev : prev + 1,
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    disabled={chatRoomPageIndex >= Math.max(chatRoomTotalPages - 1, 0)}
                    aria-label="다음 채팅방"
                  >
                    ›
                  </button>
                </div>
              )}
              {chatRoomResults.length > 0 && (
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() =>
                    router.push(
                      keyword.trim()
                        ? `/community?tab=chat-rooms&keyword=${encodeURIComponent(keyword.trim())}`
                        : `/community?tab=chat-rooms`,
                    )
                  }
                >
                  더보기
                </button>
              )}
            </div>
          </header>

          {chatRoomsLoading ? (
            <div className="py-6 text-sm text-muted-foreground">채팅방을 불러오는 중...</div>
          ) : chatRoomResults.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">관련 채팅방이 없습니다.</div>
          ) : (
            <div className="overflow-hidden pb-2">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${chatRoomPageIndex * 100}%)` }}
              >
                {chatRoomPages.map((page, pageIndex) => (
                  <div
                    key={`chatroom-page-${pageIndex}`}
                    className="flex w-full min-w-full justify-start gap-4"
                  >
                    {page.map((room) => (
                      <button
                        key={room.chatRoomId}
                        onClick={() =>
                          router.push(`/messages?roomId=${room.chatRoomId}&type=GROUP`)
                        }
                        className="min-w-[220px] max-w-[260px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="aspect-video w-full overflow-hidden bg-gray-100">
                          <img
                            src={room.thumbnailUrl || "/placeholder.svg?height=200&width=400"}
                            alt={room.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="line-clamp-2 text-sm font-semibold text-foreground">
                            {room.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}


