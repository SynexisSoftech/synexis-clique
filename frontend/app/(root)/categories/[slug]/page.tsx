"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Filter, SlidersHorizontal, Grid3X3, List, Loader2, ServerCrash } from "lucide-react"

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Navbar from "../../components/navbar/navbar"
import Footer from "../../components/footer/footer"
import publicCategoryService, { PublicCategory } from "@/service/public/categoryPublicService"

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
  const [category, setCategory] = useState<PublicCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.slug) return

    const fetchCategoryDetails = async () => {
      try {
        setLoading(true)
        const fetchedCategory = await publicCategoryService.getPublicCategoryBySlug(params.slug)
        setCategory(fetchedCategory)
      } catch (err: any) {
        setError(err.message || "Failed to load category details.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryDetails()
  }, [params.slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Could not find the requested category."}
            <Button asChild variant="link" className="p-0 h-auto ml-1">
              <Link href="/categories">Go back to all categories.</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleFilterChange = (type: string, value: string) => {
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
        {/* Other filter sections would go here */}
      </Accordion>
    </div>
  )

  return (
    <div>
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-slate-500 hover:text-slate-700">Home</Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <Link href="/categories" className="text-slate-500 hover:text-slate-700">Categories</Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">{category.title}</span>
        </div>

        <div className="relative mb-8">
          <div className="relative h-[200px] md:h-[300px] overflow-hidden rounded-lg">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="container px-4 md:px-6">
              <div className="max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{category.title}</h1>
                <p className="text-white/80 md:text-lg">{category.description}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Placeholder for products */}
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold text-slate-800">Products Coming Soon!</h2>
          <p className="text-slate-500 mt-2">The products for the '{category.title}' category will be displayed here.</p>
          {category.tags && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {category.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}