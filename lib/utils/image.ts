/**
 * 이미지 관련 유틸리티 함수
 */

import { MAX_IMAGE_SIZE, MAX_IMAGES } from '@/lib/constants/community'

/**
 * S3 URL 정리 (임시 방편 - 백엔드 수정 필요)
 */
export function cleanS3Url(url: string | undefined): string | null {
  if (!url) return null

  try {
    // URL 검증
    const parsedUrl = new URL(url)

    // 허용된 도메인 체크 (보안)
    const allowedDomains = [
      's3.amazonaws.com',
      process.env.NEXT_PUBLIC_CDN_DOMAIN,
    ].filter(Boolean)

    const isAllowed = allowedDomains.some(domain =>
      parsedUrl.hostname.includes(domain as string)
    )

    if (!isAllowed) {
      console.warn('Unauthorized image domain:', parsedUrl.hostname)
      return null
    }

    // 경로 정리 (임시)
    const parts = url.split('/')
    return parts.slice(0, 4).join('/') + '/' + parts[parts.length - 1]
  } catch (error) {
    console.error('Invalid image URL:', url, error)
    return null
  }
}

/**
 * 파일 배열을 Base64로 변환
 */
export async function filesToBase64(files: File[]): Promise<string[]> {
  const promises = Array.from(files).map(file => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  })

  return Promise.all(promises)
}

/**
 * 이미지 업로드 검증
 */
export interface ImageValidationResult {
  valid: boolean
  error?: string
}

export function validateImages(
  currentCount: number,
  newFiles: FileList | File[]
): ImageValidationResult {
  const files = Array.from(newFiles)

  // 개수 검증
  if (currentCount + files.length > MAX_IMAGES) {
    return {
      valid: false,
      error: `이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`,
    }
  }

  // 파일 크기 검증
  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `이미지 크기는 ${MAX_IMAGE_SIZE / 1024 / 1024}MB 이하만 가능합니다.`,
      }
    }

    // MIME 타입 검증
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: '이미지 파일만 업로드할 수 있습니다.',
      }
    }
  }

  return { valid: true }
}
