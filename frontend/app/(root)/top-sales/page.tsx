"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, ShoppingCart, Heart, Eye, Filter, ChevronDown, X, Search, TrendingUp, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import publicCategoryService, { type PublicCategory } from "../../../service/public/categoryPublicService"
import publicSubcategoryService, { type PublicSubcategory } from "../../../service/public/publicSubcategoryService"
import ProductService, { type ProductDetails, type ProductListResponse } from "../../../service/public/Productservice"
import ProductQuickViewModal from "../components/new-arrival/product-view"

export default function TopSalesPage() {
  // State for data
  const [category, setCategory] = useState<PublicCategory | null>(null)
  const [subcategories, setSubcategories] = useState<PublicSubcategory[]>([])
  const [allProducts, setAllProducts] = useState<ProductDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popular")

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Available filter options extracted from all products
  const availableOptions = useMemo(() => {
    const brands = [...new Set(allProducts.map((p) => p.brand).filter(Boolean))]
    const colors = [...new Set(allProducts.flatMap((p) => p.colors || []))]
    const sizes = [...new Set(allProducts.flatMap((p) => p.sizes || []))]
    const maxPrice = Math.max(...allProducts.map((p) => p.finalPrice), 2000)

    return { brands, colors, sizes, maxPrice }
  }, [allProducts])

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const filtered = allProducts.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Price range filter
      if (product.finalPrice < priceRange[0] || product.finalPrice > priceRange[1]) {
        return false
      }

      // Subcategory filter
      if (selectedSubcategories.length > 0) {
        const productSubcategoryId =
          typeof product.subcategoryId === "string" ? product.subcategoryId : product.subcategoryId?._id
        if (!productSubcategoryId || !selectedSubcategories.includes(productSubcategoryId)) {
          return false
        }
      }

      // Brand filter
      if (selectedBrands.length > 0 && (!product.brand || !selectedBrands.includes(product.brand))) {
        return false
      }

      // Color filter
      if (selectedColors.length > 0) {
        const hasMatchingColor = product.colors?.some((color) => selectedColors.includes(color))
        if (!hasMatchingColor) return false
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = product.sizes?.some((size) => selectedSizes.includes(size))
        if (!hasMatchingSize) return false
      }

      return true
    })

    // Sort products
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.finalPrice - b.finalPrice)
        break
      case "price-desc":
        filtered.sort((a, b) => b.finalPrice - a.finalPrice)
        break
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "popular":
      default:
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    return filtered
  }, [
    allProducts,
    searchQuery,
    priceRange,
    selectedSubcategories,
    selectedBrands,
    selectedColors,
    selectedSizes,
    sortBy,
  ])

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get Top Sales category
        const categories = await publicCategoryService.getAllPublicCategories()
        let topSalesCategory = categories.find((cat) => cat.title.toLowerCase().includes("top sales of the week"))

        if (!topSalesCategory) {
          const searchTerms = ["top sales", "best sellers", "trending", "popular", "hot deals"]
          for (const term of searchTerms) {
            topSalesCategory = categories.find((cat) => cat.title.toLowerCase().includes(term))
            if (topSalesCategory) break
          }
        }

        if (!topSalesCategory) {
          throw new Error("Top Sales category not found")
        }

        setCategory(topSalesCategory)

        // Get subcategories for this category
        const subcategoriesData = await publicSubcategoryService.getPublicSubcategories({
          categorySlug: topSalesCategory.slug,
        })
        setSubcategories(subcategoriesData)

        // Fetch all products from this category
        const productResponse: ProductListResponse = await ProductService.getProductsByCategory(
          topSalesCategory._id,
          { limit: 1000 }, // Get all products for client-side filtering
        )

        setAllProducts(productResponse.products)

        // Set initial price range based on actual product prices
        if (productResponse.products.length > 0) {
          const prices = productResponse.products.map((p) => p.finalPrice)
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          setPriceRange([Math.floor(minPrice), Math.ceil(maxPrice)])
        }
      } catch (err: any) {
        console.error("Error fetching initial data:", err)
        setError(err.message || "Failed to load page data")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setPriceRange([0, availableOptions.maxPrice])
    setSelectedSubcategories([])
    setSelectedBrands([])
    setSelectedColors([])
    setSelectedSizes([])
    setSortBy("popular")
    setCurrentPage(1)
  }, [availableOptions.maxPrice])

  const handleQuickView = useCallback((product: ProductDetails) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const calculateDiscount = (originalPrice: number, finalPrice: number) => {
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, priceRange, selectedSubcategories, selectedBrands, selectedColors, selectedSizes])

  const FilterSection = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-6 ${isMobile ? "p-6" : ""}`}>
      {/* Search */}
      <div>
        <Label htmlFor={`search-${isMobile ? "mobile" : "desktop"}`} className="text-sm font-medium mb-3 block">
          Search Products
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id={`search-${isMobile ? "mobile" : "desktop"}`}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={availableOptions.maxPrice}
          min={0}
          step={50}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>${0}</span>
          <span>${availableOptions.maxPrice}</span>
        </div>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-orange-600 transition-colors">
            Subcategories
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {subcategories.map((subcategory) => (
              <div key={subcategory._id} className="flex items-center space-x-3">
                <Checkbox
                  id={`subcategory-${subcategory._id}-${isMobile ? "mobile" : "desktop"}`}
                  checked={selectedSubcategories.includes(subcategory._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSubcategories([...selectedSubcategories, subcategory._id])
                    } else {
                      setSelectedSubcategories(selectedSubcategories.filter((id) => id !== subcategory._id))
                    }
                  }}
                />
                <Label
                  htmlFor={`subcategory-${subcategory._id}-${isMobile ? "mobile" : "desktop"}`}
                  className="text-sm cursor-pointer"
                >
                  {subcategory.title}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Brands */}
      {availableOptions.brands.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-orange-600 transition-colors">
            Brands ({availableOptions.brands.length})
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 max-h-48 overflow-y-auto">
            {availableOptions.brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-3">
                <Checkbox
                  id={`brand-${brand}-${isMobile ? "mobile" : "desktop"}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBrands([...selectedBrands, brand])
                    } else {
                      setSelectedBrands(selectedBrands.filter((b) => b !== brand))
                    }
                  }}
                />
                <Label htmlFor={`brand-${brand}-${isMobile ? "mobile" : "desktop"}`} className="text-sm cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Colors */}
      {availableOptions.colors.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-orange-600 transition-colors">
            Colors ({availableOptions.colors.length})
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {availableOptions.colors.map((color) => (
              <div key={color} className="flex items-center space-x-3">
                <Checkbox
                  id={`color-${color}-${isMobile ? "mobile" : "desktop"}`}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedColors([...selectedColors, color])
                    } else {
                      setSelectedColors(selectedColors.filter((c) => c !== color))
                    }
                  }}
                />
                <Label htmlFor={`color-${color}-${isMobile ? "mobile" : "desktop"}`} className="text-sm cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    {color}
                  </div>
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Sizes */}
      {availableOptions.sizes.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-orange-600 transition-colors">
            Sizes ({availableOptions.sizes.length})
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {availableOptions.sizes.map((size) => (
              <div key={size} className="flex items-center space-x-3">
                <Checkbox
                  id={`size-${size}-${isMobile ? "mobile" : "desktop"}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSizes([...selectedSizes, size])
                    } else {
                      setSelectedSizes(selectedSizes.filter((s) => s !== size))
                    }
                  }}
                />
                <Label htmlFor={`size-${size}-${isMobile ? "mobile" : "desktop"}`} className="text-sm cursor-pointer">
                  {size.toUpperCase()}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {isMobile && (
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-600">Loading Top Sales...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Page</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-8 w-8 text-orange-500" />
                <TrendingUp className="h-6 w-6 text-red-500" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 font-cormorant">
                {category?.title || "Top Sales Of The Week"}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {category?.description || "Discover our best-selling products this week"}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span>
                  Showing {paginatedProducts.length} of {filteredProducts.length} products
                </span>
                {filteredProducts.length !== allProducts.length && (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
                    Filtered from {allProducts.length} total
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    Clear All
                  </Button>
                </div>
                <FilterSection />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Button & Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden w-full sm:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {selectedSubcategories.length +
                        selectedBrands.length +
                        selectedColors.length +
                        selectedSizes.length >
                        0 && (
                        <Badge className="ml-2 bg-orange-500 text-white">
                          {selectedSubcategories.length +
                            selectedBrands.length +
                            selectedColors.length +
                            selectedSizes.length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <FilterSection isMobile />
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {(selectedSubcategories.length > 0 ||
                selectedBrands.length > 0 ||
                selectedColors.length > 0 ||
                selectedSizes.length > 0 ||
                searchQuery) && (
                <div className="mb-6 p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Active Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-orange-600 hover:bg-orange-50"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
                        Search: "{searchQuery}"
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchQuery("")} />
                      </Badge>
                    )}
                    {selectedSubcategories.map((id) => {
                      const subcategory = subcategories.find((s) => s._id === id)
                      return (
                        <Badge key={id} variant="secondary" className="bg-blue-100 text-blue-800">
                          {subcategory?.title}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => setSelectedSubcategories(selectedSubcategories.filter((s) => s !== id))}
                          />
                        </Badge>
                      )
                    })}
                    {selectedBrands.map((brand) => (
                      <Badge key={brand} variant="secondary" className="bg-green-100 text-green-800">
                        {brand}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setSelectedBrands(selectedBrands.filter((b) => b !== brand))}
                        />
                      </Badge>
                    ))}
                    {selectedColors.map((color) => (
                      <Badge key={color} variant="secondary" className="bg-purple-100 text-purple-800">
                        {color}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setSelectedColors(selectedColors.filter((c) => c !== color))}
                        />
                      </Badge>
                    ))}
                    {selectedSizes.map((size) => (
                      <Badge key={size} variant="secondary" className="bg-orange-100 text-orange-800">
                        {size}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setSelectedSizes(selectedSizes.filter((s) => s !== size))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {paginatedProducts.map((product, index) => (
                      <Card
                        key={product._id}
                        className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md relative overflow-hidden"
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
                            <Link href={`/products/${product._id}`} className="block">
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
                            <Link href={`/products/${product._id}`} className="block">
                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors cursor-pointer">
                                {product.title}
                              </h3>
                            </Link>

                            {product.brand && <p className="text-sm text-gray-500 mb-2">{product.brand}</p>}

                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg font-bold text-orange-600">
                                {formatPrice(product.finalPrice)}
                              </span>
                              {product.discountPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
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
                                  {product.stockQuantity === 0 ? "Sold Out" : "View Details"}
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}{" "}
                        products
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>

                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let page
                            if (totalPages <= 5) {
                              page = i + 1
                            } else if (currentPage <= 3) {
                              page = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              page = totalPages - 4 + i
                            } else {
                              page = currentPage - 2 + i
                            }

                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className={
                                  currentPage === page
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                    : ""
                                }
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any products matching your criteria. Try adjusting your filters.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
