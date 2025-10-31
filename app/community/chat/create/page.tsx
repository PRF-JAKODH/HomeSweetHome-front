"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, ArrowLeft } from "lucide-react"

const categories = [
  { value: "living", label: "🛋️ 거실", emoji: "🛋️" },
  { value: "kitchen", label: "🍳 주방", emoji: "🍳" },
  { value: "nordic", label: "🌲 북유럽", emoji: "🌲" },
  { value: "minimal", label: "⚪ 미니멀", emoji: "⚪" },
  { value: "diy", label: "🔨 DIY", emoji: "🔨" },
  { value: "plant", label: "🌿 식물", emoji: "🌿" },
  { value: "bedroom", label: "🛏️ 침실", emoji: "🛏️" },
  { value: "bathroom", label: "🚿 욕실", emoji: "🚿" },
  { value: "etc", label: "💬 기타", emoji: "💬" },
]

export default function CreateChatRoomPage() {
  const router = useRouter()
  const [category, setCategory] = useState("")
  const [roomName, setRoomName] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnail(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setThumbnail(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !roomName || !description) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    // TODO: Save chat room to database
    alert("채팅방이 생성되었습니다!")
    router.push("/community")
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
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground">
              채팅방 주제 <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="채팅방 주제를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">채팅방 이미지</Label>
            <div className="space-y-3">
              {thumbnail ? (
                <div className="relative inline-block">
                  <img
                    src={thumbnail || "/placeholder.svg"}
                    alt="채팅방 썸네일"
                    className="h-48 w-full object-cover rounded-lg border border-divider"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-divider bg-background-section hover:bg-background-section/80 transition-colors">
                  <Upload className="h-10 w-10 text-text-secondary mb-2" />
                  <span className="text-sm text-text-secondary">클릭하여 이미지 업로드</span>
                  <span className="text-xs text-text-secondary mt-1">권장 크기: 400x200</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

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
            />
            <p className="text-xs text-text-secondary">{roomName.length}/50</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              채팅방 설명 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="채팅방에 대한 간단한 설명을 입력하세요"
              className="min-h-[120px] w-full resize-none"
              maxLength={200}
            />
            <p className="text-xs text-text-secondary">{description.length}/200</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!category || !roomName || !description}
            >
              채팅방 만들기
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
