'use client'

import type { Notification } from '@/types/notification'
import { Bell, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PushNotificationCardProps {
  notification: Notification
  onAction?: () => void
}

export function PushNotificationCard({ notification, onAction }: PushNotificationCardProps) {
  const router = useRouter()

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'ORDER':
        return '주문'
      case 'DELIVERY':
        return '배송'
      case 'REVIEW':
        return '리뷰'
      case 'CHAT':
        return '채팅'
      case 'EVENT':
        return '이벤트'
      case 'SYSTEM':
        return '시스템'
      default:
        return category
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'ORDER_DELIVERY':
        return 'bg-blue-100 text-blue-700'
      case 'REVIEW':
        return 'bg-purple-100 text-purple-700'
      case 'EVENT':
        return 'bg-orange-100 text-orange-700'
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-primary/10 text-primary'
    }
  }

  const formatRelativeTime = (isoString: string): string => {
    const now = new Date()
    const time = new Date(isoString)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    const minutes = Math.floor(diffInSeconds / 60)
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  const handleChevronClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    console.log(notification.redirectUrl)
    if (!notification.redirectUrl) return
    router.push(notification.redirectUrl)
  }

  return (
    <div
      className={`
        relative flex gap-3 p-4 rounded-lg border transition-all
        ${!notification.isRead 
          ? 'bg-blue-50 border-blue-200 shadow-md' 
          : 'bg-white border-gray-200 hover:shadow-md'
        }
      `}
      onClick={onAction}
    >
      {/* 아이콘 */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Bell className="h-5 w-5 text-primary" />
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        {/* 카테고리 뱃지 */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(notification.categoryType)}`}>
            {getCategoryLabel(notification.categoryType)}
          </span>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
          )}
          <span className="text-xs text-text-tertiary ml-auto">
            {notification.createdAt ? formatRelativeTime(notification.createdAt) : ''}
          </span>
        </div>

        {/* 제목 */}
        <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
          {notification.title}
        </p>

        {/* 내용 */}
        <p className="text-sm text-text-secondary line-clamp-2">
          {notification.content}
        </p>

        {/* 액션 버튼 (옵션) */}
        {onAction && (
          <button className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            자세히 보기
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="알림 링크로 이동"
        className="self-center p-2 ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors flex-shrink-0"
        onClick={handleChevronClick}
        disabled={!notification.redirectUrl}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

