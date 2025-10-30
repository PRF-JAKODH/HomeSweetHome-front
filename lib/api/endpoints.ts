/**
 * API 엔드포인트 상수
 */

// 상품 관련 엔드포인트
export const PRODUCT_ENDPOINTS = {
  // 상품 CRUD
  GET_PRODUCTS: '/api/v1/products',
  GET_PRODUCT: (id: string) => `/api/v1/products/${id}`,
  CREATE_PRODUCT: '/api/v1/products',
  UPDATE_PRODUCT: (id: string) => `/api/v1/products/${id}`,
  DELETE_PRODUCT: (id: string) => `/api/v1/products/${id}`,
  
  // 상품 프리뷰 조회 (무한 스크롤)
  GET_PRODUCT_PREVIEWS: '/api/v1/products/previews',
  
  // 상품 검색 및 필터
  SEARCH_PRODUCTS: '/api/v1/products/search',
  GET_PRODUCTS_BY_CATEGORY: (categoryId: string) => `/api/v1/products/category/${categoryId}`,
  GET_PRODUCTS_BY_SUBCATEGORY: (subCategoryId: string) => `/api/v1/products/subcategory/${subCategoryId}`,
  
  // 상품 통계
  GET_PRODUCT_STATS: '/api/v1/products/stats',
  
  // 상품 재고 조회
  GET_PRODUCT_STOCK: (productId: string) => `/api/v1/products/${productId}/stocks`,
  
  // 판매자 상품 관리
  GET_SELLER_PRODUCTS: '/api/v1/products/seller',
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

// 장바구니 관련 엔드포인트
export const CART_ENDPOINTS = {
  // 장바구니 CRUD
  GET_CART: '/api/v1/carts',
  ADD_TO_CART: '/api/v1/carts',
  UPDATE_CART_ITEM: (cartItemId: string) => `/api/v1/carts/${cartItemId}`,
  DELETE_CART_ITEM: (cartItemId: string) => `/api/v1/carts/${cartItemId}`,
  DELETE_CART_ITEMS: '/api/v1/carts/batch',
  CLEAR_CART: '/api/v1/carts/clear',
} as const

// 커뮤니티 관련 엔드포인트
export const COMMUNITY_ENDPOINTS = {
  // 게시글 CRUD
  GET_POSTS: '/api/v1/community/posts',
  GET_POST: (postId: number) => `/api/v1/community/posts/${postId}`,
  CREATE_POST: '/api/v1/community/posts',
  UPDATE_POST: (postId: number) => `/api/v1/community/posts/${postId}`,
  DELETE_POST: (postId: number) => `/api/v1/community/posts/${postId}`,

  // 댓글 CRUD
  GET_COMMENTS: (postId: number) => `/api/v1/community/posts/${postId}/comments`,
  CREATE_COMMENT: (postId: number) => `/api/v1/community/posts/${postId}/comments`,
  UPDATE_COMMENT: (postId: number, commentId: number) => `/api/v1/community/posts/${postId}/comments/${commentId}`,
  DELETE_COMMENT: (postId: number, commentId: number) => `/api/v1/community/posts/${postId}/comments/${commentId}`,

  // 게시글 조회수
  INCREASE_VIEW_COUNT: (postId: number) => `/api/v1/community/posts/${postId}/views`,

  // 게시글 좋아요
  TOGGLE_POST_LIKE: (postId: number) => `/api/v1/community/posts/${postId}/likes`,
  GET_POST_LIKE_STATUS: (postId: number) => `/api/v1/community/posts/${postId}/likes/status`,

  // 댓글 좋아요
  TOGGLE_COMMENT_LIKE: (postId: number, commentId: number) => `/api/v1/community/posts/${postId}/comments/${commentId}/likes`,
  GET_COMMENT_LIKE_STATUS: (postId: number, commentId: number) => `/api/v1/community/posts/${postId}/comments/${commentId}/likes/status`,
} as const

// 공통 엔드포인트
export const COMMON_ENDPOINTS = {
  HEALTH_CHECK: '/health',
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_IMAGES: '/upload/images',
} as const
