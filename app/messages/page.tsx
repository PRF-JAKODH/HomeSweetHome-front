"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import apiClient from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { MessageCircle } from "lucide-react"
import { ChatRoomDetail, type RoomType } from "@/app/messages/chat-room-detail"
import {
  useMessagesStore,
  type DirectMessageRoom,
  type GroupMessageRoom,
} from "@/stores/messages-store"

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
  const searchParams = useSearchParams()
  const searchParamsString = useMemo(() => searchParams?.toString() ?? "", [searchParams])
  const [activeTab, setActiveTab] = useState<"dm" | "chatroom">("dm")
  const [loadingDm, setLoadingDm] = useState(false)
  const [loadingGroup, setLoadingGroup] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; type: RoomType; name: string } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const dmList = useMessagesStore((state) => state.dmList)
  const groupList = useMessagesStore((state) => state.groupList)
  const setDmList = useMessagesStore((state) => state.setDmList)
  const setGroupList = useMessagesStore((state) => state.setGroupList)

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
        const mapped: DirectMessageRoom[] = res.data.map((room) => ({
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

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredDmList = !normalizedQuery
    ? dmList
    : dmList.filter(
        (dm) =>
          dm.opponentName.toLowerCase().includes(normalizedQuery) ||
          dm.lastMessage.toLowerCase().includes(normalizedQuery),
      )

  const filteredGroupList = !normalizedQuery
    ? groupList
    : groupList.filter(
        (room) =>
          room.roomName.toLowerCase().includes(normalizedQuery) ||
          room.lastMessage.toLowerCase().includes(normalizedQuery),
      )

  const handleSelectRoom = (id: number, type: RoomType, name: string) => {
    setSelectedRoom((prev) => {
      if (prev && prev.id === id && prev.type === type && prev.name === name) {
        return prev
      }
      return { id, type, name }
    })

    const currentRoomId = searchParams?.get("roomId")
    const currentType = searchParams?.get("type")
    if (currentRoomId !== String(id) || currentType !== type) {
      const query = new URLSearchParams(searchParams?.toString())
      query.set("roomId", String(id))
      query.set("type", type)
      router.replace(`/messages?${query.toString()}`)
    }

    if (isMobile) {
      router.push(`/messages/${id}?type=${type}`)
    }
  }

  /**
   * 내가 속한 그룹 채팅방 목록 불러오기
   */
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

      const mapped: GroupMessageRoom[] = res.data.map((room) => ({
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

  useEffect(() => {
    fetchMyGroupRooms()
  }, [])

  useEffect(() => {
    if (!searchParamsString) return
    const roomIdParam = searchParams?.get("roomId")
    const roomTypeParam = (searchParams?.get("type") as RoomType | null) ?? null
    if (!roomIdParam) return
    const numericRoomId = Number(roomIdParam)
    if (Number.isNaN(numericRoomId)) return

    const targetType = roomTypeParam ?? "INDIVIDUAL"

    // 그룹 방인 경우 그룹 탭 활성화 및 목록 새로고침
    if (targetType === "GROUP") {
      setActiveTab("chatroom")
      // 새로 생성된 방이 목록에 포함되도록 그룹 목록 다시 불러오기
      fetchMyGroupRooms()
    }
  }, [searchParamsString])

  // 그룹/개인 목록이 업데이트된 후 방 선택 및 이름 확인
  useEffect(() => {
    if (!searchParamsString) return
    const roomIdParam = searchParams?.get("roomId")
    const roomTypeParam = (searchParams?.get("type") as RoomType | null) ?? null
    if (!roomIdParam) return
    const numericRoomId = Number(roomIdParam)
    if (Number.isNaN(numericRoomId)) return

    const targetType = roomTypeParam ?? "INDIVIDUAL"

    const resolvedName =
      targetType === "GROUP"
        ? (() => {
            const room = groupList.find((item) => item.id === numericRoomId)
            return room ? room.roomName : selectedRoom?.name ?? ""
          })()
        : (() => {
            const room = dmList.find((item) => item.id === numericRoomId)
            return room ? room.opponentName : selectedRoom?.name ?? ""
          })()

    setSelectedRoom((prev) => {
      if (prev && prev.id === numericRoomId && prev.type === targetType && prev.name === resolvedName) {
        return prev
      }

      return {
        id: numericRoomId,
        type: targetType,
        name: resolvedName,
      }
    })

    if (isMobile) {
      router.replace(`/messages/${numericRoomId}?type=${targetType}`)
    }
  }, [searchParamsString, dmList, groupList, isMobile, router, selectedRoom])

  return (
    <div className="min-h-screen lg:h-screen bg-background lg:overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1256px] flex-col px-4 py-8 lg:py-10 lg:pb-12 lg:pt-10">
        <h1 className="text-3xl font-bold mb-6">메시지</h1>

        <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="flex gap-4 border-b border-divider">
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

            <Input
              type="search"
              placeholder={activeTab === "dm" ? "사용자 검색" : "채팅방 검색"}
              className="w-full"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            <div className="space-y-2">
              {activeTab === "dm" ? (
                loadingDm ? (
                  <p className="text-text-secondary">채팅방 목록을 불러오는 중...</p>
                ) : filteredDmList.length > 0 ? (
                  filteredDmList.map((dm) => {
                    const isActive = selectedRoom?.id === dm.id && selectedRoom.type === "INDIVIDUAL"
                    return (
                      <div
                        key={dm.id}
                        onClick={() => handleSelectRoom(dm.id, "INDIVIDUAL", dm.opponentName)}
                        className={`flex items-center gap-4 rounded-2xl border border-transparent p-4 transition-colors cursor-pointer ${
                          isActive ? "border-primary/40 bg-primary/5" : "hover:bg-background-section"
                        }`}
                      >
                        <img
                          src={dm.opponentAvatar}
                          alt={dm.opponentName}
                          className="w-12 h-12 rounded-full object-cover"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">{dm.opponentName}</span>
                            <span className="text-xs text-text-tertiary">{dm.time}</span>
                          </div>
                          <p className="text-sm text-text-secondary truncate">{dm.lastMessage}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-text-secondary">아직 참여 중인 1:1 대화가 없습니다.</p>
                )
              ) : loadingGroup ? (
                <p className="text-text-secondary">채팅방 목록을 불러오는 중...</p>
              ) : filteredGroupList.length > 0 ? (
                filteredGroupList.map((room) => {
                  const isActive = selectedRoom?.id === room.id && selectedRoom.type === "GROUP"
                  return (
                    <div
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id, "GROUP", room.roomName)}
                      className={`flex items-center gap-4 rounded-2xl border border-transparent p-4 transition-colors cursor-pointer ${
                        isActive ? "border-primary/40 bg-primary/5" : "hover:bg-background-section"
                      }`}
                    >
                      <img
                        src={room.thumbnail}
                        alt={room.roomName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">{room.roomName}</span>
                          <div className="flex items-center gap-2">
                            {room.unread && room.unread > 0 && (
                              <span className="h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                                {room.unread}
                              </span>
                            )}
                            <span className="text-xs text-text-tertiary">{room.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-text-secondary truncate flex-1">{room.lastMessage}</p>
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
                  )
                })
              ) : (
                <p className="text-text-secondary">아직 참여 중인 그룹 채팅방이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="hidden lg:flex flex-col h-full min-h-0 rounded-3xl border border-divider bg-background p-0 overflow-hidden">
            {selectedRoom ? (
              <ChatRoomDetail
                key={`${selectedRoom.type}-${selectedRoom.id}`}
                roomId={selectedRoom.id}
                initialRoomType={selectedRoom.type}
                embedded
                onClose={() => setSelectedRoom(null)}
                className="h-full min-h-0"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">채팅을 선택해 주세요</h3>
                <p className="text-sm text-text-secondary max-w-xs">
                  왼쪽 목록에서 메시지를 선택하면 이 영역에서 대화를 바로 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}