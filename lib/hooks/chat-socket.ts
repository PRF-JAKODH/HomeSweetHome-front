"use client"

import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/stores/auth-store'

export type ChatMessagePayload = {
  roomId?: number
  senderId: string | number
  senderName: string 
  senderProfileImg: string 
  content: string
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
      console.log("[WebSocket] 연결 성공")
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
    console.error("[WebSocket] 연결되지 않음, 구독 불가")
    return null
  }

  // 이미 구독 중이면 스킵
  if (subscriptions.has(topic)) {
    console.log("[WebSocket] 이미 구독 중:", topic)
    return subscriptions.get(topic)!
  }

  console.log("[WebSocket] 구독 시작:", topic)
  const sub = client.subscribe(topic, (message) => {
    onMessage(message)
  })
  
  subscriptions.set(topic, sub)
  console.log("[WebSocket] 구독 완료, 총 구독 수:", subscriptions.size)
  return sub
}


// 구독 해제
export function unsubscribeFromTopic(topic: string): void {
  const sub = subscriptions.get(topic)
  if (sub) {
    sub.unsubscribe()
    subscriptions.delete(topic)
    console.log("[WebSocket] 구독 해제:", topic)
  }
}

// 메시지 전송
export function sendChatMessage(
  destination: string,
  payload: ChatMessagePayload
): void {
  const client = getClient()
  
  if (!client.connected) {
    console.error("[WebSocket] 연결 안 됨, 메시지 전송 불가")
    return
  }

  console.log("[ChatMessagePayload] 구독 해제:", payload)


  client.publish({
    destination: `/pub${destination}`, 
    body: JSON.stringify(payload), // JSON.stringify 필수!

  })
}

// 전체 연결 해제 
export function disconnectStomp(): void {
  if (stompClient) {
    subscriptions.forEach(sub => sub.unsubscribe())
    subscriptions.clear()
    stompClient.deactivate()
    stompClient = null
    console.log("[WebSocket] 연결 해제 완료")
  }
}