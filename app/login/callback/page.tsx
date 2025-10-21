'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshToken, initializeAuth } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('인증 처리 중...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL 파라미터에서 성공/실패 상태 확인
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (success === 'false' || error) {
          setStatus('error');
          setMessage(errorMessage || '인증에 실패했습니다.');
          return;
        }

        // 토큰 갱신 시도
        const refreshSuccess = await refreshToken();
        
        if (refreshSuccess) {
          await initializeAuth();
          setStatus('success');
          setMessage('로그인에 성공했습니다!');
          
          handleGoToHome();
        } else {
          setStatus('error');
          setMessage('토큰 갱신에 실패했습니다.');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('인증 처리 중 오류가 발생했습니다.');
      }
    };

    handleCallback();
  }, [searchParams, refreshToken, router]);

  const handleRetry = () => {
    router.push('/login');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === 'loading' && (
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-12 w-12 text-green-600" />
              )}
              {status === 'error' && (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && '인증 처리 중'}
              {status === 'success' && '로그인 성공'}
              {status === 'error' && '로그인 실패'}
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  잠시만 기다려주세요...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  홈으로 이동합니다.
                </p>
                <Button onClick={handleGoToHome} className="w-full">
                  홈으로 이동
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-red-600">
                  다시 시도해주세요.
                </p>
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full">
                    다시 로그인
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
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            문제가 지속되면 고객지원에 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
