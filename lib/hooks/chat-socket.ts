// "use client"

// import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
// import SockJS from 'sockjs-client'
// import { useAuthStore } from '@/stores/auth-store'

// export type ChatMessagePayload = {
//   roomId?: string | number  // ← number도 허용
//   senderId?: string | number
//   receiverId?: string | number
//   text: string
//   type?: 'TEXT' | 'IMAGE' | 'FILE'
//   sentAt?: string
// }

// type ConnectOptions = {
//   onConnected?: () => void
//   onDisconnected?: () => void
//   onError?: (error: unknown) => void
// }

// // ============================================
// // 싱글톤 관리
// // ============================================
// let stompClient: Client | null = null
// let isConnecting = false
// const subscriptionMap = new Map<string, StompSubscription>()  // 구독 중복 방지


// function getWebSocketUrl(): string {
//   const base = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'
//   return base
// }

// // ============================================
// // 클라이언트 생성 (싱글톤)
// // ============================================
// export function getStompClient(): Client {
//   if (stompClient) return stompClient

//   const accessToken = useAuthStore.getState().accessToken
  
//   console.log("🔌 WebSocket 클라이언트 생성")
//   console.log("📍 URL:", getWebSocketUrl())
//   console.log("🔑 Token:", accessToken ? "존재함" : "없음")

//   const client = new Client({
//     webSocketFactory: () => new SockJS(getWebSocketUrl()),
//     connectHeaders: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//     reconnectDelay: 3000,
//     heartbeatIncoming: 15000,
//     heartbeatOutgoing: 15000,
//     debug: (str) => {
//       console.log('🔍 STOMP Debug:', str)  
//     },
//   })

//   stompClient = client
//   return client
// }

// // ============================================
// // 연결 (중복 방지하자요)
// // ============================================
// export function connectStomp(options?: ConnectOptions): void {
//   const client = getStompClient()
//   const { onConnected, onDisconnected, onError } = options || {}

//   // 연결 성공 콜백
//   client.onConnect = (frame) => {
//     console.log("✅ WebSocket 연결 성공!", frame)
//     onConnected?.()
//   }

//   // 에러 콜백
//   client.onStompError = (frame) => {
//     console.error("❌ STOMP 에러:", frame)
//     onError?.(frame)
//   }

//   // 연결 종료 콜백
//   client.onWebSocketClose = (event) => {
//     console.log("🔌 WebSocket 연결 종료", event)
//     onDisconnected?.()
//   }

//   // WebSocket 에러 콜백
//   client.onWebSocketError = (event) => {
//     console.error("❌ WebSocket 에러:", event)
//   }

//   // 활성화
//   if (!client.active) {
//     console.log("🚀 WebSocket 연결 시도 중...")
//     client.activate()
//   } else {
//     console.log("ℹ️ 이미 연결되어 있음")
//   }
// }

// export function disconnectStomp(): void {
//   if (!stompClient) return
//   try {
//     console.log("🔌 WebSocket 연결 해제 중...")
//     activeSubscriptions.forEach((s) => s.unsubscribe())
//     activeSubscriptions = []
//     stompClient.deactivate()
//     console.log("✅ WebSocket 연결 해제 완료")
//   } catch (error) {
//     console.error("❌ 연결 해제 실패:", error)
//   }
// }

// export function subscribeToTopic(topic: string, onMessage: (message: IMessage) => void): void {
//   if (!stompClient || !stompClient.connected) {
//     console.error("❌ 구독 실패: 연결되지 않음")
//     return
//   }
  
//   console.log("📡 구독 시작:", topic)
//   const sub = stompClient.subscribe(topic, (message) => {
//     console.log("📩 메시지 수신:", message)
//     onMessage(message)
//   })
//   activeSubscriptions.push(sub)
// }

// export function sendChatMessage(destination: string, payload: ChatMessagePayload): void {
//   if (!stompClient || !stompClient.connected) {
//     console.warn("⚠️ 전송 실패: STOMP 클라이언트 연결 안 됨")
//     return
//   }
  
//   console.log("📤 메시지 전송:", { destination, payload })
  
//   stompClient.publish({
//     destination,
//     body: JSON.stringify(payload),
//   })
// }


"use client"

import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/stores/auth-store'

export type ChatMessagePayload = {
  roomId?: string | number
  senderId?: string | number
  text: string
  type?: 'TEXT' | 'IMAGE' | 'FILE'
  sentAt?: string
}

type ConnectOptions = {
  onConnected?: () => void
  onError?: (error: unknown) => void
}

// 싱글톤
let stompClient: Client | null = null
const subscriptions = new Map<string, StompSubscription>()

function getWebSocketUrl(): string {
  return process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'
}

// 클라이언트 생성
function getClient(): Client {
  if (stompClient) return stompClient

  const token = useAuthStore.getState().accessToken

  stompClient = new Client({
    webSocketFactory: () => new SockJS(getWebSocketUrl()),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    heartbeatIncoming: 15000,
    heartbeatOutgoing: 15000,
  })
  return stompClient
}

// 연결
export function connectStomp(options?: ConnectOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = getClient()
    
    if (client.connected) {
      options?.onConnected?.()
      resolve()
      return
    }

    client.onConnect = () => {
      options?.onConnected?.()
      console.log("✅ WebSocket 연결 성공!")
      resolve()
    }

    client.onStompError = (error) => {
      options?.onError?.(error)
      reject(error)
    }

    if (!client.active) {
      client.activate()
    }
  })
}

// 구독 (중복 방지)
export function subscribeToTopic(
  topic: string,
  onMessage: (message: IMessage) => void
): StompSubscription | null {
  const client = getClient()
  
  if (!client.connected) {
    console.error('❌ 연결되지 않음')
    return null
  }

  // 이미 구독 중이면 스킵
  if (subscriptions.has(topic)) {
    return subscriptions.get(topic)!
  }

  const sub = client.subscribe(topic, onMessage)
  subscriptions.set(topic, sub)
  console.error('')
  return sub
}

// 구독 해제
export function unsubscribeFromTopic(topic: string): void {
  const sub = subscriptions.get(topic)
  if (sub) {
    sub.unsubscribe()
    subscriptions.delete(topic)
  }
}

// 메시지 전송
export function sendChatMessage(
  destination: string,
  payload: ChatMessagePayload
): void {
  const client = getClient()
  
  if (!client.connected) {
    console.warn('⚠️ 연결 안 됨')
    return
  }

  client.publish({
    destination,                  // /pub/chat.send
    body: JSON.stringify(payload),
  })
}

// 전체 연결 해제 
export function disconnectStomp(): void {
  if (stompClient) {
    subscriptions.forEach(sub => sub.unsubscribe())
    subscriptions.clear()
    stompClient.deactivate()
    stompClient = null
  }
}