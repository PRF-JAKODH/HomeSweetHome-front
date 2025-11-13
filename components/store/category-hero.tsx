"use client"

import Image from "next/image"

type CategoryHeroContent = {
  image: string
  title?: string
  description?: string
}

const CATEGORY_HERO_CONTENT: Record<string, CategoryHeroContent> = {
  전체: {
    image: "/modern-home.avif",
    title: "전체",
    description: "감각적인 가구로 익숙한 공간을 새롭게 인테리어 하는 홈스윗홈이 추천하는 다양한 아이템을 만나보세요.",
  },
  가구: {
    image: "/modern-bedroom.png",
    title: "가구",
    description: "침대부터 소파까지 공간을 완성하는 가구를 만나보세요.",
  },
  패브릭: {
    image: "/modern-febric.jpg",
    title: "패브릭",
    description: "부드러운 촉감과 따뜻한 색감으로 공간의 분위기를 자연스럽게 바꿔보세요.",
  },
  조명: {
    image: "/modern-lamp.jpg",
    title: "조명",
    description: "따뜻한 분위기를 만들어주는 감각적인 디자인의 조명을 만나보세요.",
  },
  수납: {
    image: "/modern-storage.jpg",
    title: "수납",
    description: "수납은 기능을 넘어 하나의 디자인 요소가 됩니다.",
  }
}

export function getCategoryHeroContent(categoryName?: string) {
  if (!categoryName) return undefined
  return CATEGORY_HERO_CONTENT[categoryName]
}

interface CategoryHeroProps {
  categoryName?: string
}

export function CategoryHero({ categoryName }: CategoryHeroProps) {
  const content = getCategoryHeroContent(categoryName)
  if (!content) return null

  return (
    <div className="mb-8 flex items-center gap-6 rounded-3xl bg-gray-50 px-6 py-6">
      <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-white shadow-inner">
        <Image
          src={content.image}
          alt={`${content.title ?? categoryName} 대표 이미지`}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">카테고리</span>
        <h1 className="text-3xl font-bold text-gray-900">{content.title ?? categoryName}</h1>
        {content.description && <p className="mt-2 text-sm text-gray-600">{content.description}</p>}
      </div>
    </div>
  )
}

