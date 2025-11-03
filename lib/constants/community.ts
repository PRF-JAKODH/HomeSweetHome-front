/**
 * 커뮤니티 관련 공통 상수
 */

export const CATEGORY_COLORS = {
  추천: "bg-blue-600/15 text-blue-700 border border-blue-600/30",
  질문: "bg-orange-500/15 text-orange-700 border border-orange-500/30",
  정보: "bg-emerald-600/15 text-emerald-700 border border-emerald-600/30",
  후기: "bg-violet-600/15 text-violet-700 border border-violet-600/30",
} as const

export const CATEGORIES = [
  { value: "추천", label: "추천" },
  { value: "질문", label: "질문" },
  { value: "정보", label: "정보" },
  { value: "후기", label: "후기" },
] as const

export const SORT_OPTIONS = [
  { label: "최신순", sort: "createdAt", direction: "desc" },
  { label: "조회수순", sort: "viewCount", direction: "desc" },
  { label: "인기순", sort: "likeCount", direction: "desc" },
] as const

export const MAX_IMAGES = 10
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export type CategoryType = keyof typeof CATEGORY_COLORS
export type SortOption = typeof SORT_OPTIONS[number]
