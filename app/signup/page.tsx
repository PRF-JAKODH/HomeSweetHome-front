"use client"

import Link from "next/link"
import { useRedirectIfAuthenticated } from "@/hooks/use-auth"

export default function SignupPage() {
  // 이미 인증된 사용자는 홈으로 리다이렉트
  useRedirectIfAuthenticated("/")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-section">
      <div className="w-full max-w-md p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 5L5 17V35H15V25H25V35H35V17L20 5Z"
                stroke="#35C5F0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            홈스윗<span className="text-primary">홈</span>
          </h1>
          <p className="text-text-secondary">회원가입하고 다양한 인테리어를 만나보세요</p>
        </div>

        {/* Signup Card (소셜 버튼 제거) */}
        <div className="bg-background rounded-lg border border-divider p-8 shadow-sm">
          <div className="text-center text-sm text-text-secondary">
            회원가입하면{" "}
            <span>
              홈스윗<span className="text-primary">홈</span>
            </span>
            의{" "}
            <a href="#" className="text-primary hover:underline">
              이용약관
            </a>
            과{" "}
            <a href="#" className="text-primary hover:underline">
              개인정보처리방침
            </a>
            에 동의하게 됩니다.
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
