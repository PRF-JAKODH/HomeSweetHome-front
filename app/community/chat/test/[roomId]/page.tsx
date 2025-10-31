"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StartChatPage() {
  const router = useRouter()
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("")

  const handleJoin = () => {
    if (!roomId.trim()) {
      alert("roomId를 입력해주세요.")
      return
    }
    router.push(`/messages/${roomId}?username=${username || "테스트유저"}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-xl font-semibold mb-4">채팅 테스트</h1>
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room ID 입력"
        className="border px-4 py-2 rounded w-64"
      />
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="표시할 이름 (선택)"
        className="border px-4 py-2 rounded w-64"
      />
      <button
        onClick={handleJoin}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
      >
        채팅방 입장
      </button>
    </div>
  )
}
