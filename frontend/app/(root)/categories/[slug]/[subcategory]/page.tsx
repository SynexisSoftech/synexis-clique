"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Filter, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { categoriesService, type Category } from "../../../../../service/categoryApi"
import Navbar from "@/app/(root)/components/navbar/navbar"
import Footer from "@/app/(root)/components/footer/footer"

export default function SubcategoryPage({ params }: { params: { slug: string; subcategory: string } }) {
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState("featured")

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true)
        // Get all categories to find the one matching the slug
        const response = await categoriesService.getCategories({
          status: "active",
          limit: 100,
        })

        const foundCategory = response.categories.find(
          (cat) => cat.title.toLowerCase().replace(/\s+/g, "-") === params.slug,
        )

        if (foundCategory) {
          setCategory(foundCategory)
        } else {
          setError("Category not found")
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch category")
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [params.slug])

  // Sample products for demonstration - in real app, these would come from a products API filtered by subcategory
  const subcategoryProducts = [
    {
      id: 1,
      name: "Premium Subcategory Product 1",
      description: "Specialized product for this subcategory",
      price: 8500,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
      color: "Blue",
      brand: "Brand A",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Premium Subcategory Product 2",
      description: "Another great product in this subcategory",
      price: 7200,
      image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop",
      color: "Brown",
      brand: "Brand B",
      rating: 4.6,
    },
  ]

  if (loading) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading subcategory...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <Alert variant="destructive">
          <AlertDescription>{error || "Category not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/categories">Back to Categories</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Format subcategory name for display
  const subcategoryName = params.subcategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div>
      <Navbar />
  
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <Link href="/categories" className="text-slate-500 hover:text-slate-700">
          Categories
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <Link href={`/categories/${params.slug}`} className="text-slate-500 hover:text-slate-700">
          {category.title}
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-medium text-slate-900">{subcategoryName}</span>
      </div>

      <div className="relative mb-8">
        <div className="relative h-[200px] md:h-[300px] overflow-hidden rounded-lg">
          <Image
            src={category.image || "/placeholder.svg?height=300&width=800"}
            alt={subcategoryName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{subcategoryName}</h1>
              <p className="text-white/80 md:text-lg">
                Specialized products in {subcategoryName.toLowerCase()} from {category.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            Showing <span className="font-medium">{subcategoryProducts.length}</span> products
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {subcategoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategoryProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <CardHeader className="p-0 relative">
                <Link href={`/products/${product.id}`}>
                  <div className="overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
                    <Image
                      src={product.image || "/placeholder.svg?height=400&width=400"}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-cover w-full aspect-square transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                      stroke="currentColor"
                      className={`h-3 w-3 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                  <span className="text-xs text-slate-500 ml-1">({product.rating})</span>
                </div>
                <Badge variant="secondary" className="mb-2 bg-rose-100 text-rose-700 hover:bg-rose-200">
                  {product.brand}
                </Badge>
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-slate-600 mt-1">{product.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-semibold text-rose-600">NPR {product.price.toLocaleString()}</p>
                  <span className="text-xs text-slate-500">{product.color}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-600 mb-4">No products found in this subcategory.</p>
          <Button asChild className="bg-rose-600 hover:bg-rose-700">
            <Link href={`/categories/${params.slug}`}>View All {category.title}</Link>
          </Button>
        </div>
      )}

      {subcategoryProducts.length > 0 && (
        <div className="mt-12 bg-slate-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">About {subcategoryName}</h2>
          <p className="text-slate-600 mb-4">
            Discover our curated collection of {subcategoryName.toLowerCase()} in the {category.title} category.
          </p>
          <p className="text-slate-600">
            {category.description} Our {subcategoryName.toLowerCase()} selection offers the perfect blend of style,
            comfort, and quality for your specific needs.
          </p>
        </div>
      )}
    </div>
<Footer />
      </div>
  )
}
