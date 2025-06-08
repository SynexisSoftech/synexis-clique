"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Filter, Loader2, Grid3X3, List, ShoppingBag, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Navbar from "@/app/(root)/components/navbar/navbar"
import Footer from "@/app/(root)/components/footer/footer"
import publicSubcategoryService, { type PublicSubcategory } from "@/service/public/publicSubcategoryService"
import ProductService, { type ProductDetails, type ProductFilterOptions } from "@/service/public/Productservice"

export default function SubcategoryPage({ params }: { params: Promise<{ slug: string; subcategory: string }> }) {
  // Unwrap the params Promise
  const resolvedParams = use(params)

  const [subcategory, setSubcategory] = useState<PublicSubcategory | null>(null)
  const [products, setProducts] = useState<ProductDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState("featured")
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState([1000, 15000])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

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

  const fetchProducts = async (subcategoryId: string, options: ProductFilterOptions = {}) => {
    try {
      setProductsLoading(true)
      const response = await ProductService.getProductsBySubcategory(subcategoryId, {
        page: currentPage,
        limit: 12,
        sort: sortOption as any,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        ...options,
      })
      setProducts(response.products)
      setTotalPages(response.pages)
      setTotalProducts(response.count)
    } catch (err) {
      console.warn("Failed to fetch products:", err)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    const fetchSubcategory = async () => {
      if (!resolvedParams.slug || !resolvedParams.subcategory) return

      try {
        setLoading(true)
        const data = await publicSubcategoryService.getPublicSubcategoryBySlug(
          resolvedParams.slug,
          resolvedParams.subcategory,
        )
        setSubcategory(data)

        // Fetch products for this subcategory
        await fetchProducts(data._id)
      } catch (err: any) {
        setError(err.message || "Failed to fetch subcategory details.")
      } finally {
        setLoading(false)
      }
    }

    fetchSubcategory()
  }, [resolvedParams.slug, resolvedParams.subcategory])

  // Refetch products when filters change
  useEffect(() => {
    if (subcategory) {
      fetchProducts(subcategory._id)
    }
  }, [sortOption, priceRange, currentPage])

  const clearFilters = () => {
    setPriceRange([1000, 15000])
    setCurrentPage(1)
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4 flex items-center text-slate-900">
          <Filter className="h-4 w-4 mr-2 text-rose-500" />
          Filters
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="mb-4 border-rose-300 text-rose-600 hover:bg-rose-50"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={priceRange}
                min={1000}
                max={15000}
                step={500}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">NPR {priceRange[0].toLocaleString()}</span>
                <span className="text-sm text-slate-600">NPR {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Subcategory...</span>
        </div>
      </div>
    )
  }

  if (error || !subcategory) {
    return (
      <>
        <Navbar />
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <Alert variant="destructive">
            <AlertDescription>{error || "Subcategory not found."}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link href="/categories">Back to Categories</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <div>
      <Navbar />

      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Link href="/" className="text-slate-500 hover:text-slate-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <Link href="/categories" className="text-slate-500 hover:text-slate-700">
            Categories
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <Link href={`/categories/${subcategory.categoryId.slug}`} className="text-slate-500 hover:text-slate-700">
            {subcategory.categoryId.title}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">{subcategory.title}</span>
        </div>

        {/* Header Banner */}
        <div className="relative mb-8">
          <div className="relative h-[200px] md:h-[300px] overflow-hidden rounded-lg">
            <Image
              src={subcategory.image || "/placeholder.svg?height=300&width=800"}
              alt={subcategory.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="container px-4 md:px-6">
              <div className="max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{subcategory.title}</h1>
                <p className="text-white/80 md:text-lg">{subcategory.description}</p>
                {subcategory.tags && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subcategory.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Filters and Product Count */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Products</h2>
                {!productsLoading && <span className="text-slate-500">({totalProducts} items)</span>}
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Refine your product search</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>

                <Tabs value={viewMode} onValueChange={setViewMode}>
                  <TabsList>
                    <TabsTrigger value="grid">
                      <Grid3X3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading products...</span>
                </div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div
                  className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                >
                  {products.map((product) => {
                    const finalPrice = getFinalPrice(product)
                    const discountPercentage = getDiscountPercentage(product)

                    return (
                      <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                        <Link href={`/products/${product._id}`}>
                          <CardHeader className="p-0">
                            <div
                              className={`relative overflow-hidden ${viewMode === "grid" ? "aspect-square" : "h-48"}`}
                            >
                              <Image
                                src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                                alt={product.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {discountPercentage > 0 && (
                                <Badge className="absolute top-2 left-2 bg-red-500">{discountPercentage}% OFF</Badge>
                              )}
                              {product.stockQuantity === 0 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Badge variant="secondary">Out of Stock</Badge>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">{product.title}</h3>
                            <p className="text-slate-600 text-sm line-clamp-2 mb-3">{product.shortDescription}</p>

                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-lg text-slate-900">
                                NPR {finalPrice.toLocaleString()}
                              </span>
                              {product.discountPrice && product.originalPrice && (
                                <span className="text-slate-500 line-through text-sm">
                                  NPR {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {product.brand && <p className="text-slate-500 text-sm mb-2">{product.brand}</p>}

                            {product.rating && (
                              <div className="flex items-center gap-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-slate-600">({product.reviewsCount || 0})</span>
                              </div>
                            )}
                          </CardContent>
                        </Link>
                      </Card>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Products Found</h3>
                <p className="text-slate-600 mb-4">No products found in this subcategory yet.</p>
                <Button asChild className="bg-rose-600 hover:bg-rose-700">
                  <Link href={`/categories/${subcategory.categoryId.slug}`}>
                    View All {subcategory.categoryId.title}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="mt-12 bg-slate-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">About {subcategory.title}</h2>
          <p className="text-slate-600">{subcategory.description}</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
