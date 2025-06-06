"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { categoriesService, type Category } from "../../../service/categoryApi"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await categoriesService.getCategories({
          status: "active",
          limit: 50,
          sortBy: "title",
          sortOrder: "asc",
        })
        setCategories(response.categories)
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading categories...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
  
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-medium text-slate-900">Categories</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Shop by Category</h1>
        <p className="text-slate-600 md:text-lg">Discover our wide range of product categories</p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-600 mb-4">No categories available at the moment.</p>
          <Button asChild className="bg-rose-600 hover:bg-rose-700">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category._id}
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <Link href={`/categories/${category.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardHeader className="p-0 relative">
                  <div className="overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
                    <Image
                      src={category.image || "/placeholder.svg?height=300&width=400"}
                      alt={category.title}
                      width={400}
                      height={300}
                      className="object-cover w-full aspect-[4/3] transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge variant="secondary" className="mb-2 bg-white/90 text-slate-700 hover:bg-white">
                      {category.status}
                    </Badge>
                    <h3 className="font-bold text-xl text-white group-hover:text-rose-200 transition-colors">
                      {category.title}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{category.description}</p>
                  {category.seoKeywords && typeof category.seoKeywords === "string" && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {category.seoKeywords
                        .split(",")
                        .slice(0, 3)
                        .map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-rose-200 text-rose-600">
                            {keyword.trim()}
                          </Badge>
                        ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                    {category.createdBy && <span>By: {category.createdBy.username}</span>}
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
