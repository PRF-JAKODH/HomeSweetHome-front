"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import apiClient from "@/lib/api"
import { 
  connectStomp, 
  subscribeToTopic, 
  unsubscribeFromTopic,
  disconnectStomp,
  sendChatMessage 
} from "@/lib/hooks/chat-socket"
import type { IMessage } from "@stomp/stompjs"

// ============================================
// 타입 정의
// ============================================
export type ChatMessageResponse = {
  messageId: number
  roomId: number
  senderId: number
  senderName: string
  senderProfileImg: string
  messageType: string
  content: string
  sentAt: string
  isRead: boolean
}

// 채팅방 정보 응답 타입
type ChatRoomDetailResponse = {
  roomId: number
  partnerId: number
  partnerName: string
  thumbnailUrl: string
}

type Message = {
  messageId: number
  senderId: number
  text: string
  timestamp: string
  isMe: boolean
  images?: string[]
  status?: "sending" | "sent" | "error"
}

export type ChatMessageDto = {
  messageId: number
  roomId: number
  senderId: number
  text: string
  sentAt: string
  senderName: string
  profileImageUrl: string
}

// 이전 메시지 응답 (PreMessageResponse)
export type PreMessageResponse = {
  messages: ChatMessageDto[]
  hasNext: boolean
}

// 방 입장 응답 (RoomEnterResponse)
export type RoomEnterResponse = {
  roomInfo: ChatRoomDetailResponse
  preMessages: PreMessageResponse
}

// ============================================
// SVG 아이콘 컴포넌트
// ============================================
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

