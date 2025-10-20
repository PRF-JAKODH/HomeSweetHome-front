"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, ImageIcon, ChevronRight, Plus, Trash2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const categories = {
  가구: {
    침실가구: ["침대", "매트리스", "옷장", "화장대", "협탁"],
    거실가구: ["소파", "거실장", "TV장", "테이블", "책장"],
    주방가구: ["식탁", "의자", "수납장", "렌지대", "홈바"],
    서재가구: ["책상", "의자", "책장", "서랍장", "독서등"],
  },
  패브릭: {
    커튼: ["암막커튼", "쉬어커튼", "블라인드", "롤스크린"],
    침구: ["이불", "베개", "침대커버", "매트리스커버"],
    쿠션: ["방석", "쿠션커버", "바디필로우"],
    러그: ["거실러그", "침실러그", "주방매트"],
  },
  조명: {
    천장조명: ["샹들리에", "직부등", "매입등", "레일조명"],
    스탠드: ["플로어스탠드", "테이블스탠드", "독서등"],
    벽등: ["브라켓", "간접조명", "무드등"],
  },
  "수납/정리": {
    수납장: ["서랍장", "옷장", "신발장", "수납박스"],
    선반: ["벽선반", "진열장", "책장", "선반장"],
    행거: ["옷걸이", "행거대", "후크"],
  },
  생활용품: {
    욕실용품: ["수건", "욕실매트", "샤워커튼", "비누받침"],
    청소용품: ["청소기", "걸레", "빗자루", "쓰레기통"],
    세탁용품: ["빨래건조대", "세탁망", "다리미판"],
  },
  주방용품: {
    조리도구: ["냄비", "프라이팬", "칼", "도마"],
    식기: ["접시", "그릇", "컵", "수저"],
    보관용기: ["밀폐용기", "유리병", "냉장고정리"],
  },
  홈데코: {
    액자: ["그림액자", "사진액자", "포스터", "캔버스"],
    화병: ["꽃병", "화분", "조화"],
    시계: ["벽시계", "탁상시계", "스탠드시계"],
    소품: ["캔들", "디퓨저", "오브제"],
  },
  가전: {
    주방가전: ["냉장고", "전자레인지", "에어프라이어", "커피머신"],
    생활가전: ["청소기", "공기청정기", "가습기", "선풍기"],
    계절가전: ["히터", "에어컨", "전기장판"],
  },
  "공구/DIY": {
    공구: ["드릴", "드라이버", "망치", "톱"],
    페인트: ["벽지", "페인트", "붓", "롤러"],
    자재: ["목재", "철물", "접착제"],
  },
  반려동물: {
    강아지용품: ["사료", "간식", "장난감", "하우스"],
    고양이용품: ["사료", "간식", "스크래쳐", "화장실"],
    용품: ["목줄", "식기", "이동장"],
  },
}

type OptionValue = {
  name: string
  additionalPrice: number
  stock: number
}

