// 쇼핑수다 > 오픈채팅 > 채팅방 입장 후 채팅입력화면

"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"


export interface CreateGroupRoomRequest {
  ownerId: number
  roomName: string
  roomThumbnailUrl: string
}

export enum ChatRoomType {
  INDIVIDUAL = "INDIVIDUAL",
  GROUP = "GROUP",
}

export interface RoomListCommonResponseDto {
  roomId: number
  roomName: string
  roomType: ChatRoomType
  memberCount: number

  // 상대방 정보 (개인 채팅방용)
  partnerId: number | null
  partnerName: string | null
  thumbnailUrl: string | null

  // 마지막 메시지 관련
  lastMessage: string | null
  lastMessageAt: string | null // ISO date string
  lastMessageId: number | null
  lastMessageIsRead: boolean | null
}

export interface CreateGroupRoomResponse {
  roomId: number
  alreadyExists?: boolean
}

/**
 * 그룹 채팅방 화면 표시용 타입
 */
export interface GroupChatRoom {
  id: number
  roomName: string
  thumbnailUrl: string
  lastMessage: string
  time: string
  memberCount: number
  unread: number
}

/**
 * 시간을 상대적 표현으로 변환하는 유틸 함수
 */
function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return "최근 활동 없음"

  const now = new Date()
  const messageTime = new Date(isoString)
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

export default function MessagesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"dm" | "chatroom">("dm")
  const [groupList, setGroupList] = useState<GroupChatRoom[]>([])
  const [loading, setLoading] = useState(true)


  /**
   * 그룹 채팅방 목록 불러오기
   * 
   */
  useEffect(() => {
    const fetchMyGroupRooms = async () => {
      try {
        setLoading(true)

        const res = await apiClient.get<RoomListCommonResponseDto[]>("/api/v1/chat/rooms/group/all")
        console.log("그룹 채팅방 목록 불러오기 성공:", res)

        // 백엔드 응답 → 프론트엔드 타입으로 변환
        const mapped: GroupChatRoom[] = res.data.map((room) => ({
          id: room.roomId,
          roomName: room.roomName,
          thumbnailUrl: room.thumbnailUrl || "/placeholder.svg",
          lastMessage: room.lastMessage || "대화를 시작해보세요",
          time: formatRelativeTime(room.lastMessageAt),
          memberCount: Number(room.memberCount) || 0,
          unread: room.lastMessageIsRead ? 0 : 1,
        }))

        setGroupList(mapped)
      } catch (error) {
        console.error("그룹 채팅방 목록 불러오기 실패:", error)
      } finally {
        setLoading(false)
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


        {/* 그룹 채팅방 목록 */}
        {activeTab === "chatroom" && (
          <div className="space-y-2">
            {loading ? (
              <p className="text-text-secondary">채팅방 목록을 불러오는 중...</p>
            ) : groupList.length > 0 ? (
              groupList.map((room) => (
                <div
                  key={room.id}
                  onClick={() => {
                    console.log("🚀 그룹 채팅방 이동:", room.id)
                    router.push(`/community/chat-rooms/${room.id}`)
                  }}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-background-section cursor-pointer transition-colors"
                >
                  {/* 채팅방 썸네일 이미지 */}
                  <img
                    src={room.thumbnailUrl}
                    alt={room.roomName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      {/* 채팅방 이름 */}
                      <span className="font-medium text-foreground">{room.roomName}</span>

                      <div className="flex items-center gap-2">
                        {/* 안읽은 메시지 배지 */}
                        {room.unread > 0 && (
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
                      <span className="text-xs text-text-tertiary whitespace-nowrap">{room.memberCount}명</span>
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