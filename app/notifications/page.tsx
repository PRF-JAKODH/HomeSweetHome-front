"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Notification } from "@/types/notification"
import { useNotification } from "@/hooks/use-notification"
import { NotificationList } from "@/components/notification/notification-list"
import { NOTIFICATION_FILTER_CATEGORIES, getCategoryTypeFromDisplayName } from "@/lib/notification-util"
import { toast } from "@/hooks/use-toast"
import { deleteNotifications as deleteNotificationsAPI } from "@/api/notification-api"

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, unreadCount, markAsReadOnServer, markAllAsReadOnServer, deleteNotificationFromServer, loadNotificationsFromServer, setNotifications } = useNotification()
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedStatus, setSelectedStatus] = useState("전체")

  // 페이지 진입 시 서버와 동기화
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const result = await loadNotificationsFromServer()
        console.log("loadNotificationsFromServer", result)
      } catch (error) {
        console.error('Failed to sync notifications with server:', error)
        toast({
          title: "동기화 실패",
          description: "서버와 알림을 동기화하는 중 오류가 발생했습니다.",
          variant: "destructive",
          duration: 5000,
        })
      }
    }

    syncWithServer()
  }, [loadNotificationsFromServer])

  const categories = NOTIFICATION_FILTER_CATEGORIES

  const filteredNotifications = useMemo(() => notifications.filter((notification: Notification) => {
    const categoryMatch = selectedCategory === "전체" || 
      (notification.categoryType && getCategoryTypeFromDisplayName(selectedCategory) === notification.categoryType)
    const statusMatch =
      selectedStatus === "전체" ||
      (selectedStatus === "읽지 않음" && !notification.isRead) ||
      (selectedStatus === "읽음" && notification.isRead)
    return categoryMatch && statusMatch
  }), [notifications, selectedCategory, selectedStatus])

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.notificationId) {
      await markAsReadOnServer(notification.notificationId)
      router.push(notification.redirectUrl)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    const result = await deleteNotificationFromServer(id)
    if (!result.success) {
      toast({
        title: "삭제 실패",
        description: "알림 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1256px] px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">알림</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <p className="text-base text-gray-600">
              읽지 않은 알림 <span className="font-bold text-primary ml-1">{unreadCount}개</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-6">
            {/* Category Filter */}
            <div className="flex-1 min-w-[240px]">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? "bg-primary text-white shadow-sm scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[240px]">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">상태</label>
              <div className="flex flex-wrap gap-2">
                {["전체", "읽지 않음", "읽음"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedStatus === status
                        ? "bg-primary text-white shadow-sm scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  if (notifications.length === 0) return
                  const ids = notifications.map(n => n.notificationId)
                  await deleteNotificationsAPI(ids)
                  setNotifications([])
                } catch (error) {
                  console.error('Failed to delete all notifications:', error)
                  toast({
                    title: "전체 삭제 실패",
                    description: "서버 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
                    variant: "destructive",
                    duration: 5000,
                  })
                }
              }}
              disabled={notifications.length === 0}
              aria-disabled={notifications.length === 0}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md 
                ${notifications.length === 0 
                  ? 'bg-red-400 text-white opacity-50 cursor-not-allowed hover:shadow-none' 
                  : 'bg-red-600 text-white hover:bg-red-600/90'}`}
            >
              전체 삭제
            </button>
            <button
              onClick={async () => {
                const result = await markAllAsReadOnServer()
                if (!result.success) {
                  toast({
                    title: "전체 읽음 처리 실패",
                    description: "서버 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
                    variant: "destructive",
                    duration: 5000,
                  })
                }
              }}
              disabled={notifications.length === 0}
              aria-disabled={notifications.length === 0}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md 
                ${notifications.length === 0 
                  ? 'bg-primary/60 text-white opacity-50 cursor-not-allowed hover:shadow-none' 
                  : 'bg-primary text-white hover:bg-primary/90'}`}
            >
              전체 읽음 처리
            </button>

          </div>
        </div>

        {/* Notifications List */}
        <NotificationList
          notifications={filteredNotifications}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={markAsReadOnServer}
          onDeleteNotification={handleDeleteNotification}
        />
      </div>
    </div>
  )
}
