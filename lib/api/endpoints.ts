/**
 * API 엔드포인트 상수
 */

// 상품 관련 엔드포인트
export const PRODUCT_ENDPOINTS = {
  // 상품 CRUD
  GET_PRODUCTS: '/products',
  GET_PRODUCT: (id: string) => `/products/${id}`,
  CREATE_PRODUCT: '/products',
  UPDATE_PRODUCT: (id: string) => `/products/${id}`,
  DELETE_PRODUCT: (id: string) => `/products/${id}`,
  
  // 상품 프리뷰 조회 (무한 스크롤)
  GET_PRODUCT_PREVIEWS: '/api/v1/products/previews',
  
  // 상품 검색 및 필터
  SEARCH_PRODUCTS: '/products/search',
  GET_PRODUCTS_BY_CATEGORY: (categoryId: string) => `/products/category/${categoryId}`,
  GET_PRODUCTS_BY_SUBCATEGORY: (subCategoryId: string) => `/products/subcategory/${subCategoryId}`,
  
  // 상품 통계
  GET_PRODUCT_STATS: '/products/stats',
} as const

// 카테고리 관련 엔드포인트
export const CATEGORY_ENDPOINTS = {
  // 최상단 카테고리 조회
  GET_TOP_CATEGORIES: '/api/v1/categories/top',
  
  // 부모 ID로 하위 카테고리 조회
  GET_CATEGORIES_BY_PARENT: (parentId: number) => `/api/v1/categories/parent/${parentId}`,
  
  // 카테고리 계층 구조 조회 (최상단까지)
  GET_CATEGORY_HIERARCHY: (categoryId: number) => `/api/v1/categories/hierarchy/${categoryId}`,
} as const

// 공통 엔드포인트
export const COMMON_ENDPOINTS = {
  HEALTH_CHECK: '/health',
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_IMAGES: '/upload/images',
} as const
