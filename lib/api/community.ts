/**
 * 커뮤니티 API 함수
 */

import { apiClient } from './client'
import { COMMUNITY_ENDPOINTS } from './endpoints'
import type {
  CommunityPost,
  CommunityComment,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  GetPostsParams,
  PostsPageResponse,
} from '@/types/api/community'
import type { ApiResponse } from '@/types/api/common'

/**
 * 게시글 목록 조회
 */
export async function getPosts(params?: GetPostsParams): Promise<PostsPageResponse> {
  const queryParams = new URLSearchParams()

  if (params?.page !== undefined) queryParams.append('page', params.page.toString())
  if (params?.size !== undefined) queryParams.append('size', params.size.toString())
  if (params?.sort) queryParams.append('sort', params.sort)
  if (params?.direction) queryParams.append('direction', params.direction)

  const url = `${COMMUNITY_ENDPOINTS.GET_POSTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return apiClient.get<PostsPageResponse>(url)
}

/**
 * 게시글 상세 조회
 */
export async function getPost(postId: number): Promise<CommunityPost> {
  return apiClient.get<CommunityPost>(COMMUNITY_ENDPOINTS.GET_POST(postId))
}

/**
 * 게시글 작성
 * 백엔드는 multipart/form-data로 images와 request를 받음
 */
export async function createPost(data: CreatePostRequest): Promise<ApiResponse<CommunityPost>> {
  const userId = apiClient.getUserId()

  // FormData 생성
  const formData = new FormData()

  // request 부분을 JSON Blob으로 추가
  const requestBlob = new Blob(
    [JSON.stringify({ title: data.title, content: data.content })],
    { type: 'application/json' }
  )
  formData.append('request', requestBlob)

  // 이미지 파일이 있으면 추가
  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append('images', file)
    })
  }

  console.log('[createPost] Request:', {
    url: COMMUNITY_ENDPOINTS.CREATE_POST,
    userId,
    data: { title: data.title, content: data.content, imageCount: data.images?.length || 0 },
  })

  return apiClient.post<CommunityPost>(
    COMMUNITY_ENDPOINTS.CREATE_POST,
    formData,
    {
      headers: {
        'User-Id': userId || '1',
        'Content-Type': 'multipart/form-data',
      },
    }
  )
}

/**
 * 게시글 수정
 * 백엔드 DTO는 title, content만 받음 (이미지는 별도 처리)
 */
export async function updatePost(
  postId: number,
  data: UpdatePostRequest
): Promise<ApiResponse<CommunityPost>> {
  const userId = apiClient.getUserId()

  // 백엔드 Request DTO에 맞게 title, content만 전송
  const requestData = {
    title: data.title,
    content: data.content,
  }

  return apiClient.put<CommunityPost>(
    COMMUNITY_ENDPOINTS.UPDATE_POST(postId),
    requestData,
    {
      headers: {
        'User-Id': userId || '1',
      },
    }
  )
}

/**
 * 게시글 삭제
 */
export async function deletePost(postId: number): Promise<ApiResponse<void>> {
  const userId = apiClient.getUserId()

  return apiClient.delete<void>(COMMUNITY_ENDPOINTS.DELETE_POST(postId), {
    headers: {
      'User-Id': userId || '1',
    },
  })
}

/**
 * 댓글 목록 조회
 */
export async function getComments(postId: number): Promise<CommunityComment[]> {
  return apiClient.get<CommunityComment[]>(COMMUNITY_ENDPOINTS.GET_COMMENTS(postId))
}

/**
 * 댓글 작성
 */
export async function createComment(
  postId: number,
  data: CreateCommentRequest
): Promise<ApiResponse<CommunityComment>> {
  const userId = apiClient.getUserId()

  return apiClient.post<CommunityComment>(
    COMMUNITY_ENDPOINTS.CREATE_COMMENT(postId),
    data,
    {
      headers: {
        'User-Id': userId || '1',
      },
    }
  )
}

/**
 * 댓글 수정
 */
export async function updateComment(
  postId: number,
  commentId: number,
  data: UpdateCommentRequest
): Promise<ApiResponse<CommunityComment>> {
  const userId = apiClient.getUserId()

  return apiClient.put<CommunityComment>(
    COMMUNITY_ENDPOINTS.UPDATE_COMMENT(postId, commentId),
    data,
    {
      headers: {
        'User-Id': userId || '1',
      },
    }
  )
}

/**
 * 댓글 삭제
 */
export async function deleteComment(
  postId: number,
  commentId: number
): Promise<ApiResponse<void>> {
  const userId = apiClient.getUserId()

  return apiClient.delete<void>(
    COMMUNITY_ENDPOINTS.DELETE_COMMENT(postId, commentId),
    {
      headers: {
        'User-Id': userId || '1',
      },
    }
  )
}
