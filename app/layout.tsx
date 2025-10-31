import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { QueryProvider } from "@/lib/providers/query-provider"
import { NotificationProvider } from "@/providers/notification-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "라이프스타일 슈퍼앱, 홈스윗홈",
  description: "1000만이 선택한 No.1 인테리어 필수앱",
  generator: "v0.app",
  icons: {
    icon: "/house-logo.png",
    shortcut: "/house-logo.png",
    apple: "/house-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
      </head>
      <body className="font-sans antialiased">
        <NotificationProvider>
        <QueryProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Header />
              {children}
            </Suspense>
            <Toaster />
          </QueryProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
