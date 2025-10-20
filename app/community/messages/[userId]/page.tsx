"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef } from "react"

// Mock messages data
const mockMessages = [
  {
    id: 1,
    senderId: 2,
    text: "안녕하세요! 집사진 너무 예쁘게 찍으셨네요 😊",
    timestamp: "오전 10:23",
    isMe: false,
  },
  {
    id: 2,
    senderId: 1,
    text: "감사합니다! 오랜 시간 공들여서 꾸민 공간이라 뿌듯해요",
    timestamp: "오전 10:25",
    isMe: true,
  },
  {
    id: 3,
    senderId: 2,
    text: "혹시 거실 소파는 어디 제품인가요?",
    timestamp: "오전 10:26",
    isMe: false,
  },
  {
    id: 4,
    senderId: 1,
    text: "한샘 제품이에요! 링크 보내드릴게요",
    timestamp: "오전 10:27",
    isMe: true,
  },
]

// SVG Icons as components
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

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
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

export default function MessagesPage({ params }: { params: { userId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get("username") || "사용자"
  const [messages, setMessages] = useState(mockMessages)
  const [inputValue, setInputValue] = useState("")
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleSendMessage = () => {
    if (!inputValue.trim() && selectedImages.length === 0) return

    const newMessage = {
      id: messages.length + 1,
      senderId: 1,
      text: inputValue,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
    }

    setMessages([...messages, newMessage])
    setInputValue("")
    setSelectedImages([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background max-w-[1256px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-divider bg-background sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-background-section rounded-full transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">{username[0]}</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{username}</h2>
            <p className="text-xs text-text-secondary">활동 중</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUserInfo(!showUserInfo)}
            className="p-2 hover:bg-background-section rounded-full transition-colors"
            title="사용자 정보"
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
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-background-section rounded-full transition-colors"
              title="설정"
            >
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c.426 1.756 2.924 1.756 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31 2.37 2.37a1.724 1.724 0 002.572 1.065c.426 1.756 2.924 1.756 3.35 0a1.724 1.724 0 002.573-1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065-2.572c.426-1.756 2.924-1.756 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            {/* Settings Dropdown */}
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
                  onClick={() => {
                    if (confirm("대화방을 나가시겠습니까?")) {
                      router.push("/messages")
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-background-section transition-colors"
                >
                  🚪 대화방 나가기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUserInfo && (
        <>
          <div className="fixed inset-0 bg-black/20 z-10" onClick={() => setShowUserInfo(false)} />
          <div className="absolute right-0 top-[57px] z-20 h-[calc(100vh-57px)] w-64 border-l border-divider bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">사용자 정보</h3>
              <button
                onClick={() => setShowUserInfo(false)}
                className="p-1 hover:bg-background-section rounded-full transition-colors"
              >
                <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-semibold text-primary">{username[0]}</span>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground">{username}</h4>
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
          </div>
        </>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-2 max-w-[70%] ${message.isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!message.isMe && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">{username[0]}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
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
                  {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
                </div>
                <span className={`text-xs text-text-secondary px-2 ${message.isMe ? "text-right" : "text-left"}`}>
                  {message.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-divider bg-background px-4 py-3">
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
            className="p-2 hover:bg-background-section rounded-full transition-colors"
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
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-text-secondary"
            />
            <button className="p-1 hover:opacity-70 transition-opacity">
              <SmileIcon className="h-5 w-5 text-text-secondary" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && selectedImages.length === 0}
            className="p-2.5 bg-primary hover:bg-primary/90 disabled:bg-text-secondary/20 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            <SendIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
