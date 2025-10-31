import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Notification } from '@/types/notification'
import { deleteNotifications as deleteNotificationsAPI, getNotifications as getNotificationsAPI, markAsRead as markAsReadAPI } from '@/api/notification-api'

// 알림 비교 및 병합 유틸리티 함수들
interface NotificationComparison {
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

export type NotificationActions = {
  addNotification: (notification: Notification) => void
  markAsReadOnServer: (id: number) => Promise<{ success: boolean; error?: any }>
  markAllAsReadOnServer: () => Promise<{ success: boolean; error?: any }>
  deleteNotificationFromServer: (id: number) => Promise<{ success: boolean; error?: any }>
  loadNotificationsFromServer: () => Promise<{
    success: boolean
    error?: any
    hasChanges?: boolean
    changes?: NotificationComparison
    mergedCount?: number
  }>
  setNotifications: (notifications: Notification[]) => void
  setConnectionStatus: (isConnected: boolean) => void
  resetNotifications: () => void
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  notificationIdCounter: number
}

export type NotificationStore = NotificationState & NotificationActions

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
          // 중복 체크: 같은 ID의 알림만 중복으로 간주
          const isDuplicate = state.notifications.some(existing => 
            existing.notificationId === notification.notificationId
          )

          if (isDuplicate) {
            console.log('Duplicate notification detected by id, skipping:', notification)
            return state
          }

          // 서버에서 온 id가 없으면 추가하지 않음 (정합성 보장)
          if (notification.notificationId === undefined || notification.notificationId === null) {
            console.warn('Skipping notification without server id:', notification)
            return state
          }
          const updatedNotifications = [notification, ...state.notifications]
          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
            notificationIdCounter: state.notificationIdCounter,
          }
        }),
        
        // 로컬 읽음 처리 제거 → 서버 전용으로 유지
        
        // 서버로 읽음 처리 요청
        markAsReadOnServer: async (id: number) => {
          try {
            await markAsReadAPI([id]).then(() => {
              // 서버 읽음 처리 성공 시 로컬 상태도 업데이트
              set((state) => {
                const updatedNotifications = state.notifications.map((n) =>
                  n.notificationId === id ? { ...n, isRead: true } : n
                )
                return {
                  ...state,
                  notifications: updatedNotifications,
                  unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
                }
              })
            })

            return { success: true }
          } catch (error) {
            console.error('Failed to mark notification as read on server:', error)
            return { success: false, error }
          }
        },
        
        // 로컬 전체 읽음 제거 → 서버 전용으로 유지
        
        // 서버로 전체 읽음 처리 요청
        markAllAsReadOnServer: async () => {
          try {
            const state = get()
            const idsToMark = state.notifications
              .filter((n) => !n.isRead)
              .map((n) => n.notificationId)

            if (idsToMark.length === 0) {
              return { success: true }
            }

            await markAsReadAPI(idsToMark)

            set((prev) => {
              const updatedNotifications = prev.notifications.map((n) => ({ ...n, isRead: true }))
              return {
                ...prev,
                notifications: updatedNotifications,
                unreadCount: 0,
              }
            })

            return { success: true }
          } catch (error) {
            console.error('Failed to mark all notifications as read on server:', error)
            return { success: false, error }
          }
        },
        
        // 로컬 삭제 제거 → 서버 전용으로 유지
        
        // 서버 API를 호출하여 알림 삭제
        deleteNotificationFromServer: async (id: number) => {
          try {
            await deleteNotificationsAPI([id])
            // 서버 삭제 성공 시 로컬 상태에서도 삭제
            set((state) => {
              const updatedNotifications = state.notifications.filter((n) => n.notificationId !== id)
              return {
                ...state,
                notifications: updatedNotifications,
                unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
              }
            })
            return { success: true }
          } catch (error) {
            console.error('Failed to delete notification from server:', error)
            return { success: false, error }
          }
        },
        
        setNotifications: (notifications: Notification[]) => set((state) => ({
          ...state,
          // 서버 id 없는 항목은 제외
          notifications: notifications.filter((n) => n.notificationId !== undefined && n.notificationId !== null),
          unreadCount: notifications.filter((n) => !n.isRead).length,
        })),
        
        setConnectionStatus: (isConnected: boolean) => set((state) => ({ ...state, isConnected })),
        
        // 알림 스토어 초기화 (로그아웃 시 사용)
        resetNotifications: () => set(() => ({
          ...defaultNotificationState,
        })),
        
        // 서버에서 알림 목록 가져오기 (로컬과 비교하여 동기화)
        loadNotificationsFromServer: async () => {
          try {
            const serverNotifications = await getNotificationsAPI()
            const currentState = get()
            
            // 서버 데이터와 로컬 데이터 비교
            const comparisonResult = compareNotifications(currentState.notifications, serverNotifications)
            
            if (comparisonResult.hasChanges) {
              console.log('Notification changes detected:', comparisonResult)
              
              // 서버 데이터를 우선으로 하되, 로컬에만 있는 새 알림은 보존
              const mergedNotifications = mergeNotifications(
                currentState.notifications, 
                serverNotifications,
                comparisonResult
              )
              
              // 중복 제거를 위한 추가 검증
              const uniqueNotifications = mergedNotifications.reduce((acc, current) => {
                const existingIndex = acc.findIndex(notif => 
                  notif.notificationId === current.notificationId || 
                  (notif.title === current.title && 
                   notif.content === current.content && 
                   Math.abs(new Date(notif.createdAt).getTime() - new Date(current.createdAt).getTime()) < 1000)
                )
                if (existingIndex >= 0) {
                  const mergedItem: Notification = {
                    ...current,
                    isRead: acc[existingIndex].isRead || current.isRead,
                  }
                  acc[existingIndex] = mergedItem
                } else {
                  acc.push(current)
                }
                return acc
              }, [] as Notification[])
              
              set((state) => ({
                ...state,
                notifications: uniqueNotifications.filter((n) => n.notificationId !== undefined && n.notificationId !== null),
                unreadCount: uniqueNotifications.filter((n) => !n.isRead).length,
              }))
              
              return { 
                success: true, 
                hasChanges: true, 
                changes: comparisonResult,
                mergedCount: uniqueNotifications.length
              }
            } else {
              console.log('No notification changes detected')
              return { success: true, hasChanges: false }
            }
          } catch (error) {
            console.error('Failed to load notifications from server:', error)
            return { success: false, error }
          }
        },
      }),
      {
        name: 'ohouse_notifications_v2',
        storage: createJSONStorage(() => localStorage),
        version: 1,
      }
    )
  )
}

