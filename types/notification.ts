// Notification related types

export type NotificationCategoryType = 
  | 'ORDER' 
  | 'REVIEW' 
  | 'EVENT' 
  | 'SYSTEM' 
  | string

export interface Notification {
  id?: number // 프론트엔드에서 사용할 ID
  title: string
  content: string
  redirectUrl: string
  contextData?: Record<string, any>
  isRead: boolean
  categoryType: NotificationCategoryType
  createdAt: string // ISO 8601 형식
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  notificationIdCounter: number
}

export interface NotificationActions {
  addNotification: (notification: Notification) => void
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  deleteNotification: (id: number) => void
  deleteNotificationByIndex: (index: number) => void
  setNotifications: (notifications: Notification[]) => void
  setConnectionStatus: (isConnected: boolean) => void
}

export type NotificationStore = NotificationState & NotificationActions

