/**
 * 게시글 카드 컴포넌트
 */

import { memo } from 'react'
import Link from 'next/link'
import { CategoryBadge } from './category-badge'
import { cleanS3Url } from '@/lib/utils/image'
import { getKeywordStyle } from '@/lib/utils/keyword-extractor'
import { Eye, ThumbsUp, MessageCircle } from 'lucide-react'
import type { CommunityPost } from '@/types/api/community'

interface PostCardProps {
  post: CommunityPost
  keywords?: string[]
}

function PostCardComponent({ post, keywords = [] }: PostCardProps) {
  const thumbnail = cleanS3Url(post.imagesUrl?.[0])

  return (
    <Link
      href={`/community/shopping-talk/${post.postId}`}
      className="block bg-background border border-divider rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Category Badge */}
        <CategoryBadge category={post.category} className="self-start" />

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h2 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
              {post.title}
            </h2>

            {/* Keywords */}
            {keywords.map((keyword, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getKeywordStyle(keyword)}`}
              >
                #{keyword}
              </span>
            ))}
          </div>

          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {post.content}
          </p>

          {/* Post Meta */}
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="font-medium text-foreground">{post.authorName}</span>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {post.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {post.commentCount}
              </span>
            </div>
          </div>
        </div>

        {/* Thumbnail Image */}
        {thumbnail && (
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-surface">
            <img
              src={thumbnail}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>
    </Link>
  )
}

export const PostCard = memo(PostCardComponent)
