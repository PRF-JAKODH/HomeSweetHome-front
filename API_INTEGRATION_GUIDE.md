# 백엔드 API 연동 가이드

## 📋 단계별 구현 순서

### 1단계: 타입 정의 및 기본 구조 설정
```
📁 types/
├── api/
│   ├── common.ts          # 공통 응답 형식, 페이지네이션
│   ├── product.ts         # 상품 관련 DTO
│   ├── category.ts        # 카테고리 관련 DTO
│   └── user.ts           # 사용자 관련 DTO
└── index.ts              # 타입 재export
```

**요구사항:**
- 백엔드 API 응답 형식 문서 제공
- 각 엔드포인트별 요청/응답 스키마
- 공통 에러 처리 방식

---

### 2단계: API 클라이언트 기본 설정
```
📁 lib/
├── api/
│   ├── client.ts          # Axios 인스턴스, 인터셉터
│   ├── endpoints.ts       # API 엔드포인트 상수
│   └── types.ts          # API 관련 타입
└── utils/
    ├── api-utils.ts       # API 유틸리티 함수
    └── error-handler.ts   # 에러 처리 함수
```

**요구사항:**
- API 베이스 URL
- 인증 방식 (JWT, API Key 등)
- 공통 헤더 설정
- 에러 응답 형식

---

### 3단계: 도메인별 API 함수 구현
```
📁 lib/api/
├── products.ts            # 상품 CRUD API
├── categories.ts          # 카테고리 조회 API
├── users.ts              # 사용자 관련 API
└── orders.ts             # 주문 관련 API
```

**요구사항:**
- 각 도메인별 API 엔드포인트 목록
- 요청 파라미터 형식
- 응답 데이터 구조
- 특별한 비즈니스 로직이 있는지

---

### 4단계: 커스텀 훅 구현
```
📁 lib/hooks/
├── use-products.ts        # 상품 데이터 관리
├── use-categories.ts      # 카테고리 데이터 관리
├── use-cart.ts           # 장바구니 관리
└── use-orders.ts         # 주문 관리
```

**요구사항:**
- 데이터 캐싱 전략
- 로딩 상태 관리 방식
- 에러 처리 방식
- 실시간 업데이트 필요 여부

---

### 5단계: 서비스 레이어 구현
```
📁 services/
├── product-service.ts     # 상품 비즈니스 로직
├── cart-service.ts       # 장바구니 로직
├── order-service.ts      # 주문 처리 로직
└── auth-service.ts       # 인증 관련 로직
```

**요구사항:**
- 복잡한 비즈니스 로직이 있는지
- 로컬스토리지 연동 필요 여부
- 외부 API 연동 필요 여부

---

### 6단계: 전역 상태 관리 (선택사항)
```
📁 store/
├── slices/
│   ├── product-slice.ts   # 상품 상태
│   ├── cart-slice.ts      # 장바구니 상태
│   └── user-slice.ts     # 사용자 상태
└── index.ts              # 스토어 설정
```

**요구사항:**
- 전역 상태로 관리할 데이터
- 상태 동기화 전략
- 캐시 무효화 전략

---

## 🔄 각 단계별 요청 형식

### 1단계 요청 예시:
```
"1단계: 타입 정의를 시작해줘
- API 베이스 URL: https://api.example.com
- 인증 방식: JWT Bearer Token
- 공통 응답 형식: { success: boolean, data: any, message: string }
- 페이지네이션: { page: number, limit: number, total: number }
- 상품 API 응답 스키마: [상품 스키마 문서 첨부]"
```

### 2단계 요청 예시:
```
"2단계: API 클라이언트 설정해줘
- Axios 사용
- JWT 토큰 자동 첨부
- 401 에러 시 자동 로그아웃
- 요청/응답 로깅"
```

### 3단계 요청 예시:
```
"3단계: 상품 API 함수들을 구현해줘
- GET /products (목록 조회)
- GET /products/:id (상세 조회)
- POST /products (생성)
- PUT /products/:id (수정)
- DELETE /products/:id (삭제)"
```

## 📝 체크리스트

### 각 단계 완료 후 확인사항:
- [ ] 타입 안정성 확보
- [ ] 에러 처리 구현
- [ ] 로딩 상태 관리
- [ ] 캐싱 전략 적용
- [ ] 테스트 가능한 구조
- [ ] 재사용 가능한 코드

## 🚀 최종 통합 단계

모든 단계 완료 후:
1. **페이지별 API 연동**: 각 페이지에서 커스텀 훅 사용
2. **에러 바운더리**: 전역 에러 처리
3. **로딩 상태**: 전역 로딩 인디케이터
4. **성능 최적화**: 불필요한 API 호출 방지

---

## 📚 추가 참고사항

### 일반적인 API 연동 패턴:
1. **타입 우선**: TypeScript 타입을 먼저 정의
2. **계층 분리**: API → 서비스 → 훅 → 컴포넌트
3. **에러 처리**: 각 계층에서 적절한 에러 처리
4. **캐싱**: React Query나 SWR 활용
5. **테스트**: 각 계층별 단위 테스트

### 성능 최적화 팁:
- **불필요한 API 호출 방지**: useMemo, useCallback 활용
- **페이지네이션**: 무한 스크롤 또는 페이지네이션 구현
- **캐싱**: 적절한 캐시 TTL 설정
- **프리페칭**: 사용자 행동 예측하여 데이터 미리 로드

이 가이드를 따라 단계별로 요청하시면 체계적으로 백엔드 API를 연동할 수 있습니다!
