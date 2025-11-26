"use client"

import Image from "next/image"

type HeroVariant = "default" | "search" | "unified-search"

interface HeroContent {
  image: string
  title: string
  description: string
}

const CATEGORY_HERO_CONTENT: Record<string, HeroContent> = {
  전체: {
    image: "/modern-home.avif",
    title: "SEARCH",
    description: "감각적인 가구로 익숙한 공간을 새롭게 인테리어 하는 홈스윗홈이 추천하는 다양한 아이템을 만나보세요.",
  },
  가구: {
    image: "/modern-bedroom.png",
    title: "FURNITURE",
    description: "침대부터 소파까지 공간을 완성하는 가구를 만나보세요.",
  },
  패브릭: {
    image: "/modern-febric.jpg",
    title: "FABRIC",
    description: "부드러운 촉감과 따뜻한 색감으로 공간의 분위기를 자연스럽게 바꿔보세요.",
  },
  조명: {
    image: "/modern-lamp.jpg",
    title: "LIGHTING",
    description: "따뜻한 분위기를 만들어주는 감각적인 디자인의 조명을 만나보세요.",
  },
  수납: {
    image: "/modern-storage.jpg",
    title: "STORAGE",
    description: "수납은 기능을 넘어 하나의 디자인 요소가 됩니다.",
  },
}

const SEARCH_HERO_CONTENT: HeroContent = {
  image: "/minimal-chat.jpg",
  title: "익숙한 일상을 새롭게",
  description:
    "홈스윗홈은 가구를 단순한 물건이 아니라, 일상을 새롭게 만드는 경험으로 봅니다. \n 감각적인 디자인과 실용적인 기능을 함께 담아, \n 익숙한 공간에서도 늘 새로운 느낌을 제공합니다.",
}

const UNIFIED_SEARCH_HERO_CONTENT: HeroContent = {
  image: "/minimal-chat.jpg",
  title: "한 번의 검색으로 우리 집 라이프를",
  description:
    "통합 검색으로 스토어 상품, 쇼핑수다, 오늘의채팅방까지 한 눈에 둘러보세요. \n 떠오르는 키워드 하나면, 필요한 아이템과 이야깃거리, 대화 상대까지 모두 연결됩니다.",
}

export function getCategoryHeroContent(categoryName?: string, variant: HeroVariant = "default") {
  if (variant === "search") {
    return SEARCH_HERO_CONTENT
  }
  if (variant === "unified-search") {
    return UNIFIED_SEARCH_HERO_CONTENT
  }
  if (!categoryName) return undefined
  return CATEGORY_HERO_CONTENT[categoryName]
}

interface CategoryHeroProps {
  categoryName?: string
  variant?: HeroVariant
}

export function CategoryHero({ categoryName, variant = "default" }: CategoryHeroProps) {
  const content = getCategoryHeroContent(categoryName, variant)
  if (!content) return null

  const descriptionLines = content.description.split("\n").filter(Boolean)

  return (
    <section className="group mb-10 flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/5 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.25)] md:flex-row md:items-center md:gap-10">
      <div className="flex-1 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {variant === "search"
            ? "Homesweethome Philosophy"
            : variant === "unified-search"
            ? "Homesweethome Unified Search"
            : "Homesweethome Picks"}
        </p>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{content.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {descriptionLines.length > 1
            ? descriptionLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))
            : content.description}
        </p>
      </div>
      <div className="relative h-48 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 md:h-56 md:w-72 lg:w-80">
        <Image
          src={content.image}
          alt={`${content.title} 대표 이미지`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 20rem, (min-width: 768px) 18rem, 100vw"
          priority
        />
      </div>
    </section>
  )
}

