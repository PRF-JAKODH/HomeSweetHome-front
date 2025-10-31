// Notification category constants and utilities

export const NOTIFICATION_CATEGORIES = {
  ORDER: 'ORDER',
  DELIVERY: 'DELIVERY',
  REVIEW: 'REVIEW',
  CHAT: 'CHAT',
  EVENT: 'EVENT',
  SYSTEM: 'SYSTEM'
} as const

export type NotificationCategoryType = keyof typeof NOTIFICATION_CATEGORIES

// 카테고리 한국어 이름 매핑
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  [NOTIFICATION_CATEGORIES.ORDER]: '주문',
  [NOTIFICATION_CATEGORIES.DELIVERY]: '배송',
  [NOTIFICATION_CATEGORIES.REVIEW]: '리뷰',
  [NOTIFICATION_CATEGORIES.CHAT]: '채팅',
  [NOTIFICATION_CATEGORIES.EVENT]: '이벤트',
  [NOTIFICATION_CATEGORIES.SYSTEM]: '시스템'
}

// 카테고리 색상 매핑
export const CATEGORY_COLORS: Record<string, string> = {
  [NOTIFICATION_CATEGORIES.ORDER]: 'bg-blue-100 text-blue-700',
  [NOTIFICATION_CATEGORIES.DELIVERY]: 'bg-blue-100 text-blue-700',
  [NOTIFICATION_CATEGORIES.REVIEW]: 'bg-purple-100 text-purple-700',
  [NOTIFICATION_CATEGORIES.EVENT]: 'bg-orange-100 text-orange-700',
  [NOTIFICATION_CATEGORIES.SYSTEM]: 'bg-gray-100 text-gray-700',
  [NOTIFICATION_CATEGORIES.CHAT]: 'bg-green-100 text-green-700'
}

// 기본 색상
export const DEFAULT_CATEGORY_COLOR = 'bg-primary/10 text-primary'

/**
 * 카테고리 타입을 한국어 이름으로 변환
 */
export function getCategoryDisplayName(categoryType: string): string {
  return CATEGORY_DISPLAY_NAMES[categoryType] || categoryType
}

/**
 * 카테고리의 색상 클래스를 반환
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR
}

/**
 * 한국어 카테고리 이름을 영어 타입으로 변환 (필터링용)
 */
export function getCategoryTypeFromDisplayName(displayName: string): string | undefined {
  const entries = Object.entries(CATEGORY_DISPLAY_NAMES)
  const found = entries.find(([_, display]) => display === displayName)
  return found?.[0]
}

/**
 * 알림 페이지에서 사용할 카테고리 필터 옵션 목록
 */
export const NOTIFICATION_FILTER_CATEGORIES = [
  '전체',
  ...Object.values(CATEGORY_DISPLAY_NAMES)
]

// 템플릿 변수 치환 유틸리티
export function replaceTemplateVariables(content: string, contextData?: Record<string, any>): string {
  if (!content) return content
  if (!contextData) return content
  let replaced = content
  Object.entries(contextData).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    replaced = replaced.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(value))
  })
  return replaced
}

