/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // 이미지 최적화 비활성화 (외부 이미지 직접 로딩)
    unoptimized: true,
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
        hostname: 'shopping-phinf.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'ssl.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'phinf.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'hsweet-bucket-1007.s3.ap-northeast-2.amazonaws.com',
      },
    ],
    // 이미지 로더 설정 (필요시)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactStrictMode: false,
  experimental: {
    suppressHydrationWarning: true,
  },
}

export default nextConfig
