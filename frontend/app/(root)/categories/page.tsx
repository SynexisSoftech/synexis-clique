"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Loader2, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-rose-200 rounded-full animate-pulse" />
                <Loader2 className="h-8 w-8 text-rose-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-900">Loading Categories</h2>
                <p className="text-slate-600">Please wait while we fetch the latest categories...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-md mx-auto">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button asChild className="bg-rose-600 hover:bg-rose-700">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="text-slate-500 hover:text-rose-600 transition-colors duration-200 font-medium">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-900">Categories</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShoppingBag className="h-4 w-4" />
            Shop by Category
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Discover Our Collections
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Explore our carefully curated categories and find exactly what you're looking for
          </p>
        </div>

        {/* Categories Grid or Empty State */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Categories Available</h2>
            <p className="text-slate-600 mb-8 max-w-md">
              We're working on adding new categories. Check back soon for exciting new collections!
            </p>
            <Button asChild className="bg-rose-600 hover:bg-rose-700 px-8 py-3 text-lg">
              <Link href="/">Explore Homepage</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Card
                key={category._id}
                className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 group cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <Link href={`/categories/${category.slug}`} className="block">
                  <CardHeader className="p-0 relative">
                    <div className="overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 relative">
                      <Image
                        src={category.image || "/placeholder.svg?height=300&width=400"}
                        alt={category.title}
                        width={400}
                        height={300}
                        className="object-cover w-full aspect-[4/3] transition-all duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-bold text-xl text-white group-hover:text-rose-200 transition-colors duration-300 drop-shadow-lg">
                        {category.title}
                      </h3>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <p className="text-white/80 text-sm mt-1 drop-shadow">
                          {category.subcategories.length} subcategories
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-slate-600 line-clamp-2 leading-relaxed mb-3">{category.description}</p>

                    {/* Show subcategories preview */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.slice(0, 3).map((sub) => (
                            <span key={sub._id} className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded">
                              {sub.title}
                            </span>
                          ))}
                          {category.subcategories.length > 3 && (
                            <span className="text-xs text-slate-500">+{category.subcategories.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-rose-600 font-medium text-sm group-hover:text-rose-700 transition-colors">
                      Explore Collection
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
