'use client'

import { type ReactNode, createContext, useRef, useContext, useEffect } from 'react'
import { useStore } from 'zustand'
import { createNotificationStore } from '@/stores/notification-store'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'
import { EventSourcePolyfill } from 'event-source-polyfill'
import type { Notification } from '@/types/notification'
import type { NotificationStore } from '@/stores/notification-store'
import { replaceTemplateVariables } from '@/lib/notification-util'

export type NotificationStoreApi = ReturnType<typeof createNotificationStore>

export const NotificationStoreContext = createContext<NotificationStoreApi | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

// 템플릿 변수 치환은 공용 유틸을 사용

export function NotificationProvider({ children }: NotificationProviderProps) {
  const storeRef = useRef<NotificationStoreApi | null>(null)
  const hasLoadedInitialNotifications = useRef(false)
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null)
  const { isAuthenticated } = useAuth()
  const accessToken = useAuthStore((state) => state.accessToken)

  if (storeRef.current === null) {
    storeRef.current = createNotificationStore()
  }

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return
    }

    const store = storeRef.current
    if (!store) return

    // 앱 첫 로딩 시 서버에서 알림 목록 가져오기 (중복 방지)
    const loadInitialNotifications = async () => {
      if (hasLoadedInitialNotifications.current) {
        console.log('Initial notifications already loaded, skipping')
        return
      }
      
      try {
        await store.getState().loadNotificationsFromServer()
        hasLoadedInitialNotifications.current = true
        console.log('Initial notifications loaded from server')
      } catch (error) {
        console.error('Failed to load initial notifications:', error)
      }
    }

    loadInitialNotifications()

    // 기존 SSE 연결이 있다면 정리
    if (eventSourceRef.current) {
      console.log('Closing existing SSE connection')
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    // EventSourcePolyfill을 사용한 SSE 연결
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const eventSource = new EventSourcePolyfill(
      `${baseURL}/api/v1/notifications/subscribe`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        // 서버로부터의 마지막 이벤트/주석 수신 이후 이 시간(밀리초)까지 무응답이면 재연결 시도
        heartbeatTimeout: 180000,
      }
    )
    
    eventSourceRef.current = eventSource

    store.getState().setConnectionStatus(true)
    console.log('SSE connection established')

    // notification 이벤트 리스너 추가
    eventSource.addEventListener('notification', (event: MessageEvent) => {
      console.log('SSE notification event received:', event.data)
      
      try {
        const data = event.data.trim()
        
        // JSON 형식인지 확인
        if (data.startsWith('{') && data.endsWith('}')) {
          const rawData = JSON.parse(data)
          console.log('Parsed notification:', rawData)

          // 템플릿 변수 치환 적용
          const processedTitle = replaceTemplateVariables(rawData.title, rawData.contextData)
          const processedContent = replaceTemplateVariables(rawData.content, rawData.contextData)
          const processedRedirectUrl = replaceTemplateVariables(rawData.redirectUrl, rawData.contextData)

          const notification: Notification = {
            notificationId: rawData.notificationId,
            title: processedTitle,
            content: processedContent,
            redirectUrl: processedRedirectUrl,
            contextData: rawData.contextData,
            isRead: rawData.read,
            categoryType: rawData.categoryType,
            createdAt: rawData.createdAt,
          }

          console.log('Processed notification:', notification)

          store.getState().addNotification(notification)
            
          // Toast 알림 표시
          toast({
            title: notification.title,
            description: notification.content,
            duration: 5000,
          })
          
          // 브라우저 알림 표시
          if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new window.Notification(notification.title, {
              body: notification.content,
              icon: '/logo-icon.svg',
            })
            setTimeout(() => {
              try {
                browserNotification.close()
              } catch (e) {
                console.error('Failed to close browser notification', e)
              }
            }, 5000)
          }
        } else {
          // JSON이 아닌 메시지는 무시
          console.log('Ignoring non-JSON SSE message:', data)
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error, event.data)
      }
    })

    // 일반 message 이벤트도 처리 (백업)
    eventSource.onmessage = (event: MessageEvent) => {
      console.log('SSE message event (onmessage):', event.type, event.data)
    }

    eventSource.onerror = (error: Event) => {
      if(error.target instanceof EventSourcePolyfill) {
      } else {
        console.error('SSE connection error:', error)
      }
    }

    eventSource.onopen = (_event: Event) => {
      console.log('SSE connected')
      store.getState().setConnectionStatus(true)
    }

    return () => {
      if (eventSourceRef.current) {
        console.log('Cleaning up SSE connection')
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      store.getState().setConnectionStatus(false)
    }
  }, [isAuthenticated, accessToken])

  return (
    <NotificationStoreContext.Provider value={storeRef.current}>
      {children}
    </NotificationStoreContext.Provider>
  )
}

export function useNotificationStore<T>(selector: (store: NotificationStore) => T): T {
  const notificationStoreContext = useContext(NotificationStoreContext)
  if (!notificationStoreContext) {
    throw new Error('useNotificationStore must be used within NotificationProvider')
  }
  return useStore(notificationStoreContext, selector)
}

