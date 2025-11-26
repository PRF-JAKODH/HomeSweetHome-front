"use client"

// ============================================
// 채팅 상세 화면 (chat-room-detail.tsx)
// ============================================
// [주요 기능]
// - 개인/그룹 채팅방의 실시간 메시지 송수신
// - WebSocket(STOMP) 기반 실시간 통신
// - 그룹 채팅방 입장/퇴장 이벤트 처리 (MEMBER_JOINED, MEMBER_LEFT)
// - 무한 스크롤로 이전 메시지 로드
// - 날짜 구분선, 시스템 메시지, 이미지 첨부
// ============================================

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
import { useMessagesStore } from "@/stores/messages-store"
import { formatDateHeader, isSameDay, formatMessageTime } from "@/lib/utils/date-util"
import { DateDivider } from "@/components/chat/date-divider"
import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner"

// ============================================
// 타입 정의
// ============================================

// 채팅방 타입 (개인 또는 그룹)
export type RoomType = "INDIVIDUAL" | "GROUP"

// 그룹 입장 타입 (신규/재입장/이미 가입)
export type JoinType = "NEW_MEMBER" | "REJOIN" | "ALREADY_JOINED";

// [백엔드 응답] 개인 채팅방 상세 정보
type IndividualChatDetailResponse = {
  roomId: number                    // 채팅방 ID
  partnerId: number                 // 상대방 사용자 ID
  partnerName: string              // 상대방 이름
  partnerProfileImageUrl: string   // 상대방 프로필 이미지
}

// [백엔드 응답] 그룹 채팅방 상세 정보
type GroupChatDetailResponse = {
  roomId: number                      // 채팅방 ID
  roomName: string                    // 채팅방 이름
  roomThumbnailUrl: string            // 채팅방 썸네일
  memberCount: number                 // 참여 인원 수
  participants: RoomMemberResponse[]  // 참여자 목록
}

// 그룹 채팅방 멤버 정보
type RoomMemberResponse = {
  userId: number        // 사용자 ID
  userName: string      // 사용자 이름
  profileUrl: string    // 프로필 이미지 URL
}

// [프론트엔드] 메시지 타입
type Message = {
  messageId: number                          // 메시지 고유 ID
  senderName?: string                         
  senderProfileImg?: string   
  senderId: number                           // 발신자 ID
  content: string                            // 메시지 내용
  timestamp: string                          // 표시용 시간 (예: "오후 3:25")
  sentAt: string                             // 실제 전송 시각 (ISO 8601)
  isMe: boolean                              // 내가 보낸 메시지인지 여부
  images?: string[]                          // 첨부 이미지 URL 배열
  status?: "sending" | "sent" | "error"     // 전송 상태
  messageType?: "user" | "system"            // 메시지 종류 (일반/시스템)
}

// [WebSocket 수신] 일반 채팅 메시지 DTO
export type ChatMessageDto = {
  messageId: number       // 메시지 ID
  roomId: number          // 채팅방 ID
  senderId: number        // 발신자 ID
  content: string         // 메시지 내용
  sentAt: string          // 전송 시각 (ISO 8601)
  senderName: string      // 발신자 이름
  senderProfileImg: string // 발신자 프로필 이미지
}

// [백엔드 응답] 이전 메시지 조회 응답
export type PreMessageResponse = {
  messages: ChatMessageDto[]  // 메시지 배열
  hasMore: boolean            // 추가 메시지 존재 여부
}

// [백엔드 응답] 그룹 입장 응답
export type JoinRoomResponse = {
  roomId: number                    // 채팅방 ID
  roomName: string                  // 채팅방 이름
  memberInfo: RoomMemberResponse[]  // 새로 입장한 멤버 정보
  joinType: JoinType[]              // 입장 타입 배열
}

// [WebSocket 수신] 채팅방 업데이트 데이터 (입장/퇴장 이벤트)
export type ChatRoomUpdateData = {
  roomId: number;                                    // 채팅방 ID
  updateType: 'MEMBER_JOINED' | 'MEMBER_LEFT' | string;  // 업데이트 타입
  data: JoinRoomResponse | Record<string, any>;     // 이벤트 데이터
  occurredAt: string;                               // 발생 시각
}

// [WebSocket 수신] STOMP 업데이트 메시지 래퍼
export type StompUpdateMessage = {
  type: string;               // "CHAT_ROOM_UPDATE" 등
  data: ChatRoomUpdateData;   // 실제 업데이트 데이터
  timestamp: string;          // 타임스탬프
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * [메시지 정렬]
 * 메시지 배열을 sentAt(전송 시각) 기준 오름차순 정렬
 */
const sortMessagesBySentAt = (msgs: Message[]) =>
  [...msgs].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())

/**
 * [메시지 병합 및 중복 제거]
 * 여러 메시지 배열을 하나로 합치고 messageId 기준으로 중복 제거
 * - 같은 ID가 있으면 최신 정보로 덮어씀
 */
