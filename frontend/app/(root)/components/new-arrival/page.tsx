"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, ShoppingCart, Heart, Eye, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import publicCategoryService, { type PublicCategory } from "../../../../service/public/categoryPublicService"
import ProductService, {
  type ProductDetails,
  type ProductListResponse,
} from "../../../../service/public/Productservice"
import ProductQuickViewModal from "./product-view"

export default function NewArrivalsSection() {
  const [category, setCategory] = useState<PublicCategory | null>(null)
  const [products, setProducts] = useState<ProductDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchNewArrivalsData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all categories and find New Arrivals
        const categories = await publicCategoryService.getAllPublicCategories()
        console.log(
          "Available categories:",
          categories.map((cat) => cat.title),
        )

        // Look for the exact category from your data
        let newArrivalsCategory = categories.find(
          (cat) =>
            cat.title.toLowerCase().includes("new arrrivals collections") || cat.slug === "new-arrrivals-collections",
        )

        if (!newArrivalsCategory) {
          // Fallback search terms
          const searchTerms = ["new arrivals", "arrivals", "new"]
          for (const term of searchTerms) {
            newArrivalsCategory = categories.find((cat) => cat.title.toLowerCase().includes(term))
            if (newArrivalsCategory) break
          }
        }

        if (!newArrivalsCategory && categories.length > 0) {
          newArrivalsCategory = categories[0] // Use first category as fallback
        }

        if (!newArrivalsCategory) {
          throw new Error("New Arrivals category not found")
        }

        console.log("Selected category:", newArrivalsCategory)
        setCategory(newArrivalsCategory)

        // Fetch products from this category
        const productResponse: ProductListResponse = await ProductService.getProductsByCategory(
          newArrivalsCategory._id,
          {
            page: currentPage,
            limit: 8, // Show fewer on homepage
            sort: "newest",
          },
        )

        setProducts(productResponse.products)
        setTotalPages(productResponse.pages)
      } catch (err: any) {
        console.error("Error fetching New Arrivals data:", err)
        setError(err.message || "Failed to load New Arrivals products")
      } finally {
        setLoading(false)
      }
    }

    fetchNewArrivalsData()
  }, [currentPage])

  const handleQuickView = (product: ProductDetails) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const calculateDiscount = (originalPrice: number, finalPrice: number) => {
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#6F4E37]" />
              <p className="text-gray-600">Loading New Arrivals...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Products</h3>
              <p className="text-gray-700 mb-4">{error}</p>
              <Button className="bg-[#6F4E37] hover:bg-[#5d4230]" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-cormorant">
              {category?.title || "New Arrivals Collections"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {category?.description || "Discover our latest collection of premium products"}
            </p>
            <Button variant="outline" asChild>
              <Link href="/new-arrivals">View All Products</Link>
            </Button>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={product.images[0] || "/placeholder.png"}
                        alt={product.title}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.discountPrice && (
                          <Badge className="bg-red-500 text-white">
                            -{calculateDiscount(product.originalPrice, product.finalPrice)}%
                          </Badge>
                        )}
                        {product.stockQuantity === 0 && <Badge variant="secondary">Out of Stock</Badge>}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={() => handleQuickView(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>

                      {product.brand && <p className="text-sm text-gray-500 mb-2">{product.brand}</p>}

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-[#6F4E37]">{formatPrice(product.finalPrice)}</span>
                        {product.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {product.rating && (
                            <>
                              <div className="flex text-yellow-400">
                                {"★".repeat(Math.floor(product.rating))}
                                {"☆".repeat(5 - Math.floor(product.rating))}
                              </div>
                              <span className="text-sm text-gray-500">({product.reviewsCount || 0})</span>
                            </>
                          )}
                        </div>

                        <Button
                          size="sm"
                          className="bg-[#6F4E37] hover:bg-[#5d4230] text-white"
                          disabled={product.stockQuantity === 0}
                          asChild
                        >
                          <Link href={`/products/${product._id}`}>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found in New Arrivals Collections.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickViewModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
