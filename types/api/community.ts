/**
 * 커뮤니티 API 타입 정의
 */

// 커뮤니티 게시글 응답 타입
export interface CommunityPost {
  postId: number
  authorId: number
  authorName: string
  title: string
  content: string
  viewCount: number 
  likeCount: number
  commentCount: number
  isModified: boolean
  createdAt: string
  modifiedAt: string
  imagesUrl: string[]
}

// 커뮤니티 댓글 응답 타입
export interface CommunityComment {
  commentId: number
  postId: number
  authorId: number
  authorName: string
  content: string
  parentCommentId: number | null
  likeCount: number
  isModified: boolean
  createdAt: string
  modifiedAt: string
}

// 게시글 작성 요청 타입
export interface CreatePostRequest {
  title: string
  content: string
  images?: File[]  // 실제 파일 객체
}

// 게시글 수정 요청 타입
export interface UpdatePostRequest {
  title: string
  content: string
  imageUrls?: string[]
}

// 댓글 작성 요청 타입
export interface CreateCommentRequest {
  content: string
  parentCommentId?: number
}

// 댓글 수정 요청 타입
export interface UpdateCommentRequest {
  content: string
}

// 게시글 목록 조회 쿼리 파라미터
export interface GetPostsParams {
  page?: number
  size?: number
  sort?: 'createdAt' | 'viewCount' | 'likeCount'
  direction?: 'asc' | 'desc'
}

// 게시글 목록 응답 (페이지네이션)
export interface PostsPageResponse {
  content: CommunityPost[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  first: boolean
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  empty: boolean
}
