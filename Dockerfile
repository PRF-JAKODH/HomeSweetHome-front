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

# Next.js standalone 빌드 산출물만 복사 (production dependencies 포함)
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# 기본 포트
EXPOSE 3000

USER nextjs

CMD ["node", "server.js"]


