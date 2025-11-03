/**
 * 카테고리 뱃지 컴포넌트
 */

import { CATEGORY_COLORS, type CategoryType } from '@/lib/constants/community'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category as CategoryType] || "bg-gray-100 text-gray-600 border border-gray-300"

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        colorClass,
        className
      )}
    >
      {category}
    </span>
  )
}
