"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ShoppingCart,
  Filter,
  Grid3X3,
  List,
  Heart,
  Eye,
  Sparkles,
  ArrowUpDown,
  Search,
  Star,
  Loader2,
  X,
  Check,
  SlidersHorizontal,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { productsService, type Product } from "../../../service/ProductsService"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"

// Helper function to map API product to UI product
const mapApiProductToUiProduct = (product: Product) => {
  return {
    id: product._id, // Keep as string to avoid ID format issues
    name: product.title,
    description: product.description,
    price: product.price || 0,
    image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg?height=400&width=400",
    category: typeof product.categoryId === "object" ? product.categoryId.title : "Unknown",
    featured: product.isFeatured || false,
    color: product.colors && product.colors.length > 0 ? product.colors[0] : "Blue",
    gender: "Unisex", // Default value, adjust based on your data model
    sizes: product.sizes || ["38", "39", "40", "41", "42", "43"], // Use actual sizes if available
    brand: product.brand || "Unknown",
    rating: product.rating || 4.5,
    reviews: product.reviewsCount || 10,
    discount: product.discountPrice
      ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
      : 0,
    isNew: new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000, // New if created in last 7 days
    images: product.images || ["/placeholder.svg?height=400&width=400"],
    stock: product.stockQuantity || 0,
    colors: product.colors || [],
  }
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState([1000, 15000])
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [quickViewSize, setQuickViewSize] = useState("40")
  const [quickViewQuantity, setQuickViewQuantity] = useState(1)
  const [isFiltering, setIsFiltering] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiProducts, setApiProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(12)

  const [filters, setFilters] = useState({
    category: [],
    color: [],
    gender: [],
    brand: [],
    size: [],
  })
  const [sortOption, setSortOption] = useState("featured")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Available filter options
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableSizes, setAvailableSizes] = useState<string[]>([])
  const [minMaxPrice, setMinMaxPrice] = useState<[number, number]>([0, 20000])

  // Fetch all products once
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)

        // Fetch all products with a large limit
        const response = await productsService.getProducts({
          limit: 100, // Adjust based on your needs
          status: "active",
        })

        setApiProducts(response.products)
        setTotalCount(response.count)

        // Map API products to UI format
        const mappedProducts = response.products.map(mapApiProductToUiProduct)
        setAllProducts(mappedProducts)
        setFilteredProducts(mappedProducts)

        // Extract available filter options
        const categories = [...new Set(mappedProducts.map((p) => p.category))].filter(Boolean)
        const brands = [...new Set(mappedProducts.map((p) => p.brand))].filter(Boolean)
        const colors = [...new Set(mappedProducts.flatMap((p) => p.colors || []))].filter(Boolean)
        const sizes = [...new Set(mappedProducts.flatMap((p) => p.sizes || []))].filter(Boolean)

        // Find min and max prices
        const prices = mappedProducts.map((p) => p.price).filter((p) => p !== undefined && p !== null)
        const minPrice = Math.floor(Math.min(...prices, 1000))
        const maxPrice = Math.ceil(Math.max(...prices, 15000))

        setAvailableCategories(categories)
        setAvailableBrands(brands)
        setAvailableColors(colors)
        setAvailableSizes(sizes)
        setMinMaxPrice([minPrice, maxPrice])
        setPriceRange([minPrice, maxPrice])
      } catch (err: any) {
        setError(err.message || "Failed to fetch products")
        toast({
          title: "Error",
          description: err.message || "Failed to fetch products",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [toast])

  // Apply filters and sorting
  useEffect(() => {
    setIsFiltering(true)

    // Count active filters
    let count = 0
    if (filters.category.length) count++
    if (filters.color.length) count++
    if (filters.brand.length) count++
    if (filters.size.length) count++
    if (searchQuery) count++
    if (priceRange[0] !== minMaxPrice[0] || priceRange[1] !== minMaxPrice[1]) count++

    setActiveFiltersCount(count)

    // Apply filters
    let result = [...allProducts]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query),
      )
    }

    // Category filter
    if (filters.category.length > 0) {
      result = result.filter((p) => filters.category.includes(p.category))
    }

    // Brand filter
    if (filters.brand.length > 0) {
      result = result.filter((p) => filters.brand.includes(p.brand))
    }

    // Color filter
    if (filters.color.length > 0) {
      result = result.filter((p) => p.colors && p.colors.some((color) => filters.color.includes(color)))
    }

    // Size filter
    if (filters.size.length > 0) {
      result = result.filter((p) => p.sizes && p.sizes.some((size) => filters.size.includes(size)))
    }

    // Price range filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Apply sorting
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "featured":
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    setFilteredProducts(result)
    setTotalCount(result.length)
    setTotalPages(Math.ceil(result.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change

    setTimeout(() => {
      setIsFiltering(false)
    }, 300)
  }, [filters, searchQuery, priceRange, sortOption, allProducts, minMaxPrice, itemsPerPage])

  // Get current page products
  const currentProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * itemsPerPage
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  }, [currentPage, filteredProducts, itemsPerPage])

  const handleFilterChange = useCallback((type, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      if (newFilters[type].includes(value)) {
        newFilters[type] = newFilters[type].filter((item) => item !== value)
      } else {
        newFilters[type] = [...newFilters[type], value]
      }
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      category: [],
      color: [],
      gender: [],
      brand: [],
      size: [],
    })
    setPriceRange(minMaxPrice)
    setSearchQuery("")
  }, [minMaxPrice])

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product)
    setQuickViewSize(product.sizes[0])
    setQuickViewQuantity(1)
  }, [])

  const addToCart = useCallback(
    (product, size = "40", quantity = 1) => {
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} (Size: ${size}) added to your cart`,
      })
    },
    [toast],
  )

  const handleAddToCart = useCallback(
    (product, size = "40", quantity = 1) => {
      addToCart(product, size, quantity)
    },
    [addToCart],
  )

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const removeFilter = useCallback((type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }))
  }, [])

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center text-slate-900">
          <SlidersHorizontal className="h-4 w-4 mr-2 text-rose-500" />
          Filters
          {activeFiltersCount > 0 && <Badge className="ml-2 bg-rose-500 hover:bg-rose-600">{activeFiltersCount}</Badge>}
        </h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-rose-300 text-rose-600 hover:bg-rose-50"
            onClick={clearFilters}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 py-2">
          {filters.category.map((cat) => (
            <Badge
              key={`cat-${cat}`}
              variant="secondary"
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 pl-2 pr-1 flex items-center gap-1"
            >
              {cat}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("category", cat)} />
            </Badge>
          ))}
          {filters.brand.map((brand) => (
            <Badge
              key={`brand-${brand}`}
              variant="secondary"
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 pl-2 pr-1 flex items-center gap-1"
            >
              {brand}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("brand", brand)} />
            </Badge>
          ))}
          {filters.color.map((color) => (
            <Badge
              key={`color-${color}`}
              variant="secondary"
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 pl-2 pr-1 flex items-center gap-1"
            >
              {color}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("color", color)} />
            </Badge>
          ))}
          {filters.size.map((size) => (
            <Badge
              key={`size-${size}`}
              variant="secondary"
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 pl-2 pr-1 flex items-center gap-1"
            >
              Size {size}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("size", size)} />
            </Badge>
          ))}
          {searchQuery && (
            <Badge
              variant="secondary"
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 pl-2 pr-1 flex items-center gap-1"
            >
              "{searchQuery}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
        </div>
      )}

      <div className="border-t border-slate-200 pt-4">
        <div className="space-y-2 mb-4">
          <Label htmlFor="search" className="text-sm font-medium">
            Search Products
          </Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8"
            />
            {searchQuery && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["price", "category", "brand", "color", "size"]}>
        <AccordionItem value="price" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={minMaxPrice[0]}
                max={minMaxPrice[1]}
                step={100}
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

        {availableCategories.length > 0 && (
          <AccordionItem value="category" className="border-slate-200">
            <AccordionTrigger className="text-slate-900 hover:text-rose-600">
              Category{" "}
              {filters.category.length > 0 && <Badge className="ml-2 bg-rose-500">{filters.category.length}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.category.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) handleFilterChange("category", category)
                        else handleFilterChange("category", category)
                      }}
                    />
                    <Label htmlFor={`category-${category}`} className="text-slate-700 cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {availableBrands.length > 0 && (
          <AccordionItem value="brand" className="border-slate-200">
            <AccordionTrigger className="text-slate-900 hover:text-rose-600">
              Brand {filters.brand.length > 0 && <Badge className="ml-2 bg-rose-500">{filters.brand.length}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {availableBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brand.includes(brand)}
                      onCheckedChange={(checked) => {
                        if (checked) handleFilterChange("brand", brand)
                        else handleFilterChange("brand", brand)
                      }}
                    />
                    <Label htmlFor={`brand-${brand}`} className="text-slate-700 cursor-pointer">
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {availableColors.length > 0 && (
          <AccordionItem value="color" className="border-slate-200">
            <AccordionTrigger className="text-slate-900 hover:text-rose-600">
              Color {filters.color.length > 0 && <Badge className="ml-2 bg-rose-500">{filters.color.length}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => {
                    const isSelected = filters.color.includes(color)
                    const colorMap = {
                      Black: "#000000",
                      Brown: "#8B4513",
                      Blue: "#1E90FF",
                      Red: "#FF4136",
                      Green: "#2ECC40",
                      Grey: "#AAAAAA",
                      White: "#FFFFFF",
                      // Add more colors as needed
                    }

                    const bgColor = colorMap[color] || "#CCCCCC"

                    return (
                      <div
                        key={color}
                        className={`relative group cursor-pointer`}
                        onClick={() => handleFilterChange("color", color)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full transition-all duration-200 ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-rose-500"
                              : "hover:ring-2 hover:ring-offset-2 hover:ring-slate-300"
                          }`}
                          style={{
                            backgroundColor: bgColor,
                            boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                          }}
                        >
                          {isSelected && (
                            <Check
                              className={`h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                                ["White", "Yellow"].includes(color) ? "text-black" : "text-white"
                              }`}
                            />
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-0.5 whitespace-nowrap">
                          {color}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {availableSizes.length > 0 && (
          <AccordionItem value="size" className="border-slate-200">
            <AccordionTrigger className="text-slate-900 hover:text-rose-600">
              Size {filters.size.length > 0 && <Badge className="ml-2 bg-rose-500">{filters.size.length}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = filters.size.includes(size)
                  return (
                    <div
                      key={size}
                      className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-rose-100 text-rose-700 border-2 border-rose-500"
                          : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                      }`}
                      onClick={() => handleFilterChange("size", size)}
                    >
                      {size}
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )

  return (
    <div>
      <Navbar />

      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container px-4 py-8 md:px-6 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Products</h1>
                <p className="text-slate-600">Browse our collection of premium products</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-full sm:w-[200px] lg:w-[300px] pr-8 focus:border-rose-300 focus:ring-rose-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full sm:w-[180px] focus:ring-rose-200">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-slate-500" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-[280px_1fr] gap-8">
              <div className="hidden md:block">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="sticky top-24"
                >
                  <FilterSidebar />
                </motion.div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex md:hidden items-center">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Filters
                          {activeFiltersCount > 0 && (
                            <Badge className="ml-1 bg-rose-500 hover:bg-rose-600">{activeFiltersCount}</Badge>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                        <SheetHeader className="mb-5">
                          <SheetTitle>Filters</SheetTitle>
                          <SheetDescription>Narrow down your product search</SheetDescription>
                        </SheetHeader>
                        <div className="pr-6">
                          <FilterSidebar />
                        </div>
                        <SheetFooter className="mt-6">
                          <Button
                            className="w-full bg-rose-600 hover:bg-rose-700"
                            onClick={() => document.querySelector("[data-radix-collection-item]")?.click()}
                          >
                            Apply Filters ({filteredProducts.length} products)
                          </Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      Showing <span className="font-medium">{currentProducts.length}</span> of{" "}
                      <span className="font-medium">{totalCount}</span> products
                    </span>
                  </div>

                  <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:block">
                    <TabsList>
                      <TabsTrigger
                        value="grid"
                        className="px-3 data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger
                        value="list"
                        className="px-3 data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700"
                      >
                        <List className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <AnimatePresence mode="wait">
                  {loading || isFiltering ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center py-20"
                    >
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-rose-500" />
                        <p className="mt-4 text-slate-600">Loading products...</p>
                      </div>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12"
                    >
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                      <div className="flex justify-center mt-6">
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                      </div>
                    </motion.div>
                  ) : currentProducts.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 mb-4">No products match your current filters.</p>
                      <Button onClick={clearFilters} className="bg-rose-600 hover:bg-rose-700">
                        Clear Filters
                      </Button>
                    </motion.div>
                  ) : viewMode === "grid" ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      <AnimatePresence>
                        {currentProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            layout
                            whileHover={{ y: -5 }}
                          >
                            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full group">
                              <CardHeader className="p-0 relative">
                                <Link href={`/products/${product.id}`} prefetch={true}>
                                  <div className="overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50">
                                    <Image
                                      src={product.image || "/placeholder.svg?height=400&width=400"}
                                      alt={product.name}
                                      width={400}
                                      height={400}
                                      className="object-cover w-full aspect-square transition-transform group-hover:scale-105 duration-300"
                                    />
                                  </div>
                                </Link>
                                {product.discount > 0 && (
                                  <Badge className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700">
                                    {product.discount}% OFF
                                  </Badge>
                                )}
                                {product.isNew && (
                                  <Badge className="absolute top-2 right-2 bg-emerald-600 hover:bg-emerald-700">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    NEW
                                  </Badge>
                                )}
                                <div className="absolute bottom-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="secondary"
                                          className="h-8 w-8 rounded-full bg-white shadow-md"
                                        >
                                          <Heart className="h-4 w-4 text-rose-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Add to wishlist</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < Math.floor(product.rating)
                                          ? "text-yellow-400 fill-yellow-400"
                                          : i < product.rating
                                            ? "text-yellow-400 fill-yellow-400 opacity-50"
                                            : "text-slate-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-slate-500 ml-1">({product.reviews})</span>
                                </div>
                                <Badge variant="secondary" className="mb-2 bg-rose-100 text-rose-700 hover:bg-rose-200">
                                  {product.category}
                                </Badge>
                                <Link href={`/products/${product.id}`} prefetch={true}>
                                  <h3 className="font-semibold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                                    {product.name}
                                  </h3>
                                </Link>
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{product.description}</p>

                                {/* Color swatches */}
                                {product.colors && product.colors.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {product.colors.slice(0, 3).map((color, idx) => {
                                      const colorMap = {
                                        Black: "#000000",
                                        Brown: "#8B4513",
                                        Blue: "#1E90FF",
                                        Red: "#FF4136",
                                        Green: "#2ECC40",
                                        Grey: "#AAAAAA",
                                        White: "#FFFFFF",
                                      }

                                      const bgColor = colorMap[color] || "#CCCCCC"

                                      return (
                                        <div
                                          key={`${color}-${idx}`}
                                          className="w-4 h-4 rounded-full border border-slate-300"
                                          style={{
                                            backgroundColor: bgColor,
                                            boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                                          }}
                                          title={color}
                                        />
                                      )
                                    })}
                                    {product.colors.length > 3 && (
                                      <div className="text-xs text-slate-500 ml-1 flex items-center">
                                        +{product.colors.length - 3}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-2">
                                  {product.discount > 0 ? (
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-rose-600">
                                        NPR{" "}
                                        {Math.round(
                                          (product.price || 0) * (1 - (product.discount || 0) / 100),
                                        ).toLocaleString()}
                                      </p>
                                      <p className="text-sm text-slate-500 line-through">
                                        NPR {(product.price || 0).toLocaleString()}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="font-semibold text-rose-600">
                                      NPR {(product.price || 0).toLocaleString()}
                                    </p>
                                  )}
                                  <span className="text-xs text-slate-500">{product.brand}</span>
                                </div>

                                {/* Stock indicator */}
                                {product.stock <= 5 && product.stock > 0 && (
                                  <div className="mt-2 text-xs text-amber-600 font-medium">
                                    Only {product.stock} left in stock
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="p-4 pt-0">
                                <Button
                                  className="w-full bg-rose-600 hover:bg-rose-700 transition-colors"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={product.stock <= 0}
                                >
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {currentProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -2 }}
                        >
                          <Card className="overflow-hidden border shadow-sm hover:shadow transition-shadow group">
                            <div className="flex flex-col sm:flex-row">
                              <div className="sm:w-1/3 lg:w-1/4 relative">
                                <Link href={`/products/${product.id}`} prefetch={true}>
                                  <div className="overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 h-full">
                                    <Image
                                      src={product.image || "/placeholder.svg?height=300&width=300"}
                                      alt={product.name}
                                      width={300}
                                      height={300}
                                      className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300"
                                    />
                                  </div>
                                </Link>
                                {product.discount > 0 && (
                                  <Badge className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700">
                                    {product.discount}% OFF
                                  </Badge>
                                )}
                                {product.isNew && (
                                  <Badge className="absolute top-2 right-2 bg-emerald-600 hover:bg-emerald-700">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    NEW
                                  </Badge>
                                )}
                              </div>
                              <div className="p-4 sm:w-2/3 lg:w-3/4 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-200">
                                    {product.category}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < Math.floor(product.rating)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : i < product.rating
                                              ? "text-yellow-400 fill-yellow-400 opacity-50"
                                              : "text-slate-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-xs text-slate-500 ml-1">({product.reviews})</span>
                                  </div>
                                </div>
                                <Link href={`/products/${product.id}`} prefetch={true}>
                                  <h3 className="font-semibold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                                    {product.name}
                                  </h3>
                                </Link>
                                <p className="text-sm text-slate-600 mt-1 mb-2">{product.description}</p>

                                <div className="flex flex-wrap gap-4 mt-auto">
                                  <div className="text-sm text-slate-600">
                                    <span className="font-medium">Brand:</span> {product.brand}
                                  </div>

                                  {/* Color swatches */}
                                  {product.colors && product.colors.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-slate-600">Colors:</span>
                                      <div className="flex gap-1">
                                        {product.colors.map((color, idx) => {
                                          const colorMap = {
                                            Black: "#000000",
                                            Brown: "#8B4513",
                                            Blue: "#1E90FF",
                                            Red: "#FF4136",
                                            Green: "#2ECC40",
                                            Grey: "#AAAAAA",
                                            White: "#FFFFFF",
                                          }

                                          const bgColor = colorMap[color] || "#CCCCCC"

                                          return (
                                            <div
                                              key={`${color}-${idx}`}
                                              className="w-4 h-4 rounded-full border border-slate-300"
                                              style={{
                                                backgroundColor: bgColor,
                                                boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                                              }}
                                              title={color}
                                            />
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {product.sizes && product.sizes.length > 0 && (
                                    <div className="text-sm text-slate-600">
                                      <span className="font-medium">Sizes:</span> {product.sizes.join(", ")}
                                    </div>
                                  )}
                                </div>

                                {/* Stock indicator */}
                                {product.stock <= 5 && product.stock > 0 && (
                                  <div className="mt-2 text-xs text-amber-600 font-medium">
                                    Only {product.stock} left in stock
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-4">
                                  {product.discount > 0 ? (
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-rose-600 text-lg">
                                        NPR{" "}
                                        {Math.round(
                                          (product.price || 0) * (1 - (product.discount || 0) / 100),
                                        ).toLocaleString()}
                                      </p>
                                      <p className="text-sm text-slate-500 line-through">
                                        NPR {(product.price || 0).toLocaleString()}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="font-semibold text-rose-600 text-lg">
                                      NPR {(product.price || 0).toLocaleString()}
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                                      onClick={() => handleQuickView(product)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Quick View
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-rose-600 hover:bg-rose-700"
                                      onClick={() => handleAddToCart(product)}
                                      disabled={product.stock <= 0}
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-1" />
                                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {filteredProducts.length > 0 && totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-slate-300"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <span className="sr-only">Previous page</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </Button>

                      {/* Dynamic pagination based on current page */}
                      {(() => {
                        const pages = []
                        const maxVisiblePages = 5

                        if (totalPages <= maxVisiblePages) {
                          // Show all pages if total pages is less than max visible
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          // Always show first page
                          pages.push(1)

                          // Calculate start and end of middle section
                          let startPage = Math.max(2, currentPage - 1)
                          let endPage = Math.min(totalPages - 1, currentPage + 1)

                          // Adjust if at the beginning
                          if (currentPage <= 3) {
                            endPage = 4
                          }

                          // Adjust if at the end
                          if (currentPage >= totalPages - 2) {
                            startPage = totalPages - 3
                          }

                          // Add ellipsis after first page if needed
                          if (startPage > 2) {
                            pages.push("ellipsis1")
                          }

                          // Add middle pages
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(i)
                          }

                          // Add ellipsis before last page if needed
                          if (endPage < totalPages - 1) {
                            pages.push("ellipsis2")
                          }

                          // Always show last page
                          pages.push(totalPages)
                        }

                        return pages.map((page, index) => {
                          if (page === "ellipsis1" || page === "ellipsis2") {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2">
                                ...
                              </span>
                            )
                          }

                          return (
                            <Button
                              key={`page-${page}`}
                              variant="outline"
                              size="sm"
                              className={`font-medium ${
                                currentPage === page ? "bg-rose-100 border-rose-200 text-rose-700" : "border-slate-300"
                              }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          )
                        })
                      })()}

                      <Button
                        variant="outline"
                        size="icon"
                        className="border-slate-300"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <span className="sr-only">Next page</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Quick View Dialog */}
        <Dialog open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Quick View</DialogTitle>
              <DialogDescription>Take a closer look at this product</DialogDescription>
            </DialogHeader>
            {quickViewProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border bg-gradient-to-br from-rose-50 to-pink-50">
                    <Image
                      src={quickViewProduct.image || "/placeholder.svg?height=400&width=400"}
                      alt={quickViewProduct.name}
                      width={400}
                      height={400}
                      className="object-cover w-full aspect-square"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {quickViewProduct.images &&
                      quickViewProduct.images.map((image, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-lg border cursor-pointer"
                          onClick={() => {
                            setQuickViewProduct({
                              ...quickViewProduct,
                              image: image,
                            })
                          }}
                        >
                          <Image
                            src={image || "/placeholder.svg?height=100&width=100"}
                            alt={`${quickViewProduct.name} - Image ${index + 1}`}
                            width={100}
                            height={100}
                            className="object-cover w-full aspect-square"
                          />
                        </div>
                      ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2 bg-rose-100 text-rose-700">
                    {quickViewProduct.category}
                  </Badge>
                  <h3 className="text-2xl font-bold text-slate-900">{quickViewProduct.name}</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(quickViewProduct.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : i < quickViewProduct.rating
                              ? "text-yellow-400 fill-yellow-400 opacity-50"
                              : "text-slate-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-slate-500 ml-1">({quickViewProduct.reviews} reviews)</span>
                  </div>
                  <p className="text-slate-600">{quickViewProduct.description}</p>
                  {quickViewProduct.discount > 0 ? (
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-rose-600">
                        NPR{" "}
                        {Math.round(
                          (quickViewProduct.price || 0) * (1 - (quickViewProduct.discount || 0) / 100),
                        ).toLocaleString()}
                      </p>
                      <p className="text-slate-500 line-through">
                        NPR {(quickViewProduct.price || 0).toLocaleString()}
                      </p>
                      <Badge className="bg-rose-600 hover:bg-rose-700 ml-2">{quickViewProduct.discount}% OFF</Badge>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-rose-600">
                      NPR {(quickViewProduct.price || 0).toLocaleString()}
                    </p>
                  )}

                  {/* Color options */}
                  {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        {quickViewProduct.colors.map((color, idx) => {
                          const colorMap = {
                            Black: "#000000",
                            Brown: "#8B4513",
                            Blue: "#1E90FF",
                            Red: "#FF4136",
                            Green: "#2ECC40",
                            Grey: "#AAAAAA",
                            White: "#FFFFFF",
                          }

                          const bgColor = colorMap[color] || "#CCCCCC"

                          return (
                            <div
                              key={`${color}-${idx}`}
                              className="w-8 h-8 rounded-full border-2 border-slate-300 cursor-pointer hover:border-rose-500"
                              style={{
                                backgroundColor: bgColor,
                                boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                              }}
                              title={color}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="quick-view-size">Size</Label>
                      <Select value={quickViewSize} onValueChange={setQuickViewSize}>
                        <SelectTrigger id="quick-view-size" className="focus:ring-rose-200">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {quickViewProduct.sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              EU {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quick-view-quantity">Quantity</Label>
                      <div className="flex items-center border rounded-md">
                        <button
                          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                          onClick={() => setQuickViewQuantity(Math.max(1, quickViewQuantity - 1))}
                        >
                          -
                        </button>
                        <div className="flex-1 text-center">{quickViewQuantity}</div>
                        <button
                          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                          onClick={() => setQuickViewQuantity(Math.min(quickViewProduct.stock, quickViewQuantity + 1))}
                          disabled={quickViewQuantity >= quickViewProduct.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-rose-600 hover:bg-rose-700"
                        onClick={() => {
                          addToCart(quickViewProduct, quickViewSize, quickViewQuantity)
                          setQuickViewProduct(null)
                        }}
                        disabled={quickViewProduct.stock <= 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {quickViewProduct.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </Button>
                      <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                        <Heart className="mr-2 h-4 w-4" />
                        Add to Wishlist
                      </Button>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Brand:</span>
                      <span className="font-medium">{quickViewProduct.brand}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-600">Category:</span>
                      <span className="font-medium">{quickViewProduct.category}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-600">Availability:</span>
                      <span className={`font-medium ${quickViewProduct.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {quickViewProduct.stock > 0 ? `In Stock (${quickViewProduct.stock} available)` : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="link" className="p-0 h-auto text-rose-600 hover:text-rose-700" asChild>
                      <Link href={`/products/${quickViewProduct.id}`}>View Full Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  )
}
