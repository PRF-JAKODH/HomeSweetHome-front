'use client';

import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import { useCommunityPosts } from '@/lib/hooks/use-community'
import { formatRelativeTime } from '@/lib/utils'
import { useTopCategories } from "@/lib/hooks/use-categories"
import { getCategoryLogo } from "@/lib/utils/category-logo"

export default function HomePage() {
  // 🔄 인기순으로 정렬된 쇼핑수다 게시글 가져오기
  const { data: postsData } = useCommunityPosts({
    page: 0,
    size: 4, // 홈페이지에는 4개만 표시
    sort: 'likeCount', // 인기순 (좋아요 순)
    direction: 'desc'
  })
  const { data: topCategories = [] } = useTopCategories()

  const popularShoppingTalk = postsData?.content.map(post => ({
    id: post.postId.toString(),
    category: post.category,
    title: post.title,
    author: post.authorName,
    comments: post.commentCount,
    likes: post.likeCount,
    time: formatRelativeTime(post.createdAt),
    thumbnail: post.imagesUrl?.[0], // 첫 번째 이미지를 썸네일로 사용
  })) || []
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Banner */}
        <section className="bg-background-section">
          <div className="mx-auto max-w-[1256px] px-4 py-12 md:py-16">
            <div
              className="relative overflow-hidden rounded-lg p-8 md:p-12 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%A9%E1%84%82%E1%85%B3%E1%86%AF%E1%84%8B%E1%85%B4%E1%84%8C%E1%85%B5%E1%86%B8%E1%84%92%E1%85%A9%E1%86%B7%E1%84%92%E1%85%AA%E1%84%86%E1%85%A7%E1%86%AB-zTE8aWRABDUqMOc9x5WZPexW3IfuwZ.avif)",
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="relative z-10 max-w-xl">
                <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl text-balance">나만의 공간을 특별하게</h1>
                <p className="mb-6 text-base text-white/90 md:text-lg leading-relaxed">
                  1000만이 선택한 No.1 인테리어 필수앱
                  <br />
                  홈스윗<span className="text-primary">홈</span>에서 시작하세요
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Categories */}
        <section className="py-8">
          <div className="mx-auto max-w-[1256px] px-4">
            <h2 className="mb-6 text-xl font-bold text-foreground">카테고리별 상품 찾기</h2>
            <div className="grid grid-cols-4 gap-4 md:gap-6">
              {topCategories?.map((cat) => {
                const logoSrc = getCategoryLogo(cat.name)
                return (
                  <a
                    key={cat.id}
                    href={`/store?category=${cat.id}`}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 transition hover:shadow-md"
                  >
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-50">
                      <img
                        src={logoSrc}
                        alt={cat.name}
                        className="h-12 w-12 object-contain transition group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          target.src = '/placeholder.svg'
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        {/* Popular Shopping Talk */}
        <section className="py-12">
          <div className="mx-auto max-w-[1256px] px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">인기 쇼핑수다</h2>
                <p className="text-sm text-text-secondary">다양한 인테리어 정보를 나눠보세요</p>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary-dark" asChild>
                <a href="/community/shopping-talk">전체보기 →</a>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {popularShoppingTalk.map((post) => {
                // S3 URL 정리
                const cleanThumbnail = post.thumbnail ?
                  post.thumbnail.split('/').slice(0, 4).join('/') + '/' + post.thumbnail.split('/').pop() :
                  null

                return (
                  <a
                    key={post.id}
                    href={`/community/shopping-talk/${post.id}`}
                    className="group block rounded-lg border border-divider bg-background p-4 transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      {/* 메인 콘텐츠 */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {post.category}
                          </span>
                          <span className="text-xs text-text-secondary">{post.time}</span>
                        </div>
                        <h3 className="mb-3 text-base font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>{post.author}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 썸네일 이미지 */}
                      {cleanThumbnail && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-surface">
                          <img
                            src={cleanThumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              if (target.src !== post.thumbnail) {
                                target.src = post.thumbnail!
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
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-divider bg-background py-12">
        <div className="mx-auto max-w-[1256px] px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 text-xl font-bold">
                홈스윗<span className="text-primary">홈</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                1000만이 선택한
                <br />
                No.1 인테리어 필수앱
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-foreground">고객센터</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="/help" className="hover:text-foreground">
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-foreground">
                    1:1 문의
                  </a>
                </li>
                <li>
                  <a href="/notice" className="hover:text-foreground">
                    공지사항
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-foreground">회사소개</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="/about" className="hover:text-foreground">
                    회사소개
                  </a>
                </li>
                <li>
                  <a href="/recruit" className="hover:text-foreground">
                    채용정보
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-foreground">
                    이용약관
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-foreground">SNS</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-divider pt-8 text-xs text-text-secondary">
            © 2025 홈스윗홈. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
