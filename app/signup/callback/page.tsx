"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { Loader2, XCircle } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    phone: "",
    birthDate: "",
    roadAddress: "",
    detailAddress: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [authMessage, setAuthMessage] = useState('인증 처리 중...')
  const [showForm, setShowForm] = useState(false)

  // OAuth2 인증 처리 (성공 여부만 확인)
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL 파라미터에서 성공/실패 상태 확인
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (success === 'false' || error) {
          setAuthStatus('error');
          setAuthMessage(errorMessage || 'OAuth2 인증에 실패했습니다.');``
          return;
        }

        // OAuth2 인증 성공 확인 (토큰 갱신은 하지 않음)
        setAuthStatus('success');
        setAuthMessage('인증에 성공했습니다! 추가 정보를 입력해주세요.');
        setShowForm(true);
      } catch (error) {
        console.error('Auth callback error:', error);
        setAuthStatus('error');
        setAuthMessage('인증 처리 중 오류가 발생했습니다.');
      }
    };

    handleAuthCallback();
  }, [searchParams]);

  const handleRetry = () => {
    router.push('/signup');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  // 핸드폰번호 자동 하이픈 포맷팅
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    
    // 11자리 이상 입력 시 11자리까지만 자르기
    const limited = cleaned.slice(0, 11)
    
    const match = limited.match(/^(\d{0,3})(\d{0,4})(\d{0,4})$/)
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join("-")
    }
    return limited
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  const handleAddressSearch = () => {
    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setFormData(prev => ({
          ...prev,
          roadAddress: data.roadAddress
        }))
      },
    }).open()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.phone || !formData.birthDate || !formData.roadAddress) {
      toast({
        title: "입력 오류",
        description: "모든 필수 정보를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    clearError()
    setIsSubmitting(true)
    
    try {
      const response = await signup({
        phoneNumber: formData.phone,
        birthDate: "2020-12-23" ,
        address: formData.roadAddress + "/" + formData.detailAddress,
      })
        
      if (response) {
        toast({
          title: "회원가입 완료",
          description: "회원가입이 성공적으로 완료되었습니다.",
        })
        router.push("/")
      } else {
        toast({
          title: "오류 발생",
          description: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "오류 발생",
        description: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // OAuth2 인증 실패 시 에러 화면 표시
  if (authStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-section py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl">회원가입 실패</CardTitle>
              <CardDescription>
                {authMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-red-600">
                  다시 시도해주세요.
                </p>
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full">
                    다시 회원가입
                  </Button>
                  <Button 
                    onClick={handleGoToHome} 
                    variant="outline" 
                    className="w-full"
                  >
                    홈으로 이동
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-text-secondary">
              문제가 지속되면 고객지원에 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // OAuth2 인증 로딩 중
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-section py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl">인증 처리 중</CardTitle>
              <CardDescription>
                {authMessage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-text-secondary">
                  잠시만 기다려주세요...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 폼 제출 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  // OAuth2 인증 성공 후 폼 표시
  if (authStatus === 'success' && showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-section py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
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
            <p className="text-text-secondary">추가 정보를 입력해주세요</p>
          </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>프로필 완성</CardTitle>
            <CardDescription>
              서비스 이용을 위해 추가 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 핸드폰번호 */}
              <div className="space-y-2">
                <Label htmlFor="phone">핸드폰번호 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                />
              </div>

              {/* 생년월일 */}
              <div className="space-y-2">
                <Label htmlFor="birthDate">생년월일 *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  required
                />
              </div>

              {/* 주소 */}
              <div className="space-y-2">
                <Label>주소 *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="주소를 검색해주세요"
                    value={formData.roadAddress}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddressSearch}
                  >
                    주소 검색
                  </Button>
                </div>
                <Input
                  placeholder="상세주소 (선택사항)"
                  value={formData.detailAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, detailAddress: e.target.value }))}
                />
              </div>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "처리 중..." : "프로필 완성"}
              </Button>
            </form>
          </CardContent>
        </Card>

          <div className="mt-6 text-center text-sm text-text-secondary">
            <p>
              입력하신 정보는{" "}
              <a href="#" className="text-primary hover:underline">
                개인정보처리방침
              </a>
              에 따라 안전하게 보호됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 기본 로딩 상태 (fallback)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>로딩 중...</p>
      </div>
    </div>
  );
}
