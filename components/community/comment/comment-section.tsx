/**
 * 댓글 섹션 컴포넌트 (폼 + 리스트)
 */

import { memo } from 'react'
import { CommentForm } from './comment-form'
import { CommentList } from './comment-list'
import type { CommunityComment } from '@/types/api/community'

interface CommentSectionProps {
  comments: CommunityComment[]
  currentUserId: number | null
  isAuthenticated: boolean
  onCreateComment: (content: string) => void
  onUpdateComment: (commentId: number, content: string) => void
  onDeleteComment: (commentId: number) => void
  onLikeComment: (commentId: number) => void
  isCreating?: boolean
}

function CommentSectionComponent({
  comments,
  currentUserId,
  isAuthenticated,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onLikeComment,
  isCreating = false,
}: CommentSectionProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-foreground">
        댓글 <span className="text-primary">{comments.length.toLocaleString()}</span>
      </h2>

      {/* Comment Form */}
      {isAuthenticated ? (
        <CommentForm onSubmit={onCreateComment} isSubmitting={isCreating} />
      ) : (
        <div className="mb-6 p-4 bg-surface rounded-lg border border-divider text-center">
          <p className="text-sm text-text-secondary">
            댓글을 작성하려면 로그인이 필요합니다
          </p>
        </div>
      )}

      {/* Comment List */}
      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        isAuthenticated={isAuthenticated}
        onEdit={onUpdateComment}
        onDelete={onDeleteComment}
        onLike={onLikeComment}
      />
    </div>
  )
}

export const CommentSection = memo(CommentSectionComponent)