type Option = {
  name: string
  values: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [subImages, setSubImages] = useState<string[]>([])

  const [selectedCategory1, setSelectedCategory1] = useState<string>("")
  const [selectedCategory2, setSelectedCategory2] = useState<string>("")
  const [selectedCategory3, setSelectedCategory3] = useState<string>("")

  const [productName, setProductName] = useState("")
  const [brand, setBrand] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountRate, setDiscountRate] = useState("")
  const [shippingType, setShippingType] = useState("free")
  const [shippingFee, setShippingFee] = useState("")
  const [stock, setStock] = useState("")
  const [description, setDescription] = useState("")

  const [productType, setProductType] = useState<"single" | "option">("single")
  const [optionCount, setOptionCount] = useState<number>(1)
  const [options, setOptions] = useState<Option[]>([{ name: "", values: "" }])
  const [optionCombinations, setOptionCombinations] = useState<OptionValue[]>([])
  const [bulkAdditionalPrice, setBulkAdditionalPrice] = useState("")
  const [bulkStock, setBulkStock] = useState("")

  useEffect(() => {
    setMainImage("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400")
    setSubImages([
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200",
    ])
    setSelectedCategory1("가구")
    setSelectedCategory2("거실가구")
    setSelectedCategory3("소파")
    setProductName("모던 미니멀 소파")
    setBrand("홈스윗홈")
    setOriginalPrice("450000")
    setDiscountRate("20")
    setShippingType("free")
    setStock("15")
    setDescription("편안한 착석감과 모던한 디자인이 돋보이는 소파입니다.")
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

  const calculateFinalPrice = () => {
    const price = Number.parseFloat(originalPrice) || 0
    const discount = Number.parseFloat(discountRate) || 0
    return Math.floor(price * (1 - discount / 100))
  }

  const addOption = () => {
    if (options.length < 3) {
      setOptions([...options, { name: "", values: "" }])
      setOptionCount(options.length + 1)
    }
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    setOptionCount(newOptions.length)
  }

  const updateOption = (index: number, field: "name" | "values", value: string) => {
    const newOptions = [...options]
    newOptions[index][field] = value
    setOptions(newOptions)
  }

  const generateOptionCombinations = () => {
    const validOptions = options.filter((opt) => opt.name && opt.values)

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

    const combinations: OptionValue[] = []

    const generateCombos = (current: string[], depth: number) => {
      if (depth === optionArrays.length) {
        combinations.push({
          name: current.join(" / "),
          additionalPrice: 0,
          stock: 0,
        })
        return
      }

      for (const value of optionArrays[depth].values) {
        generateCombos([...current, value], depth + 1)
      }
    }

    generateCombos([], 0)
    setOptionCombinations(combinations)
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainImage) {
      alert("메인 이미지를 업로드해주세요.")
      return
    }

    if (!selectedCategory1 || !selectedCategory2 || !selectedCategory3) {
      alert("카테고리를 모두 선택해주세요.")
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

    alert("상품이 수정되었습니다!")
    router.push("/seller")
  }

  const getCategory2Options = () => {
    if (!selectedCategory1) return []
    return Object.keys(categories[selectedCategory1 as keyof typeof categories] || {})
  }

  const getCategory3Options = () => {
    if (!selectedCategory1 || !selectedCategory2) return []
    const cat1 = categories[selectedCategory1 as keyof typeof categories]
    if (!cat1) return []
    return cat1[selectedCategory2 as keyof typeof cat1] || []
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <h1 className="text-3xl font-bold mb-8">상품 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">
              카테고리 선택 <span className="text-red-500">*</span>
            </Label>

            {selectedCategory1 && selectedCategory2 && selectedCategory3 && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2 text-sm">
                <span className="font-medium">{selectedCategory1}</span>
                <ChevronRight className="w-4 h-4 text-text-tertiary" />
                <span className="font-medium">{selectedCategory2}</span>
                <ChevronRight className="w-4 h-4 text-text-tertiary" />
                <span className="font-medium text-primary">{selectedCategory3}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-background-section p-2 border-b">
                  <span className="text-sm font-medium">대분류</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {Object.keys(categories).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory1(cat)
                        setSelectedCategory2("")
                        setSelectedCategory3("")
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-background-section transition-colors flex items-center justify-between ${
                        selectedCategory1 === cat ? "bg-primary/10 text-primary font-medium" : ""
                      }`}
                    >
                      {cat}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-background-section p-2 border-b">
                  <span className="text-sm font-medium">중분류</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {selectedCategory1 ? (
                    getCategory2Options().map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory2(cat)
                          setSelectedCategory3("")
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-background-section transition-colors flex items-center justify-between ${
                          selectedCategory2 === cat ? "bg-primary/10 text-primary font-medium" : ""
                        }`}
                      >
                        {cat}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-text-tertiary">대분류를 선택하세요</div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-background-section p-2 border-b">
                  <span className="text-sm font-medium">소분류</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {selectedCategory2 ? (
                    getCategory3Options().map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory3(cat)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-background-section transition-colors ${
                          selectedCategory3 === cat ? "bg-primary/10 text-primary font-medium" : ""
                        }`}
                      >
                        {cat}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-text-tertiary">중분류를 선택하세요</div>
                  )}
                </div>
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

            <div>
              <Label className="text-base font-semibold mb-3 block">
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
                <div>
                  <Label className="text-base font-semibold mb-3 block">옵션 설정</Label>
                  <div className="flex items-center gap-4 mb-4">
                    <Select
                      value={optionCount.toString()}
                      onValueChange={(value) => {
                        const count = Number.parseInt(value)
                        setOptionCount(count)
                        if (count > options.length) {
                          setOptions([...options, ...Array(count - options.length).fill({ name: "", values: "" })])
                        } else {
                          setOptions(options.slice(0, count))
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="옵션 개수" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1개</SelectItem>
                        <SelectItem value="2">2개</SelectItem>
                        <SelectItem value="3">3개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm mb-1 block">옵션명</Label>
                            <Input
                              value={option.name}
                              onChange={(e) => updateOption(index, "name", e.target.value)}
                              placeholder="예: 색상"
                            />
                          </div>
                          <div>
                            <Label className="text-sm mb-1 block">옵션값 (쉼표로 구분)</Label>
                            <Input
                              value={option.values}
                              onChange={(e) => updateOption(index, "values", e.target.value)}
                              placeholder="예: 블랙,화이트,블루"
                            />
                          </div>
                        </div>
                        {options.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                            className="mt-6"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {index === options.length - 1 && options.length < 3 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addOption}
                            className="mt-6 bg-transparent"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={generateOptionCombinations}
                    className="w-full mt-4 bg-primary hover:bg-primary/90"
                  >
                    옵션목록으로 적용
                  </Button>
                </div>

                {optionCombinations.length > 0 && (
                  <div className="border rounded-lg p-4">
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

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
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
                                <Input
                                  type="number"
                                  value={combo.stock}
                                  onChange={(e) => updateCombination(index, "stock", e.target.value)}
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
