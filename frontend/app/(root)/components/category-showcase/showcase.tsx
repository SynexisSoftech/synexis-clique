"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useMemo, useCallback } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import publicCategoryService, { type PublicCategory } from "../../../../service/public/categoryPublicService"
import ProductService from "../../../../service/public/Productservice"

interface CategoryWithCount extends PublicCategory {
  count: number
  color: string
}

const GRADIENT_COLORS = [
  "from-blue-500 to-cyan-400",
  "from-amber-500 to-yellow-400",
  "from-rose-500 to-pink-400",
  "from-purple-500 to-indigo-400",
  "from-green-500 to-emerald-400",
  "from-orange-500 to-red-400",
]

export function CategoryShowcase() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized color assignment function
  const assignColors = useCallback((categories: PublicCategory[]): CategoryWithCount[] => {
    return categories.map((cat, index) => ({
      ...cat,
      count: 0, // Will be updated with real counts
      color: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
    }))
  }, [])

  // Fetch product count for a specific category
  const fetchCategoryProductCount = useCallback(async (categoryId: string): Promise<number> => {
    try {
      const response = await ProductService.getProductsByCategory(categoryId, { limit: 1 })
      return response.count || 0
    } catch (error) {
      console.warn(`Failed to fetch product count for category ${categoryId}:`, error)
      return 0
    }
  }, [])

  // Main data fetching function
  const fetchCategoriesWithCounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch categories first
      const fetchedCategories = await publicCategoryService.getAllPublicCategories()

      if (fetchedCategories.length === 0) {
        setCategories([])
        return
      }

      // Assign colors and set initial state
      const categoriesWithColors = assignColors(fetchedCategories)
      setCategories(categoriesWithColors)

      // Fetch product counts in parallel for better performance
      const countPromises = fetchedCategories.map(async (category) => {
        const count = await fetchCategoryProductCount(category._id)
        return { categoryId: category._id, count }
      })

      const counts = await Promise.allSettled(countPromises)

      // Update categories with real product counts
      setCategories((prev) =>
        prev.map((category) => {
          const countResult = counts.find(
            (result, index) => result.status === "fulfilled" && fetchedCategories[index]._id === category._id,
          )

          const count = countResult && countResult.status === "fulfilled" ? countResult.value.count : 0

          return { ...category, count }
        }),
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred."
      setError(errorMessage)
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }, [assignColors, fetchCategoryProductCount])

  useEffect(() => {
    fetchCategoriesWithCounts()
  }, [fetchCategoriesWithCounts])

  // Memoized loading skeleton
  const LoadingSkeleton = useMemo(
    () => (
      <section className="w-full py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg">
                <CardContent className="p-0">
                  <Skeleton className="w-full aspect-[3/2]" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    ),
    [],
  )

  // Error state
  if (error) {
    return (
      <section className="w-full py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Categories</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={fetchCategoriesWithCounts}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Loading state
  if (loading) {
    return LoadingSkeleton
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <section className="w-full py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 max-w-md">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Categories Available</h3>
              <p className="text-slate-600">Categories will appear here once they are added to the system.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
              Shop by Category
            </h2>
            <p className="max-w-[700px] text-slate-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Browse our wide selection of footwear for every style and occasion
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category._id} href={`/categories/${category.slug}`} className="group block">
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300 z-10`}
                    />

                    {/* Category Image */}
                    <div className="relative overflow-hidden">
                      <Image
                        src={category.image || "/placeholder.svg?height=400&width=600"}
                        alt={category.title}
                        width={600}
                        height={400}
                        className="object-cover w-full aspect-[3/2] transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />

                    {/* Text Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white z-30">
                      <h3 className="text-lg sm:text-xl font-bold mb-1 line-clamp-1">{category.title}</h3>
                      <p className="text-xs sm:text-sm text-white/90 mb-3 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                          {category.count} {category.count === 1 ? "Product" : "Products"}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all duration-200 text-xs sm:text-sm px-3 py-1"
                        >
                          Shop Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Optional: Show total categories count */}
        {/* {categories.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Showing {categories.length} {categories.length === 1 ? "category" : "categories"}
            </p>
          </div>
        )} */}
      </div>
    </section>
  )
}
