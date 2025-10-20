// Authentication related types

export interface User {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string;
  role: 'USER' | 'SELLER';
  grade: string | null;
  phone: string;
  birthDate: Date;
  address?: {
    roadAddress: string;
    detailAddress: string;
  };
}
// Response Types
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string;
  grade: string | null;
  role: 'USER' | 'SELLER';
  phoneNumber: string;
  birthDate: Date;
}

export interface accessTokenResponse {
  accessToken : string;
  userResponse : UserResponse
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: UserResponse;
}

export interface LogoutResponse {
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  provider: 'google' | 'kakao';
}

// Request Types
export interface SignupRequest {
  phoneNumber: string;
  birthDate: Date;
  role: 'USER' | 'SELLER';
}