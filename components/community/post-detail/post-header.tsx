/**
 * 게시글 상세 헤더 컴포넌트
 * - 카테고리, 작성일, 조회수
 * - 작성자 정보
 * - 수정/삭제/DM 버튼
 */

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '../category-badge'
import { MessageCircle } from 'lucide-react'

interface PostHeaderProps {
  category: string
  title: string
  authorName: string
  authorAvatar?: string
  createdAt: string
  viewCount: number
  isAuthor: boolean
  onEdit?: () => void
  onDelete?: () => void
  onDM?: () => void
  isDeleting?: boolean
}

function PostHeaderComponent({
  category,
  title,
  authorName,
  authorAvatar = '/user-avatar-1.png',
  createdAt,
  viewCount,
  isAuthor,
  onEdit,
  onDelete,
  onDM,
  isDeleting = false,
}: PostHeaderProps) {
  return (
    <div className="mb-6">
      {/* Meta Info */}
      <div className="mb-4 flex items-center gap-3">
        <CategoryBadge category={category} />
        <span className="text-sm text-text-secondary">{createdAt}</span>
        <span className="text-sm text-text-secondary">조회 {viewCount.toLocaleString()}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground mb-6">{title}</h1>

      {/* Author Info */}
      <div className="flex items-center justify-between border-y border-divider py-4">
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={authorName}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-foreground">{authorName}</p>
            <p className="text-sm text-text-secondary">{createdAt}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isAuthor && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="text-sm"
              >
                수정
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                disabled={isDeleting}
                className="text-sm text-red-500 hover:text-red-600"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </>
          )}
          {onDM && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDM}
              className="gap-2 bg-transparent"
            >
              <MessageCircle className="h-4 w-4" />
              DM
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export const PostHeader = memo(PostHeaderComponent)
