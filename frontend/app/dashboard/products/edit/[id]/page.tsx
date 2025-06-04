"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

interface Category {
  id: string
  title: string
}

interface Subcategory {
  id: string
  title: string
  categoryId: string
}

interface CustomDetail {
  id: string
  label: string
  value: string
}

interface Product {
  id: string
  title: string
  categoryId: string
  subcategoryId: string
  description: string
  shortDescription: string
  originalPrice: string
  discountPrice: string
  stockQuantity: string
  features: string
  colors: string[]
  sizes: string[]
  brand: string
  seoKeywords: string
  tags: string
  returnPolicy: string
  warranty: string
  weight: string
  dimensions: string
  material: string
  status: string
  customDetails: CustomDetail[]
}

const predefinedSizes = ["XS", "S", "M", "L", "XL", "XXL"]
const predefinedColors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#808080" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [customColor, setCustomColor] = useState("")
  const [customSize, setCustomSize] = useState("")
  const [customDetails, setCustomDetails] = useState<CustomDetail[]>([])
  const [newDetailLabel, setNewDetailLabel] = useState("")
  const [newDetailValue, setNewDetailValue] = useState("")

  const [formData, setFormData] = useState<Product>({
    id: "",
    title: "",
    categoryId: "",
    subcategoryId: "",
    description: "",
    shortDescription: "",
    originalPrice: "",
    discountPrice: "",
    stockQuantity: "",
    features: "",
    colors: [],
    sizes: [],
    brand: "",
    seoKeywords: "",
    tags: "",
    returnPolicy: "",
    warranty: "",
    weight: "",
    dimensions: "",
    material: "",
    status: "active",
    customDetails: [],
  })

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter((sub) => sub.categoryId === formData.categoryId)
      setFilteredSubcategories(filtered)
    } else {
      setFilteredSubcategories([])
    }
  }, [formData.categoryId, subcategories])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const response = await fetch("/api/subcategories")
      if (response.ok) {
        const data = await response.json()
        setSubcategories(data)
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error)
    }
  }

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const product = await response.json()
        setFormData(product)
        setCustomDetails(product.customDetails || [])
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => setImagePreviews((prev) => [...prev, reader.result as string])
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleColorChange = (color: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      colors: checked ? [...prev.colors, color] : prev.colors.filter((c) => c !== color),
    }))
  }

  const addCustomColor = () => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, customColor],
      }))
      setCustomColor("")
    }
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sizes: checked ? [...prev.sizes, size] : prev.sizes.filter((s) => s !== size),
    }))
  }

  const addCustomSize = () => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, customSize],
      }))
      setCustomSize("")
    }
  }

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }))
  }

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }))
  }

  const addCustomDetail = () => {
    if (newDetailLabel && newDetailValue) {
      const newDetail: CustomDetail = {
        id: Date.now().toString(),
        label: newDetailLabel,
        value: newDetailValue,
      }
      setCustomDetails((prev) => [...prev, newDetail])
      setNewDetailLabel("")
      setNewDetailValue("")
    }
  }

  const removeCustomDetail = (id: string) => {
    setCustomDetails((prev) => prev.filter((detail) => detail.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      })

      // Add custom details
      submitData.append("customDetails", JSON.stringify(customDetails))

      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        body: submitData,
      })

      if (response.ok) {
        router.push("/dashboard/products")
      } else {
        console.error("Failed to update product")
      }
    } catch (error) {
      console.error("Error updating product:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" size="icon" asChild className="w-fit">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Update product information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Product Information</CardTitle>
              <CardDescription className="text-sm">Update basic details about your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-sm font-medium">
                  Subcategory *
                </Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategoryId: value }))}
                  disabled={!formData.categoryId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Product Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter product title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-sm font-medium">
                  Short Description
                </Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Brief product description"
                  className="min-h-[60px] w-full resize-none"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  className="min-h-[80px] sm:min-h-[100px] w-full resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm font-medium">
                    Brand
                  </Label>
                  <Input
                    id="brand"
                    placeholder="Enter brand name"
                    value={formData.brand}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Custom Details</CardTitle>
              <CardDescription className="text-sm">Add custom product specifications and details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="detailLabel">Detail Label</Label>
                  <Input
                    id="detailLabel"
                    placeholder="e.g., Screen Size, Battery Life"
                    value={newDetailLabel}
                    onChange={(e) => setNewDetailLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detailValue">Detail Value</Label>
                  <Input
                    id="detailValue"
                    placeholder="e.g., 6.1 inches, 24 hours"
                    value={newDetailValue}
                    onChange={(e) => setNewDetailValue(e.target.value)}
                  />
                </div>
              </div>
              <Button type="button" onClick={addCustomDetail} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Detail
              </Button>

              {customDetails.length > 0 && (
                <div className="space-y-2">
                  <Label>Custom Details</Label>
                  <div className="space-y-2">
                    {customDetails.map((detail) => (
                      <div key={detail.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{detail.label}:</span> {detail.value}
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeCustomDetail(detail.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Pricing & Stock</CardTitle>
              <CardDescription className="text-sm">Update pricing and inventory details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice" className="text-sm font-medium">
                    Original Price *
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice" className="text-sm font-medium">
                    Discount Price
                  </Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discountPrice: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity" className="text-sm font-medium">
                  Stock Quantity *
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stockQuantity: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features" className="text-sm font-medium">
                  Product Features
                </Label>
                <Textarea
                  id="features"
                  placeholder="List key features"
                  value={formData.features}
                  onChange={(e) => setFormData((prev) => ({ ...prev, features: e.target.value }))}
                  className="min-h-[60px] sm:min-h-[80px] w-full resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Colors & Sizes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Colors & Sizes</CardTitle>
              <CardDescription className="text-sm">Update available colors and sizes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Colors</Label>
                <div className="space-y-3">
                  {predefinedColors.map((color) => (
                    <div key={color.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={color.name}
                        checked={formData.colors.includes(color.value)}
                        onCheckedChange={(checked) => handleColorChange(color.value, checked as boolean)}
                      />
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.value }} />
                      <Label htmlFor={color.name} className="text-sm">
                        {color.name}
                      </Label>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-12 h-8 p-0 border-0"
                    />
                    <Input
                      placeholder="Custom color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" size="sm" onClick={addCustomColor} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {formData.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color) => (
                      <Badge key={color} variant="secondary" className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                        {predefinedColors.find((c) => c.value === color)?.name || color}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeColor(color)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Sizes</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {predefinedSizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={size}
                        checked={formData.sizes.includes(size)}
                        onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                      />
                      <Label htmlFor={size} className="text-sm">
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Custom size"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={addCustomSize} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map((size) => (
                      <Badge key={size} variant="secondary" className="flex items-center gap-1">
                        {size}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSize(size)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO & Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">SEO & Additional Information</CardTitle>
              <CardDescription className="text-sm">Update SEO and customer information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords" className="text-sm font-medium">
                    SEO Keywords
                  </Label>
                  <Input
                    id="seoKeywords"
                    placeholder="keyword1, keyword2"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="tag1, tag2"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="returnPolicy" className="text-sm font-medium">
                    Return Policy
                  </Label>
                  <Textarea
                    id="returnPolicy"
                    placeholder="Describe return policy"
                    value={formData.returnPolicy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, returnPolicy: e.target.value }))}
                    className="min-h-[60px] w-full resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty" className="text-sm font-medium">
                    Warranty
                  </Label>
                  <Textarea
                    id="warranty"
                    placeholder="Describe warranty terms"
                    value={formData.warranty}
                    onChange={(e) => setFormData((prev) => ({ ...prev, warranty: e.target.value }))}
                    className="min-h-[60px] w-full resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            type="submit"
            disabled={isLoading || !formData.categoryId || !formData.subcategoryId}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
