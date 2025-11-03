/**
 * 현재 로그인한 사용자 정보를 안전하게 가져오는 훅
 * JWT를 클라이언트에서 직접 파싱하지 않고 Zustand store의 user 정보를 사용
 */

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function useCurrentUser() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useMemo(() => ({
    user,
    userId: user?.id ?? null,
    isAuthenticated,
    isGuest: !isAuthenticated,
  }), [user, isAuthenticated])
}

/**
 * 게시글/댓글 작성자 확인 훅
 */
export function useIsAuthor(authorId?: number) {
  const { userId } = useCurrentUser()

  return useMemo(() => ({
    isAuthor: userId !== null && userId === authorId,
    canEdit: userId !== null && userId === authorId,
    canDelete: userId !== null && userId === authorId,
  }), [userId, authorId])
}
