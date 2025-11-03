/**
 * 게시글 통계 컴포넌트 (조회수, 좋아요, 댓글)
 */

import { Eye, ThumbsUp, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostStatsProps {
  views: number
  likes: number
  comments: number
  className?: string
  showLabels?: boolean
}

export function PostStats({
  views,
  likes,
  comments,
  className,
  showLabels = false,
}: PostStatsProps) {
  return (
    <div className={cn("flex items-center gap-4 text-xs text-text-secondary", className)}>
      <span className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {showLabels && '조회 '}
        {views.toLocaleString()}
      </span>
      <span className="flex items-center gap-1">
        <ThumbsUp className="h-3.5 w-3.5" />
        {showLabels && '좋아요 '}
        {likes.toLocaleString()}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle className="h-3.5 w-3.5" />
        {showLabels && '댓글 '}
        {comments.toLocaleString()}
      </span>
    </div>
  )
}
