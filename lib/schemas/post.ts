/**
 * 게시글 폼 검증 스키마 (Zod)
 */

import { z } from 'zod'
import { MAX_IMAGES, MAX_IMAGE_SIZE } from '@/lib/constants/community'

export const postSchema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요'),
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이하로 입력해주세요'),
  content: z
    .string()
    .min(10, '내용은 최소 10자 이상 입력해주세요')
    .max(5000, '내용은 5000자 이하로 입력해주세요'),
  images: z
    .array(z.instanceof(File))
    .max(MAX_IMAGES, `이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다`)
    .refine(
      (files) => files.every((file) => file.size <= MAX_IMAGE_SIZE),
      `이미지 크기는 ${MAX_IMAGE_SIZE / 1024 / 1024}MB 이하만 가능합니다`
    )
    .refine(
      (files) => files.every((file) => file.type.startsWith('image/')),
      '이미지 파일만 업로드할 수 있습니다'
    )
    .optional(),
})

export type PostFormData = z.infer<typeof postSchema>
