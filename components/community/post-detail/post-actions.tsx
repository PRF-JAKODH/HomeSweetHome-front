/**
 * 게시글 액션 컴포넌트
 * - 좋아요 버튼
 * - 댓글 수 표시
 */

import { memo } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostActionsProps {
  likes: number
  comments: number
  isLiked: boolean
  isAuthenticated: boolean
  onLikeToggle: () => void
  isTogglingLike?: boolean
}

function PostActionsComponent({
  likes,
  comments,
  isLiked,
  isAuthenticated,
  onLikeToggle,
  isTogglingLike = false,
}: PostActionsProps) {
  return (
    <div className="mb-8 flex items-center gap-4 border-y border-divider py-4">
      <button
        onClick={onLikeToggle}
        disabled={isTogglingLike || !isAuthenticated}
        className={cn(
          "flex items-center gap-2 transition-colors",
          isLiked ? "text-red-500" : "text-text-secondary hover:text-foreground",
          !isAuthenticated && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        <Heart
          className={cn("h-6 w-6", isLiked && "fill-current")}
        />
        <span className="text-sm font-medium">{likes.toLocaleString()}</span>
      </button>

      <div className="flex items-center gap-2 text-text-secondary">
        <MessageCircle className="h-6 w-6" />
        <span className="text-sm font-medium">{comments.toLocaleString()}</span>
      </div>

      {!isAuthenticated && (
        <span className="text-xs text-text-secondary ml-auto">
          로그인하여 좋아요를 눌러보세요
        </span>
      )}
    </div>
  )
}

export const PostActions = memo(PostActionsComponent)
