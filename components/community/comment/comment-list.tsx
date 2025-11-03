/**
 * 댓글 목록 컴포넌트
 */

import { memo } from 'react'
import { CommentItem } from './comment-item'
import type { CommunityComment } from '@/types/api/community'

interface CommentListProps {
  comments: CommunityComment[]
  currentUserId: number | null
  isAuthenticated: boolean
  onEdit: (commentId: number, content: string) => void
  onDelete: (commentId: number) => void
  onLike: (commentId: number) => void
}

function CommentListComponent({
  comments,
  currentUserId,
  isAuthenticated,
  onEdit,
  onDelete,
  onLike,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        첫 댓글을 작성해보세요
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          isAuthor={currentUserId === comment.authorId}
          isAuthenticated={isAuthenticated}
          onEdit={onEdit}
          onDelete={onDelete}
          onLike={onLike}
        />
      ))}
    </div>
  )
}

export const CommentList = memo(CommentListComponent)
