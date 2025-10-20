"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function MessagesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"dm" | "chatroom">("dm")

  const dmList = [
    {
      id: 1,
      userId: "rarasis_home",
      name: "라라홈",
      avatar: "/user-avatar-1.png",
      lastMessage: "안녕하세요! 인테리어 정보 감사합니다.",
      time: "10분 전",
      unread: 2,
    },
    {
      id: 2,
      userId: "hoehye",
      name: "호혜홈",
      avatar: "/diverse-user-avatar-set-2.png",
      lastMessage: "그 소파 어디서 구매하셨나요?",
      time: "1시간 전",
      unread: 0,
    },
  ]

  const chatRoomList = [
    {
      id: 1,
      name: "거실 인테리어 모임",
      thumbnail: "/living-room-chat.jpg",
      participants: 128,
      lastMessage: "오늘 새로운 소파 배치 완료했어요!",
      time: "5분 전",
      unread: 5,
    },
    {
      id: 2,
      name: "주방 꾸미기",
      thumbnail: "/kitchen-chat.jpg",
      participants: 89,
      lastMessage: "수납 팁 공유합니다~",
      time: "30분 전",
      unread: 0,
    },
    {
      id: 3,
      name: "북유럽 스타일",
      thumbnail: "/nordic-style-chat.jpg",
      participants: 256,
      lastMessage: "이번 주말에 이케아 가실 분?",
      time: "2시간 전",
      unread: 12,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1256px] px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">메시지</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-divider">
          <button
            onClick={() => setActiveTab("dm")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "dm" ? "text-primary" : "text-text-secondary hover:text-foreground"
            }`}
          >
            DM
            {activeTab === "dm" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab("chatroom")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "chatroom" ? "text-primary" : "text-text-secondary hover:text-foreground"
            }`}
          >
            채팅방
            {activeTab === "chatroom" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input type="search" placeholder={activeTab === "dm" ? "사용자 검색" : "채팅방 검색"} className="max-w-md" />
        </div>

        {/* DM List */}
        {activeTab === "dm" && (
          <div className="space-y-2">
            {dmList.map((dm) => (
              <div
                key={dm.id}
                onClick={() => router.push(`/community/messages/${dm.userId}`)}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-background-section cursor-pointer transition-colors"
              >
                <img
                  src={dm.avatar || "/placeholder.svg"}
                  alt={dm.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{dm.name}</span>
                    <div className="flex items-center gap-2">
                      {dm.unread > 0 && (
                        <span className="h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium flex-shrink-0">
                          {dm.unread}
                        </span>
                      )}
                      <span className="text-xs text-text-tertiary">{dm.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary truncate">{dm.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Room List */}
        {activeTab === "chatroom" && (
          <div className="space-y-2">
            {chatRoomList.map((room) => (
              <div
                key={room.id}
                onClick={() => router.push(`/community/chat-rooms/${room.id}`)}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-background-section cursor-pointer transition-colors"
              >
                <img
                  src={room.thumbnail || "/placeholder.svg"}
                  alt={room.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{room.name}</span>
                    <div className="flex items-center gap-2">
                      {room.unread > 0 && (
                        <span className="h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium flex-shrink-0">
                          {room.unread}
                        </span>
                      )}
                      <span className="text-xs text-text-tertiary">{room.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-secondary truncate flex-1">{room.lastMessage}</p>
                    <span className="text-xs text-text-tertiary flex-shrink-0">{room.participants}명</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
