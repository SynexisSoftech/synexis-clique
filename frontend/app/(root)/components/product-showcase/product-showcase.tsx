"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "../../../../components/AddToCartButton"
import ProductService, { type ProductDetails } from "../../../../service/public/Productservice"

export function ProductShowcase() {
  const [products, setProducts] = useState<ProductDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fisher-Yates shuffle algorithm for randomization
  const shuffleArray = useCallback((array: ProductDetails[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }, [])

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ProductService.getAllProducts({
        limit: 50, // Fetch more products for better variety
        sort: "newest",
      })

      // Randomize products for different users
      const randomizedProducts = shuffleArray(response.products)
      setProducts(randomizedProducts)
    } catch (err: any) {
      setError(err.message || "Failed to load products")
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }, [shuffleArray])

  // Initial load
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Scroll controls
  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current: container } = scrollContainerRef
      const scrollAmount = container.clientWidth * 0.75

      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }, [])

  // Format price in simple Rs format with proper error handling
  const formatPrice = useCallback((price: number | null | undefined) => {
    // Handle invalid or missing price values
    if (price == null || isNaN(price) || price < 0) {
      return "Price not available"
    }

    // Convert to whole number and add commas for thousands
    const formattedNumber = Math.round(price).toLocaleString("en-IN")
    return `Rs${formattedNumber}`
  }, [])

  // Calculate discount percentage
  const getDiscountPercentage = useCallback((original: number, discounted?: number) => {
    if (!discounted || discounted >= original) return null
    return Math.round(((original - discounted) / original) * 100)
  }, [])

  // Memoized loading skeleton
  const LoadingSkeleton = useMemo(
    () => (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="w-[280px] flex-shrink-0 animate-pulse">
            <div className="bg-gray-200 rounded-lg aspect-square mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    ),
    [],
  )

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={fetchProducts}
          variant="outline"
          className="text-brand-primary border-brand-primary hover:bg-brand-secondary hover:text-white"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <section className="w-full py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked collection of premium products that our customers love
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={loading}
              aria-label="Scroll left"
              className="text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={loading}
              aria-label="Scroll right"
              className="text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Container */}
        <div className="relative">
          {loading ? (
            LoadingSkeleton
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide"
            >
              {products.map((product) => (
                <div key={product._id} className="w-[280px] flex-shrink-0 snap-start flex flex-col">
                  <Card className="h-full border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col">
                    {/* Product Image */}
                    <Link href={`/products/${product._id}`}>
                      <div className="relative w-full aspect-square overflow-hidden">
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="280px"
                          loading="lazy"
                        />

                        {/* Discount Badge */}
                        {product.discountPrice &&
                          getDiscountPercentage(product.originalPrice, product.discountPrice) && (
                            <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white">
                              {getDiscountPercentage(product.originalPrice, product.discountPrice)}% OFF
                            </Badge>
                          )}

                        {/* Out of Stock Badge */}
                        {product.stockQuantity === 0 && (
                          <Badge className="absolute top-2 left-2 bg-gray-500 text-white">Out of Stock</Badge>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <Link href={`/products/${product._id}`}>
                        <h3 className="font-semibold text-base mb-1 line-clamp-1 hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.shortDescription || product.description.substring(0, 80) + "..."}
                        </p>
                      </Link>
                      {/* Brand */}
                      {product.brand && <p className="text-xs text-muted-foreground mb-2">Brand: {product.brand}</p>}

                      {/* Price */}
                      <div className="flex items-baseline mb-4">
                        {product.discountPrice && product.discountPrice > 0 ? (
                          <>
                            <span className="text-lg font-bold text-primary">{formatPrice(product.discountPrice)}</span>
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              {formatPrice(product.originalPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center mb-3">
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating!) ? "★" : "☆"}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">({product.reviewsCount || 0})</span>
                        </div>
                      )}

                      {/* Add to Cart Button and Stock (pushed to bottom) */}
                      <div className="mt-auto">
                        <AddToCartButton
                          productId={product._id}
                          size="sm"
                          className="w-full bg-brand-primary hover:bg-brand-secondary text-white"
                          variant={product.stockQuantity === 0 ? "outline" : "default"}
                        />

                        {/* Stock Info */}
                        {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                          <p className="text-xs text-orange-600 mt-2 text-center">
                            Only {product.stockQuantity} left in stock!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* End spacer */}
              <div className="min-w-[20px] flex-shrink-0" />
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-12">
          <Button asChild className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 text-lg font-semibold">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}