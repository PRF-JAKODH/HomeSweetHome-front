// "use client"

// import type React from "react"

// import { useState, useRef, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"


// // Mock data for chat room
// const chatRoomData: Record<
//   string,
//   {
//     id: number
//     name: string
//     category: string
//     participants: number
//     members: Array<{ id: string; name: string; avatar: string }>
//   }
// > = {
//   "1": {
//     id: 1,
//     name: "거실 인테리어 고민방",
//     category: "🛋️ 거실",
//     participants: 234,
//     members: [
//       { id: "user1", name: "인테리어러버", avatar: "/user-avatar-1.png" },
//       { id: "user2", name: "홈스타일링", avatar: "/diverse-user-avatar-set-2.png" },
//       { id: "user3", name: "디자인매니아", avatar: "/user-avatar-3.png" },
//     ],
//   },
//   "2": {
//     id: 2,
//     name: "주방 꾸미기 모임",
//     category: "🍳 주방",
//     participants: 189,
//     members: [
//       { id: "user1", name: "요리왕", avatar: "/user-avatar-1.png" },
//       { id: "user2", name: "주방꾸미기", avatar: "/diverse-user-avatar-set-2.png" },
//     ],
//   },
// }

// const initialMessages = [
//   {
//     id: 1,
//     userId: "user1",
//     userName: "인테리어러버",
//     userAvatar: "/user-avatar-1.png",
//     message: "안녕하세요! 소파 배치 관련해서 고민이 있어서요",
//     timestamp: "오전 10:23",
//     isMe: false,
//   },
//   {
//     id: 2,
//     userId: "user2",
//     userName: "홈스타일링",
//     userAvatar: "/diverse-user-avatar-set-2.png",
//     message: "어떤 고민이신가요?",
//     timestamp: "오전 10:25",
//     isMe: false,
//   },
//   {
//     id: 3,
//     userId: "me",
//     userName: "나",
//     userAvatar: "/user-avatar-4.png",
//     message: "저도 궁금해요! 거실이 좁아서 배치가 어렵더라구요",
//     timestamp: "오전 10:27",
//     isMe: true,
//   },
//   {
//     id: 4,
//     userId: "user1",
//     userName: "인테리어러버",
//     userAvatar: "/user-avatar-1.png",
//     message: "맞아요! 저도 거실이 좁은데 소파를 벽에 붙여야 할지 띄워야 할지 고민이에요",
//     timestamp: "오전 10:28",
//     isMe: false,
//   },
//   {
//     id: 5,
//     userId: "user3",
//     userName: "디자인매니아",
//     userAvatar: "/user-avatar-3.png",
//     message: "벽에서 10-15cm 정도 띄우면 공간이 더 넓어 보여요",
//     timestamp: "오전 10:30",
//     isMe: false,
//   },
//   {
//     id: 6,
//     userId: "user2",
//     userName: "홈스타일링",
//     userAvatar: "/diverse-user-avatar-set-2.png",
//     message: "그리고 소파 뒤에 콘솔 테이블 놓으면 수납도 되고 좋아요!",
//     timestamp: "오전 10:32",
//     isMe: false,
//   },
// ]

// export default function ChatRoomPage() {
//   const params = useParams()
//   const router = useRouter()
//   const roomId = params.roomId as string

