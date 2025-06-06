"use client"

import { useState, useEffect } from "react"
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
    id: Number(product._id),
    name: product.title,
    description: product.description,
    price: product.price,
    image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg?height=400&width=400",
    category: typeof product.categoryId === "object" ? product.categoryId.title : "Unknown",
    featured: product.isFeatured || false,
    color: "Blue", // Default value, adjust based on your data model
    gender: "Unisex", // Default value, adjust based on your data model
    sizes: ["38", "39", "40", "41", "42", "43"], // Default value, adjust based on your data model
    brand: product.brand || "Unknown",
    rating: 4.5, // Default value, adjust based on your data model
    reviews: 10, // Default value, adjust based on your data model
    discount: 0, // Default value, adjust based on your data model
    isNew: new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000, // New if created in last 7 days
    images: product.images || ["/placeholder.svg?height=400&width=400"],
    stock: product.stock,
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
  const [products, setProducts] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filters, setFilters] = useState({
    category: [],
    color: [],
    gender: [],
    brand: [],
    priceRange: [],
  })
  const [sortOption, setSortOption] = useState("featured")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setIsFiltering(true)

        // Map sort options to API parameters
        let sortBy: string | undefined
        let sortOrder: "asc" | "desc" | undefined

        switch (sortOption) {
          case "price-low":
            sortBy = "price"
            sortOrder = "asc"
            break
          case "price-high":
            sortBy = "price"
            sortOrder = "desc"
            break
          case "newest":
            sortBy = "createdAt"
            sortOrder = "desc"
            break
          case "rating":
            // If your API supports sorting by rating
            sortBy = "rating"
            sortOrder = "desc"
            break
          case "featured":
          default:
            // If your API supports featured flag
            sortBy = "isFeatured"
            sortOrder = "desc"
            break
        }

        const response = await productsService.getProducts({
          page: currentPage,
          limit: 12,
          search: searchQuery || undefined,
          status: "active",
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sortBy,
          sortOrder,
          // Add other filters as needed
        })

        setApiProducts(response.products)
        setTotalCount(response.count)
        setTotalPages(response.pages)

        // Map API products to UI format
        const mappedProducts = response.products.map(mapApiProductToUiProduct)
        setProducts(mappedProducts)
      } catch (err: any) {
        setError(err.message || "Failed to fetch products")
        toast({
          title: "Error",
          description: err.message || "Failed to fetch products",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setIsFiltering(false)
      }
    }

    fetchProducts()
  }, [currentPage, sortOption, searchQuery, priceRange, toast])

  const handleFilterChange = (type, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      if (newFilters[type].includes(value)) {
        newFilters[type] = newFilters[type].filter((item) => item !== value)
      } else {
        newFilters[type] = [...newFilters[type], value]
      }
      return newFilters
    })
  }

  const clearFilters = () => {
    setFilters({
      category: [],
      color: [],
      gender: [],
      brand: [],
      priceRange: [],
    })
    setPriceRange([1000, 15000])
    setSearchQuery("")
  }

  const handleQuickView = (product) => {
    setQuickViewProduct(product)
    setQuickViewSize(product.sizes[0])
    setQuickViewQuantity(1)
  }

  const addToCart = (product, size = "40", quantity = 1) => {
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} (Size: ${size}) would be added to your cart`,
    })
  }

  const handleAddToCart = (product, size = "40", quantity = 1) => {
    addToCart(product, size, quantity)
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
      <Accordion type="single" collapsible defaultValue="category">
        <AccordionItem value="category" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {["Athletic", "Casual", "Formal", "Outdoor"].map((category) => (
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
        <AccordionItem value="price" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={1000}
                max={15000}
                step={500}
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
        <AccordionItem value="color" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Color</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {["Black", "Brown", "Blue", "Red", "Green", "Grey", "White"].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      filters.color.includes(color) ? "border-rose-500" : "border-transparent hover:border-slate-300"
                    }`}
                    style={{
                      backgroundColor:
                        color === "Black"
                          ? "#000"
                          : color === "Brown"
                            ? "#8B4513"
                            : color === "Blue"
                              ? "#1E90FF"
                              : color === "Red"
                                ? "#FF4136"
                                : color === "Green"
                                  ? "#2ECC40"
                                  : color === "Grey"
                                    ? "#AAAAAA"
                                    : "#FFFFFF",
                      boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                    }}
                    onClick={() => handleFilterChange("color", color)}
                    title={color}
                  ></div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="brand" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {["Nike", "Adidas", "Converse", "Clarks", "Merrell", "Jordan", "Skechers", "Columbia"].map((brand) => (
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
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-[200px] lg:w-[300px] pr-8 focus:border-rose-300 focus:ring-rose-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px] focus:ring-rose-200">
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
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
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
              <div className="flex md:hidden items-center justify-between mb-4">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-medium">{products.length}</span> products
                </p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Narrow down your product search</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Showing <span className="font-medium">{products.length}</span> of{" "}
                    <span className="font-medium">{totalCount}</span> products
                  </span>
                  {(filters.category.length > 0 ||
                    filters.color.length > 0 ||
                    filters.gender.length > 0 ||
                    filters.brand.length > 0 ||
                    searchQuery) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={clearFilters}
                    >
                      Clear All
                    </Button>
                  )}
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
                ) : products.length === 0 ? (
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
                      {products.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3 }}
                          layout
                          whileHover={{ y: -5 }}
                        >
                          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                            <CardHeader className="p-0 relative">
                              <Link href={`/products/${product.id}`}>
                                <div className="overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50">
                                  <Image
                                    src={product.image || "/placeholder.svg?height=400&width=400"}
                                    alt={product.name}
                                    width={400}
                                    height={400}
                                    className="object-cover w-full aspect-square transition-transform hover:scale-105 duration-300"
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
                                        onClick={() => handleQuickView(product)}
                                      >
                                        <Eye className="h-4 w-4 text-slate-700" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Quick view</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
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
                              <Link href={`/products/${product.id}`}>
                                <h3 className="font-semibold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{product.description}</p>
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
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -2 }}
                      >
                        <Card className="overflow-hidden border shadow-sm hover:shadow transition-shadow">
                          <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-1/3 lg:w-1/4 relative">
                              <Link href={`/products/${product.id}`}>
                                <div className="overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 h-full">
                                  <Image
                                    src={product.image || "/placeholder.svg?height=300&width=300"}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
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
                              <Link href={`/products/${product.id}`}>
                                <h3 className="font-semibold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-slate-600 mt-1 mb-2">{product.description}</p>
                              <div className="flex flex-wrap gap-2 mt-auto">
                                <div className="text-sm text-slate-600">
                                  <span className="font-medium">Brand:</span> {product.brand}
                                </div>
                                <div className="text-sm text-slate-600">
                                  <span className="font-medium">Color:</span> {product.color}
                                </div>
                                <div className="text-sm text-slate-600">
                                  <span className="font-medium">Sizes:</span> {product.sizes.join(", ")}
                                </div>
                              </div>
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

              {products.length > 0 && totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-300"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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

                    {[...Array(Math.min(totalPages, 3))].map((_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant="outline"
                          size="sm"
                          className={`font-medium ${
                            currentPage === pageNum ? "bg-rose-100 border-rose-200 text-rose-700" : "border-slate-300"
                          }`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

                    {totalPages > 3 && (
                      <>
                        {currentPage > 3 && <span className="px-2">...</span>}
                        {currentPage > 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-medium border-slate-300"
                            onClick={() => setCurrentPage(currentPage)}
                          >
                            {currentPage}
                          </Button>
                        )}
                        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                        {currentPage < totalPages - 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-medium border-slate-300"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        )}
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-300"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
                <div className="grid grid-cols-3 gap-2">
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
                    <p className="text-slate-500 line-through">NPR {(quickViewProduct.price || 0).toLocaleString()}</p>
                    <Badge className="bg-rose-600 hover:bg-rose-700 ml-2">{quickViewProduct.discount}% OFF</Badge>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-rose-600">
                    NPR {(quickViewProduct.price || 0).toLocaleString()}
                  </p>
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
                        onClick={() => setQuickViewQuantity(quickViewQuantity + 1)}
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
                    <span className="text-slate-600">Color:</span>
                    <span className="font-medium">{quickViewProduct.color}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600">Availability:</span>
                    <span className={`font-medium ${quickViewProduct.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {quickViewProduct.stock > 0 ? "In Stock" : "Out of Stock"}
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
