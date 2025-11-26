/**
 * 검색 관련 API 함수들
 */

import { apiClient } from './client'
import { PRODUCT_ENDPOINTS, CHAT_SEARCH_ENDPOINTS } from './endpoints'
import type { SearchChatRoomsRequest, SearchChatRoomsResponse } from '@/types/api/chat'
import { ChatRoomSortType } from '@/types/api/chat'

/**
 * 최근 검색어 조회
 */
export const getRecentSearches = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>(PRODUCT_ENDPOINTS.SEARCH_RECENT)
  if (Array.isArray(response)) {
    return response
  }
  return Array.isArray((response as any)?.data) ? (response as any).data : []
}

/**
 * 최근 검색어 삭제
 */
export const deleteRecentSearchKeyword = async (keyword: string): Promise<void> => {
  await apiClient.delete(PRODUCT_ENDPOINTS.SEARCH_RECENT_DELETE_KEYWORD, {
    params: { keyword },
  })
}

/**
 * 최근 검색어 전체 삭제
 */
export const clearRecentSearches = async (): Promise<void> => {
  await apiClient.delete(PRODUCT_ENDPOINTS.SEARCH_RECENT_CLEAR_ALL)
}

/**
 * 상품 검색 자동 완성
 */
export const getSearchAutocomplete = async (keyword: string): Promise<string[]> => {
  if (!keyword || keyword.trim().length < 2) {
    return []
  }
  const response = await apiClient.get<string[]>(PRODUCT_ENDPOINTS.SEARCH_AUTOCOMPLETE, {
    params: { keyword: keyword.trim() }
  })
  if (Array.isArray(response)) {
    return response
  }
  return Array.isArray((response as any)?.data) ? (response as any).data : []
}

/**
 * 채팅방 검색 자동 완성
 */
export const getChatRoomAutocomplete = async (keyword: string): Promise<string[]> => {
  if (!keyword || keyword.trim().length < 2) {
    return []
  }
  const response = await apiClient.get<string[]>(CHAT_SEARCH_ENDPOINTS.SEARCH_AUTOCOMPLETE, {
    params: { keyword: keyword.trim() }
  })
  if (Array.isArray(response)) {
    return response
  }
  return Array.isArray((response as any)?.data) ? (response as any).data : []
}

/**
 * 채팅방 검색 및 조회
 */
export const searchChatRooms = async (params: SearchChatRoomsRequest = {}): Promise<SearchChatRoomsResponse> => {
  const apiParams: Record<string, any> = {
    ...(params.nextCursor !== undefined && params.nextCursor !== null ? { nextCursor: params.nextCursor } : {}),
    ...(params.keyword ? { keyword: params.keyword.trim() } : {}),
    sortType: params.sortType || ChatRoomSortType.LATEST,
    limit: params.limit !== undefined ? params.limit : 20,
  }

  const response = await apiClient.get<SearchChatRoomsResponse>(CHAT_SEARCH_ENDPOINTS.SEARCH_CHAT_ROOMS, {
    params: apiParams,
  })

  return response
}

