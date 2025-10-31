# syntax=docker/dockerfile:1.7

# 1) Dependencies 설치 스테이지
FROM node:20-alpine AS deps
WORKDIR /app

# OS 패키지 (optional: sharp 등 네이티브 모듈 대비)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# 패키지 매니저 자동 감지
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    else \
      npm ci; \
    fi

# 2) 빌드 스테이지
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 프로덕션 빌드
ENV NODE_ENV=production
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && corepack prepare pnpm@latest --activate && pnpm run build; \
    elif [ -f yarn.lock ]; then \
      yarn build; \
    else \
      npm run build; \
    fi

# 3) 런타임 스테이지 (최소 이미지)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 비루트 유저
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Next.js 실행에 필요한 산출물만 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# 기본 포트
EXPOSE 3000

# 헬스체크(옵션)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:3000 || exit 1

USER nextjs

CMD ["npm", "run", "start"]


