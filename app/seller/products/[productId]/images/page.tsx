"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { getProduct } from "@/lib/api/products"


export default function EditProductImagesPage() {
  const router = useRouter()
  const params = useParams()
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [subImages, setSubImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 상품 이미지 데이터 가져오기
  useEffect(() => {
    const fetchProductData = async () => {
      if (!params.productId) return
      
      setLoading(true)
      try {
        const productResponse = await getProduct(params.productId as string)
        const productData = (productResponse.data || productResponse) as any
        
        console.log('상품 이미지 데이터:', productData)
        
        // 이미지 설정
        if (productData.images && productData.images.length > 0) {
          setMainImage(productData.images[0])
        } else if (productData.imageUrl) {
          setMainImage(productData.imageUrl)
        }
        
        if (productData.detailImageUrls && productData.detailImageUrls.length > 0) {
          setSubImages(productData.detailImageUrls)
        }
      } catch (error) {
        console.error('상품 이미지 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProductData()
  }, [params.productId])

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setMainImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSubImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeSubImage = (index: number) => {
    setSubImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainImage) {
      alert("메인 이미지를 업로드해주세요.")
      return
    }

    setSubmitting(true)
    try {
      // TODO: 실제 이미지 수정 API 호출
      // await updateProductImages(params.productId as string, mainImage, subImages)
      alert("이미지가 수정되었습니다!")
      router.push("/seller")
    } catch (error) {
      console.error('이미지 수정 실패:', error)
      alert("이미지 수정에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">이미지 정보를 불러오는 중...</p>
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

        <h1 className="text-3xl font-bold mb-8">이미지 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">
              메인 이미지 <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-4">
              {mainImage ? (
                <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden border">
                  <Image src={mainImage || "/placeholder.svg"} alt="Main product" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setMainImage(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square max-w-md mx-auto border-2 border-dashed rounded-lg cursor-pointer hover:bg-background-section transition-colors">
                  <ImageIcon className="w-12 h-12 text-text-tertiary mb-2" />
                  <span className="text-sm text-text-secondary">클릭하여 이미지 업로드</span>
                  <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">서브 이미지 (최대 5장)</Label>
            <div className="grid grid-cols-5 gap-4">
              {subImages.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image src={image || "/placeholder.svg"} alt={`Sub ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSubImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {subImages.length < 5 && (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-background-section transition-colors">
                  <Upload className="w-6 h-6 text-text-tertiary mb-1" />
                  <span className="text-xs text-text-secondary">추가</span>
                  <input type="file" accept="image/*" multiple onChange={handleSubImageUpload} className="hidden" />
                </label>
              )}
            </div>
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