// Utility functions

function compareNotifications(localNotifications: Notification[], serverNotifications: Notification[]): NotificationComparison {
  const result: NotificationComparison = {
    hasChanges: false,
    newOnServer: [],
    newLocally: [],
    updatedOnServer: [],
    deletedOnServer: [],
    conflicts: []
  }

  // 서버에만 있는 알림 (새로 생성된 알림)
  result.newOnServer = serverNotifications.filter(serverNotif => 
    !localNotifications.some(localNotif => localNotif.notificationId === serverNotif.notificationId)
  )

  // 로컬에만 있는 알림 (아직 서버에 동기화되지 않은 알림)
  result.newLocally = localNotifications.filter(localNotif => 
    !serverNotifications.some(serverNotif => serverNotif.notificationId === localNotif.notificationId)
  )

  // 서버에서 삭제된 알림
  result.deletedOnServer = localNotifications.filter(localNotif => 
    !serverNotifications.some(serverNotif => serverNotif.notificationId === localNotif.notificationId)
  )

  // 공통 알림들의 변경사항 확인
  serverNotifications.forEach(serverNotif => {
    const localNotif = localNotifications.find(local => local.notificationId === serverNotif.notificationId)
    if (localNotif) {
      // 읽음 상태가 다른 경우
      if (localNotif.isRead !== serverNotif.isRead) {
        result.conflicts.push({
          local: localNotif,
          server: serverNotif,
          field: 'isRead'
        })
        result.updatedOnServer.push(serverNotif)
      }
      
      // 다른 필드들이 다른 경우 (제목, 내용 등)
      if (localNotif.title !== serverNotif.title || localNotif.content !== serverNotif.content) {
        result.conflicts.push({
          local: localNotif,
          server: serverNotif,
          field: 'content'
        })
        result.updatedOnServer.push(serverNotif)
      }
    }
  })

  result.hasChanges = result.newOnServer.length > 0 || 
                     result.newLocally.length > 0 || 
                     result.updatedOnServer.length > 0 || 
                     result.deletedOnServer.length > 0 ||
                     result.conflicts.length > 0

  return result
}

function mergeNotifications(
  localNotifications: Notification[], 
  serverNotifications: Notification[], 
  comparison: NotificationComparison
): Notification[] {
  const merged: Notification[] = []
  
  // 1. 서버의 모든 알림을 기본으로 사용
  merged.push(...serverNotifications)
  
  // 2. 로컬에만 있는 새 알림들을 추가 (SSE로 받은 아직 서버에 반영되지 않은 알림)
  merged.push(...comparison.newLocally)
  
  // 3. 충돌이 있는 경우 서버 우선 정책 적용
  // (읽음 상태는 서버 우선, 내용은 서버 우선)
  
  // 4. 중복 제거 (같은 ID가 있으면 서버 버전 유지)
  const uniqueNotifications = merged.reduce((acc, current) => {
    const existingIndex = acc.findIndex(notif => notif.notificationId === current.notificationId)
    if (existingIndex >= 0) {
      // 읽음 상태는 단조 증가: 어느 한쪽이 true면 true 유지
      const mergedItem: Notification = {
        ...current,
        isRead: acc[existingIndex].isRead || current.isRead,
      }
      acc[existingIndex] = mergedItem
    } else {
      acc.push(current)
    }
    return acc
  }, [] as Notification[])
  
  // 5. 최신순으로 정렬 (createdAt 기준)
  return uniqueNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

