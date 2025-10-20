"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, ImageIcon, ChevronRight, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const CATEGORIES = {
  가구: {
    침실가구: ["침대", "매트리스", "침대프레임", "협탁", "화장대", "옷장"],
    거실가구: ["소파", "거실장", "TV장", "거실테이블", "콘솔"],
    주방가구: ["식탁", "식탁의자", "주방수납", "렌지대", "식기장"],
    서재가구: ["책상", "책장", "서재의자", "컴퓨터책상"],
    수납가구: ["서랍장", "옷장", "행거", "수납장", "선반"],
  },
  패브릭: {
    커튼: ["암막커튼", "쉬어커튼", "블라인드", "롤스크린"],
    침구: ["이불", "베개", "침대커버", "요", "쿠션"],
    러그: ["거실러그", "침실러그", "주방매트", "현관매트"],
    쿠션: ["방석", "쿠션커버", "등쿠션", "목쿠션"],
  },
  조명: {
    천장조명: ["직부등", "샹들리에", "펜던트", "레일조명"],
    스탠드: ["플로어스탠드", "테이블스탠드", "독서등"],
    벽등: ["벽부등", "브라켓", "간접조명"],
    전구: ["LED전구", "형광등", "할로겐"],
  },
  "수납/정리": {
    옷수납: ["옷걸이", "수납박스", "압축팩", "서랍정리"],
    주방수납: ["밀폐용기", "양념통", "냉장고정리", "싱크대정리"],
    욕실수납: ["욕실선반", "수납바구니", "칫솔걸이"],
    소품수납: ["정리함", "서류정리", "케이블정리"],
  },
  생활용품: {
    청소용품: ["청소기", "걸레", "빗자루", "청소세제"],
    욕실용품: ["수건", "욕실매트", "샤워기", "비누"],
    세탁용품: ["세제", "섬유유연제", "빨래건조대", "다리미"],
    생활잡화: ["휴지통", "우산꽂이", "시계", "거울"],
  },
  주방용품: {
    조리도구: ["냄비", "프라이팬", "칼", "도마", "주걱"],
    식기: ["그릇", "접시", "컵", "수저", "젓가락"],
    주방가전: ["전자레인지", "에어프라이어", "믹서기", "토스터"],
    보관용기: ["밀폐용기", "유리병", "텀블러", "도시락"],
  },
  홈데코: {
    액자: ["그림액자", "사진액자", "포스터", "캔버스"],
    화병: ["꽃병", "조화", "드라이플라워", "화분"],
    시계: ["벽시계", "탁상시계", "스탠드시계"],
    장식소품: ["오브제", "캔들", "디퓨저", "방향제"],
  },
  가전: {
    계절가전: ["선풍기", "에어컨", "히터", "가습기", "제습기"],
    생활가전: ["청소기", "공기청정기", "다리미", "건조기"],
    주방가전: ["냉장고", "전자레인지", "정수기", "커피머신"],
  },
  "공구/DIY": {
    전동공구: ["드릴", "그라인더", "샌더", "전동드라이버"],
    수공구: ["드라이버", "렌치", "펜치", "망치"],
    DIY자재: ["목재", "페인트", "접착제", "나사못"],
  },
  반려동물: {
    강아지용품: ["사료", "간식", "장난감", "목줄", "하우스"],
    고양이용품: ["사료", "간식", "스크래쳐", "화장실", "캣타워"],
    용품: ["식기", "급수기", "이동장", "배변패드"],
  },
}

type OptionInput = {
  name: string
  values: string
}

type OptionCombination = {
  combination: string[]
  additionalPrice: number
  stock: number
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

  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<string | null>(null)

  const [productType, setProductType] = useState<"single" | "option">("single")

  const [optionInputs, setOptionInputs] = useState<OptionInput[]>([{ name: "", values: "" }])
  const [optionCombinations, setOptionCombinations] = useState<OptionCombination[]>([])
  const [bulkAdditionalPrice, setBulkAdditionalPrice] = useState("")
  const [bulkStock, setBulkStock] = useState("")

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
        stock: 0,
      })),
    )
  }

  const updateCombination = (index: number, field: "additionalPrice" | "stock", value: number) => {
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
        stock: stockValue,
      })),
    )
    setBulkStock("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainImage) {
      alert("메인 이미지를 업로드해주세요.")
      return
    }

    if (!selectedDetailCategory) {
      alert("카테고리를 선택해주세요.")
      return
    }

    if (!productName || !originalPrice) {
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

    // Save product logic here
    alert("상품이 등록되었습니다!")
    router.push("/seller")
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

            {/* Selected Category Path */}
            {selectedDetailCategory && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                <span className="text-sm text-text-secondary">선택된 카테고리: </span>
                <span className="text-sm font-medium">
                  {selectedMainCategory} &gt; {selectedSubCategory} &gt; {selectedDetailCategory}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 h-[400px]">
              {/* Main Categories */}
              <div className="border rounded-lg overflow-y-auto">
                {Object.keys(CATEGORIES).map((mainCat) => (
                  <button
                    key={mainCat}
                    type="button"
                    onClick={() => {
                      setSelectedMainCategory(mainCat)
                      setSelectedSubCategory(null)
                      setSelectedDetailCategory(null)
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-background-section transition-colors ${
                      selectedMainCategory === mainCat ? "bg-background-section font-medium" : ""
                    }`}
                  >
                    <span>{mainCat}</span>
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  </button>
                ))}
              </div>

              {/* Sub Categories */}
              <div className="border rounded-lg overflow-y-auto">
                {selectedMainCategory &&
                  Object.keys(CATEGORIES[selectedMainCategory as keyof typeof CATEGORIES]).map((subCat) => (
                    <button
                      key={subCat}
                      type="button"
                      onClick={() => {
                        setSelectedSubCategory(subCat)
                        setSelectedDetailCategory(null)
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-background-section transition-colors ${
                        selectedSubCategory === subCat ? "bg-background-section font-medium" : ""
                      }`}
                    >
                      <span>{subCat}</span>
                      <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    </button>
                  ))}
              </div>

              {/* Detail Categories */}
              <div className="border rounded-lg overflow-y-auto">
                {selectedMainCategory &&
                  selectedSubCategory &&
                  CATEGORIES[selectedMainCategory as keyof typeof CATEGORIES][
                    selectedSubCategory as keyof (typeof CATEGORIES)[keyof typeof CATEGORIES]
                  ].map((detailCat: string) => (
                    <button
                      key={detailCat}
                      type="button"
                      onClick={() => setSelectedDetailCategory(detailCat)}
                      className={`w-full px-4 py-3 text-left hover:bg-background-section transition-colors ${
                        selectedDetailCategory === detailCat ? "bg-primary/10 font-medium text-primary" : ""
                      }`}
                    >
                      {detailCat}
                    </button>
                  ))}
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
              <Label htmlFor="brand">브랜드</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="브랜드명을 입력하세요"
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
                                  value={combo.additionalPrice}
                                  onChange={(e) =>
                                    updateCombination(index, "additionalPrice", Number.parseInt(e.target.value) || 0)
                                  }
                                  className="w-32"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={combo.stock}
                                  onChange={(e) =>
                                    updateCombination(index, "stock", Number.parseInt(e.target.value) || 0)
                                  }
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
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              상품 등록
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
