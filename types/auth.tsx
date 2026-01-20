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
  address: string;
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
  address: string;
}
export interface AccessTokenResponse {
  accessToken : string;
  user : User
}

export interface RefreshTokenResponse {
  accessToken: string;
  userResponse: UserResponse;
}

export interface LogoutResponse {
}


export interface LoginCredentials {
  provider: 'google' | 'kakao';
}

// Request Types
export interface SignupRequest {
  phoneNumber: string;
  birthDate: Date;
  address: string;
}