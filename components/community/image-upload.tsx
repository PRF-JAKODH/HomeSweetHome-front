/**
 * 이미지 업로드 컴포넌트
 */

import { useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { validateImages, filesToBase64 } from '@/lib/utils/image'
import { MAX_IMAGES } from '@/lib/constants/community'
import { toast } from 'sonner'

interface ImageUploadProps {
  images: string[]
  imageFiles: File[]
  onImagesChange: (images: string[], files: File[]) => void
}

export function ImageUpload({ images, imageFiles, onImagesChange }: ImageUploadProps) {
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 검증
    const validation = validateImages(images.length, files)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    try {
      // 파일을 Base64로 변환 (순서 보장)
      const base64Images = await filesToBase64(Array.from(files))

      // 상태 업데이트
      onImagesChange(
        [...images, ...base64Images],
        [...imageFiles, ...Array.from(files)]
      )
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      toast.error('이미지 업로드에 실패했습니다.')
    }

    // input 초기화
    e.target.value = ''
  }, [images, imageFiles, onImagesChange])

  const removeImage = useCallback((index: number) => {
    onImagesChange(
      images.filter((_, i) => i !== index),
      imageFiles.filter((_, i) => i !== index)
    )
  }, [images, imageFiles, onImagesChange])

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-divider rounded-lg cursor-pointer hover:border-primary transition-colors">
        <div className="text-center">
          <Plus className="mx-auto h-8 w-8 text-text-secondary mb-2" />
          <p className="text-sm text-text-secondary">사진 추가하기</p>
          <p className="text-xs text-text-secondary mt-1">
            최대 {MAX_IMAGES}장까지 업로드 가능
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
