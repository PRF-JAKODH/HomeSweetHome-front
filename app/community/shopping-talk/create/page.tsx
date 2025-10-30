"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useMutation } from '@tanstack/react-query'
import { createPost } from '@/lib/api/community'

const categories = [
  { value: "추천", label: "추천" },
  { value: "질문", label: "질문" },
  { value: "정보", label: "정보" },
  { value: "후기", label: "후기" },
]

export default function CreateShoppingTalkPage() {
  const router = useRouter()
  const [category, setCategory] = useState("추천")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      router.push("/community/shopping-talk")
    },
    onError: (error) => {
      console.error('게시글 작성 실패:', error)
      alert('게시글 작성에 실패했습니다.')
    }
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)
    setImageFiles([...imageFiles, ...fileArray])

    const newImages: string[] = []
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        if (newImages.length === files.length) {
          setImages([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImageFiles(imageFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createMutation.mutate({
      title,
      content,
      category,
      images: imageFiles.length > 0 ? imageFiles : undefined
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-divider bg-background">
        <div className="mx-auto max-w-[1256px] px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">쇼핑수다 글쓰기</h1>
          <p className="mt-2 text-sm text-text-secondary">가구, 인테리어 쇼핑 정보를 공유해주세요</p>
        </div>
      </div>

      {/* Create Form */}
      <div className="mx-auto max-w-[800px] px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">카테고리 선택</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              required
              className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">본문</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해주세요"
              required
              rows={10}
              className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">사진 업로드</label>
            <div className="space-y-4">
              {/* Upload Button */}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-divider rounded-lg cursor-pointer hover:border-primary transition-colors">
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-text-secondary mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-sm text-text-secondary">사진 추가하기</p>
                  <p className="text-xs text-text-secondary mt-1">최대 10장까지 업로드 가능</p>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={!title || !content}>
              작성 완료
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
