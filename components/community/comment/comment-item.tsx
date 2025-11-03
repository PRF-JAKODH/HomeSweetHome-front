/**
 * 댓글 아이템 컴포넌트
 */

import { memo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Comment {
  commentId: number
  authorName: string
  authorId: number
  content: string
  createdAt: string
  likeCount: number
}

interface CommentItemProps {
  comment: Comment
  isAuthor: boolean
  isAuthenticated: boolean
  onEdit: (commentId: number, content: string) => void
  onDelete: (commentId: number) => void
  onLike: (commentId: number) => void
  isEditing?: boolean
  isDeleting?: boolean
  isLiking?: boolean
}

function CommentItemComponent({
  comment,
  isAuthor,
  isAuthenticated,
  onEdit,
  onDelete,
  onLike,
  isEditing: isEditingExternal,
  isDeleting = false,
  isLiking = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(comment.content)
  }

  const handleSubmitEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.commentId, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      onDelete(comment.commentId)
    }
  }

  return (
    <div className="border-b border-divider pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <img
          src="/user-avatar-1.png"
          alt={comment.authorName}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-medium text-foreground">
              {comment.authorName}
            </span>
            <span className="text-xs text-text-secondary">
              {comment.createdAt}
            </span>
          </div>

          {/* Edit Mode */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-lg border border-divider bg-background p-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                rows={3}
                maxLength={1000}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitEdit}
                  disabled={!editContent.trim() || editContent === comment.content}
                  className="text-xs"
                >
                  수정 완료
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="text-xs"
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Content */}
              <p className="text-sm text-foreground leading-relaxed mb-2">
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onLike(comment.commentId)}
                  disabled={isLiking || !isAuthenticated}
                  className={cn(
                    "flex items-center gap-1 text-xs transition-colors",
                    !isAuthenticated
                      ? "opacity-50 cursor-not-allowed text-text-secondary"
                      : "text-text-secondary hover:text-foreground"
                  )}
                  aria-label="좋아요"
                >
                  <Heart className="h-4 w-4" />
                  <span>{comment.likeCount.toLocaleString()}</span>
                </button>

                {isAuthor && (
                  <>
                    <button
                      onClick={handleStartEdit}
                      className="text-xs text-text-secondary hover:text-foreground transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-xs text-red-500 hover:text-red-600 transition-colors"
                    >
                      {isDeleting ? '삭제 중...' : '삭제'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export const CommentItem = memo(CommentItemComponent)
