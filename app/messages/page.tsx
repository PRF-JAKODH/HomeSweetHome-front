"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

/**
 * RoomListCommonResponseDto
 */
type RoomListCommonResponseDto = {
  roomId: number
  roomName: string
  roomType: string
  thumbnailUrl: string
  lastMessage: string
  lastMessageAt: string
  memberCount: number
  lastMessageIsRead: boolean
  partnerId: number
  partnerName: string 

}

/**
 * 화면에 표시할 채팅방 타입 
 */
type Room = {
  id: number
  opponentId: number
  opponentName: string
  opponentAvatar: string
  lastMessage: string
  time: string
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
  const [dmList, setDmList] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * 컴포넌트 마운트 시 내 개인 채팅방 목록 불러오기
   */
  useEffect(() => {
    const fetchMyRooms = async () => {

      try {
        setLoading(true)

        // API 호출
        const res = await apiClient.get<RoomListCommonResponseDto[]>("/api/v1/chat/rooms/my/individual")

        console.log("개인 채팅방 목록 불러오기 성공해따!:", res)

        // 백엔드 응답 → 프론트엔드 타입으로 변환
        const mapped: Room[] = res.data.map((room) => ({
          id: room.roomId,
          opponentId: room.partnerId,
          opponentName: room.partnerName,
          opponentAvatar: room.thumbnailUrl || "/placeholder.svg",
          lastMessage: room.lastMessage || "대화를 시작해보세요",
          time: formatRelativeTime(room.lastMessageAt),
          unread: room.lastMessageIsRead ? 0 : 1,
        }))

        setDmList(mapped)

      } catch (error) {
        console.error("채팅방 목록 불러오기 실패:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyRooms()
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
            {/* 로딩 중일 때 */}
            {loading ? (
              <p className="text-text-secondary">채팅방 목록을 불러오는 중...</p>
            ) : dmList.length > 0 ? (
              // 채팅방 목록이 있을 때
              dmList.map((dm) => (
                <div
                  key={dm.id}
                  onClick={() => {
                    console.log("🚀 채팅방 이동:", dm.id)
                    router.push(`/messages/${dm.id}`)  // ✅ messages (복수형)
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
                        {/* 안읽은 메시지 배지 */}
                        {dm.unread > 0 && (
                          <span className="h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                            {dm.unread}
                          </span>
                        )}
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
              // 채팅방이 없을 때
              <p className="text-text-secondary">아직 참여 중인 1:1 대화가 없습니다.</p>
            )}
          </div>
        )}

        {/* 그룹 채팅방 (미구현) */}
        {activeTab === "chatroom" && (
          <div className="space-y-2">
            <p className="text-text-secondary">그룹 채팅방 기능은 준비 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}