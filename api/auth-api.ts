import apiClient, { AuthType } from "@/lib/api";
import { 
  SignupRequest,
  AccessTokenResponse,
  LogoutResponse,
  RefreshTokenResponse,
  User
} from "@/types/auth";

// 회원가입 API
export const signup = async (signupRequest: SignupRequest) => {
  return await apiClient.post<AccessTokenResponse>('/api/v1/auth/signup', signupRequest, {
    authType: AuthType.REFRESH_TOKEN,
  });
};

// 로그아웃 API
export const logout = async () => {
  return await apiClient.post<LogoutResponse>('/api/v1/auth/logout', {}, {
    authType: AuthType.ACCESS_TOKEN,
  });
};

// 토큰 갱신 API
export const refreshToken = async () => {
  return await apiClient.post<RefreshTokenResponse>('/api/v1/auth/refresh', {}, {
    authType: AuthType.REFRESH_TOKEN,
  });
};