"use client"

import { Card } from "@/components/ui/card"
import { useState } from "react"
import Image from "next/image"

interface ProductCardProps {
  id: string
  image: string
  brand: string
  name: string
  price: number
  originalPrice?: number
  discountRate?: number
  rating?: number | null
  reviewCount?: number | null
  isFreeShipping?: boolean
  shippingPrice?: number | null
}

export function ProductCard({
  id,
  image,
  brand,
  name,
  price,
  originalPrice,
  discountRate,
  rating,
  reviewCount,
  isFreeShipping = false,
  shippingPrice = 0,
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  return (
    <a href={`/store/products/${id}`} className="block">
      <Card className="group overflow-hidden border-transparent hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-background-section">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
            </div>
          )}
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col flex-grow">
          {/* Brand */}
          <div className="mb-1 text-sm font-medium text-gray-500">{brand}</div>

          {/* Product Name */}
          <h3 className="mb-2 line-clamp-2 text-base font-medium text-foreground leading-relaxed">{name}</h3>

          {/* Price */}
          <div className="mb-2 flex items-center gap-2">
            {discountRate && <span className="text-lg font-bold text-primary">{discountRate}%</span>}
            <span className="text-lg font-bold text-foreground">{price?.toLocaleString() || '0'}</span>
          </div>

          {originalPrice && (
            <div className="mb-2 text-sm text-text-secondary line-through">{originalPrice?.toLocaleString() || '0'}</div>
          )}

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-sky-400">★</span>
              <span className="font-medium text-foreground">{rating ?? 0}</span>
            </div>
            <span className="text-text-secondary">리뷰 {(reviewCount ?? 0).toLocaleString()}</span>
          </div>

          {/* Shipping Info */}
          <div className="mt-1 mt-auto">
            {isFreeShipping ? (
              <div className="inline-block rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700">
                무료배송
              </div>
            ) : (
              <span className="text-sm text-text-secondary">배송비 {(shippingPrice ?? 0).toLocaleString()}원</span>
            )}
          </div>
        </div>
      </Card>
    </a>
  )
}
