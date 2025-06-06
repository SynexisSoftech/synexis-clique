"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Filter, SlidersHorizontal, Grid3X3, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Navbar from "../../components/navbar/navbar"
import Footer from "../../components/footer/footer"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState([1000, 15000])
  const [sortOption, setSortOption] = useState("featured")
  const [filters, setFilters] = useState({
    colors: [],
    sizes: [],
    brands: [],
    styles: [],
  })

  // Get category info based on slug
  const getCategoryInfo = () => {
    const categories = {
      athletic: {
        name: "Athletic Shoes",
        description: "Performance footwear for sports and active lifestyles",
        image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1974&auto=format&fit=crop",
        color: "bg-blue-500",
        subcategories: [
          { name: "Running Shoes", slug: "running" },
          { name: "Basketball Shoes", slug: "basketball" },
          { name: "Training Shoes", slug: "training" },
          { name: "Tennis Shoes", slug: "tennis" },
        ],
      },
      casual: {
        name: "Casual Shoes",
        description: "Comfortable everyday footwear for any occasion",
        image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1915&auto=format&fit=crop",
        color: "bg-amber-500",
        subcategories: [
          { name: "Sneakers", slug: "sneakers" },
          { name: "Slip-Ons", slug: "slip-ons" },
          { name: "Canvas Shoes", slug: "canvas" },
          { name: "Loafers", slug: "loafers" },
        ],
      },
      formal: {
        name: "Formal Shoes",
        description: "Elegant designs for professional and special occasions",
        image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop",
        color: "bg-rose-500",
        subcategories: [
          { name: "Oxford Shoes", slug: "oxford" },
          { name: "Derby Shoes", slug: "derby" },
          { name: "Monk Straps", slug: "monk-straps" },
          { name: "Dress Boots", slug: "dress-boots" },
        ],
      },
      outdoor: {
        name: "Outdoor Shoes",
        description: "Durable footwear for hiking, trekking and adventures",
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop",
        color: "bg-green-500",
        subcategories: [
          { name: "Hiking Boots", slug: "hiking" },
          { name: "Trail Running Shoes", slug: "trail-running" },
          { name: "Trekking Shoes", slug: "trekking" },
          { name: "Waterproof Boots", slug: "waterproof" },
        ],
      },
    }

    return (
      categories[params.slug] || {
        name: "Category Not Found",
        description: "Please check the URL and try again",
        image: "/placeholder.svg?height=400&width=800",
        color: "bg-slate-500",
        subcategories: [],
      }
    )
  }

  const category = getCategoryInfo()

  // Sample products for the category
  const products = [
    {
      id: 1,
      name: "Air Zoom Runner",
      description: "Lightweight running shoes with responsive cushioning",
      price: 8500,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
      category: "Athletic",
      subcategory: "Running",
      color: "Blue",
      brand: "Nike",
      rating: 4.8,
      sizes: [39, 40, 41, 42, 43, 44],
    },
    {
      id: 2,
      name: "Classic Leather Loafers",
      description: "Timeless design with premium leather construction",
      price: 7200,
      image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop",
      category: "Formal",
      subcategory: "Loafers",
      color: "Brown",
      brand: "Clarks",
      rating: 4.6,
      sizes: [40, 41, 42, 43, 44],
    },
    {
      id: 3,
      name: "Urban Canvas Sneakers",
      description: "Comfortable everyday sneakers with stylish design",
      price: 4500,
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1998&auto=format&fit=crop",
      category: "Casual",
      subcategory: "Sneakers",
      color: "Black",
      brand: "Converse",
      rating: 4.5,
      sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    },
    {
      id: 4,
      name: "Hiking Trail Boots",
      description: "Durable boots with excellent traction for outdoor adventures",
      price: 9500,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop",
      category: "Outdoor",
      subcategory: "Hiking",
      color: "Green",
      brand: "Merrell",
      rating: 4.9,
      sizes: [40, 41, 42, 43, 44, 45],
    },
    {
      id: 5,
      name: "Basketball High Tops",
      description: "Performance basketball shoes with ankle support",
      price: 7800,
      image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=80&w=1974&auto=format&fit=crop",
      category: "Athletic",
      subcategory: "Basketball",
      color: "Red",
      brand: "Jordan",
      rating: 4.7,
      sizes: [41, 42, 43, 44, 45, 46],
    },
    {
      id: 6,
      name: "Slip-On Comfort Shoes",
      description: "Easy-to-wear shoes for everyday comfort",
      price: 3900,
      image: "https://images.unsplash.com/photo-1603808033176-9d134e6f2c74?q=80&w=1915&auto=format&fit=crop",
      category: "Casual",
      subcategory: "Slip-Ons",
      color: "Grey",
      brand: "Skechers",
      rating: 4.4,
      sizes: [39, 40, 41, 42, 43, 44],
    },
  ]

  // Filter products based on category
  const filteredProducts = products.filter((product) => product.category.toLowerCase() === params.slug.toLowerCase())

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
      colors: [],
      sizes: [],
      brands: [],
      styles: [],
    })
    setPriceRange([1000, 15000])
  }

  const FilterSidebar = () => (
    <div>
      <Navbar />

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
      <Accordion type="single" collapsible defaultValue="subcategory">
        <AccordionItem value="subcategory" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Subcategories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {category.subcategories.map((sub) => (
                <div key={sub.slug} className="flex items-center space-x-2">
                  <Checkbox id={`sub-${sub.slug}`} />
                  <Label htmlFor={`sub-${sub.slug}`} className="text-slate-700">
                    {sub.name}
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
        <AccordionItem value="color" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Color</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {["Black", "Brown", "Blue", "Red", "Green", "Grey", "White"].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      filters.colors.includes(color) ? "border-rose-500" : "border-transparent hover:border-slate-300"
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
                    onClick={() => handleFilterChange("colors", color)}
                    title={color}
                  ></div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="size" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Size</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-4 gap-2">
              {[38, 39, 40, 41, 42, 43, 44, 45].map((size) => (
                <div
                  key={size}
                  className={`flex items-center justify-center h-10 rounded border cursor-pointer ${
                    filters.sizes.includes(size)
                      ? "bg-rose-100 border-rose-300 text-rose-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => handleFilterChange("sizes", size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="brand" className="border-slate-200">
          <AccordionTrigger className="text-slate-900 hover:text-rose-600">Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {["Nike", "Adidas", "Puma", "Reebok", "New Balance", "Converse", "Vans"].map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={(checked) => {
                      if (checked) handleFilterChange("brands", brand)
                      else handleFilterChange("brands", brand)
                    }}
                  />
                  <Label htmlFor={`brand-${brand}`} className="text-slate-700">
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
        <span className="font-medium text-slate-900">{category.name}</span>
      </div>

      <div className="relative mb-8">
        <div className="relative h-[200px] md:h-[300px] overflow-hidden rounded-lg">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{category.name}</h1>
              <p className="text-white/80 md:text-lg">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {category.subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/categories/${params.slug}/${sub.slug}`}
              className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
            >
              {sub.name}
            </Link>
          ))}
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
          <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:block">
            <TabsList>
              <TabsTrigger value="grid" className="px-3">
                <Grid3X3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        <div className="hidden md:block">
          <FilterSidebar />
        </div>
        <div>
          <div className="flex md:hidden items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
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

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                >
                  <CardHeader className="p-0 relative">
                    <Link href={`/products/${product.id}`}>
                      <div className="overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
                        <Image
                          src={product.image || "/placeholder.svg"}
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
                      {product.subcategory}
                    </Badge>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-600 mt-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold text-rose-600">NPR {product.price.toLocaleString()}</p>
                      <span className="text-xs text-slate-500">{product.brand}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full bg-rose-600 hover:bg-rose-700">Add to Cart</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden border shadow-sm hover:shadow transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 lg:w-1/4">
                      <Link href={`/products/${product.id}`}>
                        <div className="overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50 h-full">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </Link>
                    </div>
                    <div className="p-4 sm:w-2/3 lg:w-3/4 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-200">
                          {product.subcategory}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                              stroke="currentColor"
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"
                              }`}
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
                          <span className="font-medium">Sizes:</span> {product.sizes.map((s) => s).join(", ")}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <p className="font-semibold text-rose-600 text-lg">NPR {product.price.toLocaleString()}</p>
                        <Button className="bg-rose-600 hover:bg-rose-700">Add to Cart</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-slate-600 mb-4">No products match your current filters.</p>
              <Button onClick={clearFilters} className="bg-rose-600 hover:bg-rose-700">
                Clear Filters
              </Button>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" disabled className="border-slate-300">
                  <span className="sr-only">Previous page</span>
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <Button variant="outline" size="sm" className="font-medium bg-rose-100 border-rose-200 text-rose-700">
                  1
                </Button>
                <Button variant="outline" size="sm" className="font-medium border-slate-300">
                  2
                </Button>
                <Button variant="outline" size="sm" className="font-medium border-slate-300">
                  3
                </Button>
                <Button variant="outline" size="icon" className="border-slate-300">
                  <span className="sr-only">Next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
        </div>
  )
}
