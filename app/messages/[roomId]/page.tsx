"use client"

import React from "react"
import { ChatRoomDetail, type RoomType } from "@/app/messages/chat-room-detail"

type PageProps = {
  params: Promise<{ roomId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function MessagesRoomPage({ params, searchParams }: PageProps) {
  const resolvedParams = React.use(params)
  const resolvedSearchParams = React.use(searchParams)

  const roomId = Number(resolvedParams.roomId)
  const initialRoomType = (resolvedSearchParams?.type as RoomType | undefined) ?? null

  if (Number.isNaN(roomId)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-text-secondary">유효하지 않은 채팅방입니다.</p>
      </div>
    )
  }

  
  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1256px] px-4 py-6">
        <ChatRoomDetail
          roomId={roomId}
          initialRoomType={initialRoomType}
          className="flex-1 min-h-0 rounded-3xl border border-divider overflow-hidden"
        />
      </div>
    </div>
  )
}
