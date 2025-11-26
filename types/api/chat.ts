/**
 * 채팅방 관련 타입 정의
 */

import { ScrollResponse } from './common'

/**
 * 채팅방 정렬 타입
 */
export enum ChatRoomSortType {
  RECOMMENDED = 'RECOMMENDED',
  LATEST = 'LATEST',
}

/**
 * 채팅방 검색 응답
 */
export interface ChatRoomSearchResponse {
  chatRoomId: number
  name: string
  thumbnailUrl: string | null
  createdAt: string
}

/**
 * 채팅방 검색 요청 파라미터
 */
export interface SearchChatRoomsRequest {
  nextCursor?: string | null
  keyword?: string
  sortType?: ChatRoomSortType
  limit?: number
}

/**
 * 채팅방 검색 응답 (ScrollResponse 사용)
 */
export type SearchChatRoomsResponse = ScrollResponse<ChatRoomSearchResponse>

