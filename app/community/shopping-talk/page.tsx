"use client"

import { Button } from "@/components/ui/button"
import { useCommunityPosts } from '@/lib/hooks/use-community'
import { formatRelativeTime } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  추천: "bg-primary/10 text-primary",
  질문: "bg-accent/10 text-accent",
  정보: "bg-green-500/10 text-green-600",
  후기: "bg-purple-500/10 text-purple-600",
}

export default function ShoppingTalkPage() {
  const { data: postsData, isLoading, error } = useCommunityPosts({
    page: 0,
    size: 10,
    sort: 'createdAt',
    direction: 'desc'
  })
  const talkPosts = postsData?.content.map(post => ({
    id: post.postId,
    category: "일반",
    title: post.title,
    content: post.content,
    author: post.authorName,
    createdAt: formatRelativeTime(post.createdAt),
    views: post.viewCount,
    likes: post.likeCount,
    comments: post.commentCount,
  })) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-divider bg-background">
        <div className="mx-auto max-w-[1256px] px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">쇼핑수다</h1>
              <p className="mt-2 text-sm text-text-secondary">가구, 인테리어 쇼핑 정보를 나누는 공간</p>
            </div>
            <a href="/community/shopping-talk/create">
              <Button className="bg-primary hover:bg-primary/90">글쓰기</Button>
            </a>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="mx-auto max-w-[1256px] px-4 py-8">
        <div className="space-y-4">
          {talkPosts.map((post) => (
            <a
              key={post.id}
              href={`/community/shopping-talk/${post.id}`}
              className="block bg-background border border-divider rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Category Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    categoryColors[post.category] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {post.category}
                </span>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">{post.content}</p>

                  {/* Post Meta */}
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="font-medium text-foreground">{post.author}</span>
                    <span>{post.createdAt}</span>
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
                        {post.views}
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
                        {post.likes}
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
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
