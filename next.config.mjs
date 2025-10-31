/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // 이미지 최적화 활성화 (개발 환경에서는 이미지 최적화가 느릴 수 있으므로 필요시 주석 처리)
    unoptimized: false,
    // 외부 이미지 도메인 허용
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: false,
  experimental: {
    suppressHydrationWarning: true,
  },
}

export default nextConfig
