"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageOff, Sparkles, Zap } from "lucide-react"

interface ProductImageProps {
  src: string | string[]
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  showBadges?: boolean
  discountPercentage?: number
  isNew?: boolean
  isOutOfStock?: boolean
  isFeatured?: boolean
  aspectRatio?: "square" | "video" | "auto"
  hoverEffect?: boolean
  onClick?: () => void
}

export function ProductImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = "",
  priority = false,
  sizes = "400px",
  showBadges = true,
  discountPercentage = 0,
  isNew = false,
  isOutOfStock = false,
  isFeatured = false,
  aspectRatio = "square",
  hoverEffect = true,
  onClick,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Handle multiple images
  const images = Array.isArray(src) ? src : [src]
  const currentImage = images[currentImageIndex] || "/placeholder.jpg"
  
  // Fallback to placeholder if no valid image
  const imageSrc = currentImage && currentImage !== "" ? currentImage : "/placeholder.jpg"

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-[3/2]"
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleNextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const handlePrevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image Container */}
      <div 
        className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg ${aspectRatioClasses[aspectRatio]} ${
          hoverEffect ? 'transition-all duration-300 hover:scale-105' : ''
        }`}
        onClick={onClick}
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Skeleton className="w-full h-full" />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageOff className="h-12 w-12 mb-2" />
            <p className="text-sm">Image not available</p>
          </div>
        )}

        {/* Actual Image */}
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`object-cover w-full h-full transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          sizes={sizes}
          priority={priority}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Image Navigation (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrevImage()
              }}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              ←
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNextImage()
              }}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              →
            </button>
          </div>
        )}

        {/* Image Counter (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Badges */}
      {showBadges && (
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium px-2 py-1 text-xs shadow-lg">
              {discountPercentage}% OFF
            </Badge>
          )}

          {/* New Badge */}
          {isNew && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-2 py-1 text-xs shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" />
              NEW
            </Badge>
          )}

          {/* Featured Badge */}
          {isFeatured && (
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-2 py-1 text-xs shadow-lg">
              <Zap className="h-3 w-3 mr-1" />
              FEATURED
            </Badge>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <Badge className="bg-gray-500 text-white font-medium px-2 py-1 text-xs shadow-lg">
              OUT OF STOCK
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for product cards
export function ProductImageCompact({
  src,
  alt,
  className = "",
  discountPercentage = 0,
  isNew = false,
  isOutOfStock = false,
  onClick,
}: Omit<ProductImageProps, 'width' | 'height' | 'sizes' | 'priority' | 'showBadges' | 'aspectRatio' | 'hoverEffect'>) {
  return (
    <ProductImage
      src={src}
      alt={alt}
      width={300}
      height={200}
      className={className}
      sizes="300px"
      priority={false}
      showBadges={true}
      discountPercentage={discountPercentage}
      isNew={isNew}
      isOutOfStock={isOutOfStock}
      aspectRatio="auto"
      hoverEffect={true}
      onClick={onClick}
    />
  )
}

// Hero version for product details
export function ProductImageHero({
  src,
  alt,
  className = "",
  discountPercentage = 0,
  isNew = false,
  isOutOfStock = false,
  onClick,
}: Omit<ProductImageProps, 'width' | 'height' | 'sizes' | 'priority' | 'showBadges' | 'aspectRatio' | 'hoverEffect'>) {
  return (
    <ProductImage
      src={src}
      alt={alt}
      width={600}
      height={600}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
      priority={true}
      showBadges={true}
      discountPercentage={discountPercentage}
      isNew={isNew}
      isOutOfStock={isOutOfStock}
      aspectRatio="square"
      hoverEffect={false}
      onClick={onClick}
    />
  )
} 
