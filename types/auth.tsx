// Authentication related types

export interface User {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string;
  provider: string;
  role: string | null;
  grade: string | null;
  createdAt: string;
  updatedAt: string;
}

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
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: User;
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