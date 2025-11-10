"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

// Request DTO
export interface CreateGroupRoomRequest {
  ownerId: number
  roomName: string
  roomThumbnailUrl?: File | null // ✅ 선택값으로 변경
}

// Response DTO
export interface CreateGroupRoomResponse {
  roomId: number
  alreadyExists?: boolean
}

export default function CreateChatRoomPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthStore()
  const [roomName, setRoomName] = useState("")
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 이미지 업로드 (선택)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setThumbnail(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setThumbnail(null)
    setThumbnailFile(null)
  }

  // 방 생성 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "로그인 필요",
        description: "로그인이 필요한 서비스입니다.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!roomName.trim()) {
      toast({
        title: "입력 오류",
        description: "채팅방 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "인증 오류",
        description: "사용자 정보를 불러올 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("ownerId", String(user.id))
      formData.append("roomName", roomName.trim())
      if (thumbnailFile) {
        formData.append("roomThumbnailUrl", thumbnailFile) // ✅ 선택적으로만 추가
      }

      const response = await apiClient.post<CreateGroupRoomResponse>(
        "/api/v1/chat/rooms/group",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      const { roomId, alreadyExists } = response.data

      toast({
        title: alreadyExists ? "기존 채팅방으로 이동" : "채팅방 생성 완료",
        description: alreadyExists
          ? "동일한 이름의 채팅방이 이미 존재합니다."
          : "새로운 채팅방이 생성되었습니다.",
      })

      router.push(`/messages/${roomId}`)
    } catch (error: any) {
      console.error("❌ 채팅방 생성 실패:", error)
      toast({
        title: "채팅방 생성 실패",
        description: error.response?.data?.message || "채팅방을 생성하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[800px] px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-text-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </button>
          <h1 className="text-2xl font-bold text-foreground">채팅방 만들기</h1>
          <p className="mt-2 text-sm text-text-secondary">
            관심사가 같은 사람들과 소통할 수 있는 채팅방을 만들어보세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-sm font-medium text-foreground">
              채팅방 이름 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="예: 거실 인테리어 고민방"
              className="w-full"
              maxLength={50}
              disabled={isSubmitting}
            />
            <p className="text-xs text-text-secondary">{roomName.length}/50</p>
          </div>

          {/* Thumbnail Upload (선택사항) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              채팅방 이미지 <span className="text-text-secondary text-xs">(선택)</span>
            </Label>
            <div className="space-y-3">
              {thumbnail ? (
                <div className="relative inline-block">
                  <img
                    src={thumbnail}
                    alt="채팅방 썸네일"
                    className="h-48 w-full object-cover rounded-lg border border-divider"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-divider bg-background-section hover:bg-background-section/80 transition-colors">
                  <Upload className="h-10 w-10 text-text-secondary mb-2" />
                  <span className="text-sm text-text-secondary">이미지 업로드 (선택)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!roomName || isSubmitting}
            >
              {isSubmitting ? "생성 중..." : "채팅방 만들기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
