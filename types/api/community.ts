/**
 * 커뮤니티 API 타입 정의
 */

import type { ScrollResponse } from './common'

// 커뮤니티 게시글 응답 타입
export interface CommunityPost {
  postId: number
  authorId: number
  authorName: string
  title: string
  content: string
  category?: string  // 추천, 질문, 정보, 후기
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
  category?: string  // 추천, 질문, 정보, 후기
  images?: File[]  // 실제 파일 객체
}

// 게시글 수정 요청 타입
export interface UpdatePostRequest {
  title: string
  content: string
  category?: string  // 추천, 질문, 정보, 후기
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

// 커뮤니티 검색 정렬 타입
export enum CommunitySortType {
  RECOMMENDED = 'RECOMMENDED',
  LATEST = 'LATEST',
  VIEW_COUNT = 'VIEW_COUNT',
  LIKE_COUNT = 'LIKE_COUNT',
}

// 커뮤니티 게시글 검색 응답 (Search API용)
export interface CommunityPostSearchResponse {
  postId: number
  title: string
  snippet: string
  category: string
  authorId: number
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
}

// 커뮤니티 게시글 검색 요청 파라미터
export interface SearchCommunityPostsRequest {
  nextCursor?: string | null
  keyword?: string
  sortType?: CommunitySortType
  limit?: number
}

// 커뮤니티 게시글 검색 응답 (무한 스크롤)
export type SearchCommunityPostsResponse = ScrollResponse<CommunityPostSearchResponse>
