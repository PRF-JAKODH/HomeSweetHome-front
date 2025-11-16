/**
 * 카테고리명과 로고 이미지를 매핑하는 유틸
 * - 한국어 카테고리명을 키로 사용
 * - 포함(부분 일치) 매칭도 지원하여 하위 카테고리명에도 대응
 * - 매핑에 없는 경우 placeholder로 폴백
 */

export type CategoryLogoMap = Record<string, string>

// 중앙 집중식 매핑: 새 카테고리/로고는 여기만 추가하면 됩니다.
export const CATEGORY_LOGOS: CategoryLogoMap = {
  '가구': '/furniture-logo.avif',
  '패브릭': '/fabric-logo.png',
  '조명': '/light-logo.png',
  '수납': '/storage-logo.png',
}

/**
 * 카테고리명으로 로고 경로를 반환합니다.
 * - 완전 일치 우선
 * - 부분 일치(포함)로 보조 매칭
 * - 없으면 placeholder 반환
 */
export function getCategoryLogo(categoryName: string | undefined | null): string {
  if (!categoryName) return '/placeholder.svg'

  // 1) 완전 일치
  if (CATEGORY_LOGOS[categoryName]) {
    return CATEGORY_LOGOS[categoryName]
  }

  // 2) 부분 일치 (예: "거실가구" -> "가구")
  const partialKey = Object.keys(CATEGORY_LOGOS).find((key) => categoryName.includes(key))
  if (partialKey) {
    return CATEGORY_LOGOS[partialKey]
  }

  // 3) 폴백
  return '/placeholder.svg'
}


