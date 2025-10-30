"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, ImageIcon, ChevronRight } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { useTopCategories, useCategoriesByParent } from "@/lib/hooks/use-categories"
import { getProduct } from "@/lib/api/products"
import { getCategoryHierarchy } from "@/lib/api/categories"


export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [subImages, setSubImages] = useState<string[]>([])

  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null)
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(false)

  const [productName, setProductName] = useState("")
  const [brand, setBrand] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountRate, setDiscountRate] = useState("")
  const [shippingType, setShippingType] = useState("free")
  const [shippingFee, setShippingFee] = useState("")
  const [description, setDescription] = useState("")

  // 카테고리 API 훅들
  const { data: topCategories = [], isLoading: topCategoriesLoading, error: topCategoriesError } = useTopCategories()
  const { data: subCategories = [], isLoading: subCategoriesLoading } = useCategoriesByParent(selectedMainCategory || 0)
  const subSubCategoryParentId = selectedSubCategory && subCategories.length > 0 ? selectedSubCategory : 0
  const { data: subSubCategories = [], isLoading: subSubCategoriesLoading } = useCategoriesByParent(subSubCategoryParentId)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchProductData = async () => {
      if (!params.productId) return
      
      setLoading(true)
      try {
        const productResponse = await getProduct(params.productId as string)
        const productData = (productResponse.data || productResponse) as any
        
        console.log('상품 데이터:', productData)
        
        // 상품 데이터로 폼 초기화
        setProductName(productData.name || "")
        setBrand(productData.brand || "")
        setOriginalPrice(String(productData.basePrice || productData.price || ""))
        setDiscountRate(String(productData.discountRate || 0))
        setShippingType(productData.shippingPrice === 0 ? "free" : "paid")
        setShippingFee(String(productData.shippingPrice || 0))
        setDescription(productData.description || "")
        
        // 카테고리 설정
        if (productData.categoryId) {
          try {
            const categoryResponse = await getCategoryHierarchy(Number(productData.categoryId))
            if (categoryResponse && categoryResponse.length > 0) {
              setSelectedMainCategory(categoryResponse[0].id)
              if (categoryResponse.length > 1) {
                setSelectedSubCategory(categoryResponse[1].id)
              }
              if (categoryResponse.length > 2) {
                setSelectedDetailCategory(categoryResponse[2].id)
              }
            }
          } catch (error) {
            console.error('카테고리 조회 실패:', error)
          }
        }
        
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
        console.error('상품 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProductData()
  }, [params.productId])

  // 카테고리 선택 핸들러들
  const handleMainCategoryChange = (categoryId: number) => {
    setSelectedMainCategory(categoryId)
    setSelectedSubCategory(null)
    setSelectedDetailCategory(null)
  }

  const handleSubCategoryChange = (subCategoryId: number) => {
    setSelectedSubCategory(subCategoryId)
    setSelectedDetailCategory(null)
  }

  const handleDetailCategoryChange = (detailCategoryId: number) => {
    setSelectedDetailCategory(detailCategoryId)
  }

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

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

  const calculateFinalPrice = () => {
    const price = Number.parseFloat(originalPrice) || 0
    const discount = Number.parseFloat(discountRate) || 0
    return Math.floor(price * (1 - discount / 100))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainImage) {
      alert("메인 이미지를 업로드해주세요.")
      return
    }

    const selectedCategoryId = selectedDetailCategory || selectedSubCategory || selectedMainCategory
    if (!selectedCategoryId) {
      alert("카테고리를 선택해주세요.")
      return
    }

    if (!productName || !brand || !originalPrice) {
      alert("필수 항목을 모두 입력해주세요.")
      return
    }

    // TODO: 실제 상품 수정 API 호출
    // try {
    //   await updateProduct(params.productId as string, productData)
    //   alert("상품이 수정되었습니다!")
    //   router.push("/seller")
    // } catch (error) {
    //   console.error('상품 수정 실패:', error)
    //   alert("상품 수정에 실패했습니다. 다시 시도해주세요.")
    // }
    
    alert("상품이 수정되었습니다!")
    router.push("/seller")
  }


  // 클라이언트 사이드에서만 렌더링
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (topCategoriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">카테고리를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (topCategoriesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">카테고리를 불러오는데 실패했습니다.</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
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

        <h1 className="text-3xl font-bold mb-8">기본 정보 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">
              카테고리 <span className="text-red-500">*</span>
            </Label>

            {/* Selected Category Path */}
            {(selectedMainCategory || selectedSubCategory || selectedDetailCategory) && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                <span className="text-sm text-text-secondary">선택된 카테고리: </span>
                <span className="text-sm font-medium">
                  {[
                    topCategories.find(cat => cat.id === selectedMainCategory)?.name,
                    subCategories.find(cat => cat.id === selectedSubCategory)?.name,
                    subSubCategories.find(cat => cat.id === selectedDetailCategory)?.name
                  ].filter(Boolean).join(" > ")}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 h-[400px]">
              {/* Main Categories */}
              <div className="border rounded-lg overflow-y-auto">
                {topCategoriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : topCategoriesError ? (
                  <div className="flex items-center justify-center py-8 text-red-500">
                    <span className="text-sm">카테고리를 불러올 수 없습니다</span>
                  </div>
                ) : (
                  topCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        handleMainCategoryChange(category.id)
                        toggleCategory(category.id)
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-background-section transition-colors ${
                        selectedMainCategory === category.id ? "bg-primary/10 font-medium text-primary" : ""
                      }`}
                    >
                      <span>{category.name}</span>
                      <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    </button>
                  ))
                )}
              </div>

              {/* Sub Categories */}
              <div className="border rounded-lg overflow-y-auto">
                {selectedMainCategory && (
                  <>
                    {subCategoriesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : subCategories.length > 0 ? (
                      subCategories.map((subCategory) => (
                        <button
                          key={subCategory.id}
                          type="button"
                          onClick={() => {
                            handleSubCategoryChange(subCategory.id)
                            toggleCategory(subCategory.id)
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-background-section transition-colors ${
                            selectedSubCategory === subCategory.id ? "bg-primary/10 font-medium text-primary" : ""
                          }`}
                        >
                          <span>{subCategory.name}</span>
                          <ChevronRight className="w-4 h-4 text-text-tertiary" />
                        </button>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8 text-text-secondary">
                        <span className="text-sm">하위 카테고리가 없습니다</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Detail Categories */}
              <div className="border rounded-lg overflow-y-auto">
                {selectedMainCategory && selectedSubCategory && (
                  <>
                    {subSubCategoriesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : subSubCategories.length > 0 ? (
                      subSubCategories.map((subSubCategory) => (
                        <button
                          key={subSubCategory.id}
                          type="button"
                          onClick={() => handleDetailCategoryChange(subSubCategory.id)}
                          className={`w-full px-4 py-3 text-left hover:bg-background-section transition-colors ${
                            selectedDetailCategory === subSubCategory.id ? "bg-primary/10 font-medium text-primary" : ""
                          }`}
                        >
                          {subSubCategory.name}
                        </button>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8 text-text-secondary">
                        <span className="text-sm">세부 카테고리가 없습니다</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>

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

          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="productName">
                상품명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="상품명을 입력하세요"
                required
              />
            </div>

            <div>
              <Label htmlFor="brand">
                브랜드 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="브랜드명을 입력하세요"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="originalPrice">
                  원 가격 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discountRate">할인율 (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  min="0"
                  max="100"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {originalPrice && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">최종 판매가</span>
                  <span className="text-2xl font-bold text-primary">₩{calculateFinalPrice().toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <Label>
                배송 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shipping"
                    value="free"
                    checked={shippingType === "free"}
                    onChange={(e) => setShippingType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>무료배송</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shipping"
                    value="paid"
                    checked={shippingType === "paid"}
                    onChange={(e) => setShippingType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>배송비</span>
                </label>
              </div>
              {shippingType === "paid" && (
                <Input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  placeholder="배송비를 입력하세요"
                  className="mt-2"
                />
              )}
            </div>

          </Card>

          <Card className="p-6">
            <Label htmlFor="description" className="text-base font-semibold mb-3 block">
              상품 상세 설명
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품에 대한 상세한 설명을 입력하세요"
              rows={10}
              className="resize-none"
            />
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              수정 완료
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
