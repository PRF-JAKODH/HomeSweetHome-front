"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// Mock data for chat room
const chatRoomData: Record<
  string,
  {
    id: number
    name: string
    category: string
    participants: number
    members: Array<{ id: string; name: string; avatar: string }>
  }
> = {
  "1": {
    id: 1,
    name: "거실 인테리어 고민방",
    category: "🛋️ 거실",
    participants: 234,
    members: [
      { id: "user1", name: "인테리어러버", avatar: "/user-avatar-1.png" },
      { id: "user2", name: "홈스타일링", avatar: "/diverse-user-avatar-set-2.png" },
      { id: "user3", name: "디자인매니아", avatar: "/user-avatar-3.png" },
    ],
  },
  "2": {
    id: 2,
    name: "주방 꾸미기 모임",
    category: "🍳 주방",
    participants: 189,
    members: [
      { id: "user1", name: "요리왕", avatar: "/user-avatar-1.png" },
      { id: "user2", name: "주방꾸미기", avatar: "/diverse-user-avatar-set-2.png" },
    ],
  },
}

const initialMessages = [
  {
    id: 1,
    userId: "user1",
    userName: "인테리어러버",
    userAvatar: "/user-avatar-1.png",
    message: "안녕하세요! 소파 배치 관련해서 고민이 있어서요",
    timestamp: "오전 10:23",
    isMe: false,
  },
  {
    id: 2,
    userId: "user2",
    userName: "홈스타일링",
    userAvatar: "/diverse-user-avatar-set-2.png",
    message: "어떤 고민이신가요?",
    timestamp: "오전 10:25",
    isMe: false,
  },
  {
    id: 3,
    userId: "me",
    userName: "나",
    userAvatar: "/user-avatar-4.png",
    message: "저도 궁금해요! 거실이 좁아서 배치가 어렵더라구요",
    timestamp: "오전 10:27",
    isMe: true,
  },
  {
    id: 4,
    userId: "user1",
    userName: "인테리어러버",
    userAvatar: "/user-avatar-1.png",
    message: "맞아요! 저도 거실이 좁은데 소파를 벽에 붙여야 할지 띄워야 할지 고민이에요",
    timestamp: "오전 10:28",
    isMe: false,
  },
  {
    id: 5,
    userId: "user3",
    userName: "디자인매니아",
    userAvatar: "/user-avatar-3.png",
    message: "벽에서 10-15cm 정도 띄우면 공간이 더 넓어 보여요",
    timestamp: "오전 10:30",
    isMe: false,
  },
  {
    id: 6,
    userId: "user2",
    userName: "홈스타일링",
    userAvatar: "/diverse-user-avatar-set-2.png",
    message: "그리고 소파 뒤에 콘솔 테이블 놓으면 수납도 되고 좋아요!",
    timestamp: "오전 10:32",
    isMe: false,
  },
]

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [showMembers, setShowMembers] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (roomId === "create") {
      router.replace("/community/chat-rooms/create")
    }
  }, [roomId, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const room = chatRoomData[roomId] || chatRoomData["1"]

  const handleSendMessage = () => {
    const message = {
      id: messages.length + 1,
      userId: "me",
      userName: "나",
      userAvatar: "/user-avatar-4.png",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
    }
    setMessages([...messages, message])
    setNewMessage("")
    setSelectedImages([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
      setSelectedImages([...selectedImages, ...imageUrls])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index))
  }

  if (roomId === "create") {
    return null
  }

  return (
    <div className="flex h-screen flex-col bg-background max-w-[1256px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-divider bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-foreground hover:text-primary transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{room.name}</h1>
            <p className="text-xs text-text-secondary">{room.participants}명</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="rounded-lg p-2 text-foreground hover:bg-background-section transition-colors"
            title="참여자 목록"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg p-2 text-foreground hover:bg-background-section transition-colors"
              title="설정"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-divider rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={() => {
                    setShowSettings(false)
                    alert("📢 채팅방 공지\n\n서로 존중하며 즐거운 대화를 나눠요!")
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-section transition-colors"
                >
                  📢 공지 확인
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false)
                    alert("첨부된 이미지 목록을 표시합니다.")
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-section transition-colors"
                >
                  🖼️ 첨부 이미지
                </button>
                <button
                  onClick={() => {
                    if (confirm("채팅방을 나가시겠습니까?")) {
                      router.push("/community")
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-background-section transition-colors"
                >
                  🚪 채팅방 나가기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      {showMembers && (
        <>
          <div className="fixed inset-0 bg-black/20 z-10" onClick={() => setShowMembers(false)} />
          <div className="absolute right-0 top-[57px] z-20 h-[calc(100vh-57px)] w-64 border-l border-divider bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">참여자 ({room.participants})</h3>
              <button
                onClick={() => setShowMembers(false)}
                className="p-1 hover:bg-background-section rounded-full transition-colors"
              >
                <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {room.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <img src={member.avatar || "/placeholder.svg"} alt={member.name} className="h-10 w-10 rounded-full" />
                  <span className="text-sm text-foreground">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : ""}`}>
            {!msg.isMe && (
              <img
                src={msg.userAvatar || "/placeholder.svg"}
                alt={msg.userName}
                className="h-10 w-10 rounded-full flex-shrink-0"
              />
            )}
            <div className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"} max-w-[70%]`}>
              {!msg.isMe && <span className="mb-1 text-xs font-medium text-foreground">{msg.userName}</span>}
              <div
                className={`rounded-2xl px-4 py-2 ${
                  msg.isMe ? "bg-primary text-white" : "bg-gray-100 text-foreground"
                }`}
              >
                {msg.images && msg.images.length > 0 && (
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    {msg.images.map((img, idx) => (
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
                {msg.message && <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>}
              </div>
              <span className="mt-1 text-xs text-text-secondary">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-divider bg-background p-4">
        {selectedImages.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {selectedImages.map((img, index) => (
              <div key={index} className="relative">
                <img src={img || "/placeholder.svg"} alt="미리보기" className="h-20 w-20 rounded-lg object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg p-2 text-text-secondary hover:text-foreground hover:bg-background-section transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="flex-1 rounded-lg border border-divider bg-background-section px-4 py-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-text-secondary focus:outline-none"
              rows={1}
              style={{ minHeight: "24px", maxHeight: "120px" }}
            />
          </div>
          <button className="rounded-lg p-2 text-text-secondary hover:text-foreground hover:bg-background-section transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && selectedImages.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
