'use client'

import { type ReactNode, createContext, useRef, useContext, useEffect } from 'react'
import { useStore } from 'zustand'
import { createNotificationStore } from '@/stores/notification-store'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'
import { EventSourcePolyfill } from 'event-source-polyfill'
import type { Notification, NotificationStore } from '@/types/notification'

export type NotificationStoreApi = ReturnType<typeof createNotificationStore>

export const NotificationStoreContext = createContext<NotificationStoreApi | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

// 템플릿 변수 치환 함수
function replaceTemplateVariables(
  content: string,
  contextData?: Record<string, any>
): string {
  if (!contextData) {
    return content
  }

  let replacedContent = content
  
  // contextData의 모든 키-값 쌍으로 {key}를 실제 값으로 치환
  Object.entries(contextData).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    replacedContent = replacedContent.replace(
      new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
      String(value)
    )
  })

  return replacedContent
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const storeRef = useRef<NotificationStoreApi | null>(null)
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

          // 백엔드의 read 필드를 isRead로 변환하고 content의 템플릿 변수를 치환
          const processedTitle = replaceTemplateVariables(rawData.title, rawData.contextData)
          const processedContent = replaceTemplateVariables(rawData.content, rawData.contextData)
          
          const notification: Notification = {
            ...rawData,
            title: processedTitle,
            content: processedContent,
            isRead: rawData.read ?? rawData.isRead ?? false,
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
      console.error('SSE connection error:', error)
      // store.getState().setConnectionStatus(false)
      // eventSource.close()
    }

    eventSource.onopen = (_event: Event) => {
      console.log('SSE connection opened')
      store.getState().setConnectionStatus(true)
    }

    return () => {
      eventSource.close()
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

