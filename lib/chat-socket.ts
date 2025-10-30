"use client"

import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/stores/auth-store'

export type ChatMessagePayload = {
  roomId?: string
  senderId?: string | number
  receiverId?: string | number
  content: string
  type?: 'TEXT' | 'IMAGE' | 'FILE'
  sentAt?: string
  // add any extra fields your backend expects
}

type ConnectOptions = {
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: unknown) => void
}

let stompClient: Client | null = null
let activeSubscriptions: StompSubscription[] = []

function getWebSocketUrl(): string {
  const base = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'
  return base
}


export function getStompClient(): Client {
  if (stompClient) return stompClient

  const accessToken = useAuthStore.getState().accessToken

  const client = new Client({
    webSocketFactory: () => new SockJS(getWebSocketUrl()),
    connectHeaders: {
      Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
    },
    reconnectDelay: 3000,
    heartbeatIncoming: 15000,
    heartbeatOutgoing: 15000,
  })

  stompClient = client
  return client
}

export function connectStomp(options?: ConnectOptions): void {
  const client = getStompClient()
  const { onConnected, onDisconnected, onError } = options || {}

  // 콜백 등록
  client.onConnect = () => {
    onConnected?.()           // 연결 성공 시 실행 (sub구독)
  }

  client.onStompError = (frame) => {
    onError?.(frame)
  }

  client.onWebSocketClose = () => {
    onDisconnected?.()
  }

  // 활성화 (실제 connect 시도) 
  if (!client.active) {
    client.activate()
  }
}

export function disconnectStomp(): void {
  if (!stompClient) return
  try {
    activeSubscriptions.forEach((s) => s.unsubscribe())
    activeSubscriptions = []
    stompClient.deactivate()
  } catch {
    // ignore
  }
}

export function subscribeToTopic(topic: string, onMessage: (message: IMessage) => void): void {
  if (!stompClient || !stompClient.connected) return
  const sub = stompClient.subscribe(topic, onMessage)
  activeSubscriptions.push(sub)
}

export function sendChatMessage(destination: string, payload: ChatMessagePayload): void {
  if (!stompClient || !stompClient.connected) {
    console.warn('STOMP client not connected; message not sent')
    return
  }
  stompClient.publish({
    destination,
    body: JSON.stringify(payload),
  })
}


