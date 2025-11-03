/**
 * 게시글 본문 컴포넌트
 * - 텍스트 내용
 * - 이미지 갤러리
 */

import { memo, useState } from 'react'
import { cleanS3Url } from '@/lib/utils/image'

interface PostContentProps {
  content: string
  images?: string[]
}

function PostContentComponent({ content, images = [] }: PostContentProps) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())

  const handleImageError = (index: number, originalUrl: string) => {
    setFailedImages(prev => new Set(prev).add(index))
  }

  return (
    <div className="mb-8">
      {/* Text Content */}
      <div className="prose prose-slate max-w-none">
        <p className="whitespace-pre-wrap text-foreground leading-relaxed">
          {content}
        </p>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
          {images.map((imageUrl, index) => {
            if (failedImages.has(index)) return null

            const cleanUrl = cleanS3Url(imageUrl)
            if (!cleanUrl) return null

            return (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg bg-surface"
              >
                <img
                  src={cleanUrl}
                  alt={`게시글 이미지 ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onError={() => handleImageError(index, imageUrl)}
                  loading="lazy"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const PostContent = memo(PostContentComponent)
