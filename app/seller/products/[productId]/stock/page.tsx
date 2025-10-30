"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Package } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { SkuStockResponse } from "@/types/api/product"
import { getProductStock, updateProductSkuStock } from "@/lib/api/products"

type OptionValue = {
  skuId: number
  name: string
  additionalPrice: number
  stock: number
}

export default function EditProductStockPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [stockData, setStockData] = useState<SkuStockResponse[]>([])
  const [optionCombinations, setOptionCombinations] = useState<OptionValue[]>([])
  const [bulkAdditionalPrice, setBulkAdditionalPrice] = useState("")
  const [bulkStock, setBulkStock] = useState("")
  const [productName, setProductName] = useState("")

  // 상품 재고 데이터 가져오기
  useEffect(() => {
    const fetchStockData = async () => {
      if (!params.productId) return
      
      setLoading(true)
      try {
        const data = await getProductStock(params.productId as string)
        setStockData(data)
        
        // SKU 데이터를 옵션 조합 형태로 변환
        const combinations: OptionValue[] = data.map((sku) => ({
          skuId: sku.skuId,
          name: sku.options
            .filter(opt => opt.groupName && opt.valueName)
            .map(opt => `${opt.groupName}: ${opt.valueName}`)
            .join(', ') || '기본 옵션',
          additionalPrice: sku.priceAdjustment,
          stock: sku.stockQuantity
        }))
        setOptionCombinations(combinations)
      } catch (error) {
        console.error('재고 데이터 조회 실패:', error)
        alert('재고 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [params.productId])

  const updateCombination = (index: number, field: "additionalPrice" | "stock", value: string) => {
    const newCombinations = [...optionCombinations]
    newCombinations[index][field] = Number(value) || 0
    setOptionCombinations(newCombinations)
  }

  const applyBulkAdditionalPrice = () => {
    if (!bulkAdditionalPrice) return
    const price = Number(bulkAdditionalPrice)
    setOptionCombinations(optionCombinations.map((combo) => ({ ...combo, additionalPrice: price })))
    setBulkAdditionalPrice("")
  }

  const applyBulkStock = () => {
    if (!bulkStock) return
    const stockValue = Number(bulkStock)
    setOptionCombinations(optionCombinations.map((combo) => ({ ...combo, stock: stockValue })))
    setBulkStock("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (optionCombinations.length === 0) {
      alert("옵션이 없습니다.")
      return
    }

    setSubmitting(true)
    try {
      // API 요청 형식으로 변환
      const skus = optionCombinations.map((combo) => ({
        skuId: combo.skuId,
        stockQuantity: combo.stock,
        priceAdjustment: combo.additionalPrice
      }))
      
      await updateProductSkuStock(params.productId as string, skus)
      alert("재고가 수정되었습니다!")
      router.push("/seller")
    } catch (error) {
      console.error('재고 수정 실패:', error)
      alert("재고 수정에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-500"
    if (stock < 5) return "text-orange-500"
    return "text-foreground"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">재고 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <h1 className="text-3xl font-bold mb-8">옵션 재고 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5" />
              <Label className="text-base font-semibold">옵션별 재고 관리</Label>
            </div>

            {optionCombinations.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <Package className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
                <p>등록된 옵션이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">옵션 목록 (총 {optionCombinations.length}개)</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={bulkAdditionalPrice}
                        onChange={(e) => setBulkAdditionalPrice(e.target.value)}
                        placeholder="추가금액"
                        className="w-32"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={applyBulkAdditionalPrice}>
                        추가금액 일괄입력
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={bulkStock}
                        onChange={(e) => setBulkStock(e.target.value)}
                        placeholder="재고"
                        className="w-32"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={applyBulkStock}>
                        재고수량 일괄입력
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-background-section">
                        <th className="p-3 text-left text-sm font-medium">옵션명</th>
                        <th className="p-3 text-left text-sm font-medium">추가 금액 (원)</th>
                        <th className="p-3 text-left text-sm font-medium">재고 수량</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionCombinations.map((combo, index) => (
                        <tr key={index} className="border-b hover:bg-background-section">
                          <td className="p-3 text-sm">{combo.name}</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={combo.additionalPrice}
                              onChange={(e) => updateCombination(index, "additionalPrice", e.target.value)}
                              className="w-32"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={combo.stock}
                                onChange={(e) => updateCombination(index, "stock", e.target.value)}
                                className="w-32"
                              />
                              <span className={`text-sm font-medium ${getStockColor(combo.stock)}`}>
                                {combo.stock > 0 ? "재고 있음" : "품절"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitting}>
              {submitting ? "수정 중..." : "수정 완료"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

