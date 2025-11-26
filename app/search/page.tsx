"use client"

import { useMemo } from "react"
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
          </header>

          {productsLoading ? (
            <div className="py-6 text-sm text-muted-foreground">상품을 불러오는 중...</div>
          ) : productResults.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">관련 상품이 없습니다.</div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {productResults.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="min-w-[160px] max-w-[180px] group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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
                      {typeof item.averageRating === "number" && typeof item.reviewCount === "number" && (
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
          </header>

          {communitiesLoading ? (
            <div className="py-6 text-sm text-muted-foreground">게시글을 불러오는 중...</div>
          ) : communityResults.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">관련 쇼핑수다 글이 없습니다.</div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {communityResults.slice(0, 10).map((post) => (
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
          </header>

          {chatRoomsLoading ? (
            <div className="py-6 text-sm text-muted-foreground">채팅방을 불러오는 중...</div>
          ) : chatRoomResults.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">관련 채팅방이 없습니다.</div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {chatRoomResults.slice(0, 10).map((room) => (
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
          )}
        </section>
      </main>
    </div>
  )
}


