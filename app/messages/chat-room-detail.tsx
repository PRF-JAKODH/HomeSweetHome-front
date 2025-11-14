"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { IMessage } from "@stomp/stompjs"

import apiClient from "@/lib/api"
import {
  connectStomp,
  disconnectStomp,
  sendChatMessage,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "@/lib/hooks/chat-socket"
import { useAuthStore } from "@/stores/auth-store"

// ============================================
// 타입 정의
// ============================================

export type RoomType = "INDIVIDUAL" | "GROUP"

type IndividualChatDetailResponse = {
  roomId: number
  partnerId: number
  partnerName: string
  partnerProfileImageUrl: string
}

type GroupChatDetailResponse = {
  roomId: number
  roomName: string
  roomThumbnailUrl: string
  memberCount: number
  participants: GroupMemberInfo[]
}

type GroupMemberInfo = {
  userId: number
  userName: string
  profileUrl: string
}

type Message = {
  messageId: number
  senderId: number
  content: string
  timestamp: string
  sentAt: string
  isMe: boolean
  images?: string[]
  status?: "sending" | "sent" | "error"
}

export type ChatMessageDto = {
  messageId: number
  roomId: number
  senderId: number
  content: string
  sentAt: string
  senderName: string
  senderProfileImg: string
}

export type PreMessageResponse = {
  messages: ChatMessageDto[]
  hasNext: boolean
}

const sortMessagesBySentAt = (msgs: Message[]) =>
  [...msgs].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())

type ChatRoomDetailProps = {
  roomId: number
  initialRoomType?: RoomType | null
  embedded?: boolean
  onClose?: () => void
  className?: string
}

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const SmileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

