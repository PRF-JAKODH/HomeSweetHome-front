"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNotification } from "@/hooks/use-notification"
import { formatRelativeTime } from "@/lib/utils/date-util"
import { getCategoryDisplayName } from "@/lib/notification-util"

export function NotificationDropdown () {
  const router = useRouter()
  const { notifications, unreadCount, markAsReadOnServer, markAllAsReadOnServer } = useNotification()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:flex relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 z-[200]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-divider">
          <span className="text-sm font-semibold">알림</span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                markAllAsReadOnServer()
              }}
            >
              전체 읽음
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-primary hover:text-primary"
              onClick={() => {
                setOpen(false)
                router.push("/notifications")
              }}
            >
              모두 보기
            </Button>
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-secondary">알림이 없습니다</div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.notificationId}
                onClick={async () => {
                  if (notification.redirectUrl) {
                    await markAsReadOnServer(notification.notificationId)
                    setOpen(false)
                    router.push(notification.redirectUrl)
                  }
                }}
                className={`px-3 py-3 border-b border-divider last:border-0 cursor-pointer hover:bg-background-section transition-colors ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary">{getCategoryDisplayName(notification.categoryType)}</span>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-text-secondary line-clamp-2">{notification.content}</p>
                    <span className="text-xs text-text-tertiary mt-1 inline-block">
                      {notification.createdAt ? formatRelativeTime(notification.createdAt) : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


