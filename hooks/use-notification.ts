import { useNotificationStore } from '@/providers/notification-provider'

export function useNotification() {
  const notifications = useNotificationStore((state) => state.notifications)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const isConnected = useNotificationStore((state) => state.isConnected)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const markAsReadOnServer = useNotificationStore((state) => state.markAsReadOnServer)
  const markAllAsReadOnServer = useNotificationStore((state) => state.markAllAsReadOnServer)
  const deleteNotificationFromServer = useNotificationStore((state) => state.deleteNotificationFromServer)
  const loadNotificationsFromServer = useNotificationStore((state) => state.loadNotificationsFromServer)
  const setNotifications = useNotificationStore((state) => state.setNotifications)
  const setConnectionStatus = useNotificationStore((state) => state.setConnectionStatus)
  const resetNotifications = useNotificationStore((state) => state.resetNotifications)

  return {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsReadOnServer,
    markAllAsReadOnServer,
    deleteNotificationFromServer,
    loadNotificationsFromServer,
    setNotifications,
    setConnectionStatus,
    resetNotifications,
  }
}

