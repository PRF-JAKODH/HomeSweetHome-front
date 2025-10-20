import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Suspense } from "react"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "홈스윗홈 - 인테리어 쇼핑의 모든 것",
  description: "1000만이 선택한 No.1 인테리어 필수앱",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
      </head>
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
          {children}
        </Suspense>
      </body>
    </html>
  )
}
