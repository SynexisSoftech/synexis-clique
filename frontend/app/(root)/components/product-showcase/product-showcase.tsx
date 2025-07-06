"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react"
import ProductService, { type ProductDetails } from "../../../../service/public/Productservice"
import { ProductCard } from "@/components/ui/product-card"
import { ProductGridFeatured } from "@/components/ui/product-grid"

// Helper function to map API product to UI product format
const mapApiProductToUiProduct = (product: ProductDetails) => {
  const finalPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.originalPrice
  const discountPercentage =
    product.discountPrice && product.discountPrice > 0
      ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
      : 0

  return {
    id: product._id,
    name: product.title,
    description: product.description,
    shortDescription: product.shortDescription,
    price: finalPrice,
    originalPrice: product.originalPrice,
    discountPrice: product.discountPrice || 0,
    images: product.images && product.images.length > 0 ? product.images : ["/placeholder.jpg"],
    category: typeof product.categoryId === "object" ? product.categoryId.title : "Unknown",
    brand: product.brand || "Unknown",
    rating: product.rating || 0,
    reviews: product.reviewsCount || 0,
    stock: product.stockQuantity,
    stockQuantity: product.stockQuantity,
    status: product.status,
    colors: product.colors || [],
    features: product.features || [],
    isCashOnDeliveryAvailable: product.isCashOnDeliveryAvailable,
    isNew: new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
    createdAt: product.createdAt,
  }
}

export function ProductShowcase() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fisher-Yates shuffle algorithm for randomization
  const shuffleArray = useCallback((array: any[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }, [])

  // Fetch featured products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ProductService.getAllProducts({
        limit: 12, // Show 12 featured products
        sort: "newest",
      })

      // Map API products to UI format and randomize
      const mappedProducts = response.products.map(mapApiProductToUiProduct)
      const randomizedProducts = shuffleArray(mappedProducts)
      setProducts(randomizedProducts)
    } catch (err: any) {
      setError(err.message || "Failed to load featured products")
    } finally {
      setLoading(false)
    }
  }, [shuffleArray])

  // Initial load
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50/30 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Badge */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Trending Now
            </Badge>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-amber-900 mb-4 sm:mb-6 leading-tight">
            Featured{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Products
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-amber-800 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4">
            Discover our handpicked collection of premium products that our customers love. 
            Each item is carefully selected for quality, style, and value.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12 sm:mb-16 max-w-full"
        >
          <ProductGridFeatured
            products={products}
            loading={loading}
            error={error}
            onRetry={fetchProducts}
            showQuickView={true}
            showWishlist={true}
            emptyMessage="No featured products available at the moment. Check back soon!"
          />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-white">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
                Ready to Explore More?
              </h3>
              <p className="text-amber-100 mb-6 sm:mb-8 text-base sm:text-lg">
                Browse our complete collection of premium products and find exactly what you're looking for.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-amber-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
                >
                  <Link href="/products" className="flex items-center gap-2">
                    View All Products
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-amber-600 font-semibold px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
                >
                  <Link href="/categories" className="flex items-center gap-2">
                    Browse Categories
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
