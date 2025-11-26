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
  SEARCH_AUTHENTICATED: '/api/v1/products/search',
  SEARCH_RECENT: '/api/v1/recent-keyword',
  SEARCH_RECENT_DELETE_KEYWORD: '/api/v1/recent-keyword',
  SEARCH_RECENT_CLEAR_ALL: '/api/v1/recent-keyword/all',
  SEARCH_PRODUCT_DETAIL: (productId: string | number) => `/api/v1/products/search/${productId}`,
  RECENT_VIEWS: '/api/v1/recent-view',
  RECENT_VIEWS_DELETE_ONE: '/api/v1/recent-view',
  
  // 상품 검색 및 필터
  SEARCH_PRODUCTS: '/api/v1/products/search',
  SEARCH_AUTOCOMPLETE: '/api/v1/products/search/autocomplete',
  GET_PRODUCTS_BY_CATEGORY: (categoryId: string) => `/api/v1/products/category/${categoryId}`,
  GET_PRODUCTS_BY_SUBCATEGORY: (subCategoryId: string) => `/api/v1/products/subcategory/${subCategoryId}`,
  
  // 상품 통계
  GET_PRODUCT_STATS: '/api/v1/products/stats',
  
  // 상품 재고 조회
  GET_PRODUCT_STOCK: (productId: string) => `/api/v1/products/${productId}/stocks`,
  
  // 상품 SKU 재고 업데이트
  UPDATE_PRODUCT_SKU_STOCK: (productId: string) => `/api/v1/products/${productId}/skus`,
  
  // 상품 상태 업데이트
  UPDATE_PRODUCT_STATUS: (productId: string) => `/api/v1/products/${productId}/status`,
  
  // 상품 이미지 업데이트
  UPDATE_PRODUCT_IMAGES: (productId: string) => `/api/v1/products/${productId}/images`,
  
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
  GET_CART_COUNT: '/api/v1/carts/count',
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

// 커뮤니티 검색 관련 엔드포인트 (쇼핑수다 자동완성/검색)
export const COMMUNITY_SEARCH_ENDPOINTS = {
  SEARCH_AUTOCOMPLETE: '/api/v1/search/community/autocomplete',
  SEARCH_POSTS: '/api/v1/search/community',
} as const

// 채팅방 검색 관련 엔드포인트
export const CHAT_SEARCH_ENDPOINTS = {
  SEARCH_AUTOCOMPLETE: '/api/v1/search/chat/autocomplete',
  SEARCH_CHAT_ROOMS: '/api/v1/search/chat',
} as const

// 공통 엔드포인트
export const COMMON_ENDPOINTS = {
  HEALTH_CHECK: '/health',
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_IMAGES: '/upload/images',
} as const
