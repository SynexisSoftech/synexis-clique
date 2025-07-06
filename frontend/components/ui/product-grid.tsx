"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "./product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

interface Product {
  id: string
  name: string
  description?: string
  shortDescription?: string
  price: number
  originalPrice: number
  discountPrice?: number
  images: string[]
  category: string
  brand: string
  rating?: number
  reviews?: number
  stock: number
  status: string
  colors?: string[]
  features?: string[]
  isCashOnDeliveryAvailable?: boolean
  warranty?: string
  returnPolicy?: string
  isNew?: boolean
  createdAt?: string
}

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  error?: string | null
  variant?: "default" | "compact"
  columns?: 2 | 3 | 4 | 5 | 6
  showQuickView?: boolean
  showWishlist?: boolean
  onRetry?: () => void
  emptyMessage?: string
  className?: string
}

export function ProductGrid({
  products,
  loading = false,
  error = null,
  variant = "default",
  columns = 4,
  showQuickView = true,
  showWishlist = true,
  onRetry,
  emptyMessage = "No products found",
  className = "",
}: ProductGridProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
  }

  const LoadingSkeleton = () => (
    <div className={`grid gap-4 sm:gap-6 ${gridCols[columns]}`}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3 sm:space-y-4">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Failed to load products</h3>
      <p className="text-gray-600 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No products found</h3>
      <p className="text-gray-600 max-w-md text-sm sm:text-base">{emptyMessage}</p>
    </div>
  )

  if (!mounted) {
    return <LoadingSkeleton />
  }

  if (loading) {
    return (
      <div className={`space-y-4 sm:space-y-6 ${className}`}>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorState />
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`grid-${variant}-${columns}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`grid gap-4 sm:gap-6 ${gridCols[columns]}`}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: "easeOut"
              }}
              whileHover={{ y: -2 }}
            >
              <ProductCard
                product={product}
                variant={variant}
                showQuickView={showQuickView}
                showWishlist={showWishlist}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Compact grid for mobile-first design
export function ProductGridCompact({ products, ...props }: Omit<ProductGridProps, 'columns'>) {
  return <ProductGrid products={products} columns={2} variant="compact" {...props} />
}

// Featured grid for homepage
export function ProductGridFeatured({ products, ...props }: Omit<ProductGridProps, 'columns' | 'variant'>) {
  return <ProductGrid products={products} columns={4} variant="default" {...props} />
}

// Wide grid for product listing pages
export function ProductGridWide({ products, ...props }: Omit<ProductGridProps, 'columns'>) {
  return <ProductGrid products={products} columns={5} {...props} />
} 
