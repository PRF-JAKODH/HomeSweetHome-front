"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ProductCardProps {
  id: string
  image: string
  brand: string
  name: string
  price: number
  originalPrice?: number
  discountRate?: number
  rating: number
  reviewCount: number
  isLiked?: boolean
  isFreeShipping?: boolean
  shippingPrice?: number
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
  isLiked = false,
  isFreeShipping = false,
  shippingPrice = 0,
}: ProductCardProps) {
  return (
    <a href={`/store/products/${id}`} className="block">
      <Card className="group overflow-hidden border-transparent hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-background-section">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Discount Badge */}
          {discountRate && (
            <div className="absolute left-2 top-2 rounded bg-primary px-3 py-1.5 text-sm font-bold text-white">
              {discountRate}%
            </div>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <svg
              className={`h-4 w-4 ${isLiked ? "fill-error text-error" : "text-text-secondary"}`}
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col flex-grow">
          {/* Brand */}
          <div className="mb-1 text-xs font-medium text-text-secondary">{brand}</div>

          {/* Product Name */}
          <h3 className="mb-2 line-clamp-2 text-sm font-medium text-foreground leading-relaxed">{name}</h3>

          {/* Price */}
          <div className="mb-2 flex items-center gap-2">
            {discountRate && <span className="text-base font-bold text-primary">{discountRate}%</span>}
            <span className="text-base font-bold text-foreground">{price?.toLocaleString() || '0'}원</span>
          </div>

          {originalPrice && (
            <div className="mb-2 text-xs text-text-secondary line-through">{originalPrice?.toLocaleString() || '0'}원</div>
          )}

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-warning">★</span>
              <span className="font-medium text-foreground">{rating}</span>
            </div>
            <span className="text-text-secondary">리뷰 {reviewCount.toLocaleString()}</span>
          </div>

          {/* Shipping Info */}
          <div className="mt-1 mt-auto">
            {isFreeShipping ? (
              <div className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                무료배송
              </div>
            ) : (
              <span className="text-xs text-text-secondary">배송비 {shippingPrice.toLocaleString()}원</span>
            )}
          </div>
        </div>
      </Card>
    </a>
  )
}
