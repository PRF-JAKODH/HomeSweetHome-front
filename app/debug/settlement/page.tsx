"use client"

import { useEffect, useState } from "react"
import { settlementApi } from "@/api/sapi"

export default function SettlementDebug() {
  const [data, setData] = useState<any>(null)
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    ;(async () => {
      const res = await settlementApi.daily(11, today)
      console.log("🟢 from backend =", res)
      setData(res)
    })()
  }, [today])

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
