"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  
  const { login, isLoading, error, clearError } = useAuth()
  const router = useRouter()

  // 에러가 있으면 토스트 표시
  useEffect(() => {
    if (error) {
      toast({
        title: "로그인 오류",
        description: error,
        variant: "destructive",
      })
      clearError()
    }
  }, [error, clearError])

  const handleGoogleLogin = () => {
    login('google')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-section">
      <div className="w-full max-w-md p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/house-logo.png"
              alt="홈스윗홈 로고"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            홈스윗<span className="text-primary">홈</span>
          </h1>
          <p className="text-text-secondary">로그인하고 다양한 인테리어를 만나보세요</p>
        </div>

        {/* Login Card */}
        <div className="bg-background rounded-lg border border-divider p-8 shadow-sm">
          <div className="space-y-4">
            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
                  fill="#4285F4"
                />
                <path
                  d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
                  fill="#34A853"
                />
                <path
                  d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
                  fill="#FBBC05"
                />
                <path
                  d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
                  fill="#EA4335"
                />
              </svg>
              {isLoading ? "로그인 중..." : "구글로 시작하기"}
            </Button>

           
          </div>

          <div className="mt-6 text-center text-sm text-text-secondary">
            로그인하면{" "}
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

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            아직 계정이 없으신가요?{" "}
            <a 
              href="/signup" 
              className="text-primary hover:underline font-medium"
            >
              회원가입하기
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
