// Notification related types

export type NotificationCategoryType = 
  | 'ORDER' 
  | 'REVIEW' 
  | 'EVENT' 
  | 'SYSTEM' 
  | string

export interface Notification {
  notificationId: number
  title: string
  content: string
  redirectUrl: string
  contextData?: Record<string, any>
  isRead: boolean
  categoryType: NotificationCategoryType
  createdAt: string // ISO 8601 형식
}

export interface NotificationComparison {
  hasChanges: boolean
  newOnServer: Notification[]
  newLocally: Notification[]
  updatedOnServer: Notification[]
  deletedOnServer: Notification[]
  conflicts: Array<{
    local: Notification
    server: Notification
    field: string
  }>
}