export function ChatRoomDetail({
  roomId,
  initialRoomType = null,
  embedded = false,
  onClose,
  className,
}: ChatRoomDetailProps) {
  const router = useRouter()
  const searchParamsType = initialRoomType

  const rootClassName = ["flex flex-col h-full min-h-0 bg-background", className].filter(Boolean).join(" ")

  // 채팅방 타입 및 정보
  const [roomType, setRoomType] = useState<RoomType | null>(searchParamsType)
  const [roomName, setRoomName] = useState<string>("")
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("")
  const [memberCount, setMemberCount] = useState<number>(0)
  const [groupMembers, setGroupMembers] = useState<GroupMemberInfo[]>([])

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [partnerId, setPartnerId] = useState<number | null>(null)
  const [partnerName, setPartnerName] = useState<string>("상대방")

  const [showUserInfo, setShowUserInfo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const isSubscribedRef = useRef(false)

  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    setRoomType(searchParamsType)
  }, [searchParamsType])

  useEffect(() => {
    setMessages([])
    setHasMore(true)
    setLoading(true)
    setError(null)
    setShowUserInfo(false)
    setShowSettings(false)
    isSubscribedRef.current = false
  }, [roomId])

  useEffect(() => {
    if (!roomId || !accessToken) return

    let mounted = true

    const init = async () => {
      try {
        await fetchChatRoomInfo()

        await connectStomp({
          onConnected: () => {
            if (!mounted) return
            setIsConnected(true)

            if (isSubscribedRef.current) {
              console.log("⚠️ 이미 구독 중 - 스킵")
              return
            }

            subscribeToTopic(`/sub/rooms/${roomId}`, handleMessageReceived)
            isSubscribedRef.current = true
            console.log("✅ 구독 완료")
          },
          onError: (error) => {
            console.error("❌ 웹소켓 연결 실패:", error)
            setIsConnected(false)
          },
        })
      } catch (error) {
        console.error("❌ 초기화 실패:", error)
      }
    }

    init()

    return () => {
      mounted = false

      if (isSubscribedRef.current) {
        console.log("구독 해제")
        unsubscribeFromTopic(`/sub/rooms/${roomId}`)
        isSubscribedRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, accessToken])

  const fetchChatRoomInfo = async () => {
    const myUserId = useAuthStore.getState().user?.id

    try {
      setLoading(true)
      setError(null)

      let roomInfo: IndividualChatDetailResponse | GroupChatDetailResponse
      let type: RoomType

      if (searchParamsType === "INDIVIDUAL") {
        console.log("📤 개인 채팅방 정보 요청 - roomId:", roomId)
        const response = await apiClient.get<IndividualChatDetailResponse>(`/api/v1/chat/rooms/individual/${roomId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        })
        roomInfo = response.data
        type = "INDIVIDUAL"
      } else if (searchParamsType === "GROUP") {
        console.log("📤 그룹 채팅방 정보 요청 - roomId:", roomId)
        const response = await apiClient.get<GroupChatDetailResponse>(`/api/v1/chat/rooms/group/${roomId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        })
        roomInfo = response.data
        type = "GROUP"
      } else {
        try {
          console.log("📤 개인 채팅방 정보 요청 시도 - roomId:", roomId)
          const response = await apiClient.get<IndividualChatDetailResponse>(`/api/v1/chat/rooms/individual/${roomId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })
          roomInfo = response.data
          type = "INDIVIDUAL"
        } catch (individualError) {
          console.log("📤 그룹 채팅방 정보 요청 시도 - roomId:", roomId)
          const response = await apiClient.get<GroupChatDetailResponse>(`/api/v1/chat/rooms/group/${roomId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })
          roomInfo = response.data
          type = "GROUP"
        }
      }

      console.log("✅ 채팅방 정보 응답:", roomInfo)

      setRoomType(type)

      if (type === "INDIVIDUAL") {
        const individualInfo = roomInfo as IndividualChatDetailResponse
        setPartnerId(individualInfo.partnerId)
        setPartnerName(individualInfo.partnerName)
        setThumbnailUrl(individualInfo.partnerProfileImageUrl || "")
        setRoomName(individualInfo.partnerName)
      } else {
        const groupInfo = roomInfo as GroupChatDetailResponse
        setRoomName(groupInfo.roomName)
        setThumbnailUrl(groupInfo.roomThumbnailUrl || "")
        setMemberCount(groupInfo.memberCount)
        setGroupMembers(groupInfo.participants)
        console.log("👥 그룹 멤버 정보:", groupInfo.participants)
      }

      await fetchInitialMessages()
    } catch (error: any) {
      console.error("❌ 채팅방 정보 로드 실패:", error)
      console.error("❌ 에러 상세:", error.response?.data)
      setError(error.response?.data?.message || "채팅방 정보를 불러올 수 없습니다")
      setPartnerName("상대방")
      setThumbnailUrl("")
    } finally {
      setLoading(false)
    }
  }

  const fetchInitialMessages = async () => {
    const myUserId = useAuthStore.getState().user?.id

    try {
      const response = await apiClient.get<PreMessageResponse>(`/api/v1/chat/rooms/${roomId}/messages`, {
        params: { size: 30 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      const { messages: newMessages, hasNext } = response.data

      const parsedMessages = newMessages.map((msg: ChatMessageDto) => ({
        messageId: msg.messageId,
        senderId: msg.senderId,
        content: msg.content,
        timestamp: formatTimestamp(msg.sentAt),
        sentAt: msg.sentAt,
        isMe: msg.senderId === myUserId,
        status: "sent" as const,
      }))

      setMessages(sortMessagesBySentAt(parsedMessages))
      setHasMore(hasNext)

      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error("❌ 초기 메시지 로드 실패:", error)
    }
  }

  const handleMessageReceived = (msg: IMessage) => {
    try {
      const payload = JSON.parse(msg.body) as ChatMessageDto
      console.log("📩 메시지 수신:", payload)

      if (payload.senderId === user?.id) {
        console.log("⏭️ 내가 보낸 메시지 - 스킵")
        return
      }

      const newMessage: Message = {
        messageId: payload.messageId,
        senderId: payload.senderId,
        content: payload.content,
        timestamp: formatTimestamp(payload.sentAt),
        sentAt: payload.sentAt,
        isMe: false,
        status: "sent",
      }

      setMessages((prev) => sortMessagesBySentAt([...prev, newMessage]))
      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error("❌ 메시지 파싱 실패:", error)
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() && selectedImages.length === 0) {
      console.warn("⚠️ 메시지 내용이 없습니다.")
      return
    }

    if (!isConnected) {
      console.warn("⚠️ 웹소켓이 연결되지 않았습니다.")
      alert("채팅 서버와 연결이 끊어졌습니다. 다시 시도해주세요.")
      return
    }

    if (!user?.id) {
      console.warn("⚠️ 로그인 정보가 없습니다.")
      alert("로그인이 필요합니다.")
      return
    }

    const senderId = user.id

    const tempMessage: Message = {
      messageId: Date.now(),
      senderId: senderId,
      content: inputValue,
      timestamp: formatTimestamp(new Date().toISOString()),
      sentAt: new Date().toISOString(),
      isMe: true,
      status: "sending",
      images: selectedImages.length > 0 ? selectedImages : undefined,
    }

    setMessages((prev) => sortMessagesBySentAt([...prev, tempMessage]))

    try {
      sendChatMessage("/pub/chat.send", {
        roomId: roomId,
        senderId: senderId,
        content: inputValue,
      })

      console.log("📤 메시지 전송 완료:", {
        roomId,
        senderId,
        content: inputValue,
      })

      setMessages((prev) =>
        prev.map((msg) => (msg.messageId === tempMessage.messageId ? { ...msg, status: "sent" } : msg)),
      )

      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error)

      setMessages((prev) =>
        prev.map((msg) => (msg.messageId === tempMessage.messageId ? { ...msg, status: "error" } : msg)),
      )

      alert("메시지 전송에 실패했습니다.")
    }

    setInputValue("")
    setSelectedImages([])
  }

  const fetchOlderMessages = async (lastMessageId: number) => {
    if (loadingMore) {
      console.log("⏳ 이전 메시지 로딩 중 - 중복 호출 방지")
      return
    }
    if (!hasMore) {
      console.log("🔚 hasMore=false - 추가 메시지 없음")
      return
    }

    setLoadingMore(true)

    try {
      console.log("📤 이전 메시지 요청", { roomId, lastMessageId })
      const response = await apiClient.get(`/api/v1/chat/rooms/${roomId}/messages`, {
        params: { lastMessageId, size: 30 },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const { messages: newMessages, hasNext } = response.data
      const myUserId = useAuthStore.getState().user?.id

      const parsedNewMessages = newMessages.map((msg: ChatMessageDto) => ({
        messageId: msg.messageId,
        senderId: msg.senderId,
        content: msg.content,
        timestamp: formatTimestamp(msg.sentAt),
        sentAt: msg.sentAt,
        isMe: msg.senderId === myUserId,
        status: "sent" as const,
      }))

      const container = chatContainerRef.current
      const previousScrollHeight = container?.scrollHeight || 0

      setMessages((prev) => sortMessagesBySentAt([...parsedNewMessages, ...prev]))
      setHasMore(hasNext)

      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - previousScrollHeight
        }
      }, 0)
      console.log("✅ 이전 메시지 로드 완료", { fetched: parsedNewMessages.length, hasNext })
    } catch (error) {
      console.error("❌ 이전 메시지 불러오기 실패:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
    setSelectedImages((prev) => [...prev, ...imageUrls])
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const formatTimestamp = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleLeaveRoom = () => {
    if (!confirm("대화방을 나가시겠습니까?")) {
      return
    }
    disconnectStomp()
    if (embedded) {
      onClose?.()
    } else {
      router.push("/messages")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const container = chatContainerRef.current
    const sentinel = topSentinelRef.current
    if (!container || !sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries
        if (!entry || !entry.isIntersecting || loadingMore) return
        const firstMessageId = messages[0]?.messageId
        if (!firstMessageId) return
        await fetchOlderMessages(firstMessageId)
      },
      {
        root: container,
        threshold: 0,
        rootMargin: "50px 0px 0px 0px",
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [messages, loadingMore, hasMore])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-text-secondary">채팅방 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    )
  }

  return (
    <div className={rootClassName}>
      <header className="flex items-center gap-3 px-6 py-4 border-b border-divider bg-background sticky top-0 z-10">
        {embedded && (
          <button
            onClick={() => {
              disconnectStomp()
              onClose?.()
            }}
            className="lg:hidden p-2 hover:bg-background-section rounded-full transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeftIcon className="h-5 w-5 text-foreground" />
          </button>
        )}
        <div className="flex items-center gap-3 flex-1">
          {roomType === "INDIVIDUAL" ? (
            <>
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt={partnerName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{partnerName[0]}</span>
                </div>
              )}
              <div>
                <h2 className="font-semibold text-foreground">{partnerName}</h2>
              </div>
            </>
          ) : (
            <>
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt={roomName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-foreground">{roomName}</h2>
                <p className="text-xs text-text-secondary">👥 {memberCount}명</p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUserInfo(!showUserInfo)}
            className="p-2 hover:bg-background-section rounded-full transition-colors"
            aria-label="사용자 정보"
          >
            {roomType === "INDIVIDUAL" ? (
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            ) : (
              <UsersIcon className="h-5 w-5 text-foreground" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-background-section rounded-full transition-colors"
              aria-label="설정"
            >
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-divider rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={() => {
                    setShowSettings(false)
                    alert("첨부된 이미지가 없습니다.")
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-section transition-colors"
                >
                  첨부 이미지
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-background-section transition-colors"
                >
                  대화방 나가기
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showUserInfo && (
        <>
          <div className="fixed inset-0 bg-black/20 z-10" onClick={() => setShowUserInfo(false)} />

          <aside className="absolute right-0 top-[57px] z-20 h-[calc(100%-57px)] w-64 border-l border-divider bg-background p-4 shadow-lg overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{roomType === "INDIVIDUAL" ? "사용자 정보" : "참여자 목록"}</h3>
              <button
                onClick={() => setShowUserInfo(false)}
                className="p-1 hover:bg-background-section rounded-full transition-colors"
                aria-label="닫기"
              >
                <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {roomType === "INDIVIDUAL" ? (
              <div className="flex flex-col items-center gap-4">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={partnerName} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary">{partnerName[0]}</span>
                  </div>
                )}

                <div className="text-center">
                  <h4 className="font-semibold text-foreground">{partnerName}</h4>
                </div>

                <div className="w-full pt-4 border-t border-divider space-y-2">
                  <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-background-section rounded-lg transition-colors">
                    프로필 보기
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-text-secondary mb-3">총 {memberCount}명의 참여자</div>
                {groupMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 p-2 hover:bg-background-section rounded-lg transition-colors"
                  >
                    {member.profileUrl ? (
                      <img src={member.profileUrl} alt={member.userName} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{member.userName[0]}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {member.userName}
                        {member.userId === user?.id && <span className="ml-2 text-xs text-primary">(나)</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </>
      )}

      <main ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4">
        <div ref={topSentinelRef} className="h-1" aria-hidden />
        {messages.map((message) => (
          <div key={message.messageId} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-2 max-w-[70%] ${message.isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!message.isMe && (
                <>
                  {roomType === "INDIVIDUAL" ? (
                    thumbnailUrl ? (
                      <img src={thumbnailUrl} alt={partnerName} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">{partnerName[0]}</span>
                      </div>
                    )
                  ) : (
                    (() => {
                      const sender = groupMembers.find((m) => m.userId === message.senderId)
                      return sender?.profileUrl ? (
                        <img src={sender.profileUrl} alt={sender.userName} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">{sender?.userName[0] || "?"}</span>
                        </div>
                      )
                    })()
                  )}
                </>
              )}

              <div className="flex flex-col gap-1">
                {!message.isMe && roomType === "GROUP" && (
                  <span className="text-xs text-text-secondary px-2">
                    {groupMembers.find((m) => m.userId === message.senderId)?.userName || "알 수 없음"}
                  </span>
                )}

                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    message.isMe ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-foreground rounded-bl-sm"
                  }`}
                >
                  {message.images && message.images.length > 0 && (
                    <div className="mb-2 grid grid-cols-2 gap-2">
                      {message.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img || "/placeholder.svg"}
                          alt="첨부 이미지"
                          className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(img, "_blank")}
                        />
                      ))}
                    </div>
                  )}

                  {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}
                </div>

                <span className={`text-xs text-text-secondary px-2 ${message.isMe ? "text-right" : "text-left"}`}>
                  {message.timestamp}
                  {message.status === "sending" && " (전송 중...)"}
                  {message.status === "error" && " (전송 실패)"}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </main>

      <footer className="border-t border-divider bg-background px-4 py-3">
        {selectedImages.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {selectedImages.map((img, index) => (
              <div key={index} className="relative">
                <img src={img || "/placeholder.svg"} alt="미리보기" className="h-20 w-20 rounded-lg object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="이미지 제거"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-background-section rounded-full transition-colors"
            aria-label="이미지 추가"
          >
            <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="flex-1 bg-background-section rounded-3xl px-4 py-2 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-text-secondary"
            />
            <button className="p-1 hover:opacity-70 transition-opacity" aria-label="이모티콘">
              <SmileIcon className="h-5 w-5 text-text-secondary" />
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && selectedImages.length === 0}
            className="p-2.5 bg-primary hover:bg-primary/90 disabled:bg-text-secondary/20 disabled:cursor-not-allowed rounded-full transition-colors"
            aria-label="전송"
          >
            <SendIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </footer>
    </div>
  )
}

