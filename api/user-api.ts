import apiClient, { AuthType } from "@/lib/api";
import { User, UserResponse } from "@/types/auth";

// 사용자 정보 수정 API
export const updateUser = async (user: User) => {
  return await apiClient.put<User>('/api/v1/user/update', user, {
    authType: AuthType.ACCESS_TOKEN,
  });
};

// 사용자 역할 변경 API (판매자 등록)
export const updateUserRole = async (role: string) => {
  return await apiClient.put<User>('/api/v1/user/role', { role }, {
    authType: AuthType.ACCESS_TOKEN,
  });
};

// 사용자 정보 조회 API
export const fetchUser = async () => {
  return await apiClient.get<UserResponse>('/api/v1/user/me', { authType: AuthType.ACCESS_TOKEN });
};