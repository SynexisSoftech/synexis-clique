"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Grid3X3, Loader2, ServerCrash, ShoppingBag, ArrowRight, Star, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Navbar from "../../components/navbar/navbar"
import Footer from "../../components/footer/footer"
import publicCategoryService, { type PublicCategory } from "@/service/public/categoryPublicService"
import publicSubcategoryService, { type PublicSubcategory } from "@/service/public/publicSubcategoryService"
import ProductService, { type ProductDetails } from "@/service/public/Productservice"

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap the params Promise
  const resolvedParams = use(params)

  const [viewMode, setViewMode] = useState("grid")
  const [sortOption, setSortOption] = useState("featured")
  const [category, setCategory] = useState<PublicCategory | null>(null)
  const [subcategories, setSubcategories] = useState<PublicSubcategory[]>([])
  const [products, setProducts] = useState<ProductDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to calculate final price
  const getFinalPrice = (product: ProductDetails) => {
    return product.discountPrice || product.originalPrice || 0
  }

  // Helper function to calculate discount percentage
  const getDiscountPercentage = (product: ProductDetails) => {
    if (product.discountPrice && product.originalPrice) {
      return Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    }
    return 0
  }

  useEffect(() => {
    if (!resolvedParams.slug) return

    const fetchCategoryData = async () => {
      try {
        setLoading(true)

        // Fetch category details
        const fetchedCategory = await publicCategoryService.getPublicCategoryBySlug(resolvedParams.slug)
        setCategory(fetchedCategory)

        // Fetch subcategories for this category
        const fetchedSubcategories = await publicSubcategoryService.getPublicSubcategories({
          categorySlug: resolvedParams.slug,
        })
        setSubcategories(fetchedSubcategories)

        // Fetch products for this category
        setProductsLoading(true)
        try {
          const productsResponse = await ProductService.getProductsByCategory(fetchedCategory._id, {
            limit: 12,
            sort: sortOption as any,
          })
          setProducts(productsResponse.products)
        } catch (productError) {
          console.warn("Failed to fetch products:", productError)
          setProducts([])
        } finally {
          setProductsLoading(false)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load category details.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [resolvedParams.slug, sortOption])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-amber-100 rounded-full animate-pulse" />
                <div className="w-16 h-16 border-4 border-amber-200 rounded-full animate-pulse absolute top-2 left-2" />
                <Loader2 className="h-8 w-8 text-amber-700 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-slate-900">Loading Category</h2>
                <p className="text-slate-600 max-w-sm">Discovering amazing collections for you...</p>
                <div className="flex gap-2 justify-center">
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ServerCrash className="h-8 w-8 text-red-600" />
              </div>
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                <AlertTitle className="text-red-800 font-semibold">Something went wrong</AlertTitle>
                <AlertDescription className="text-red-700">
                  {error || "Could not find the requested category."}
                </AlertDescription>
              </Alert>
              <div className="mt-8 space-y-4">
                <Button
                  asChild
                  className="bg-amber-800 hover:bg-amber-900 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105"
                >
                  <Link href="/categories">Browse All Categories</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-amber-200 text-amber-800 hover:bg-amber-50 px-6 py-2 rounded-full"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <Navbar />

      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        {/* Enhanced Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 mb-6 sm:mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-slate-500 hover:text-amber-800 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
          <Link
            href="/categories"
            className="text-slate-500 hover:text-amber-800 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Categories
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
          <span className="font-semibold text-slate-900 text-sm sm:text-base">{category.title}</span>
        </nav>

        {/* Enhanced Hero Section */}
        <div className="relative mb-8 sm:mb-12 lg:mb-16">
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
            <Image
              src={category.image || "/placeholder.svg?height=500&width=1200"}
              alt={category.title}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          <div className="absolute inset-0 flex items-center">
            <div className="container px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm">
                  <ShoppingBag className="h-4 w-4" />
                  Category Collection
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                  {category.title}
                </h1>

                <p className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 drop-shadow">
                  {category.description}
                </p>

                {category.tags && category.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {category.tags.slice(0, 4).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors backdrop-blur-sm px-3 py-1 text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {category.tags.length > 4 && (
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm"
                      >
                        +{category.tags.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    asChild
                    className="bg-amber-800 hover:bg-amber-900 text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Link href="#subcategories">
                      Explore Collection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  {subcategories.length > 0 && (
                 <Button
  variant="outline"
  asChild
  className="border-white/30 text-black hover:bg-white/10 px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 backdrop-blur-sm"
>
  <Link href="#subcategories">View {subcategories.length} Subcategories</Link>
</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Subcategories Section */}
        {subcategories.length > 0 && (
          <div id="subcategories" className="mb-12 sm:mb-16 lg:mb-20">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Grid3X3 className="h-4 w-4" />
                Subcategories
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Browse Our Collections</h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Discover specialized categories within {category.title} to find exactly what you're looking for
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {subcategories.map((subcategory, index) => (
                <Card
                  key={subcategory._id}
                  className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 group cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link href={`/categories/${category.slug}/${subcategory.slug}`} className="block h-full">
                    <CardHeader className="p-0 relative">
                      <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                        <Image
                          src={subcategory.image || "/placeholder.svg?height=200&width=300"}
                          alt={subcategory.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                        {/* Floating Action Button */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                        <h3 className="font-bold text-lg sm:text-xl text-white group-hover:text-amber-200 transition-colors duration-300 drop-shadow-lg mb-1">
                          {subcategory.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                          <Star className="h-3 w-3 fill-current" />
                          <span>Premium Collection</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                      <p className="text-slate-600 line-clamp-2 leading-relaxed mb-4 text-sm sm:text-base">
                        {subcategory.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-800 font-medium text-sm sm:text-base group-hover:text-amber-900 transition-colors">
                          Explore Now
                          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>

                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-0 text-xs px-2 py-1">
                          New
                        </Badge>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

       
          </div>
        )}

        {/* Empty State for No Subcategories */}
        {subcategories.length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
              No Subcategories Available
            </h3>
            <p className="text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
              We're working on adding exciting subcategories to the {category.title} collection. Check back soon!
            </p>
            <Button
              asChild
              className="bg-amber-800 hover:bg-amber-900 text-white px-6 sm:px-8 py-3 text-base sm:text-lg rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Link href="/categories">Explore Other Categories</Link>
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
