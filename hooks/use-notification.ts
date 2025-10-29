import { useNotificationStore } from '@/providers/notification-provider'

export function useNotification() {
  const notifications = useNotificationStore((state) => state.notifications)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const isConnected = useNotificationStore((state) => state.isConnected)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const deleteNotification = useNotificationStore((state) => state.deleteNotification)
  const setNotifications = useNotificationStore((state) => state.setNotifications)
  const setConnectionStatus = useNotificationStore((state) => state.setConnectionStatus)

  return {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setNotifications,
    setConnectionStatus,
  }
}

