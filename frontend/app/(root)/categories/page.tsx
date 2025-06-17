"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Loader2, ShoppingBag, Grid3X3, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"
import publicCategoryService, { type PublicCategory } from "@/service/public/categoryPublicService"
import publicSubcategoryService, { type PublicSubcategory } from "@/service/public/publicSubcategoryService"

interface CategoryWithSubcategories extends PublicCategory {
  subcategories?: PublicSubcategory[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const fetchCategoriesWithSubcategories = async () => {
      try {
        setLoading(true)
        const fetchedCategories = await publicCategoryService.getAllPublicCategories()

        // Fetch subcategories for each category
        const categoriesWithSubcategories = await Promise.all(
          fetchedCategories.map(async (category) => {
            try {
              const subcategories = await publicSubcategoryService.getPublicSubcategories({
                categorySlug: category.slug,
              })
              return { ...category, subcategories }
            } catch (err) {
              console.warn(`Failed to fetch subcategories for ${category.title}:`, err)
              return { ...category, subcategories: [] }
            }
          }),
        )

        setCategories(categoriesWithSubcategories)
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories")
      } finally {
        setLoading(false)
      }
    }

    fetchCategoriesWithSubcategories()
  }, [])

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
                <h2 className="text-2xl font-bold text-slate-900">Loading Categories</h2>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-8 w-8 text-red-600" />
              </div>
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                <AlertDescription className="text-red-800">
                  <strong>Oops!</strong> {error}
                </AlertDescription>
              </Alert>
              <div className="mt-8 space-y-4">
                <Button
                  asChild
                  className="bg-amber-800 hover:bg-amber-900 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105"
                >
                  <Link href="/">Return Home</Link>
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

      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-8 lg:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 mb-6 sm:mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-slate-500 hover:text-amber-800 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
          <span className="font-semibold text-slate-900 text-sm sm:text-base">Categories</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4 sm:mb-6">
            <ShoppingBag className="h-4 w-4" />
            Shop by Category
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 bg-clip-text text-transparent leading-tight">
            Discover Our Collections
          </h1>
          <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-4">
            Explore our carefully curated categories and find exactly what you're looking for
          </p>
        </div>

        {/* View Toggle and Stats */}
        {categories.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-4">
              <p className="text-slate-600 text-sm sm:text-base">
                <span className="font-semibold text-slate-900">{categories.length}</span> categories available
              </p>
              <div className="hidden sm:block w-px h-4 bg-slate-300" />
              <p className="text-slate-500 text-sm hidden sm:block">
                {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)} subcategories
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-amber-800 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-amber-800 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">List</span>
              </Button>
            </div>
          </div>
        )}

        {/* Categories Grid or Empty State */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6 sm:mb-8">
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
              No Categories Available
            </h2>
            <p className="text-slate-600 mb-6 sm:mb-8 max-w-md text-sm sm:text-base leading-relaxed px-4">
              We're working on adding exciting new categories. Check back soon for amazing collections!
            </p>
            <Button
              asChild
              className="bg-amber-800 hover:bg-amber-900 text-white px-6 sm:px-8 py-3 text-base sm:text-lg rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Link href="/">Explore Homepage</Link>
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8"
                : "space-y-4 sm:space-y-6"
            }
          >
            {categories.map((category) => (
              <Card
                key={category._id}
                className={`overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 group cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white hover:-translate-y-1 ${
                  viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                }`}
              >
                <Link href={`/categories/${category.slug}`} className="block h-full">
                  <div className={viewMode === "list" ? "flex flex-col sm:flex-row h-full" : ""}>
                    <CardHeader className={`p-0 relative ${viewMode === "list" ? "sm:w-80 sm:flex-shrink-0" : ""}`}>
                      <div className="overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 relative">
                        <Image
                          src={category.image || "/placeholder.svg?height=300&width=400"}
                          alt={category.title}
                          width={400}
                          height={300}
                          className={`object-cover w-full transition-all duration-500 group-hover:scale-110 ${
                            viewMode === "list" ? "aspect-[16/10] sm:aspect-[4/3]" : "aspect-[4/3]"
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                      </div>
                      <div
                        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 ${viewMode === "list" ? "sm:hidden" : ""}`}
                      >
                        <h3 className="font-bold text-lg sm:text-xl text-white group-hover:text-amber-200 transition-colors duration-300 drop-shadow-lg">
                          {category.title}
                        </h3>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <p className="text-white/80 text-xs sm:text-sm mt-1 drop-shadow">
                            {category.subcategories.length} subcategories
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent
                      className={`p-4 sm:p-6 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}
                    >
                      {viewMode === "list" && (
                        <div className="mb-4 sm:mb-0 hidden sm:block">
                          <h3 className="font-bold text-xl lg:text-2xl text-slate-900 mb-2 group-hover:text-amber-700 transition-colors duration-300">
                            {category.title}
                          </h3>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <p className="text-slate-500 text-sm mb-3">
                              {category.subcategories.length} subcategories available
                            </p>
                          )}
                        </div>
                      )}

                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                          {category.description}
                        </p>

                        {/* Show subcategories preview */}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="mb-3 sm:mb-4">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {category.subcategories.slice(0, viewMode === "list" ? 5 : 3).map((sub) => (
                                <Badge
                                  key={sub._id}
                                  variant="secondary"
                                  className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-2 py-1 rounded-full border-0"
                                >
                                  {sub.title}
                                </Badge>
                              ))}
                              {category.subcategories.length > (viewMode === "list" ? 5 : 3) && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-slate-500 border-slate-200 px-2 py-1 rounded-full"
                                >
                                  +{category.subcategories.length - (viewMode === "list" ? 5 : 3)} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-800 font-medium text-sm sm:text-base group-hover:text-amber-800 transition-colors">
                          Explore Collection
                          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                        {viewMode === "list" && category.subcategories && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{category.subcategories.length} items</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action Section */}
        {categories.length > 0 && (
          <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-amber-100">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
                Browse our complete product catalog or get in touch with our team for personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Button
                  asChild
                  className="bg-amber-800 hover:bg-amber-900 text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  <Link href="/products">Browse All Products</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-200 text-amber-800 hover:bg-amber-50 px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
