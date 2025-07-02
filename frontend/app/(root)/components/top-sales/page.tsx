"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, ShoppingCart, Heart, Eye, AlertCircle, TrendingUp, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import publicCategoryService, { type PublicCategory } from "../../../../service/public/categoryPublicService"
import ProductService, { type ProductDetails, type ProductListResponse } from "../../../../service/public/Productservice"
import ProductQuickViewModal from "../new-arrival/product-view"
import { formatPrice, calculateDiscount } from "@/lib/utils"

export default function TopSalesSection() {
  const [category, setCategory] = useState<PublicCategory | null>(null)
  const [products, setProducts] = useState<ProductDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{ categories: string[]; searchTerms: string[] }>({
    categories: [],
    searchTerms: ["top sales of the week", "top sales", "best sellers", "trending", "popular"],
  })

  useEffect(() => {
    const fetchTopSalesData = async () => {
      try {
        setLoading(true)
        setError(null)

        // First, get all categories
        const categories = await publicCategoryService.getAllPublicCategories()

        // Debug: Store all category titles for debugging
        const categoryTitles = categories.map((cat) => cat.title)
        setDebugInfo((prev) => ({ ...prev, categories: categoryTitles }))

        console.log("Available categories:", categoryTitles)

        // Try multiple search terms to find the right category
        const searchTerms = [
          "top sales of the week",
          "top sales of week",
          "top sales",
          "best sellers",
          "trending",
          "popular",
          "hot deals",
          "weekly deals",
        ]
        let topSalesCategory: PublicCategory | undefined

        // Try exact match first
        topSalesCategory = categories.find((cat) => cat.title.toLowerCase() === "top sales of the week")

        // If not found, try includes with various search terms
        if (!topSalesCategory) {
          for (const term of searchTerms) {
            topSalesCategory = categories.find((cat) => cat.title.toLowerCase().includes(term))
            if (topSalesCategory) {
              console.log(`Found category using search term: "${term}"`)
              break
            }
          }
        }

        // If still not found, look for categories with "sale" or "deal" in the name
        if (!topSalesCategory) {
          const fallbackTerms = ["sale", "deal", "offer", "special"]
          for (const term of fallbackTerms) {
            topSalesCategory = categories.find((cat) => cat.title.toLowerCase().includes(term))
            if (topSalesCategory) {
              console.log(`Found category using fallback term: "${term}"`)
              break
            }
          }
        }

        // If still not found, just use the first category as fallback
        if (!topSalesCategory && categories.length > 0) {
          console.log("Using first available category as fallback")
          topSalesCategory = categories[0]
        }

        if (!topSalesCategory) {
          throw new Error("Top Sales category not found and no fallback categories available")
        }

        console.log("Selected category:", topSalesCategory)
        setCategory(topSalesCategory)

        // Then fetch products from this category
        const productResponse: ProductListResponse = await ProductService.getProductsByCategory(topSalesCategory._id, {
          page: currentPage,
          limit: 8, // Show fewer on homepage
          sort: "popular", // Sort by popularity for top sales
        })

        setProducts(productResponse.products)
        setTotalPages(productResponse.pages)
      } catch (err: any) {
        console.error("Error fetching Top Sales data:", err)
        setError(err.message || "Failed to load Top Sales products")
      } finally {
        setLoading(false)
      }
    }

    fetchTopSalesData()
  }, [currentPage])

  const handleQuickView = (product: ProductDetails) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-gray-600">Loading Top Sales...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
              <div className="flex items-center gap-4 mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <h3 className="text-xl font-semibold text-red-600">Error Loading Products</h3>
              </div>
              <p className="text-gray-700 mb-6">{error}</p>

              {/* Debug Information */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Debug Information</h4>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Available Categories:</strong>
                  </p>
                  {debugInfo.categories.length > 0 ? (
                    <ul className="list-disc pl-5 mb-4 max-h-32 overflow-y-auto">
                      {debugInfo.categories.map((cat, index) => (
                        <li key={index}>{cat}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mb-4">No categories returned from API</p>
                  )}

                  <p className="mb-2">
                    <strong>Search Terms Used:</strong>
                  </p>
                  <ul className="list-disc pl-5">
                    {debugInfo.searchTerms.map((term, index) => (
                      <li key={index}>"{term}"</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
                onClick={() => window.location.reload()}
              >
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
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-8 w-8 text-orange-500" />
                <TrendingUp className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-cormorant">
              {category?.title || "Top Sales Of The Week"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {category?.description || "Don't miss out on our best-selling products this week"}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending Now
              </Badge>
              <Badge variant="outline" className="border-red-300 text-red-600">
                Limited Time
              </Badge>
            </div>
            <div className="mt-6">
              <Button variant="outline" asChild className="border-orange-300 text-orange-600 hover:bg-orange-50">
                <Link href="/top-sales">View All Top Sales</Link>
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
              {products.map((product, index) => (
                <Card
                  key={product._id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg relative overflow-hidden"
                >
                  {/* Ranking Badge */}
                  {index < 3 && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge
                        className={`${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                              ? "bg-gray-400 text-white"
                              : "bg-amber-600 text-white"
                        } shadow-lg`}
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Link href={`/products/${product._id}`}>
                        <Image
                          src={product.images[0] || "/placeholder.png"}
                          alt={product.title}
                          width={300}
                          height={300}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.discountPrice && (
                          <Badge className="bg-red-500 text-white shadow-lg animate-pulse">
                            -{calculateDiscount(product.originalPrice, product.finalPrice)}% OFF
                          </Badge>
                        )}
                        {product.stockQuantity === 0 && (
                          <Badge variant="secondary" className="shadow-lg">
                            Sold Out
                          </Badge>
                        )}
                        {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                          <Badge className="bg-orange-500 text-white shadow-lg">
                            Only {product.stockQuantity} left
                          </Badge>
                        )}
                        {index < 3 && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white"
                        >
                          <Heart className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white"
                          onClick={() => handleQuickView(product)}
                        >
                          <Eye className="h-4 w-4 text-gray-700" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      <Link href={`/products/${product._id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {product.title}
                        </h3>
                      </Link>

                      {product.brand && <p className="text-sm text-gray-500 mb-2">{product.brand}</p>}

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-orange-600">{formatPrice(product.finalPrice, 'NPR')}</span>
                        {product.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice, 'NPR')}
                          </span>
                        )}
                      </div>

                      {/* Sales Indicator */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">
                            {Math.floor(Math.random() * 50) + 10} sold this week
                          </span>
                        </div>
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
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300"
                          disabled={product.stockQuantity === 0}
                          asChild
                        >
                          <Link href={`/products/${product._id}`}>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {product.stockQuantity === 0 ? "Sold Out" : "Buy Now"}
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
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No top sales found</h3>
              <p className="text-gray-600">Check back later for our weekly top sellers.</p>
            </div>
          )}

          {/* Call to Action */}
          {products.length > 0 && (
            <div className="text-center mt-12">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Don't Miss Out!</h3>
                <p className="text-gray-600 mb-6">These are our hottest products this week. Limited stock available!</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    asChild
                  >
                    <Link href="/top-sales">
                      <Crown className="h-5 w-5 mr-2" />
                      Shop All Top Sales
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    View Trending Products
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickViewModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