const mergeMessages = (...messageLists: Message[][]) => {
  const messageMap = new Map<number, Message>()

  messageLists.flat().forEach((message) => {
    if (!message?.messageId) return
    const existing = messageMap.get(message.messageId)
    if (!existing) {
      messageMap.set(message.messageId, message)
      return
    }

    // 최신 정보(에러/성공 상태 포함)를 우선으로 반영
    const existingTime = new Date(existing.sentAt).getTime()
    const incomingTime = new Date(message.sentAt).getTime()
    if (incomingTime >= existingTime || existing.status === "sending") {
      messageMap.set(message.messageId, { ...existing, ...message })
    }
  })

  return sortMessagesBySentAt(Array.from(messageMap.values()))
}

// ============================================
// Props 타입
// ============================================

type ChatRoomDetailProps = {
  roomId: number                          // 채팅방 ID (필수)
  initialRoomType?: RoomType | null      // 초기 방 타입 (선택사항)
  embedded?: boolean                      // 임베디드 모드 여부
  onClose?: () => void                    // 닫기 콜백
  className?: string                      // 추가 CSS 클래스
}

// ============================================
// SVG 아이콘 컴포넌트들
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

// ============================================
// 메인 컴포넌트
// ============================================

export function ChatRoomDetail({
  roomId,
  initialRoomType = null,
  embedded = false,
  onClose,
  className,
}: ChatRoomDetailProps) {
  // --------------------------------------------
  // Hooks
  // --------------------------------------------
  const router = useRouter()
  const searchParamsType = initialRoomType
  const hasLeftRoomRef = useRef(false)


  // CSS 클래스 조합
  const rootClassName = ["flex flex-col h-full min-h-0 bg-background overflow-hidden", className]
    .filter(Boolean)
    .join(" ")

  // --------------------------------------------
  // State: 채팅방 기본 정보
  // --------------------------------------------
  const [roomType, setRoomType] = useState<RoomType | null>(searchParamsType)  // 채팅방 타입
  const [roomName, setRoomName] = useState<string>("")                          // 채팅방/상대방 이름
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("")                  // 썸네일/프로필 이미지
  const [memberCount, setMemberCount] = useState<number>(0)                     // 그룹 참여 인원
  const [groupMembers, setGroupMembers] = useState<RoomMemberResponse[]>([])    // 그룹 참여자 목록
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)                     // 나가기 진행 중

  // --------------------------------------------
  // State: 메시지 관련
  // --------------------------------------------
  const [messages, setMessages] = useState<Message[]>([])                       // 메시지 목록
  const [inputValue, setInputValue] = useState("")                              // 입력 중인 메시지
  const [selectedImages, setSelectedImages] = useState<string[]>([])            // 첨부할 이미지들

  // --------------------------------------------
  // State: 연결 및 로딩 상태
  // --------------------------------------------
  const [isConnected, setIsConnected] = useState(false)                         // WebSocket 연결 여부
  const [hasMore, setHasMore] = useState(true)                                  // 더 불러올 메시지 존재
  const [loadingMore, setLoadingMore] = useState(false)                         // 이전 메시지 로딩 중
  const [loading, setLoading] = useState(true)                                  // 초기 로딩 중
  const [error, setError] = useState<string | null>(null)                       // 에러 메시지
  const [hasShownEntryNotice, setHasShownEntryNotice] = useState(false)         // 입장 메시지 표시 완료

  // --------------------------------------------
  // State: 개인 채팅방 상대방 정보
  // --------------------------------------------
  const [partnerId, setPartnerId] = useState<number | null>(null)               // 상대방 ID
  const [partnerName, setPartnerName] = useState<string>("상대방")              // 상대방 이름

  // --------------------------------------------
  // State: UI 제어
  // --------------------------------------------
  const [showUserInfo, setShowUserInfo] = useState(false)                       // 사용자 정보 모달
  const [showSettings, setShowSettings] = useState(false)                       // 설정 드롭다운

  // --------------------------------------------
  // Refs
  // --------------------------------------------
  const fileInputRef = useRef<HTMLInputElement>(null)                           // 파일 입력
  const messagesEndRef = useRef<HTMLDivElement>(null)                           // 스크롤 하단 감지
  const chatContainerRef = useRef<HTMLDivElement>(null)                         // 메시지 컨테이너
  const topSentinelRef = useRef<HTMLDivElement>(null)                           // 무한 스크롤 감지 (상단)
  const isSubscribedRef = useRef(false)                                         // WebSocket 구독 여부

  // --------------------------------------------
  // Zustand Store (전역 상태)
  // --------------------------------------------
  const user = useAuthStore((s) => s.user)                                      // 현재 사용자
  const accessToken = useAuthStore((s) => s.accessToken)                        // 인증 토큰
  const updateRoomSummary = useMessagesStore((state) => state.updateRoomSummary) // 채팅방 요약 업데이트
  const formatTimestamp = formatMessageTime                                      // 시간 포맷팅 함수

  // ============================================
  // Effect 1: roomType 동기화
  // ============================================
  useEffect(() => {
    setRoomType(searchParamsType)
  }, [searchParamsType])

  // ============================================
  // Effect 2: 채팅방 변경 시 초기화
  // ============================================
  useEffect(() => {
    setMessages([])                     // 메시지 목록 비우기
    setHasMore(true)                    // 무한 스크롤 활성화
    setLoading(true)                    // 로딩 시작
    setError(null)                      // 에러 초기화
    setShowUserInfo(false)              // 모달 닫기
    setShowSettings(false)              // 드롭다운 닫기
    isSubscribedRef.current = false     // 구독 상태 초기화
    setHasShownEntryNotice(false)       // 입장 메시지 초기화
  }, [roomId])

  // ============================================
  // Effect 3: 채팅방 요약 업데이트 (기본 정보)
  // ============================================
  useEffect(() => {
    if (!roomType) return
    if (roomType === "INDIVIDUAL" && (!partnerName || partnerName === "상대방")) return
    if (roomType === "GROUP" && (!roomName || roomName.trim() === "")) return

    updateRoomSummary({
      id: roomId,
      type: roomType,
      opponentName: roomType === "INDIVIDUAL" ? partnerName : undefined,
      opponentAvatar: roomType === "INDIVIDUAL" ? thumbnailUrl : undefined,
      roomName: roomType === "GROUP" ? roomName : undefined,
      thumbnail: roomType === "GROUP" ? thumbnailUrl : undefined,
    })
  }, [roomType, partnerName, roomName, thumbnailUrl, roomId])

  // ============================================
  // Effect 4: 채팅방 요약 업데이트 (마지막 메시지)
  // ============================================
  useEffect(() => {
    if (!roomType) return
    if (messages.length === 0) return
    if (roomType === "INDIVIDUAL" && (!partnerName || partnerName === "상대방")) return
    if (roomType === "GROUP" && (!roomName || roomName.trim() === "")) return

    const lastMessage = messages[messages.length - 1]
    const lastMessagePreview =
      lastMessage.content?.trim() ||
      (lastMessage.images && lastMessage.images.length > 0 ? "사진을 보냈습니다." : "")
    const displayTime = formatRelativeTime(lastMessage.sentAt) || lastMessage.timestamp

    updateRoomSummary({
      id: roomId,
      type: roomType,
      lastMessage: lastMessagePreview,
      time: displayTime,
      opponentName: roomType === "INDIVIDUAL" ? partnerName : undefined,
      opponentAvatar: roomType === "INDIVIDUAL" ? thumbnailUrl : undefined,
      roomName: roomType === "GROUP" ? roomName : undefined,
      thumbnail: roomType === "GROUP" ? thumbnailUrl : undefined,
    })
  }, [messages, roomType, partnerName, roomName, thumbnailUrl, roomId])

  // ============================================
  // Effect 5: 그룹 입장 시스템 메시지
  // ============================================
  useEffect(() => {
    if (hasShownEntryNotice) return
    if (roomType !== "GROUP") return
    if (!user?.name) return

    const nowIso = new Date().toISOString()
    const entryMessage: Message = {
      messageId: Number(`${Date.now()}999`),
      senderId: user.id ?? 0,
      content: `${user.name}님이 입장하셨습니다.`,
      timestamp: formatTimestamp(nowIso),
      sentAt: nowIso,
      isMe: false,
      status: "sent",
      messageType: "system",
    }

    setMessages((prev) => mergeMessages(prev, [entryMessage]))
    setHasShownEntryNotice(true)
  }, [roomType, user?.name, hasShownEntryNotice, formatTimestamp])

  // ============================================
  // Effect 6: WebSocket 연결 및 구독
  // ============================================
  useEffect(() => {
    if (!roomId || !accessToken) return
  
    let mounted = true  // 언마운트 감지용
  
    const init = async () => {
      try {
        // [1단계] 채팅방 정보 로드
        await fetchChatRoomInfo()
  
        // [2단계] WebSocket 연결
        await connectStomp({
          onConnected: () => {
            if (!mounted) return
            setIsConnected(true)
  
            // 중복 구독 방지
            if (isSubscribedRef.current) {
              console.log("[WebSocket] 이미 구독 중, 스킵")
              return
            }
  
            // [3단계] 메시지 수신 구독
            // - 일반 채팅 메시지 (TALK)
            // - 그룹 업데이트 이벤트 (MEMBER_JOINED, MEMBER_LEFT)
            subscribeToTopic(`/sub/chat/rooms/${roomId}`, handleStompMessageReceived)
            isSubscribedRef.current = true
            console.log("[WebSocket] 구독 완료, roomId:", roomId)
          },
          onError: (error) => {
            console.error("[WebSocket] 연결 실패:", error)
            setIsConnected(false)
          },
        })
      } catch (error) {
        console.error("[초기화] 실패:", error)
      }
    }
  
    init()
  
    // Cleanup
    return () => {
      mounted = false
  
      if (isSubscribedRef.current) {
        console.log("[WebSocket] 구독 해제, roomId:", roomId)
        unsubscribeFromTopic(`/sub/rooms/${roomId}`)
        isSubscribedRef.current = false
      }
    }
  }, [roomId, accessToken, memberCount])

  // ============================================
  // 함수: 채팅방 정보 조회
  // - 그룹 채팅방의 경우 자동으로 입장/재입장 처리 (POST 요청)
  // ============================================
  const fetchChatRoomInfo = async () => {
    const myUserId = useAuthStore.getState().user?.id

    try {
      setLoading(true)
      setError(null)

      let roomInfo: IndividualChatDetailResponse | GroupChatDetailResponse
      let type: RoomType

      // [경우 1] 개인 채팅방으로 명시된 경우
      if (searchParamsType === "INDIVIDUAL") {
        console.log("[채팅방 정보] 개인 채팅방 요청, roomId:", roomId)
        const response = await apiClient.get<IndividualChatDetailResponse>(
          `/api/v1/chat/rooms/individual/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        roomInfo = response.data
        type = "INDIVIDUAL"
        
      // [경우 2] 그룹 채팅방으로 명시된 경우
    } else if (searchParamsType === "GROUP") {
      console.log("[채팅방 정보] 그룹 채팅방 요청, roomId:", roomId)
      type = "GROUP"
      
      // 🔹 [1단계] 멤버 등록 API 호출
      // POST /api/v1/chat/members/group/{roomId}
      // - 신규 멤버 등록 또는 재입장 처리 (is_exit = false로 변경)
      try {
        console.log("🔹 [1단계] 멤버 등록 API 호출 (POST /group/{roomId})")
        
        const memberResponse = await apiClient.post<JoinRoomResponse>(
          `/api/v1/chat/members/group/${roomId}`, 
          {}, 
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        
        const joinType = memberResponse.data.joinType?.[0] // NEW_MEMBER, REJOIN, ALREADY_JOINED
        console.log(`✅ [멤버 등록] 성공, joinType: ${joinType}`)
        
        // joinType에 따른 로그
        if (joinType === "NEW_MEMBER") {
          console.log("   → 신규 멤버로 등록됨")
        } else if (joinType === "REJOIN") {
          console.log("   → 퇴장했던 멤버 재입장")
        } else if (joinType === "ALREADY_JOINED") {
          console.log("   → 이미 활성 멤버임")
        }

      } catch (memberError: any) {
        console.error("❌ [멤버 등록] 실패:", memberError.response?.data?.message || memberError.message)
        
        // 멤버 등록 실패 시 에러 처리
        if (memberError.response?.status === 403) {
          throw new Error("이 채팅방에 참여할 권한이 없습니다.")
        } else if (memberError.response?.status === 404) {
          throw new Error("존재하지 않는 채팅방입니다.")
        } else {
          throw memberError
        }
      }
      
      // 🔹 [2단계] 입장 알림 API 호출
      // POST /api/v1/chat/rooms/{roomId}/join
      // - WebSocket으로 다른 사용자들에게 "OOO님이 입장했습니다" 알림
      try {
        console.log("🔹 [2단계] 입장 알림 API 호출 (POST /{roomId}/join)")
        
        await apiClient.post(
          `/api/v1/chat/rooms/${roomId}/join`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        
        console.log("[입장 알림] 성공 - 다른 사용자들에게 입장 알림 전송됨")
        
      } catch (joinError: any) {
        // 입장 알림 실패는 치명적이지 않으므로 경고만 표시
        console.warn("[입장 알림] 실패:", joinError.response?.data?.message || joinError.message)
        // 계속 진행 (방 정보는 가져올 수 있음)
      }
      
      // 🔹 [3단계] 그룹 채팅방 상세 조회
      // GET /api/v1/chat/rooms/group/{roomId}
      // - 최신 멤버 목록 및 방 정보 가져오기
      console.log("[3단계] 방 상세 정보 조회 (GET /group/{roomId})")
      
      const response = await apiClient.get<GroupChatDetailResponse>(
        `/api/v1/chat/rooms/group/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )
      roomInfo = response.data
      console.log("[방 정보] 로드 완료")

      // [경우 3] 타입을 모르는 경우: 개인 → 그룹 순서로 시도
      } else {
        try {
          // 1차 시도: 개인 채팅방
          console.log("[채팅방 정보] 타입 미지정, 개인 채팅방 시도, roomId:", roomId)
          const response = await apiClient.get<IndividualChatDetailResponse>(
            `/api/v1/chat/rooms/individual/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          )
          roomInfo = response.data
          type = "INDIVIDUAL"
        } catch (individualError) {
          // 2차 시도: 그룹 채팅방 (POST → GET)
          console.log("[채팅방 정보] 개인 실패, 그룹 채팅방 시도, roomId:", roomId)
          type = "GROUP"
            


        // 🔹 [1단계] 멤버 등록
        try {
          console.log("🔹 [1단계] 멤버 등록 API 호출")
          
          const memberResponse = await apiClient.post<JoinRoomResponse>(
            `/api/v1/chat/members/group/${roomId}`,
            {},
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )
          
          const joinType = memberResponse.data.joinType?.[0]
          console.log(`[멤버 등록] 성공, joinType: ${joinType}`)
          
        } catch (memberError: any) {
          console.error(" [멤버 등록] 실패:", memberError.response?.data?.message || memberError.message)
          throw memberError
        }
        
        // 🔹 [2단계] 입장 알림
        try {
          console.log("🔹 [2단계] 입장 알림 API 호출")
          
          await apiClient.post(
            `/api/v1/chat/rooms/${roomId}/join`,
            {},
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )
          
          console.log("[입장 알림] 성공")
          
        } catch (joinError: any) {
          console.warn("[입장 알림] 실패:", joinError.response?.data?.message || joinError.message)
        }
        
        // 🔹 [3단계] 방 상세 정보 조회
        console.log("🔹 [3단계] 방 상세 정보 조회")
        
        const response = await apiClient.get<GroupChatDetailResponse>(
          `/api/v1/chat/rooms/group/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        roomInfo = response.data
        console.log("[방 정보] 로드 완료")

        // 🆕 [4단계] 그룹 채팅방 목록 전체 새로고침
      // updateRoomSummary는 memberCount 필드가 없어서 사용 불가
      // 대신 전체 목록을 다시 불러옴
      console.log("🔹 [4단계] 그룹 채팅방 목록 새로고침")
      try {
        await useMessagesStore.getState().fetchGroupRooms(accessToken!)
        console.log("✅ [목록 새로고침] 완료")
      } catch (refreshError) {
        console.warn("⚠️ [목록 새로고침] 실패:", refreshError)
        // 실패해도 계속 진행 (치명적이지 않음)
      }
    }
  }

    console.log("[채팅방 정보] 로드 성공, type:", type)

    setRoomType(type)

    // [타입별 상태 설정]
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

      // [초기 메시지 로드]
      await fetchInitialMessages()

    } catch (error: any) {
      console.error("[채팅방 정보] 로드 실패:", error.response?.data?.message || error.message)
      setError(error.message || error.response?.data?.message || "채팅방 정보를 불러올 수 없습니다")
      setPartnerName("상대방")
      setThumbnailUrl("")
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // 함수: 초기 메시지 로드 (최근 30개)
  // ============================================
  const fetchInitialMessages = async () => {
    const myUserId = useAuthStore.getState().user?.id

    try {
      const response = await apiClient.get<PreMessageResponse>(
        `/api/v1/chat/rooms/${roomId}/messages`,
        {
          params: { size: 30 },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )

      const { messages: newMessages, hasMore } = response.data

      const parsedMessages = newMessages.map((msg: ChatMessageDto) => ({
        messageId: msg.messageId,
        senderId: msg.senderId,
        content: msg.content,
        timestamp: formatTimestamp(msg.sentAt),
        sentAt: msg.sentAt,
        isMe: msg.senderId === myUserId,
        status: "sent" as const,
        messageType: "user" as const,
      }))

      setMessages(mergeMessages(parsedMessages))
      setHasMore(hasMore)
      console.log("[초기 메시지] 로드 완료, 개수:", parsedMessages.length)

      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error("[초기 메시지] 로드 실패:", error)
    }
  }

  // ============================================
  // 함수: 그룹 멤버 목록 갱신
  // - MEMBER_JOINED, MEMBER_LEFT 이벤트 발생 시 호출
  // - 최신 참여자 목록과 인원 수를 서버에서 다시 불러옴
  // ============================================
  const fetchGroupMembers = async () => {
    if (hasLeftRoomRef.current) {
      console.log("[멤버 갱신] 이미 퇴장한 방이므로 스킵")
      return
    }
    
    if (roomType !== 'GROUP' || !roomId || !accessToken) return;    
    try {
        const response = await apiClient.get<GroupChatDetailResponse>(
            `/api/v1/chat/rooms/group/${roomId}`, 
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        
        const groupInfo = response.data;
        
        // 상태 업데이트
        setMemberCount(groupInfo.memberCount);
        setGroupMembers(groupInfo.participants);
        console.log("[멤버 갱신] Stomp 이벤트로 인해 참여자 목록 업데이트됨:", groupInfo.memberCount);
        
    } catch (error) {
        console.error("[멤버 갱신] API 호출 실패:", error);
    }
  }

  // ============================================
  // 함수: 일반 대화 메시지 처리 (TALK)
  // - WebSocket으로 수신한 채팅 메시지를 화면에 표시
  // ============================================
  const handleTalkMessage = (msgBody: any) => {
    try {
        const payload = msgBody as ChatMessageDto

        console.log("[TALK 수신] senderId:", payload.senderId, "content:", payload.content)

        // 내가 보낸 메시지는 무시 (낙관적 업데이트로 이미 표시됨)
        if (payload.senderId === user?.id) {
            return
        }

        const newMessage: Message = {
          messageId: payload.messageId,
          senderId: payload.senderId,
          senderName: payload.senderName,
          senderProfileImg: payload.senderProfileImg,
          content: payload.content,
          sentAt: payload.sentAt,
          timestamp: formatTimestamp(payload.sentAt),
          isMe: false,
          status: "sent",
          messageType: "user",
      }

        setMessages((prev) => mergeMessages(prev, [newMessage]))
        setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
        console.error("[TALK 메시지] 파싱/처리 실패:", error)
    }
  }

  // ============================================
  // 함수: 채팅방 업데이트 이벤트 처리
  // - MEMBER_JOINED: 새로운 멤버 입장 → 시스템 메시지 표시 + 멤버 목록 갱신
  // - MEMBER_LEFT: 멤버 퇴장 → 시스템 메시지 표시 + 멤버 목록 갱신
  // ============================================
  const handleUpdateMessage = (updateMsg: StompUpdateMessage) => {
    if (roomType !== 'GROUP') return; // 그룹 채팅방에서만 처리

    const { updateType, data: eventData } = updateMsg.data;
    
    // [1] 참여자 입장 이벤트
    if (updateType === 'MEMBER_JOINED') {
        const joinResponse = eventData as JoinRoomResponse;
        const newMember = joinResponse.memberInfo[0]; // 첫 번째 멤버 정보
        
        if (!newMember) return;

        console.log(`➡️ [MEMBER_JOINED] ${newMember.userName} 입장`);
        
        // 시스템 메시지 생성
        const systemMessage: Message = {
            messageId: Date.now() + Math.random(), 
            senderId: 0, 
            content: `${newMember.userName}님이 입장했습니다.`,
            sentAt: updateMsg.timestamp,
            timestamp: formatMessageTime(updateMsg.timestamp),
            isMe: false,
            status: "sent",
            messageType: "system",
        };

        setMessages((prev) => mergeMessages(prev, [systemMessage]));
        
        // 그룹 멤버 목록 갱신 API 호출
        fetchGroupMembers(); 

    // [2] 참여자 퇴장 이벤트
    } else if (updateType === 'MEMBER_LEFT') {
        const exitData = eventData as { userId: number, userName: string };


        if (!exitData || !exitData.userName) {
          console.warn("[MEMBER_LEFT] userName 없음", eventData);
          return;
      }
        
        const systemMessage: Message = {
             messageId: Date.now() + Math.random(), 
             senderId: 0, 
             content: `${exitData.userName}님이 퇴장했습니다.`,
             sentAt: updateMsg.timestamp,
             timestamp: formatMessageTime(updateMsg.timestamp),
             isMe: false,
             status: "sent",
             messageType: "system",
        };
        
        setMessages((prev) => mergeMessages(prev, [systemMessage]));
        fetchGroupMembers();

    } else {
        console.log(`[UPDATE] 처리되지 않은 업데이트 타입: ${updateType}`);
    }
    
    setTimeout(() => scrollToBottom(), 100);
  }

  // ============================================
  // 함수: STOMP 메시지 수신 핸들러 (통합)
  // - type 필드를 확인하여 적절한 핸들러로 분기
  // - TALK: 일반 채팅 메시지 → handleTalkMessage()
  // - CHAT_ROOM_UPDATE: 그룹 업데이트 이벤트 → handleUpdateMessage()
  // ============================================
  const handleStompMessageReceived = (msg: IMessage) => {
    console.log("🔔 [Stomp] 원본 메시지:", msg.body)

    if (hasLeftRoomRef.current) {
      console.log("[Stomp] 이미 퇴장한 방의 메시지 무시")
      return
    }

    try {
        const payload = JSON.parse(msg.body);


        const type = payload.type || ''; // 백엔드의 type 필드

        if (type === 'TALK') {
            handleTalkMessage(payload.data || payload); // 일반 대화 메시지
        } else if (type === 'CHAT_ROOM_UPDATE') {
            handleUpdateMessage(payload); // 그룹 업데이트 이벤트
        } else {
            // type 필드가 없는 경우 대체 처리
            if(payload.content && payload.senderId) {
                // content와 senderId가 있으면 TALK로 간주
                handleTalkMessage(payload);
            } else {
                console.warn(`[Stomp] 알 수 없는 메시지 타입 수신: ${type || '타입 없음'}`, payload);
            }
        }
    } catch (error) {
        console.error("[Stomp 메시지] 파싱 실패:", error);
    }
  }

  // ============================================
  // 함수: 메시지 전송
  // ============================================
  const handleSendMessage = () => {
    if (!inputValue.trim() && selectedImages.length === 0) {
      return
    }

    if (!isConnected) {
      alert("채팅 서버와 연결이 끊어졌습니다. 다시 시도해주세요.")
      return
    }

    if (!user?.id) {
      alert("로그인이 필요합니다.")
      return
    }

    const senderId = user.id
    const senderProfileImg = user.profileImageUrl
    const senderName = user.name

    // 낙관적 업데이트: 임시 메시지 생성
    const tempMessage: Message = {
      messageId: Date.now(),
      senderId: senderId,
      content: inputValue,
      timestamp: formatTimestamp(new Date().toISOString()),
      sentAt: new Date().toISOString(),
      isMe: true,
      status: "sending",
      images: selectedImages.length > 0 ? selectedImages : undefined,
      messageType: "user",
    }

    setMessages((prev) => mergeMessages(prev, [tempMessage]))

    try {
      // WebSocket으로 전송
      sendChatMessage("/chat.send", {
        roomId: roomId,
        senderId: senderId,
        senderName: senderName, 
        senderProfileImg: senderProfileImg,
        content: inputValue,
      })
      console.log("[메시지 전송] 성공, roomId:", roomId)

      // 전송 성공: 상태를 "sent"로 변경
      setMessages((prev) =>
        prev.map((msg) => (msg.messageId === tempMessage.messageId ? { ...msg, status: "sent" } : msg)),
      )

      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error("[메시지 전송] 실패:", error)

      // 전송 실패: 상태를 "error"로 변경
      setMessages((prev) =>
        prev.map((msg) => (msg.messageId === tempMessage.messageId ? { ...msg, status: "error" } : msg)),
      )

      alert("메시지 전송에 실패했습니다.")
    }

    setInputValue("")
    setSelectedImages([])
  }

  // ============================================
  // 함수: 이전 메시지 로드 (무한 스크롤)
  // ============================================
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
      console.log("[이전 메시지] 요청, lastMessageId:", lastMessageId)
      const response = await apiClient.get(`/api/v1/chat/rooms/${roomId}/messages`, {
        params: { lastMessageId, size: 30 },
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
      })

      // 디버깅용 로그
      console.log("🔍 전체 응답:", response)
      console.log("🔍 response.data:", response.data)
      console.log("🔍 hasMore 값:", response.data.hasMore)
      console.log("🔍 hasNext 값:", response.data.hasNext)

      const { messages: newMessages, hasMore } = response.data
      
      console.log("🔍 디스트럭처링 후:", { newMessages, hasMore })
      const myUserId = useAuthStore.getState().user?.id

      if (newMessages.length === 0) {
        console.log("[이전 메시지] 응답이 비어있음")
        setHasMore(false)
        return
      }

      const parsedNewMessages = newMessages.map((msg: ChatMessageDto) => ({
        messageId: msg.messageId,
        senderId: msg.senderId,
        content: msg.content,
        timestamp: formatTimestamp(msg.sentAt),
        sentAt: msg.sentAt,
        isMe: msg.senderId === myUserId,
        status: "sent" as const,
        messageType: "user" as const,
      }))

      const container = chatContainerRef.current
      const previousScrollHeight = container?.scrollHeight || 0

      setMessages((prev) => mergeMessages(parsedNewMessages, prev))
      setHasMore(hasMore)

      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - previousScrollHeight
        }
      }, 0)
      console.log("[이전 메시지] 로드 완료, 개수:", parsedNewMessages.length)
    } catch (error) {
      console.error("[이전 메시지] 로드 실패:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  // ============================================
  // 이벤트 핸들러: Enter 키 입력
  // ============================================
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // ============================================
  // 이벤트 핸들러: 이미지 파일 선택
  // ============================================
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
    setSelectedImages((prev) => [...prev, ...imageUrls])
  }

  // ============================================
  // 이벤트 핸들러: 이미지 제거
  // ============================================
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // ============================================
  // 유틸리티: 상대적 시간 표시
  // ============================================
  const formatRelativeTime = (isoString?: string): string => {
    if (!isoString) return "방금 전"
    const messageTime = new Date(isoString)
    if (Number.isNaN(messageTime.getTime())) return "방금 전"

    const now = new Date()
    const diffMs = now.getTime() - messageTime.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return "방금 전"
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return messageTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
  }

  // ============================================
  // 이벤트 핸들러: 채팅방 나가기
  // ============================================
  const handleLeaveRoom = async () => {
    if (isLeavingRoom) return
    
    if (!confirm("대화방을 나가시겠습니까?")) {
      return
    }
  
    setIsLeavingRoom(true)
  
    try {
      await apiClient.post(
        `/api/v1/chat/rooms/${roomId}/exit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      console.log("[채팅방 퇴장] 성공, roomId:", roomId)
      hasLeftRoomRef.current = true

      toast("채팅방에서 나갔습니다.");

      disconnectStomp()
      useMessagesStore.getState().removeRoom(roomId)
  
      if (roomType === "INDIVIDUAL") {
        await useMessagesStore.getState().fetchIndividualRooms(accessToken!)
      } else if (roomType === "GROUP") {
        await useMessagesStore.getState().fetchGroupRooms(accessToken!)
      }
  
      if (embedded) {
        onClose?.()
      } else {
        router.push("/messages")
      }

    } catch (error: any) {
      console.error("[채팅방 퇴장] 실패:", error.response?.data?.message || error.message)

      hasLeftRoomRef.current = false

      alert(error.response?.data?.message || "채팅방 나가기에 실패했습니다.")
    } finally {
      setIsLeavingRoom(false)
    }
  }

  // ============================================
  // 유틸리티: 스크롤을 맨 아래로
  // ============================================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // ============================================
  // Effect 7: IntersectionObserver 설정 (무한 스크롤)
  // ============================================
  useEffect(() => {
    const container = chatContainerRef.current
    const sentinel = topSentinelRef.current
    
    if (!container || !sentinel || !hasMore) {
      console.log("[IntersectionObserver] 조건 미충족", {
        hasContainer: !!container,
        hasSentinel: !!sentinel,
        hasMore
      })
      return
    }

    console.log("[IntersectionObserver] 설정 시작")

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries
        
        if (!entry?.isIntersecting) return
        
        if (loadingMore) {
          console.log("[IntersectionObserver] 이미 로딩 중")
          return
        }
        
        const firstMessageId = messages[0]?.messageId
        if (!firstMessageId) return
        
        console.log("[IntersectionObserver] 트리거, firstMessageId:", firstMessageId)
        await fetchOlderMessages(firstMessageId)
      },
      {
        root: container,
        threshold: 0,
        rootMargin: "100px 0px 0px 0px",
      },
    )

    observer.observe(sentinel)
    
    return () => {
      console.log("[IntersectionObserver] 정리")
      observer.disconnect()
    }
  }, [messages, loadingMore, hasMore])

  // ============================================
  // 렌더링: 로딩 상태
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-text-secondary">채팅방 정보를 불러오는 중...</p>
      </div>
    )
  }

  // ============================================
  // 렌더링: 에러 상태
  // ============================================
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    )
  }

  // ============================================
  // 메인 렌더링 (이하 동일, 생략)
  // ============================================
  
  // ... (나머지 JSX는 이전과 동일하므로 생략)

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
                {/* <button
                  onClick={handleLeaveRoom}
                  disabled={isLeavingRoom}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-background-section transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLeavingRoom && (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-500 border-t-transparent" />
                  )}
                  {isLeavingRoom ? "나가는 중..." : "대화방 나가기"}
                </button> */}
                <button
                  onClick={handleLeaveRoom}
                  disabled={isLeavingRoom}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-background-section transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLeavingRoom ? "나가는 중..." : "대화방 나가기"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showUserInfo && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-black/50 z-50" 
            onClick={() => setShowUserInfo(false)} 
          />

          {/* 모달 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-slideUp">
              {/* 헤더 */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-divider bg-background-section">
                <button
                  onClick={() => setShowUserInfo(false)}
                  className="p-2 hover:bg-background rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-bold text-foreground flex-1">
                  {roomType === "INDIVIDUAL" ? "사용자 정보" : roomName || "참여자 목록"}
                </h3>
              </div>

              {/* 내용 */}
              <div className="flex-1 overflow-y-auto">
                {roomType === "INDIVIDUAL" ? (
                  <div className="flex flex-col items-center gap-4 p-6">
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt={partnerName} className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-primary">{partnerName[0]}</span>
                      </div>
                    )}

                    <div className="text-center">
                      <h4 className="font-semibold text-foreground text-lg">{partnerName}</h4>
                    </div>

                    <div className="w-full pt-4 border-t border-divider space-y-2">
                      <button className="w-full px-4 py-3 text-sm text-foreground hover:bg-background-section rounded-xl transition-colors">
                        프로필 보기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 p-3 hover:bg-background-section rounded-xl transition-colors"
                      >
                        {/* 프로필 이미지 */}
                        <div className="relative">
                          {member.profileUrl ? (
                            <img 
                              src={member.profileUrl} 
                              alt={member.userName} 
                              className="h-12 w-12 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-lg font-semibold text-primary">{member.userName[0]}</span>
                            </div>
                          )}
                          
                          {/* 알림 뱃지 (선택사항) */}
                          {/* {hasNotification && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">N</span>
                            </div>
                          )} */}
                        </div>

                        {/* 이름 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.userName}
                            {member.userId === user?.id && (
                              <span className="ml-2 text-xs text-text-secondary">(나)</span>
                            )}
                          </p>
                        </div>

                        {/* 메뉴 버튼 */}
                        <button
                          className="p-2 hover:bg-background rounded-full transition-colors"
                          aria-label="메뉴"
                        >
                          <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <main ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4">
        <div ref={topSentinelRef} className="h-1" aria-hidden />
        {/* 로딩 인디케이터 */}
        {loadingMore && (
          <div className="flex justify-center py-4 animate-fadeIn">
            <div className="flex items-center gap-2 px-4 py-2 bg-background-section rounded-full shadow-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm text-text-secondary">메시지 불러오는 중...</span>
            </div>
          </div>
        )}
       {/* 메시지 목록 */}
      {messages.map((message, index) => {
          // 이전 메시지와 날짜가 다르면 날짜 헤더 표시
          const showDateHeader = 
            index === 0 || 
            !isSameDay(message.sentAt, messages[index - 1].sentAt)

          return (
            <React.Fragment key={message.messageId}>
              {/* ✅ 날짜 구분선 컴포넌트 사용 */}
              {showDateHeader && (
                <DateDivider 
                  date={formatDateHeader(message.sentAt)} 
                  variant="badge"  // default, line, badge, card 중 선택
                />
              )}

              {/* 시스템 메시지 */}
              {message.messageType === "system" ? (
                <div className="flex justify-center">
                  <span className="px-3 py-1 text-xs text-text-secondary bg-background-section rounded-full">
                    {message.content}
                  </span>
                </div>
              ) : (
              /* 메시지 */
              <div className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
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
              )}
            </React.Fragment>
          )
        })}

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

