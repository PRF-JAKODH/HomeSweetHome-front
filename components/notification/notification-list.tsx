"use client"

import { Notification } from "@/types/notification"
import { formatRelativeTime } from "@/lib/utils/date-util"
import { getCategoryDisplayName } from "@/lib/notification-util"

interface NotificationListProps {
  notifications: Notification[]
  onNotificationClick: (notification: Notification) => void
  onMarkAsRead: (id: number) => void
  onDeleteNotification: (id: number) => void
}

export function NotificationList({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onDeleteNotification
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">알림이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.notificationId}
          className={`bg-white rounded-xl border transition-all duration-200 ${
            !notification.isRead 
              ? "border-l-4 border-l-primary shadow-md bg-blue-50/30" 
              : "border-gray-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary px-3 py-1 bg-blue-100 rounded-full">
                  {getCategoryDisplayName(notification.categoryType)}
                </span>
                {!notification.isRead && (
                  <span className="text-xs font-bold text-white px-2.5 py-1 bg-primary rounded-full">NEW</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary font-semibold">
                  {notification.createdAt ? formatRelativeTime(notification.createdAt) : notification.createdAt.slice(0, 10)}
                </span>
                {notification.notificationId && (
                  <button
                    onClick={() => onDeleteNotification(notification.notificationId)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:shadow-sm whitespace-nowrap"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
            <h3
              onClick={() => onNotificationClick(notification)}
              className="text-base font-bold text-gray-900 mb-2 cursor-pointer hover:text-primary transition-colors"
            >
              {notification.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{notification.content}</p>
            {!notification.isRead && notification.notificationId && (
              <div className="flex justify-end">
                <button
                  onClick={() => onMarkAsRead(notification.notificationId)}
                  className="px-4 py-2 text-xs font-semibold text-primary hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-sm whitespace-nowrap"
                >
                  읽음
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
