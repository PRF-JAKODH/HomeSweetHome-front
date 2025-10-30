"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, ImageIcon, ChevronRight, Plus, Trash2, FolderPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useTopCategories, useCategoriesByParent, useCreateCategory } from "@/lib/hooks/use-categories"
import { createProduct } from "@/lib/api/products"
import { Category } from "@/types/api/category"
import { CreateProductRequest, OptionGroup, SkuInfo } from "@/types/api/product"


type OptionInput = {
  name: string
  values: string
}

type OptionCombination = {
  combination: string[]
  additionalPrice: number
  stockQuantity: number
}

export default function CreateProductPage() {
  const router = useRouter()
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [subImages, setSubImages] = useState<string[]>([])
  const [productName, setProductName] = useState("")
  const [brand, setBrand] = useState("") // Added brand state
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountRate, setDiscountRate] = useState("")
  const [shippingType, setShippingType] = useState("free")
  const [shippingFee, setShippingFee] = useState("")
  const [stock, setStock] = useState("")
  const [description, setDescription] = useState("")

  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null)
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [isClient, setIsClient] = useState(false)

  const [productType, setProductType] = useState<"single" | "option">("single")

  const [optionInputs, setOptionInputs] = useState<OptionInput[]>([{ name: "", values: "" }])
  const [optionCombinations, setOptionCombinations] = useState<OptionCombination[]>([])
  const [bulkAdditionalPrice, setBulkAdditionalPrice] = useState("")
  const [bulkStock, setBulkStock] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 카테고리 생성 관련 상태
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<{
    type: "top" | "sub" | "detail"
    parentId?: number
  } | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // 카테고리 API 훅들
  const { data: topCategories = [], isLoading: topCategoriesLoading, error: topCategoriesError } = useTopCategories()
  const { data: subCategories = [], isLoading: subCategoriesLoading } = useCategoriesByParent(selectedMainCategory || 0)
  const subSubCategoryParentId = selectedSubCategory && subCategories.length > 0 ? selectedSubCategory : 0
  const { data: subSubCategories = [], isLoading: subSubCategoriesLoading } = useCategoriesByParent(subSubCategoryParentId)
  const createCategoryMutation = useCreateCategory()

  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const addOptionInput = () => {
    if (optionInputs.length < 3) {
      setOptionInputs([...optionInputs, { name: "", values: "" }])
    }
  }

  const removeOptionInput = (index: number) => {
    if (optionInputs.length > 1) {
      setOptionInputs(optionInputs.filter((_, i) => i !== index))
    }
  }

  const updateOptionInput = (index: number, field: "name" | "values", value: string) => {
    const updated = [...optionInputs]
    updated[index][field] = value
    setOptionInputs(updated)
  }

  const generateOptionCombinations = () => {
    const validOptions = optionInputs.filter((opt) => opt.name && opt.values)

    if (validOptions.length === 0) {
      alert("옵션명과 옵션값을 입력해주세요.")
      return
    }

    const optionArrays = validOptions.map((opt) => ({
      name: opt.name,
      values: opt.values
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v),
    }))

    // Generate all combinations
    const combinations: string[][] = [[]]
    for (const option of optionArrays) {
      const newCombinations: string[][] = []
      for (const combination of combinations) {
        for (const value of option.values) {
          newCombinations.push([...combination, value])
        }
      }
      combinations.length = 0
      combinations.push(...newCombinations)
    }

    setOptionCombinations(
      combinations.map((combo) => ({
        combination: combo,
        additionalPrice: 0,
        stockQuantity: 0,
      })),
    )
  }

  const updateCombination = (index: number, field: "additionalPrice" | "stockQuantity", value: number) => {
    const updated = [...optionCombinations]
    updated[index][field] = value
    setOptionCombinations(updated)
  }

  const applyBulkAdditionalPrice = () => {
    const price = Number.parseInt(bulkAdditionalPrice) || 0
    setOptionCombinations(
      optionCombinations.map((combo) => ({
        ...combo,
        additionalPrice: price,
      })),
    )
    setBulkAdditionalPrice("")
  }

  const applyBulkStock = () => {
    const stockValue = Number.parseInt(bulkStock) || 0
    setOptionCombinations(
      optionCombinations.map((combo) => ({
        ...combo,
        stockQuantity: stockValue,
      })),
    )
    setBulkStock("")
  }

  // 카테고리 생성 함수들
  const handleCreateCategory = async (event?: React.MouseEvent | React.KeyboardEvent) => {
    // 중복 실행 방지
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (!newCategoryName.trim()) {
      return
    }

    if (!editingCategory) return

    // 이미 생성 중이면 중복 실행 방지
    if (isCreating || createCategoryMutation.isPending) {
      console.log('중복 실행 방지됨')
      return
    }

    setIsCreating(true)
    try {
      const categoryData = {
        name: newCategoryName.trim(),
        ...(editingCategory.type !== "top" && { parentId: editingCategory.parentId })
      }

      const newCategory = await createCategoryMutation.mutateAsync(categoryData)
      
      // 생성된 카테고리 자동 선택
      if (editingCategory.type === "top") {
        setSelectedMainCategory(newCategory.id)
        setSelectedSubCategory(null)
        setSelectedDetailCategory(null)
      } else if (editingCategory.type === "sub") {
        setSelectedSubCategory(newCategory.id)
        setSelectedDetailCategory(null)
      } else if (editingCategory.type === "detail") {
        setSelectedDetailCategory(newCategory.id)
      }

      // 폼 초기화
      setNewCategoryName("")
      setEditingCategory(null)
    } catch (error: any) {
      console.error('카테고리 생성 실패:', error)
      alert("카테고리 생성에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsCreating(false)
    }
  }

  const startCreatingCategory = (type: "top" | "sub" | "detail", parentId?: number) => {
    setEditingCategory({ type, parentId })
    setNewCategoryName("")
  }

  const cancelCreatingCategory = () => {
    setEditingCategory(null)
    setNewCategoryName("")
  }

  // Base64 문자열을 File 객체로 변환하는 헬퍼 함수
  const base64ToFile = (base64String: string, filename: string): Promise<File> => {
    return new Promise((resolve) => {
      const arr = base64String.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const file = new File([u8arr], filename, { type: mime })
      resolve(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (productType === "single" && !stock) {
      alert("수량을 입력해주세요.")
      return
    }

    if (productType === "option" && optionCombinations.length === 0) {
      alert("옵션을 생성해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      // 메인 이미지를 File로 변환
      const mainImageFile = await base64ToFile(mainImage, 'main-image.jpg')
      
      // 상세 이미지들을 File로 변환
      const detailImageFiles: File[] = []
      for (const image of subImages) {
        const file = await base64ToFile(image, `detail-image-${detailImageFiles.length}.jpg`)
        detailImageFiles.push(file)
      }

      // 상품 데이터 구성
      let productData: CreateProductRequest

      if (productType === "single") {
        // 단일 상품
        productData = {
          categoryId: selectedCategoryId,
          name: productName,
          brand: brand,
          basePrice: parseInt(originalPrice),
          discountRate: parseFloat(discountRate) || 0,
          description: description,
          shippingPrice: shippingType === "free" ? 0 : parseInt(shippingFee) || 0,
          optionGroups: [],
          skus: [{
            priceAdjustment: 0,
            stockQuantity: parseInt(stock),
            optionIndexes: []
          }]
        }
      } else {
        // 옵션 상품
        const optionGroups: OptionGroup[] = optionInputs
          .filter(opt => opt.name && opt.values)
          .map(opt => ({
            groupName: opt.name,
            values: opt.values.split(',').map(v => v.trim()).filter(v => v)
          }))

        // 옵션 그룹의 values를 평면화하여 전체 옵션 리스트 생성
        const flattenedOptions: string[] = []
        optionGroups.forEach(group => {
          flattenedOptions.push(...group.values)
        })

        const skus: SkuInfo[] = optionCombinations.map(combo => {
          // 각 조합의 옵션값이 평면화된 리스트에서의 인덱스를 찾기
          const optionIndexes: number[] = []
          
          combo.combination.forEach((value) => {
            const index = flattenedOptions.findIndex(option => option === value)
            if (index !== -1) {
              optionIndexes.push(index)
            }
          })
          
          return {
            priceAdjustment: combo.additionalPrice,
            stockQuantity: combo.stockQuantity,
            optionIndexes
          }
        })

        productData = {
          categoryId: selectedCategoryId,
          name: productName,
          brand: brand,
          basePrice: parseInt(originalPrice),
          discountRate: parseFloat(discountRate) || 0,
          description: description,
          shippingPrice: shippingType === "free" ? 0 : parseInt(shippingFee) || 0,
          optionGroups,
          skus
        }
      }

      await createProduct(productData, mainImageFile, detailImageFiles)
      
      alert("상품이 등록되었습니다!")
      router.push("/seller")
    } catch (error: any) {
      console.error('상품 등록 실패:', error)
      
      // 409 에러 (동일한 제품명) 처리
      if (error?.response?.status === 409) {
        alert(error?.response?.data?.message || "동일한 제품명을 사용할 수 없습니다.")
      } else {
        alert("상품 등록에 실패했습니다. 다시 시도해주세요.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 클라이언트 사이드에서만 렌더링
  if (!isClient) {
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

        <h1 className="text-3xl font-bold mb-8">상품 등록</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-800">
                ⚠️ <span className="font-medium">주의:</span> 카테고리는 상품 등록 이후 수정할 수 없습니다.
              </p>
            </div>

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
                  <>
                    {topCategories.map((category) => (
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
                    ))}
                    
                    {/* 최상단 카테고리 생성 */}
                    {editingCategory?.type === "top" ? (
                      <div className="px-4 py-3 border-t">
                        <div className="flex items-center gap-2">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="카테고리명 입력"
                            className="flex-1 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                e.stopPropagation()
                                handleCreateCategory(e)
                              } else if (e.key === "Escape") {
                                e.preventDefault()
                                e.stopPropagation()
                                cancelCreatingCategory()
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateCategory}
                            disabled={!newCategoryName.trim() || isCreating || createCategoryMutation.isPending}
                            className="px-2"
                          >
                            ✓
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelCreatingCategory}
                            className="px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startCreatingCategory("top")}
                        className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-background-section transition-colors text-text-secondary border-t"
                      >
                        <Plus className="w-4 h-4" />
                        <span>카테고리 추가</span>
                      </button>
                    )}
                  </>
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
                    ) : (
                      <>
                        {subCategories.map((subCategory) => (
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
                        ))}
                        
                        {/* 하위 카테고리 생성 */}
                        {editingCategory?.type === "sub" && editingCategory.parentId === selectedMainCategory ? (
                          <div className="px-4 py-3 border-t">
                            <div className="flex items-center gap-2">
                              <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="카테고리명 입력"
                                className="flex-1 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleCreateCategory(e)
                                  } else if (e.key === "Escape") {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    cancelCreatingCategory()
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleCreateCategory}
                                disabled={!newCategoryName.trim() || isCreating || createCategoryMutation.isPending}
                                className="px-2"
                              >
                                ✓
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelCreatingCategory}
                                className="px-2"
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startCreatingCategory("sub", selectedMainCategory)}
                            className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-background-section transition-colors text-text-secondary border-t"
                          >
                            <Plus className="w-4 h-4" />
                            <span>카테고리 추가</span>
                          </button>
                        )}
                      </>
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
                    ) : (
                      <>
                        {subSubCategories.map((subSubCategory) => (
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
                        ))}
                        
                        {/* 세부 카테고리 생성 */}
                        {editingCategory?.type === "detail" && editingCategory.parentId === selectedSubCategory ? (
                          <div className="px-4 py-3 border-t">
                            <div className="flex items-center gap-2">
                              <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="카테고리명 입력"
                                className="flex-1 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleCreateCategory(e)
                                  } else if (e.key === "Escape") {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    cancelCreatingCategory()
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleCreateCategory}
                                disabled={!newCategoryName.trim() || isCreating || createCategoryMutation.isPending}
                                className="px-2"
                              >
                                ✓
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelCreatingCategory}
                                className="px-2"
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startCreatingCategory("detail", selectedSubCategory)}
                            className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-background-section transition-colors text-text-secondary border-t"
                          >
                            <Plus className="w-4 h-4" />
                            <span>카테고리 추가</span>
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Main Image */}
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

          {/* Sub Images */}
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

          {/* Product Info */}
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

          <Card className="p-6 space-y-4">
            <Label className="text-base font-semibold">
              상품 유형 <span className="text-red-500">*</span>
            </Label>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ <span className="font-medium">주의:</span> 옵션 유형은 등록 후 수정할 수 없습니다.
              </p>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  value="single"
                  checked={productType === "single"}
                  onChange={(e) => setProductType(e.target.value as "single" | "option")}
                  className="w-4 h-4"
                />
                <span>단일 상품</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  value="option"
                  checked={productType === "option"}
                  onChange={(e) => setProductType(e.target.value as "single" | "option")}
                  className="w-4 h-4"
                />
                <span>옵션 상품</span>
              </label>
            </div>

            {productType === "option" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ <span className="font-medium">주의:</span> 옵션명은 등록 이후 수정할 수 없습니다.
                </p>
              </div>
            )}

            {productType === "single" ? (
              <div>
                <Label htmlFor="stock">
                  수량 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">옵션 설정</Label>
                  <span className="text-sm text-text-secondary">최대 3개까지 추가 가능</span>
                </div>

                {optionInputs.map((option, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label>옵션 {index + 1}</Label>
                      {optionInputs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOptionInput(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">옵션명</Label>
                        <Input
                          value={option.name}
                          onChange={(e) => updateOptionInput(index, "name", e.target.value)}
                          placeholder="예: 색상, 사이즈"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">옵션값 (쉼표로 구분)</Label>
                        <Input
                          value={option.values}
                          onChange={(e) => updateOptionInput(index, "values", e.target.value)}
                          placeholder="예: 블랙,화이트,블루"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {optionInputs.length < 3 && (
                  <Button type="button" variant="outline" onClick={addOptionInput} className="w-full bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    옵션 추가
                  </Button>
                )}

                <Button type="button" onClick={generateOptionCombinations} className="w-full bg-primary">
                  옵션목록으로 적용
                </Button>

                {optionCombinations.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
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
                        <thead className="bg-background-section">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">옵션명</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">추가 금액 (원)</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">재고 수량</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optionCombinations.map((combo, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-3 text-sm">{combo.combination.join(" / ")}</td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={combo.additionalPrice || ""}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                                    updateCombination(index, "additionalPrice", value)
                                  }}
                                  className="w-32"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={combo.stockQuantity || ""}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                                    updateCombination(index, "stockQuantity", value)
                                  }}
                                  className="w-32"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Description */}
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

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "등록 중..." : "상품 등록"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}
