import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Notification, NotificationStore, NotificationState, NotificationActions } from '@/types/notification'

export const defaultNotificationState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  notificationIdCounter: 0,
}

export const createNotificationStore = (initState: NotificationState = defaultNotificationState) => {
  return createStore<NotificationStore>()(
    persist<NotificationStore>(
      (set, get) => ({
        ...initState,
        
        addNotification: (notification: Notification) => set((state) => {
          const newId = state.notificationIdCounter + 1
          const notificationWithId = { 
            ...notification, 
            id: notification.id || newId 
          }
          const updatedNotifications = [notificationWithId, ...state.notifications]
          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
            notificationIdCounter: newId,
          }
        }),
        
        markAsRead: (id: number) => set((state) => {
          const updatedNotifications = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          )
          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
          }
        }),
        
        markAllAsRead: () => set((state) => {
          const updatedNotifications = state.notifications.map((n) => ({ ...n, isRead: true }))
          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: 0,
          }
        }),
        
        deleteNotification: (id: number) => set((state) => {
          const updatedNotifications = state.notifications.filter((n) => n.id !== id)
          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
          }
        }),
        
        deleteNotificationByIndex: (index: number) => set((state) => {
          const updatedNotifications = state.notifications.filter((_, i) => i !== index)
          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
          }
        }),
        
        setNotifications: (notifications: Notification[]) => set((state) => ({
          ...state,
          notifications: notifications.map((n, index) => ({
            ...n,
            id: n.id || Date.now() + index,
          })),
          unreadCount: notifications.filter((n) => !n.isRead).length,
        })),
        
        setConnectionStatus: (isConnected: boolean) => set((state) => ({ ...state, isConnected })),
      }),
      {
        name: 'ohouse_notifications_v2',
        storage: createJSONStorage(() => localStorage),
        version: 1,
      }
    )
  )
}

