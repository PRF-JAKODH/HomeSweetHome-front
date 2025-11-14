"use client"

import { ChatRoomDetail, type RoomType } from "@/app/messages/chat-room-detail"

type PageProps = {
  params: { roomId: string }
  searchParams: { type?: string }
}

export default function MessagesRoomPage({ params, searchParams }: PageProps) {
  const roomId = Number(params.roomId)
  const initialRoomType = (searchParams?.type as RoomType | undefined) ?? null

  if (Number.isNaN(roomId)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-text-secondary">유효하지 않은 채팅방입니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[90vh] min-h-0 bg-background max-w-[1256px] mx-auto rounded-3xl border border-divider overflow-hidden">
      <ChatRoomDetail roomId={roomId} initialRoomType={initialRoomType} className="h-full min-h-0" />
    </div>
  )
}
