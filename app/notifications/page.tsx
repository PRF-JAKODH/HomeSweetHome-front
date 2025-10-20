"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedStatus, setSelectedStatus] = useState("전체")

  const categories = ["전체", "주문/배송", "리뷰", "이벤트", "시스템"]

  useEffect(() => {
    const storedNotifications = localStorage.getItem("ohouse_notifications")
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications))
    }
  }, [])

  const filteredNotifications = notifications.filter((notification) => {
    const categoryMatch = selectedCategory === "전체" || notification.category === selectedCategory
    const statusMatch =
      selectedStatus === "전체" ||
      (selectedStatus === "읽지 않음" && !notification.read) ||
      (selectedStatus === "읽음" && notification.read)
    return categoryMatch && statusMatch
  })

  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updatedNotifications)
    localStorage.setItem("ohouse_notifications", JSON.stringify(updatedNotifications))
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updatedNotifications)
    localStorage.setItem("ohouse_notifications", JSON.stringify(updatedNotifications))
  }

  const deleteNotification = (id: number) => {
    const updatedNotifications = notifications.filter((n) => n.id !== id)
    setNotifications(updatedNotifications)
    localStorage.setItem("ohouse_notifications", JSON.stringify(updatedNotifications))
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1256px] px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">알림</h1>
          <p className="text-sm text-text-secondary">
            읽지 않은 알림 <span className="font-semibold text-primary">{unreadCount}개</span>
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-divider p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-white"
                        : "bg-background-section text-foreground hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">상태</label>
              <div className="flex flex-wrap gap-2">
                {["전체", "읽지 않음", "읽음"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? "bg-primary text-white"
                        : "bg-background-section text-foreground hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-divider flex gap-2">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-background-section text-foreground hover:bg-gray-200 transition-colors"
            >
              전체 읽음 처리
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg border border-divider p-12 text-center">
              <p className="text-text-secondary">알림이 없습니다</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border border-divider p-4 transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary px-2 py-1 bg-blue-50 rounded">
                        {notification.category}
                      </span>
                      {!notification.read && (
                        <span className="text-xs font-medium text-white px-2 py-1 bg-primary rounded">NEW</span>
                      )}
                      <span className="text-xs text-text-tertiary ml-auto">{notification.time}</span>
                    </div>
                    <h3
                      onClick={() => handleNotificationClick(notification)}
                      className="text-base font-semibold text-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                    >
                      {notification.title}
                    </h3>
                    <p className="text-sm text-text-secondary">{notification.content}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-3 py-1 text-xs font-medium text-primary hover:bg-blue-50 rounded transition-colors"
                      >
                        읽음
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
