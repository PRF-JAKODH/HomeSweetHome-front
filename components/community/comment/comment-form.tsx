/**
 * 댓글 작성 폼 컴포넌트
 */

import { memo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentFormProps {
  onSubmit: (content: string) => void
  isSubmitting?: boolean
  placeholder?: string
}

function CommentFormComponent({
  onSubmit,
  isSubmitting = false,
  placeholder = '댓글을 입력하세요...',
}: CommentFormProps) {
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter로 제출
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="mb-6">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-divider bg-background p-4 text-sm text-foreground placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        rows={3}
        maxLength={1000}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          {content.length}/1000 · Ctrl+Enter로 작성
        </span>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? '작성 중...' : '댓글 작성'}
        </Button>
      </div>
    </div>
  )
}

export const CommentForm = memo(CommentFormComponent)
