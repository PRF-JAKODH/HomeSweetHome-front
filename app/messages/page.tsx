"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

// 타입 정의 수정 - 옵셔널 필드 명시
type IndividualRoomListResponseDto = {
  roomId: number
  roomType: string
  memberCount: number
  partnerId: number
  partnerName: string
  thumbnailUrl: string | null
  lastMessage: string | null
  lastMessageAt: string | null
}

type GroupRoomListResponse = {
  roomId: number
  roomName: string
  roomType: string
  thumbnailUrl: string | null
  memberCount: number
  lastMessage: string | null
  lastMessageAt: string | null
}

type Room = {
  id: number
  opponentId: number
  opponentName: string
  opponentAvatar: string
  lastMessage: string
  time: string
  unread?: number  
}

type GroupRoom = {
  id: number
  roomName: string
  thumbnail: string
  lastMessage: string
  time: string
  memberCount: number
  unread?: number  
}

/**
 * 시간을 상대적 표현으로 변환하는 유틸 함수 (수정됨)
 */
function formatRelativeTime(isoString: string | null | undefined): string {
  // null, undefined, 빈 문자열 모두 처리
  if (!isoString || isoString.trim() === "") {
    return "최근 활동 없음"
  }

  try {
    const now = new Date()
    const messageTime = new Date(isoString)
    
    // Invalid Date 체크
    if (isNaN(messageTime.getTime())) {
      return "최근 활동 없음"
    }

    const diffMs = now.getTime() - messageTime.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return "방금 전"
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    
    return messageTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
  } catch (error) {
    console.error("시간 포맷 변환 실패:", error)
    return "최근 활동 없음"
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"dm" | "chatroom">("dm")
  const [dmList, setDmList] = useState<Room[]>([])
  const [groupList, setGroupList] = useState<GroupRoom[]>([])
  const [loadingDm, setLoadingDm] = useState(false)
  const [loadingGroup, setLoadingGroup] = useState(false)

  /**
   * 내가 속한 개인 채팅방 목록 불러오기
   */
  useEffect(() => {
    const fetchMyIndividualRooms = async () => {
      try {
        setLoadingDm(true)

        const { accessToken } = useAuthStore.getState()

        const res = await apiClient.get<IndividualRoomListResponseDto[]>(
          "/api/v1/chat/rooms/my/individual",
          {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
          }
        )

        console.log("✅ 개인 채팅방 목록 API 응답:", res.data)
        
        // 각 채팅방의 상세 정보 로깅
        res.data.forEach((room, index) => {
          console.log(`📋 [개인 채팅방 ${index + 1}]`, {
            roomId: room.roomId,
            partnerName: room.partnerName,
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
            hasLastMessage: !!room.lastMessage,
            hasLastMessageAt: !!room.lastMessageAt
          })
        })

        // 백엔드 응답 → 프론트엔드 타입으로 변환
        const mapped: Room[] = res.data.map((room) => ({
          id: room.roomId,
          opponentId: room.partnerId,
          opponentName: room.partnerName,
          opponentAvatar: room.thumbnailUrl || "/placeholder.svg",
          lastMessage: room.lastMessage || "대화를 시작해보세요",
          time: formatRelativeTime(room.lastMessageAt),
        }))

        console.log("✅ 변환된 개인 채팅방 목록:", mapped)
        setDmList(mapped)
      } catch (error) {
        console.error("❌ 개인 채팅방 목록 불러오기 실패:", error)
      } finally {
        setLoadingDm(false)
      }
    }

    fetchMyIndividualRooms()
  }, [])

  /**
   * 내가 속한 그룹 채팅방 목록 불러오기
   */
  useEffect(() => {
    const fetchMyGroupRooms = async () => {
      try {
        setLoadingGroup(true)

        const { accessToken } = useAuthStore.getState()

        const res = await apiClient.get<GroupRoomListResponse[]>(
          "/api/v1/chat/rooms/my/group",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          }
        )

        console.log("✅ 그룹 채팅방 목록 API 응답:", res.data)
        
        // 각 채팅방의 상세 정보 로깅
        res.data.forEach((room, index) => {
          console.log(`📋 [그룹 채팅방 ${index + 1}]`, {
            roomId: room.roomId,
            roomName: room.roomName,
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
            hasLastMessage: !!room.lastMessage,
            hasLastMessageAt: !!room.lastMessageAt
          })
        })

        const mapped: GroupRoom[] = res.data.map((room) => ({
          id: room.roomId,
          roomName: room.roomName,
          thumbnail: room.thumbnailUrl || "/placeholder.svg",
          lastMessage: room.lastMessage || "방 멤버들과 인사를 나눠보세요.",
          time: formatRelativeTime(room.lastMessageAt),
          memberCount: Number(room.memberCount) || 0,
        }))

        console.log("✅ 변환된 그룹 채팅방 목록:", mapped)
        setGroupList(mapped)
      } catch (error) {
        console.error("❌ 그룹 채팅방 목록 불러오기 실패:", error)
      } finally {
        setLoadingGroup(false)
      }
    }
    fetchMyGroupRooms()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1256px] px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">메시지</h1>

        {/* 탭 (개인 / 채팅방 구분) */}
        <div className="flex gap-4 mb-6 border-b border-divider">
          <button
            onClick={() => setActiveTab("dm")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "dm" ? "text-primary" : "text-text-secondary hover:text-foreground"
            }`}
          >
            개인
            {activeTab === "dm" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>

          <button
            onClick={() => setActiveTab("chatroom")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "chatroom" ? "text-primary" : "text-text-secondary hover:text-foreground"
            }`}
          >
            그룹
            {activeTab === "chatroom" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        {/* 검색창 */}
        <div className="mb-6">
          <Input
            type="search"
            placeholder={activeTab === "dm" ? "사용자 검색" : "채팅방 검색"}
            className="max-w-md"
          />
        </div>

        {/* 개인 DM 목록 */}
        {activeTab === "dm" && (
          <div className="space-y-2">
            {loadingDm ? (
              <p className="text-text-secondary">채팅방 목록을 불러오는 중...</p>
            ) : dmList.length > 0 ? (
              dmList.map((dm) => (
                <div
                  key={dm.id}
                  onClick={() => {
                    console.log("🚀 개인 채팅방 이동:", dm.id)
                    router.push(`/messages/${dm.id}?type=INDIVIDUAL`)
                  }}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-background-section cursor-pointer transition-colors"
                >
                  {/* 상대방 프로필 이미지 */}
                  <img
                    src={dm.opponentAvatar}
                    alt={dm.opponentName}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      {/* 상대방 이름 */}
                      <span className="font-medium text-foreground">{dm.opponentName}</span>

                      <div className="flex items-center gap-2">
                        {/* 마지막 메시지 시간 */}
                        <span className="text-xs text-text-tertiary">{dm.time}</span>
                      </div>
                    </div>
                    {/* 마지막 메시지 미리보기 */}
                    <p className="text-sm text-text-secondary truncate">{dm.lastMessage}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-secondary">아직 참여 중인 1:1 대화가 없습니다.</p>
            )}
          </div>
        )}

        {/* 그룹 채팅방 목록 */}
        {activeTab === "chatroom" && (
          <div className="space-y-2">
            {loadingGroup ? (
              <p className="text-text-secondary">채팅방 목록을 불러오는 중...</p>
            ) : groupList.length > 0 ? (
              groupList.map((room) => (
                <div
                  key={room.id}
                  onClick={() => {
                    console.log("🚀 그룹 채팅방 이동:", room.id)
                    router.push(`/messages/${room.id}?type=GROUP`)
                  }}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-background-section cursor-pointer transition-colors"
                >
                  {/* 채팅방 썸네일 이미지 */}
                  <img
                    src={room.thumbnail}
                    alt={room.roomName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      {/* 채팅방 이름 */}
                      <span className="font-medium text-foreground">{room.roomName}</span>

                      <div className="flex items-center gap-2">
                        {/* 안읽은 메시지 배지 */}
                        {room.unread && room.unread > 0 && (
                          <span className="h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                            {room.unread}
                          </span>
                        )}
                        {/* 마지막 메시지 시간 */}
                        <span className="text-xs text-text-tertiary">{room.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* 마지막 메시지 미리보기 */}
                      <p className="text-sm text-text-secondary truncate flex-1">{room.lastMessage}</p>
                      {/* 참여자 수 */}
                      <span className="text-xs text-text-tertiary whitespace-nowrap flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {room.memberCount}명
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-secondary">아직 참여 중인 그룹 채팅방이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}