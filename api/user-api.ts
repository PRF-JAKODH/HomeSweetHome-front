import apiClient, { AuthType } from "@/lib/api"
import { User, UserResponse } from "@/types/auth"

// 사용자 정보 수정 API
export const updateUser = async (user: User) => {
  return await apiClient.put<User>('/api/v1/user/update', user, {
    authType: AuthType.ACCESS_TOKEN,
  })
}

// 멀티파트로 사용자 정보(프로필 이미지 포함) 수정 API
export const updateUserMultipart = async (formData: FormData) => {
  return await apiClient.put<User>('/api/v1/user/update', formData, {
    authType: AuthType.ACCESS_TOKEN,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 사용자 역할 변경 API (판매자 등록)
export const updateUserRole = async (role: string) => {
  return await apiClient.put<User>('/api/v1/user/role', { role }, {
    authType: AuthType.ACCESS_TOKEN,
  })
}

// 사용자 정보 조회 API
export const fetchUser = async () => {
  return await apiClient.get<UserResponse>('/api/v1/user/me', { authType: AuthType.ACCESS_TOKEN })
}