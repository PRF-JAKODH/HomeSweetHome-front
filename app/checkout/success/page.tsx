// app/checkout/success/page.tsx
'use client'; // App Router 클라이언트 컴포넌트

import { useEffect, useState, Suspense } from 'react'; // Suspense 추가
import { useSearchParams } from 'next/navigation'; // App Router용 훅
import axios from 'axios';
import { Button } from '@/components/ui/button'; // 필요 시 UI 컴포넌트 사용
import { Card } from '@/components/ui/card'; // 필요 시 UI 컴포넌트 사용
import { useRouter } from 'next/navigation'; // 페이지 이동용
import { apiClient } from '@/lib/api/client';
import { useCheckoutStore } from '@/stores/checkout-store';
// API 2 응답 타입 (OrderService의 PaymentConfirmResponse와 일치)
interface PaymentConfirmResponseDto {
    merchantUid: string;
    status: string; // "DELIVERED" 등
}

// Suspense 내부에서 searchParams를 읽는 컴포넌트
function SuccessPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter(); // 페이지 이동용

    const clearCheckoutItems = useCheckoutStore((state) => state.clearItems);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderResult, setOrderResult] = useState<PaymentConfirmResponseDto | null>(null);

    useEffect(() => {
        // 컴포넌트 마운트 시 URL 쿼리 파라미터 추출 및 API 2 호출
        
        const confirmPayment = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                setError('API URL 환경 변수가 설정되지 않았습니다.');
                setIsLoading(false);
                return;
            }

            // --- URL 쿼리 파라미터 가져오기 ---
            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId'); // 백엔드가 준 merchantUid
            const amountStr = searchParams.get('amount');
            const amount = amountStr ? parseInt(amountStr, 10) : null;

            console.log('Success Page - Query Params:', { paymentKey, orderId, amount }); // 디버깅 로그

            // --- 파라미터 유효성 검사 ---
            if (!paymentKey || !orderId || amount === null || isNaN(amount)) {
                setError('결제 승인에 필요한 정보가 URL에 올바르게 전달되지 않았습니다.');
                setIsLoading(false);
                return;
            }

            try {
                // --- 백엔드 API 2 호출 ---
                console.log('API 2 요청 데이터:', { paymentKey, orderId, amount });
                const response = await apiClient.post<PaymentConfirmResponseDto>(
                    `${apiUrl}/api/v1/orders/payments/confirm`, // 백엔드 결제 검증 API 주소
                    { paymentKey, orderId, amount }
                )
                console.log('API 2 응답 데이터:', response.data);

                setOrderResult(response.data);

                clearCheckoutItems();
                // TODO: DB 장바구니 비우기 API 호출 (localStorage.removeItem 대신)
                localStorage.removeItem("ohouse_cart");

            } catch (err) {
                console.error('결제 검증 실패:', err);
                if (axios.isAxiosError(err) && err.response) {
                    // 백엔드가 GlobalExceptionHandler로 보내준 에러 메시지
                    setError(`결제 최종 승인 실패: ${err.response.data.message || '백엔드 서버 오류'}`);
                } else {
                    setError('결제 최종 승인 중 알 수 없는 오류가 발생했습니다.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        confirmPayment(); // useEffect에서 비동기 함수 즉시 호출

    }, [searchParams, clearCheckoutItems]); // searchParams가 변경될 때마다(실제로는 페이지 로드 시 한 번) 실행

    // --- 렌더링 ---
    if (isLoading) {
        return <div className="text-center p-10">결제 승인 중... 잠시만 기다려주세요.</div>;
    }

    if (error) {
        return (
            <div className="text-center p-10">
                <h1 className="text-xl font-bold text-red-600 mb-4">결제 실패</h1>
                <p className="mb-6">{error}</p>
                <Button onClick={() => router.push('/cart')}>장바구니로 돌아가기</Button>
            </div>
        );
    }

    return (
        <div className="text-center p-10">
            <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">결제가 성공적으로 완료되었습니다!</h1>
            <p className="text-gray-600 mb-6">주문해주셔서 감사합니다.</p>
            
            <div className="mt-8 flex justify-center gap-4">
                <Button variant="outline" onClick={() => router.push('/profile?tab=shopping')}>주문 내역 보기</Button>
                <Button onClick={() => router.push('/')}>홈으로 가기</Button>
            </div>
        </div>
    );
}

// Suspense로 감싸서 페이지를 렌더링 (useSearchParams 사용 규칙)
export default function OrderSuccessPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessPageContent />
        </Suspense>
    );
}