//   const [messages, setMessages] = useState(initialMessages)
//   const [newMessage, setNewMessage] = useState("")
//   const [showMembers, setShowMembers] = useState(false)
//   const [showSettings, setShowSettings] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const [selectedImages, setSelectedImages] = useState<string[]>([])
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     if (roomId === "create") {
//       router.replace("/community/chat-rooms/create")
//     }
//   }, [roomId, router])

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   const room = chatRoomData[roomId] || chatRoomData["1"]

//   const handleSendMessage = () => {
//     const message = {
//       id: messages.length + 1,
//       userId: "me",
//       userName: "나",
//       userAvatar: "/user-avatar-4.png",
//       message: newMessage,
//       timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
//       isMe: true,
//       images: selectedImages.length > 0 ? [...selectedImages] : undefined,
//     }
//     setMessages([...messages, message])
//     setNewMessage("")
//     setSelectedImages([])
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       handleSendMessage()
//     }
//   }

//   const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files
//     if (files) {
//       const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
//       setSelectedImages([...selectedImages, ...imageUrls])
//     }
//   }

//   const removeImage = (index: number) => {
//     setSelectedImages(selectedImages.filter((_, i) => i !== index))
//   }

//   if (roomId === "create") {
//     return null
//   }

//   return (
//     <div className="flex h-screen flex-col bg-background max-w-[1256px] mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between border-b border-divider bg-background px-4 py-3">
//         <div className="flex items-center gap-3">
//           <button onClick={() => router.back()} className="text-foreground hover:text-primary transition-colors">
//             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//           <div>
//             <h1 className="text-lg font-semibold text-foreground">{room.name}</h1>
//             <p className="text-xs text-text-secondary">{room.participants}명</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setShowMembers(!showMembers)}
//             className="rounded-lg p-2 text-foreground hover:bg-background-section transition-colors"
//             title="참여자 목록"
//           >
//             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//               />
//             </svg>
//           </button>
//           {/* Settings Dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => setShowSettings(!showSettings)}
//               className="rounded-lg p-2 text-foreground hover:bg-background-section transition-colors"
//               title="설정"
//             >
//               <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//                 />
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                 />
//               </svg>
//             </button>
//             {showSettings && (
//               <div className="absolute right-0 mt-2 w-48 bg-background border border-divider rounded-lg shadow-lg py-1 z-20">
//                 <button
//                   onClick={() => {
//                     setShowSettings(false)
//                     alert("📢 채팅방 공지\n\n서로 존중하며 즐거운 대화를 나눠요!")
//                   }}
//                   className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-section transition-colors"
//                 >
//                   📢 공지 확인
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowSettings(false)
//                     alert("첨부된 이미지 목록을 표시합니다.")
//                   }}
//                   className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-section transition-colors"
//                 >
//                   🖼️ 첨부 이미지
//                 </button>
//                 <button
//                   onClick={() => {
//                     if (confirm("채팅방을 나가시겠습니까?")) {
//                       router.push("/community")
//                     }
//                   }}
//                   className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-background-section transition-colors"
//                 >
//                   🚪 채팅방 나가기
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Members Sidebar */}
//       {showMembers && (
//         <>
//           <div className="fixed inset-0 bg-black/20 z-10" onClick={() => setShowMembers(false)} />
//           <div className="absolute right-0 top-[57px] z-20 h-[calc(100vh-57px)] w-64 border-l border-divider bg-background p-4 shadow-lg">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-foreground">참여자 ({room.participants})</h3>
//               <button
//                 onClick={() => setShowMembers(false)}
//                 className="p-1 hover:bg-background-section rounded-full transition-colors"
//               >
//                 <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//             <div className="space-y-3">
//               {room.members.map((member) => (
//                 <div key={member.id} className="flex items-center gap-3">
//                   <img src={member.avatar || "/placeholder.svg"} alt={member.name} className="h-10 w-10 rounded-full" />
//                   <span className="text-sm text-foreground">{member.name}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </>
//       )}

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg) => (
//           <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : ""}`}>
//             {!msg.isMe && (
//               <img
//                 src={msg.userAvatar || "/placeholder.svg"}
//                 alt={msg.userName}
//                 className="h-10 w-10 rounded-full flex-shrink-0"
//               />
//             )}
//             <div className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"} max-w-[70%]`}>
//               {!msg.isMe && <span className="mb-1 text-xs font-medium text-foreground">{msg.userName}</span>}
//               <div
//                 className={`rounded-2xl px-4 py-2 ${
//                   msg.isMe ? "bg-primary text-white" : "bg-gray-100 text-foreground"
//                 }`}
//               >
//                 {msg.images && msg.images.length > 0 && (
//                   <div className="mb-2 grid grid-cols-2 gap-2">
//                     {msg.images.map((img, idx) => (
//                       <img
//                         key={idx}
//                         src={img || "/placeholder.svg"}
//                         alt="첨부 이미지"
//                         className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
//                         onClick={() => window.open(img, "_blank")}
//                       />
//                     ))}
//                   </div>
//                 )}
//                 {msg.message && <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>}
//               </div>
//               <span className="mt-1 text-xs text-text-secondary">{msg.timestamp}</span>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <div className="border-t border-divider bg-background p-4">
//         {selectedImages.length > 0 && (
//           <div className="mb-3 flex gap-2 flex-wrap">
//             {selectedImages.map((img, index) => (
//               <div key={index} className="relative">
//                 <img src={img || "/placeholder.svg"} alt="미리보기" className="h-20 w-20 rounded-lg object-cover" />
//                 <button
//                   onClick={() => removeImage(index)}
//                   className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="flex items-end gap-2">
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={handleImageSelect}
//             className="hidden"
//           />
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             className="rounded-lg p-2 text-text-secondary hover:text-foreground hover:bg-background-section transition-colors"
//           >
//             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//           </button>
//           <div className="flex-1 rounded-lg border border-divider bg-background-section px-4 py-2">
//             <textarea
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="메시지를 입력하세요..."
//               className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-text-secondary focus:outline-none"
//               rows={1}
//               style={{ minHeight: "24px", maxHeight: "120px" }}
//             />
//           </div>
//           <button className="rounded-lg p-2 text-text-secondary hover:text-foreground hover:bg-background-section transition-colors">
//             <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </button>
//           <Button
//             onClick={handleSendMessage}
//             disabled={!newMessage.trim() && selectedImages.length === 0}
//             className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
//           >
//             <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//             </svg>
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { connectStomp, disconnectStomp, sendChatMessage } from "@/lib/chat-socket"
import type { IMessage } from "@stomp/stompjs"


// export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
//   // 여기에서 roomId 활용 가능
//   const roomId = params.roomId
//   return (
//     <div>
//       <h2>채팅방 {roomId}</h2>
//       <MessagesPage params={params} />
//     </div>
//   )
// }

export type ChatMessageDto = {
  id: number
  roomId: number
  senderId: number
  text: string
  sentaAt: string // ✅ LocalDateTime → 문자열(ISO 형식)로 받음
}

type Message = {
  id: number
  senderId: number
  text: string
  timestamp: string
  isMe: boolean
  images?: string[]
  status?: "sending" | "sent" | "error"
}

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

export default function MessagesPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get("username") || "사용자"

  // React의 상태 관리 (useState)
  const [messages, setMessages] = useState<Message[]>([]) // 모든 메시지 목록
  const [inputValue, setInputValue] = useState("")


  const [showUserInfo, setShowUserInfo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

   // STOMP 연결 + 구독
   useEffect(() => {
    connectStomp({
      onConnected: () => {
        console.log("✅ STOMP 연결 완료")

        // 서버 메시지 구독 (/sub/rooms/{roomId})
        subscribeToTopic(`/sub/rooms/${params.roomId}`, (msg: IMessage) => {
          const payload = JSON.parse(msg.body) as ChatMessageDto
          console.log("📩 수신 메시지:", payload)

          setMessages((prev) => {
            // 이미 같은 id가 있으면 중복 추가 방지
            if (prev.some((m) => m.id === payload.id)) return prev

            return [
              ...prev,
              {
                id: payload.id,
                senderId: payload.senderId,
                text: payload.text,
                timestamp: new Date(payload.sentAt).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isMe: payload.senderId === user?.id,
                status: "sent",
              },
            ]
          })
        })
      },
    })
  
    // 언마운트 시 연결 해제
    return () => disconnectStomp()
  }, [params.roomId, user?.id])

    // 파일 선택 이벤트 (이미지 미리보기)
  // const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files
  //   if (files) {
  //     const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
  //     setSelectedImages([ ..selectedImages, ...imageUrls])
  //   }
  // }

  // 이미지 제거 함수
  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index))
  }

  // 메시지 전송 함수
  const handleSendMessage = () => {
    if (!inputValue.trim() && selectedImages.length === 0) return
  
    //  임시 ID 생성 (로컬 메시지 추적용)
    const tempId = Date.now()
  
    //  로컬에서 즉시 메시지 표시 (Optimistic UI)
    const newMessage: Message = {
      id: tempId,
      senderId: user?.id ?? 1,
      text: inputValue,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
      status: "sending", // ✅ 전송 중 상태 표시용
    }
  
    setMessages((prev) => [...prev, newMessage])
  
    // 3️⃣ 서버로 실제 메시지 전송 (백엔드 DTO와 동일 구조)
    try {
      sendChatMessage("/pub/chat.send", {
        roomId: Number(params.roomId),
        senderId: user?.id,
        text: inputValue,
      })
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error)
  
      // 4️⃣ 전송 실패 시 상태 변경
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "error" } : msg
        )
      )
    }
  
    // 5️⃣ 입력창 초기화
    setInputValue("")
    setSelectedImages([])
  }

  // 엔터키 눌렀을 때 메시지 전송 함수
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 
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
        {messages.map((message: Message) => (
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
                      {message.images.map((img: string, idx: number) => (
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
