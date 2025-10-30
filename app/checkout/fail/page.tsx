"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function CheckoutFailPage() {
  const params = useSearchParams()
  const router = useRouter()

  const code = params.get("code")
  const message = params.get("message")

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[640px] px-4 py-16">
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">결제에 실패했어요</h1>
          {message && (
            <p className="text-sm text-text-secondary break-words">{message}</p>
          )}
          {code && (
            <p className="text-xs text-text-secondary">오류 코드: {code}</p>
          )}
          <div className="pt-2 flex gap-3 justify-center">
            <Button onClick={() => router.push("/checkout")}>
              결제 다시 시도
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>홈으로</Button>
          </div>
        </Card>
      </main>
    </div>
  )
}