// ============================================
// 메인 컴포넌트
// ============================================
export default function MessagesPage({ params }: { params: Promise<{roomId:string}> }) {
  // ------------------------------------------
  // 1. 기본 설정 및 상태 초기화
  // ------------------------------------------
  const resolvedParams = React.use(params)
  const roomId = Number(resolvedParams.roomId)
  const router = useRouter()
  
  // Zustand 스토어에서 사용자 정보 가져오기
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)

  // ------------------------------------------
  // 2. 상태 관리
  // ------------------------------------------
  // 채팅 관련 상태
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastMessageId, setLastMessageId] = useState<number | null>(null)

  
  // UI 상태
  const [partnerName, setPartnerName] = useState<string>("상대방")
  const [partnerProfileImg, setPartnerProfileImg] = useState<string>("")
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isSubscribedRef = useRef(false)  

  const [loadingMore, setLoadingMore] = useState(false)
  // ------------------------------------------
  // 3. 채팅방 정보 로드 및 웹소켓 연결
  // ------------------------------------------
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
            isSubscribedRef.current = true  // ✅ 구독 완료 표시
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

      if (isSubscribedRef.current){
        console.log("구독 해제")
        unsubscribeFromTopic(`/sub/rooms/${roomId}`)
        isSubscribedRef.current = false
      }
    }
  }, [roomId, accessToken])

  // ------------------------------------------
  // 4. 함수 정의
  // ------------------------------------------
  
  /**
   * 채팅방 정보 조회 
   */
  const fetchChatRoomInfo = async () => {
    const myUserId = useAuthStore.getState().user?.id


    try {
      console.log("📤 채팅방 정보 요청 - roomId:", roomId)
            const response = await apiClient.get(`http://localhost:8080/api/v1/chat/rooms/${roomId}/enter`, {
        headers: {
          Authorization: `Bearer ${accessToken},`
        },
      })

      console.log("✅ 채팅방 정보 응답:", response)

// ✅ 응답 본문
const roomData = response.data
if (!roomData) {
  console.error("⚠️ roomData가 undefined입니다:", response)
  return
}

  // ✅ 구조 분해 (안전하게 처리)
  const { roomInfo, preMessages } = roomData
  if (!preMessages) {
    console.error("⚠️ preMessages가 undefined입니다:", roomData)
    return
  }

  const myUserId = useAuthStore.getState().user?.id

  // ✅ 메시지 변환 (내 메시지 구분)
  const parsedMessages = preMessages.messages
    .slice()
    .reverse()
    .map((msg: ChatMessageDto) => ({
    ...msg,
    isMe: msg.senderId === myUserId, 
  }))

  console.log("🏠 roomInfo:", roomInfo)
  console.log("💬 parsedMessages:", parsedMessages)


      if (!preMessages) {
        console.error("⚠️ preMessages가 undefined입니다:", roomData)
        return
      }
      
      setPartnerName(roomData.roomInfo.partnerName || "상대방")
      setPartnerProfileImg(roomData.roomInfo.thumbnailUrl || "")
      setMessages(parsedMessages)

    } catch (error: any) {
      console.error("❌ 채팅방 정보 로드 실패:", {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message
      })
      setPartnerName("상대방")
      setPartnerProfileImg("")
    }
  }

  /**
   * 메시지 수신 처리
   */
  const handleMessageReceived = (msg: IMessage) => {
    try {
      const payload = JSON.parse(msg.body) as ChatMessageDto
      console.log("📩 메시지 수신:", payload)

      if (payload.senderId === user?.id) {
        console.log("⏭️ 내가 보낸 메시지 - 스킵")
        return  
      }

      // 새 메시지를 목록에 추가
      const newMessage: Message = {
        messageId: payload.messageId,
        senderId: payload.senderId,
        text: payload.text,
        timestamp: formatTimestamp(payload.sentAt),
        isMe: false,
        status: "sent",
      }

      setMessages((prev) => [...prev, newMessage])
      scrollToBottom()
    } catch (error) {
      console.error("❌ 메시지 파싱 실패:", error)
    }
  }

  /**
   * 메시지 전송
   */
  const handleSendMessage = () => {
    // 입력값 검증
    if (!inputValue.trim() && selectedImages.length === 0) return

    if (!isConnected) {
      console.warn("⚠️ 웹소켓이 연결되지 않았습니다.")
      return
    }

    // UI 메시지 생성 (Optimistic UI)
    const tempMessage: Message = {
      messageId: Date.now(),
      senderId: user?.id ?? 0,
      text: inputValue,
      timestamp: formatTimestamp(new Date().toISOString()),
      isMe: true,
      status: "sent",
      images: selectedImages.length > 0 ? selectedImages : undefined,
    }

    // 화면에 먼저 표시
    setMessages((prev) => [...prev, tempMessage])

    // // 서버로 메시지 전송
    try {
      sendChatMessage("/pub/chat.send", {
        roomId: roomId, 
        text: inputValue,
        senderId: user?.id
      })
      console.log("📤 메시지 전송 완료")
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error)
      // 실패한 메시지 상태 업데이트
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === tempMessage.messageId ? { ...msg, status: "error" } : msg
        )
      )
    }

    // 입력 필드 초기화
    setInputValue("")
    setSelectedImages([])
  }

    /**
   * 스크롤을 최하단으로 이동
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }


  const chatContainerRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const container = chatContainerRef.current
  if (!container) return

  const handleScroll = async () => {
    // 최상단에 도달한 경우
    if (container.scrollTop === 0 && hasMore) {
      const firstMessageId = messages[0]?.messageId
      if (!firstMessageId) return
      await fetchOlderMessages(firstMessageId)
    }
  }

  container.addEventListener("scroll", handleScroll)
  return () => container.removeEventListener("scroll", handleScroll)
}, [loadingMore, hasMore])



const fetchOlderMessages = async (lastMessageId: number) => {
  try {
    const response = await apiClient.get(`/api/v1/chat/rooms/${roomId}/messages`, {
      params: { lastMessageId, size: 30 },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    // 구조분해할당으로 꺼냄
    const { messages: newMessages, hasMore: newHasMore } = response.data

    // 기존 메시지 위에 추가
    setMessages((prev) => [...newMessages.reverse(), ...prev])
    setHasMore(newHasMore)

    if (newMessages.length > 0) {
      setLastMessageId(newMessages[0].messageId)
    }

  } catch (error) {
    console.error("❌ 이전 메시지 불러오기 실패:", error)
  }
}


 /*
  * Enter 키 입력 처리 (한글 중복 전송 방지)
  */
 const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
   // 한글 조합 중일 때는 무시
   if (e.nativeEvent.isComposing) {
     return
   }
   
   if (e.key === "Enter" && !e.shiftKey) {
     e.preventDefault()
     handleSendMessage()
   }
 }

  /**
   * 이미지 선택 처리
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const imageUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    )
    setSelectedImages((prev) => [...prev, ...imageUrls])
  }

  /**
   * 선택한 이미지 제거
   */
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * 시간 포맷 변환
   */
  const formatTimestamp = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  /**
   * 채팅방 나가기
   */
  const handleLeaveRoom = () => {
    if (confirm("대화방을 나가시겠습니까?")) {
      disconnectStomp()
      router.push("/messages")
    }
  }

  // ------------------------------------------
  // 5. 렌더링 (기존과 동일)
  // ------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-background max-w-[1256px] mx-auto">
      
      {/* ========== 헤더 ========== */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-divider bg-background sticky top-0 z-10">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-background-section rounded-full transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeftIcon className="h-5 w-5 text-foreground" />
        </button>

        {/* 상대방 정보 */}
        <div className="flex items-center gap-3 flex-1">
          {/* 프로필 이미지 */}
          {partnerProfileImg ? (
            <img 
              src={partnerProfileImg} 
              alt={partnerName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {partnerName[0]}
              </span>
            </div>
          )}
          
          <div>
            <h2 className="font-semibold text-foreground">{partnerName}</h2>
            <p className="text-xs text-text-secondary">
              {isConnected ? "🟢 활동 중" : "🔴 오프라인"}
            </p>
          </div>
        </div>

        {/* 우측 버튼들 */}
        <div className="flex items-center gap-2">
          {/* 사용자 정보 버튼 */}
          <button
            onClick={() => setShowUserInfo(!showUserInfo)}
            className="p-2 hover:bg-background-section rounded-full transition-colors"
            aria-label="사용자 정보"
          >
            <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {/* 설정 버튼 */}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {/* 설정 드롭다운 */}
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-divider rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={() => {
                    setShowSettings(false)
                    alert("공지사항이 없습니다.")
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-section transition-colors"
                >
                  📢 공지 확인
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false)
                    alert("첨부된 이미지가 없습니다.")
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-section transition-colors"
                >
                  🖼️ 첨부 이미지
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-background-section transition-colors"
                >
                  🚪 대화방 나가기
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========== 사용자 정보 사이드바 ========== */}
      {showUserInfo && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/20 z-10"
            onClick={() => setShowUserInfo(false)}
          />
          
          {/* 사이드바 */}
          <aside className="absolute right-0 top-[57px] z-20 h-[calc(100vh-57px)] w-64 border-l border-divider bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">사용자 정보</h3>
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
            
            <div className="flex flex-col items-center gap-4">
              {/* 프로필 이미지 */}
              {partnerProfileImg ? (
                <img 
                  src={partnerProfileImg} 
                  alt={partnerName}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {partnerName[0]}
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h4 className="font-semibold text-foreground">{partnerName}</h4>
                <p className="text-sm text-text-secondary">활동 중</p>
              </div>
              <div className="w-full pt-4 border-t border-divider space-y-2">
                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-background-section rounded-lg transition-colors">
                  프로필 보기
                </button>
                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-background-section rounded-lg transition-colors">
                  차단하기
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ========== 메시지 목록 ========== */}
      <main ref = {chatContainerRef}
       className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.messageId}
            className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-2 max-w-[70%] ${
                message.isMe ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* 프로필 이미지 (상대방 메시지만) */}
              {!message.isMe && (
                <>
                  {partnerProfileImg ? (
                    <img 
                      src={partnerProfileImg} 
                      alt={partnerName}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {partnerName[0]}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* 메시지 내용 */}
              <div className="flex flex-col gap-1">
                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    message.isMe
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-gray-100 text-foreground rounded-bl-sm"
                  }`}
                >
                  {/* 이미지 첨부 */}
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
                  
                  {/* 텍스트 메시지 */}
                  {message.text && (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}
                </div>

                {/* 시간 표시 */}
                <span
                  className={`text-xs text-text-secondary px-2 ${
                    message.isMe ? "text-right" : "text-left"
                  }`}
                >
                  {message.timestamp}
                  {message.status === "sending" && " (전송 중...)"}
                  {message.status === "error" && " (전송 실패)"}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* 스크롤 최하단 참조 */}
        <div />
      </main>

      {/* ========== 입력 영역 ========== */}
      <footer className="border-t border-divider bg-background px-4 py-3">
        {/* 선택한 이미지 미리보기 */}
        {selectedImages.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {selectedImages.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img || "/placeholder.svg"}
                  alt="미리보기"
                  className="h-20 w-20 rounded-lg object-cover"
                />
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

        {/* 입력 필드 */}
        <div className="flex items-end gap-2">
          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* 이미지 추가 버튼 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-background-section rounded-full transition-colors"
            aria-label="이미지 추가"
          >
            <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* 텍스트 입력 */}
          <div className="flex-1 bg-background-section rounded-3xl px-4 py-2 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-text-secondary"
            />
            <button
              className="p-1 hover:opacity-70 transition-opacity"
              aria-label="이모티콘"
            >
              <SmileIcon className="h-5 w-5 text-text-secondary" />
            </button>
          </div>

          {/* 전송 버튼 */}
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