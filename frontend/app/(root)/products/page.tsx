"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
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
  ArrowRight,
  Package,
  TrendingUp,
  Award,
  Zap,
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
  SheetClose,
} from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import ProductService, { type ProductDetails } from "../../../service/public/Productservice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"
import { AddToCartButton } from "@/components/AddToCartButton"

// Helper function to map API product to UI product
const mapApiProductToUiProduct = (product: ProductDetails) => {
  const finalPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.originalPrice
  const discountPercentage =
    product.discountPrice && product.discountPrice > 0
      ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
      : 0

  return {
    id: product._id,
    name: product.title,
    description: product.description,
    shortDescription: product.shortDescription,
    price: finalPrice,
    originalPrice: product.originalPrice,
    discountPrice: product.discountPrice || 0,
    finalPrice: finalPrice,
    image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg?height=400&width=400",
    category: typeof product.categoryId === "object" ? product.categoryId.title : "Unknown",
    featured: product.status === "active",
    color: product.colors && product.colors.length > 0 ? product.colors[0] : "Blue",
    sizes: product.sizes || ["38", "39", "40", "41", "42", "43"],
    brand: product.brand || "Unknown",
    rating: product.rating || 4.5,
    reviews: product.reviewsCount || 10,
    discount: discountPercentage,
    isNew: new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
    images: product.images || ["/placeholder.svg?height=400&width=400"],
    stock: product.stockQuantity,
    stockQuantity: product.stockQuantity,
    colors: product.colors || [],
    status: product.status,
    isCashOnDeliveryAvailable: product.isCashOnDeliveryAvailable,
    warranty: product.warranty,
    returnPolicy: product.returnPolicy,
    features: product.features || [],
    material: product.material,
    weight: product.weight,
    createdAt: product.createdAt,
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
  const [apiProducts, setApiProducts] = useState<ProductDetails[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(12)

  const [filters, setFilters] = useState({
    category: [],
    color: [],
    brand: [],
    size: [],
    features: [],
    inStock: false,
    onSale: false,
    hasWarranty: false,
    cashOnDelivery: false,
  })
  const [sortOption, setSortOption] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Available filter options
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableSizes, setAvailableSizes] = useState<string[]>([])
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([])
  const [minMaxPrice, setMinMaxPrice] = useState<[number, number]>([0, 20000])

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch products using the ProductService
        const response = await ProductService.getAllProducts({
          limit: 100,
          sort: "newest",
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
        const features = [...new Set(mappedProducts.flatMap((p) => p.features || []))].filter(Boolean)

        // Find min and max prices
        const prices = mappedProducts.map((p) => p.price).filter((p) => p !== undefined && p !== null)
        const minPrice = Math.floor(Math.min(...prices, 1000))
        const maxPrice = Math.ceil(Math.max(...prices, 15000))

        setAvailableCategories(categories)
        setAvailableBrands(brands)
        setAvailableColors(colors)
        setAvailableSizes(sizes)
        setAvailableFeatures(features)
        setMinMaxPrice([minPrice, maxPrice])
        setPriceRange([minPrice, maxPrice])
      } catch (err: any) {
        console.error("Error fetching products:", err)
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
    if (filters.features.length) count++
    if (filters.inStock) count++
    if (filters.onSale) count++
    if (filters.hasWarranty) count++
    if (filters.cashOnDelivery) count++
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
          p.category.toLowerCase().includes(query) ||
          (p.features && p.features.some((f) => f.toLowerCase().includes(query))),
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

    // Features filter
    if (filters.features.length > 0) {
      result = result.filter((p) => p.features && p.features.some((feature) => filters.features.includes(feature)))
    }

    // Stock filter
    if (filters.inStock) {
      result = result.filter((p) => p.stock > 0)
    }

    // On sale filter
    if (filters.onSale) {
      result = result.filter((p) => p.discount > 0)
    }

    // Warranty filter
    if (filters.hasWarranty) {
      result = result.filter((p) => p.warranty)
    }

    // Cash on delivery filter
    if (filters.cashOnDelivery) {
      result = result.filter((p) => p.isCashOnDeliveryAvailable)
    }

    // Price range filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case "popular":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "discount":
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0))
        break
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    setFilteredProducts(result)
    setTotalCount(result.length)
    setTotalPages(Math.ceil(result.length / itemsPerPage))
    setCurrentPage(1)

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
      if (Array.isArray(newFilters[type])) {
        if (newFilters[type].includes(value)) {
          newFilters[type] = newFilters[type].filter((item) => item !== value)
        } else {
          newFilters[type] = [...newFilters[type], value]
        }
      } else {
        newFilters[type] = value
      }
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      category: [],
      color: [],
      brand: [],
      size: [],
      features: [],
      inStock: false,
      onSale: false,
      hasWarranty: false,
      cashOnDelivery: false,
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

  const removeFilter = useCallback(
    (type, value) => {
      if (Array.isArray(filters[type])) {
        setFilters((prev) => ({
          ...prev,
          [type]: prev[type].filter((item) => item !== value),
        }))
      } else {
        setFilters((prev) => ({
          ...prev,
          [type]: false,
        }))
      }
    },
    [filters],
  )

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center text-slate-900">
          <SlidersHorizontal className="h-4 w-4 mr-2 text-amber-700" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-amber-800 hover:bg-amber-900 text-white">{activeFiltersCount}</Badge>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-amber-200 text-amber-800 hover:bg-amber-50 text-xs px-2 py-1 h-auto"
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
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 pl-2 pr-1 flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter("category", cat)}
            >
              {cat}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {filters.brand.map((brand) => (
            <Badge
              key={`brand-${brand}`}
              variant="secondary"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 pl-2 pr-1 flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter("brand", brand)}
            >
              {brand}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {filters.color.map((color) => (
            <Badge
              key={`color-${color}`}
              variant="secondary"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 pl-2 pr-1 flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter("color", color)}
            >
              {color}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {filters.size.map((size) => (
            <Badge
              key={`size-${size}`}
              variant="secondary"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 pl-2 pr-1 flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter("size", size)}
            >
              Size {size}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {filters.features.map((feature) => (
            <Badge
              key={`feature-${feature}`}
              variant="secondary"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 pl-2 pr-1 flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter("features", feature)}
            >
              {feature}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {filters.inStock && (
            <Badge
              variant="secondary"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 pl-2 pr-1 flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter("inStock", true)}
            >
              In Stock
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.onSale && (
            <Badge
              variant="secondary"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 pl-2 pr-1 flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter("onSale", true)}
            >
              On Sale
              <X className="h-3 w-3" />
            </Badge>
          )}
          {searchQuery && (
            <Badge
              variant="secondary"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 pl-2 pr-1 flex items-center gap-1 cursor-pointer"
              onClick={() => setSearchQuery("")}
            >
              "{searchQuery}"
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      <Separator className="bg-slate-200" />

      <div className="space-y-2 mb-4">
        <Label htmlFor="search" className="text-sm font-medium text-slate-700">
          Search Products
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-slate-200 focus:border-amber-300 focus:ring-amber-200"
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["price", "availability", "category", "brand"]}>
        <AccordionItem value="price" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-amber-800 py-3">
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-amber-700" />
              Price Range
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-1">
              <Slider
                value={priceRange}
                min={minMaxPrice[0]}
                max={minMaxPrice[1]}
                step={100}
                onValueChange={setPriceRange}
                className="mt-2"
              />
              <div className="flex items-center justify-between">
                <div className="bg-white border border-slate-200 rounded-md px-2 py-1 text-sm text-slate-900 font-medium">
                  NPR {priceRange[0].toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">to</div>
                <div className="bg-white border border-slate-200 rounded-md px-2 py-1 text-sm text-slate-900 font-medium">
                  NPR {priceRange[1].toLocaleString()}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-amber-800 py-3">
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-700" />
              Availability & Services
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => handleFilterChange("inStock", checked)}
                  className="text-amber-800 border-slate-300 data-[state=checked]:bg-amber-800 data-[state=checked]:border-amber-800"
                />
                <Label htmlFor="in-stock" className="text-sm font-medium cursor-pointer">
                  In Stock Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-sale"
                  checked={filters.onSale}
                  onCheckedChange={(checked) => handleFilterChange("onSale", checked)}
                  className="text-amber-800 border-slate-300 data-[state=checked]:bg-amber-800 data-[state=checked]:border-amber-800"
                />
                <Label htmlFor="on-sale" className="text-sm font-medium cursor-pointer">
                  On Sale
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-warranty"
                  checked={filters.hasWarranty}
                  onCheckedChange={(checked) => handleFilterChange("hasWarranty", checked)}
                  className="text-amber-800 border-slate-300 data-[state=checked]:bg-amber-800 data-[state=checked]:border-amber-800"
                />
                <Label htmlFor="has-warranty" className="text-sm font-medium cursor-pointer">
                  With Warranty
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cash-delivery"
                  checked={filters.cashOnDelivery}
                  onCheckedChange={(checked) => handleFilterChange("cashOnDelivery", checked)}
                  className="text-amber-800 border-slate-300 data-[state=checked]:bg-amber-800 data-[state=checked]:border-amber-800"
                />
                <Label htmlFor="cash-delivery" className="text-sm font-medium cursor-pointer">
                  Cash on Delivery
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {availableCategories.length > 0 && (
          <AccordionItem value="category" className="border-slate-200">
            <AccordionTrigger className="text-slate-900 hover:text-amber-800 py-3">
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-700" />
                Category
                {filters.category.length > 0 && (
                  <Badge className="ml-2 bg-amber-800 text-white text-xs">{filters.category.length}</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.category.includes(category)}
                      onCheckedChange={() => handleFilterChange("category", category)}
                      className="text-amber-800 border-slate-300 data-[state=checked]:bg-amber-800 data-[state=checked]:border-amber-800"
                    />
                    <Label htmlFor={`category-${category}`} className="text-slate-700 cursor-pointer text-sm">
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
            <AccordionTrigger className="text-slate-900 hover:text-amber-800 py-3">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-700" />
                Brand
                {filters.brand.length > 0 && (
                  <Badge className="ml-2 bg-amber-800 text-white text-xs">{filters.brand.length}</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {availableBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brand.includes(brand)}
                      onCheckedChange={() => handleFilterChange("brand", brand)}
                      className="text-amber-800 border-slate-300 data-[state=checked]:bg-amber-800 data-[state=checked]:border-amber-800"
                    />
                    <Label htmlFor={`brand-${brand}`} className="text-slate-700 cursor-pointer text-sm">
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
            <AccordionTrigger className="text-slate-900 hover:text-amber-800 py-3">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-blue-400 rounded-full" />
                Color
                {filters.color.length > 0 && (
                  <Badge className="ml-2 bg-amber-800 text-white text-xs">{filters.color.length}</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-3 p-2">
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
                    Yellow: "#FFDC00",
                    Purple: "#B10DC9",
                    Orange: "#FF851B",
                  }

                  const bgColor = colorMap[color] || "#CCCCCC"

                  return (
                    <TooltipProvider key={color}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`relative group cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "ring-2 ring-offset-2 ring-amber-600 scale-110"
                                : "hover:ring-2 hover:ring-offset-2 hover:ring-slate-300 hover:scale-105"
                            }`}
                            onClick={() => handleFilterChange("color", color)}
                          >
                            <div
                              className="w-8 h-8 rounded-full shadow-sm"
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
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{color}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {availableSizes.length > 0 && (
          <AccordionItem value="size" className="border-slate-200">
            <AccordionTrigger className="text-slate-900 hover:text-amber-800 py-3">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border border-amber-700 rounded text-xs flex items-center justify-center text-amber-700 font-bold">
                  S
                </div>
                Size
                {filters.size.length > 0 && (
                  <Badge className="ml-2 bg-amber-800 text-white text-xs">{filters.size.length}</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 p-2">
                {availableSizes.map((size) => {
                  const isSelected = filters.size.includes(size)
                  return (
                    <div
                      key={size}
                      className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-all duration-200 text-sm font-medium ${
                        isSelected
                          ? "bg-amber-800 text-white shadow-md scale-105"
                          : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800"
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

        {availableFeatures.length > 0 && (
          <AccordionItem value="features" className="border-slate-200">
            <AccordionTrigger className="text-slate-900 hover:text-amber-800 py-3">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-700" />
                Features
                {filters.features.length > 0 && (
                  <Badge className="ml-2 bg-amber-800 text-white text-xs">{filters.features.length}</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {availableFeatures.slice(0, 10).map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() => handleFilterChange("features", feature)}
                      className="text-amber-800 border-slate-300 data-[state=checked]:bg-amber-800 data-[state=checked]:border-amber-800"
                    />
                    <Label htmlFor={`feature-${feature}`} className="text-slate-700 cursor-pointer text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
                {availableFeatures.length > 10 && (
                  <p className="text-xs text-slate-500 mt-2 pl-6">
                    +{availableFeatures.length - 10} more features available
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <Navbar />

      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-8 lg:py-12">
            {/* Enhanced Header */}
      

            {/* Search and Sort Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md border border-slate-100 p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="w-full sm:w-[250px] lg:w-[350px] pl-9 border-slate-200 focus:border-amber-300 focus:ring-amber-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-full sm:w-[200px] border-slate-200 focus:ring-amber-200 focus:border-amber-300">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="Sort by" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="discount">Best Deals</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-medium">{totalCount}</span>
                    <span>products found</span>
                  </div>

                  <Tabs value={viewMode} onValueChange={setViewMode} className="hidden sm:block">
                    <TabsList className="bg-slate-100">
                      <TabsTrigger
                        value="grid"
                        className="data-[state=active]:bg-amber-800 data-[state=active]:text-white"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger
                        value="list"
                        className="data-[state=active]:bg-amber-800 data-[state=active]:text-white"
                      >
                        <List className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Filters Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="sticky top-4 bg-white rounded-xl shadow-md border border-slate-100 p-6"
                >
                  <FilterSidebar />
                </motion.div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                {/* Mobile Filter Button */}
                <div className="flex lg:hidden items-center justify-between mb-6">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-amber-200 text-amber-800 hover:bg-amber-50"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge className="ml-1 bg-amber-800 hover:bg-amber-900 text-white text-xs">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[320px] sm:w-[400px] overflow-y-auto bg-white">
                      <SheetHeader className="mb-6">
                        <SheetTitle className="text-amber-800">Product Filters</SheetTitle>
                        <SheetDescription>
                          Narrow down your product search to find exactly what you need
                        </SheetDescription>
                      </SheetHeader>
                      <div className="pr-6">
                        <FilterSidebar />
                      </div>
                      <SheetFooter className="mt-8 pt-6 border-t border-slate-200">
                        <SheetClose asChild>
                          <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white">
                            Apply Filters ({filteredProducts.length} products)
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  <Tabs value={viewMode} onValueChange={setViewMode} className="sm:hidden">
                    <TabsList className="bg-slate-100">
                      <TabsTrigger
                        value="grid"
                        className="data-[state=active]:bg-amber-800 data-[state=active]:text-white"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger
                        value="list"
                        className="data-[state=active]:bg-amber-800 data-[state=active]:text-white"
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
                      className="bg-white rounded-xl shadow-md border border-slate-100 p-12 flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-amber-100 rounded-full animate-pulse" />
                          <Loader2 className="h-8 w-8 text-amber-700 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Loading products...</p>
                          <p className="text-sm text-slate-500">Please wait while we fetch the latest items</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-xl shadow-md border border-slate-100 p-8"
                    >
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">{error}</AlertDescription>
                      </Alert>
                      <div className="flex justify-center mt-6">
                        <Button
                          onClick={() => window.location.reload()}
                          className="bg-amber-800 hover:bg-amber-900 text-white"
                        >
                          Try Again
                        </Button>
                      </div>
                    </motion.div>
                  ) : currentProducts.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-xl shadow-md border border-slate-100 p-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                          <Search className="h-10 w-10 text-amber-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
                        <p className="text-slate-600 mb-6 max-w-md">
                          No products match your current filters. Try adjusting your search criteria or clear all
                          filters.
                        </p>
                        <Button
                          onClick={clearFilters}
                          className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-2 rounded-full"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </motion.div>
                  ) : viewMode === "grid" ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
                    >
                      <AnimatePresence>
                        {currentProducts.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            layout
                            whileHover={{ y: -8 }}
                            className="h-full"
                          >
                            <Card className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 h-full group bg-white/90 backdrop-blur-sm hover:bg-white flex flex-col">
                              <CardHeader className="p-0 relative flex-shrink-0">
                                <Link href={`/products/${product.id}`} prefetch={true}>
                                  <div className="overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 relative h-40 sm:h-44">
                                    <Image
                                      src={product.image || "/placeholder.svg?height=400&width=400"}
                                      alt={product.name}
                                      width={400}
                                      height={400}
                                      className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  </div>
                                </Link>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                  {product.discount > 0 && (
                                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-2 py-1 text-xs">
                                      {product.discount}% OFF
                                    </Badge>
                                  )}
                                  {product.isNew && (
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 py-1 text-xs">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      NEW
                                    </Badge>
                                  )}
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="secondary"
                                          className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
                                        >
                                          <Heart className="h-4 w-4 text-amber-800" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Add to wishlist</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="secondary"
                                          className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
                                          onClick={() => handleQuickView(product)}
                                        >
                                          <Eye className="h-4 w-4 text-amber-800" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Quick view</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </CardHeader>

                              <CardContent className="p-2 sm:p-3 flex-1 flex flex-col">
                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < Math.floor(product.rating)
                                          ? "text-amber-400 fill-amber-400"
                                          : i < product.rating
                                            ? "text-amber-400 fill-amber-400 opacity-50"
                                            : "text-slate-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-slate-500 ml-1">({product.reviews})</span>
                                </div>

                                {/* Category */}
                                <Badge
                                  variant="secondary"
                                  className="mb-2 bg-amber-100 text-amber-800 hover:bg-amber-200 border-0 w-fit"
                                >
                                  {product.category}
                                </Badge>

                                {/* Product Name */}
                                <Link href={`/products/${product.id}`} prefetch={true}>
                                  <h3 className="font-bold text-sm sm:text-base text-slate-900 hover:text-amber-800 transition-colors duration-300 line-clamp-2 mb-1 min-h-[2.5rem] flex items-start">
                                    {product.name}
                                  </h3>
                                </Link>

                                {/* Color swatches */}
                                {product.colors && product.colors.length > 0 && (
                                  <div className="flex gap-1 mb-2">
                                    {product.colors.slice(0, 4).map((color, idx) => {
                                      const colorMap = {
                                        Black: "#000000",
                                        Brown: "#8B4513",
                                        Blue: "#1E90FF",
                                        Red: "#FF4136",
                                        Green: "#2ECC40",
                                        Grey: "#AAAAAA",
                                        White: "#FFFFFF",
                                        Yellow: "#FFDC00",
                                        Purple: "#B10DC9",
                                        Orange: "#FF851B",
                                      }

                                      const bgColor = colorMap[color] || "#CCCCCC"

                                      return (
                                        <div
                                          key={`${color}-${idx}`}
                                          className="w-4 h-4 rounded-full border border-slate-300 shadow-sm"
                                          style={{
                                            backgroundColor: bgColor,
                                            boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                                          }}
                                          title={color}
                                        />
                                      )
                                    })}
                                    {product.colors.length > 4 && (
                                      <div className="text-xs text-slate-500 ml-1 flex items-center">
                                        +{product.colors.length - 4}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {product.features.slice(0, 1).map((feature, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs border-amber-200 text-amber-700 bg-amber-50"
                                      >
                                        {feature}
                                      </Badge>
                                    ))}
                                    {product.features.length > 1 && (
                                      <span className="text-xs text-slate-500">
                                        +{product.features.length - 1} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Price */}
                                <div className="flex items-center justify-between mb-3">
                                  {product.discount > 0 ? (
                                    <div className="flex flex-col gap-1">
                                      <p className="font-bold text-base text-amber-800">
                                        NPR {product.finalPrice.toLocaleString()}
                                      </p>
                                      <p className="text-xs text-slate-500 line-through">
                                        NPR {product.originalPrice.toLocaleString()}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="font-bold text-base text-amber-800">
                                      NPR {product.price.toLocaleString()}
                                    </p>
                                  )}
                                  <span className="text-xs text-slate-500 font-medium">{product.brand}</span>
                                </div>

                                {/* Stock and Services */}
                                <div className="space-y-1 mb-3 flex-1">
                                  {product.stock <= 5 && product.stock > 0 && (
                                    <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                                      Only {product.stock} left in stock
                                    </div>
                                  )}

                                  <div className="flex flex-wrap gap-1">
                                    {product.isCashOnDeliveryAvailable && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                      >
                                        💰 COD
                                      </Badge>
                                    )}
                                    {product.warranty && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
                                        🛡️ Warranty
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>

                              <CardFooter className="p-2 sm:p-3 pt-0 mt-auto">
                                {product.status === "out-of-stock" || product.stock <= 0 ? (
                                  <Button className="w-full bg-gray-300 text-gray-600 cursor-not-allowed" disabled>
                                    Out of Stock
                                  </Button>
                                ) : (
                                  <AddToCartButton
                                    productId={product.id}
                                    className="w-full bg-amber-800 hover:bg-amber-900 text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                                  />
                                )}
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
                      className="space-y-4 sm:space-y-6"
                    >
                      {currentProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group bg-white/90 backdrop-blur-sm hover:bg-white">
                            <div className="flex flex-col sm:flex-row">
                              <div className="sm:w-1/3 lg:w-1/4 relative flex-shrink-0">
                                <Link href={`/products/${product.id}`} prefetch={true}>
                                  <div className="overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 h-full min-h-[200px] sm:min-h-[250px]">
                                    <Image
                                      src={product.image || "/placeholder.svg?height=300&width=300"}
                                      alt={product.name}
                                      width={300}
                                      height={300}
                                      className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-500"
                                    />
                                  </div>
                                </Link>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                  {product.discount > 0 && (
                                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-2 py-1 text-xs">
                                      {product.discount}% OFF
                                    </Badge>
                                  )}
                                  {product.isNew && (
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 py-1 text-xs">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="p-4 sm:p-6 sm:w-2/3 lg:w-3/4 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0"
                                  >
                                    {product.category}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < Math.floor(product.rating)
                                            ? "text-amber-400 fill-amber-400"
                                            : i < product.rating
                                              ? "text-amber-400 fill-amber-400 opacity-50"
                                              : "text-slate-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-xs text-slate-500 ml-1">({product.reviews})</span>
                                  </div>
                                </div>

                                <Link href={`/products/${product.id}`} prefetch={true}>
                                  <h3 className="font-bold text-xl lg:text-2xl text-slate-900 hover:text-amber-800 transition-colors duration-300 mb-2 line-clamp-2">
                                    {product.name}
                                  </h3>
                                </Link>

                                <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3 flex-1">
                                  {product.shortDescription || product.description}
                                </p>

                                <div className="flex flex-wrap gap-4 mb-4">
                                  <div className="text-sm text-slate-600">
                                    <span className="font-medium">Brand:</span> {product.brand}
                                  </div>

                                  {product.material && (
                                    <div className="text-sm text-slate-600">
                                      <span className="font-medium">Material:</span> {product.material}
                                    </div>
                                  )}

                                  {product.weight && (
                                    <div className="text-sm text-slate-600">
                                      <span className="font-medium">Weight:</span> {product.weight}
                                    </div>
                                  )}
                                </div>

                                {/* Color swatches */}
                                {product.colors && product.colors.length > 0 && (
                                  <div className="flex items-center gap-2 mb-4">
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
                                          Yellow: "#FFDC00",
                                          Purple: "#B10DC9",
                                          Orange: "#FF851B",
                                        }

                                        const bgColor = colorMap[color] || "#CCCCCC"

                                        return (
                                          <div
                                            key={`${color}-${idx}`}
                                            className="w-5 h-5 rounded-full border border-slate-300 shadow-sm"
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
                                  <div className="text-sm text-slate-600 mb-4">
                                    <span className="font-medium">Available Sizes:</span> {product.sizes.join(", ")}
                                  </div>
                                )}

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-sm font-medium text-slate-600">Features:</span>
                                    {product.features.slice(0, 3).map((feature, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs border-amber-200 text-amber-700 bg-amber-50"
                                      >
                                        {feature}
                                      </Badge>
                                    ))}
                                    {product.features.length > 3 && (
                                      <span className="text-xs text-slate-500">
                                        +{product.features.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Stock and Services */}
                                <div className="space-y-2 mb-4">
                                  {product.stock <= 5 && product.stock > 0 && (
                                    <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                                      Only {product.stock} left in stock
                                    </div>
                                  )}

                                  <div className="flex flex-wrap gap-2">
                                    {product.isCashOnDeliveryAvailable && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                      >
                                        💰 Cash on Delivery Available
                                      </Badge>
                                    )}
                                    {product.warranty && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
                                        🛡️ Warranty Included
                                      </Badge>
                                    )}
                                    {product.returnPolicy && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                      >
                                        🔄 Return Policy
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                  {product.discount > 0 ? (
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-xl text-amber-800">
                                        NPR {product.finalPrice.toLocaleString()}
                                      </p>
                                      <p className="text-sm text-slate-500 line-through">
                                        NPR {product.originalPrice.toLocaleString()}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="font-bold text-xl text-amber-800">
                                      NPR {product.price.toLocaleString()}
                                    </p>
                                  )}

                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-amber-200 text-amber-800 hover:bg-amber-50"
                                      onClick={() => handleQuickView(product)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Quick View
                                    </Button>
                                    {product.status === "out-of-stock" || product.stock <= 0 ? (
                                      <Button
                                        size="sm"
                                        className="bg-gray-300 text-gray-600 cursor-not-allowed"
                                        disabled
                                      >
                                        Out of Stock
                                      </Button>
                                    ) : (
                                      <AddToCartButton
                                        productId={product.id}
                                        className="bg-amber-800 hover:bg-amber-900 text-white transition-all duration-200 hover:scale-105"
                                      />
                                    )}
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

                {/* Enhanced Pagination */}
                {filteredProducts.length > 0 && totalPages > 1 && (
                  <div className="flex justify-center mt-8 sm:mt-12">
                    <div className="bg-white rounded-full shadow-md border border-slate-100 p-1 flex items-center">
                      <Button
                        variant="ghost"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-full"
                      >
                        Previous
                      </Button>

                      <div className="flex items-center px-2">
                        {(() => {
                          const pages = []
                          const maxVisiblePages = 5

                          if (totalPages <= maxVisiblePages) {
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(i)
                            }
                          } else {
                            pages.push(1)

                            let startPage = Math.max(2, currentPage - 1)
                            let endPage = Math.min(totalPages - 1, currentPage + 1)

                            if (currentPage <= 3) {
                              endPage = 4
                            }

                            if (currentPage >= totalPages - 2) {
                              startPage = totalPages - 3
                            }

                            if (startPage > 2) {
                              pages.push("ellipsis1")
                            }

                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(i)
                            }

                            if (endPage < totalPages - 1) {
                              pages.push("ellipsis2")
                            }

                            pages.push(totalPages)
                          }

                          return pages.map((page, index) => {
                            if (page === "ellipsis1" || page === "ellipsis2") {
                              return (
                                <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
                                  ...
                                </span>
                              )
                            }

                            return (
                              <Button
                                key={`page-${page}`}
                                variant={currentPage === page ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className={`w-8 h-8 p-0 mx-0.5 rounded-full ${
                                  currentPage === page
                                    ? "bg-amber-800 text-white"
                                    : "text-slate-600 hover:text-amber-800 hover:bg-amber-50"
                                }`}
                              >
                                {page}
                              </Button>
                            )
                          })
                        })()}
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-full"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Enhanced Quick View Dialog */}
        <Dialog open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-800">Quick View</DialogTitle>
              <DialogDescription>Take a closer look at this premium product</DialogDescription>
            </DialogHeader>
            {quickViewProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
                    <Image
                      src={quickViewProduct.image || "/placeholder.svg?height=400&width=400"}
                      alt={quickViewProduct.name}
                      width={400}
                      height={400}
                      className="object-cover w-full aspect-square"
                    />
                  </div>
                  {quickViewProduct.images && quickViewProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {quickViewProduct.images.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-lg border cursor-pointer hover:border-amber-300 transition-colors"
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
                            className="object-cover w-full aspect-square hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0">
                      {quickViewProduct.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(quickViewProduct.rating)
                              ? "text-amber-400 fill-amber-400"
                              : i < quickViewProduct.rating
                                ? "text-amber-400 fill-amber-400 opacity-50"
                                : "text-slate-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-slate-500 ml-1">({quickViewProduct.reviews} reviews)</span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{quickViewProduct.name}</h3>

                  <p className="text-slate-600 leading-relaxed">
                    {quickViewProduct.shortDescription || quickViewProduct.description}
                  </p>

                  {quickViewProduct.discount > 0 ? (
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-bold text-amber-800">
                        NPR {quickViewProduct.finalPrice.toLocaleString()}
                      </p>
                      <p className="text-lg text-slate-500 line-through">
                        NPR {quickViewProduct.originalPrice.toLocaleString()}
                      </p>
                      <Badge className="bg-amber-600 hover:bg-amber-700 ml-2">{quickViewProduct.discount}% OFF</Badge>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-amber-800">NPR {quickViewProduct.price.toLocaleString()}</p>
                  )}

                  {/* Color options */}
                  {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Available Colors</Label>
                      <div className="flex gap-3">
                        {quickViewProduct.colors.map((color, idx) => {
                          const colorMap = {
                            Black: "#000000",
                            Brown: "#8B4513",
                            Blue: "#1E90FF",
                            Red: "#FF4136",
                            Green: "#2ECC40",
                            Grey: "#AAAAAA",
                            White: "#FFFFFF",
                            Yellow: "#FFDC00",
                            Purple: "#B10DC9",
                            Orange: "#FF851B",
                          }

                          const bgColor = colorMap[color] || "#CCCCCC"

                          return (
                            <TooltipProvider key={`${color}-${idx}`}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="w-10 h-10 rounded-full border-2 border-slate-300 cursor-pointer hover:border-amber-500 transition-colors shadow-sm"
                                    style={{
                                      backgroundColor: bgColor,
                                      boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{color}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {quickViewProduct.features && quickViewProduct.features.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Key Features</Label>
                      <div className="flex flex-wrap gap-2">
                        {quickViewProduct.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="border-amber-200 text-amber-800 bg-amber-50">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <Label htmlFor="quick-view-size" className="text-base font-medium">
                        Size
                      </Label>
                      <Select value={quickViewSize} onValueChange={setQuickViewSize}>
                        <SelectTrigger id="quick-view-size" className="focus:ring-amber-200 focus:border-amber-300">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {quickViewProduct.sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              Size {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="quick-view-quantity" className="text-base font-medium">
                        Quantity
                      </Label>
                      <div className="flex items-center border rounded-lg overflow-hidden w-32">
                        <button
                          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                          onClick={() => setQuickViewQuantity(Math.max(1, quickViewQuantity - 1))}
                        >
                          -
                        </button>
                        <div className="flex-1 text-center font-medium">{quickViewQuantity}</div>
                        <button
                          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                          onClick={() => setQuickViewQuantity(Math.min(quickViewProduct.stock, quickViewQuantity + 1))}
                          disabled={quickViewQuantity >= quickViewProduct.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      {quickViewProduct.status === "out-of-stock" || quickViewProduct.stock <= 0 ? (
                        <Button className="flex-1 bg-gray-300 text-gray-600 cursor-not-allowed" disabled>
                          Out of Stock
                        </Button>
                      ) : (
                        <AddToCartButton
                          productId={quickViewProduct.id}
                          className="flex-1 bg-amber-800 hover:bg-amber-900 text-white"
                        />
                      )}
                      <Button variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-50">
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Brand:</span>
                      <span className="font-medium">{quickViewProduct.brand}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Category:</span>
                      <span className="font-medium">{quickViewProduct.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Availability:</span>
                      <span className={`font-medium ${quickViewProduct.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {quickViewProduct.stock > 0 ? `In Stock (${quickViewProduct.stock} available)` : "Out of Stock"}
                      </span>
                    </div>
                    {quickViewProduct.material && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Material:</span>
                        <span className="font-medium">{quickViewProduct.material}</span>
                      </div>
                    )}
                    {quickViewProduct.weight && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Weight:</span>
                        <span className="font-medium">{quickViewProduct.weight}</span>
                      </div>
                    )}
                    {quickViewProduct.isCashOnDeliveryAvailable && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Cash on Delivery:</span>
                        <span className="font-medium text-green-600">Available</span>
                      </div>
                    )}
                    {quickViewProduct.warranty && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Warranty:</span>
                        <span className="font-medium text-green-600">Included</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button variant="link" className="p-0 h-auto text-amber-800 hover:text-amber-900" asChild>
                      <Link href={`/products/${quickViewProduct.id}`}>
                        View Full Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
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
