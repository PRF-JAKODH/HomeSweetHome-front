"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { PostCard } from '@/components/community/post-card'
import { useInfiniteCommunityPosts } from '@/lib/hooks/use-community'
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll'
import { extractKeywords } from '@/lib/utils/keyword-extractor'
import { SORT_OPTIONS, type SortOption } from '@/lib/constants/community'

export default function ShoppingTalkPage() {
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0])

  // 무한 스크롤 데이터 페칭
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteCommunityPosts({
    size: 10,
    sort: selectedSort.sort,
    direction: selectedSort.direction,
  })

  // 무한 스크롤 observer
  const { observerTarget } = useInfiniteScroll({
    onIntersect: fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  })

  // 모든 페이지의 게시글을 평탄화
  const posts = useMemo(() =>
    data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  )

  // 게시글에 키워드 추가 (메모이제이션)
  const postsWithKeywords = useMemo(() =>
    posts.map((post) => ({
      post,
      keywords: extractKeywords(post.title, post.content, 3),
    })),
    [posts]
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b border-divider bg-background">
        <div className="mx-auto max-w-[1256px] px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">쇼핑수다</h1>
              <p className="mt-2 text-sm text-text-secondary">
                가구, 인테리어 쇼핑 정보를 나누는 공간
              </p>
            </div>
            <Link href="/community/shopping-talk/create">
              <Button className="bg-primary hover:bg-primary/90">글쓰기</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Posts List */}
      <main className="mx-auto max-w-[1256px] px-4 py-8">
        {/* Sort Options */}
        <div className="flex gap-2 mb-6">
          {SORT_OPTIONS.map((option) => (
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

        {/* Posts */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8 text-text-secondary">
              로딩 중...
            </div>
          )}

          {postsWithKeywords.map(({ post, keywords }) => (
            <PostCard key={post.postId} post={post} keywords={keywords} />
          ))}

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="py-8">
            {isFetchingNextPage && (
              <div className="text-center text-sm text-text-secondary flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                더 불러오는 중...
              </div>
            )}

            {!isFetchingNextPage && !hasNextPage && posts.length > 0 && (
              <div className="text-center text-text-secondary text-sm">
                모든 게시글을 불러왔습니다
              </div>
            )}

            {!isLoading && posts.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                게시글이 없습니다
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
