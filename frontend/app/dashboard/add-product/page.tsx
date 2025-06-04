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
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ICategory, ISubcategory, ICustomDetail, IProductFormData, ColorOption } from "@/types"

const predefinedSizes: string[] = ["XS", "S", "M", "L", "XL", "XXL"]
const predefinedColors: ColorOption[] = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#808080" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
]

export default function AddProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [subcategories, setSubcategories] = useState<ISubcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<ISubcategory[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [customColor, setCustomColor] = useState<string>("")
  const [customSize, setCustomSize] = useState<string>("")
  const [customDetails, setCustomDetails] = useState<ICustomDetail[]>([])
  const [newDetailLabel, setNewDetailLabel] = useState<string>("")
  const [newDetailValue, setNewDetailValue] = useState<string>("")

  const [formData, setFormData] = useState<IProductFormData>({
    title: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    subcategoryId: "",
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
    images: [],
  })

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [])

  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter((sub) => sub.categoryId === formData.categoryId)
      setFilteredSubcategories(filtered)
      setFormData((prev) => ({ ...prev, subcategoryId: "" }))
    } else {
      setFilteredSubcategories([])
    }
  }, [formData.categoryId, subcategories])

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data: ICategory[] = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchSubcategories = async (): Promise<void> => {
    try {
      const response = await fetch("/api/subcategories")
      if (response.ok) {
        const data: ISubcategory[] = await response.json()
        setSubcategories(data)
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))

      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => setImagePreviews((prev) => [...prev, reader.result as string])
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleColorChange = (color: string, checked: boolean): void => {
    setFormData((prev) => ({
      ...prev,
      colors: checked ? [...prev.colors, color] : prev.colors.filter((c) => c !== color),
    }))
  }

  const addCustomColor = (): void => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, customColor],
      }))
      setCustomColor("")
    }
  }

  const handleSizeChange = (size: string, checked: boolean): void => {
    setFormData((prev) => ({
      ...prev,
      sizes: checked ? [...prev.sizes, size] : prev.sizes.filter((s) => s !== size),
    }))
  }

  const addCustomSize = (): void => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, customSize],
      }))
      setCustomSize("")
    }
  }

  const removeColor = (color: string): void => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }))
  }

  const removeSize = (size: string): void => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }))
  }

  const addCustomDetail = (): void => {
    if (newDetailLabel && newDetailValue) {
      const newDetail: ICustomDetail = {
        id: Date.now().toString(),
        label: newDetailLabel,
        value: newDetailValue,
      }
      setCustomDetails((prev) => [...prev, newDetail])
      setNewDetailLabel("")
      setNewDetailValue("")
    }
  }

  const removeCustomDetail = (id: string): void => {
    setCustomDetails((prev) => prev.filter((detail) => detail.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          value.forEach((file: File) => submitData.append("images", file))
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      })

      // Add custom details
      submitData.append("customDetails", JSON.stringify(customDetails))

      const response = await fetch("/api/products", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        router.push("/dashboard/products")
      } else {
        console.error("Failed to create product")
      }
    } catch (error) {
      console.error("Error creating product:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange =
    (field: keyof IProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSelectChange =
    (field: keyof IProductFormData) =>
    (value: string): void => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-muted-foreground">Create a new product for your inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic details about your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={handleSelectChange("categoryId")}>
                  <SelectTrigger>
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
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={handleSelectChange("subcategoryId")}
                  disabled={!formData.categoryId}
                >
                  <SelectTrigger>
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
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter product title"
                  value={formData.title}
                  onChange={handleInputChange("title")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Brief product description (1-2 sentences)"
                  className="min-h-[60px]"
                  value={formData.shortDescription}
                  onChange={handleInputChange("shortDescription")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed product description"
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="Enter brand name"
                  value={formData.brand}
                  onChange={handleInputChange("brand")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Stock</CardTitle>
              <CardDescription>Set pricing and inventory details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price *</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.originalPrice}
                    onChange={handleInputChange("originalPrice")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.discountPrice}
                    onChange={handleInputChange("discountPrice")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={handleInputChange("stockQuantity")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Product Features</Label>
                <Textarea
                  id="features"
                  placeholder="List key features (one per line or comma-separated)"
                  value={formData.features}
                  onChange={handleInputChange("features")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    placeholder="e.g., 1.5 kg"
                    value={formData.weight}
                    onChange={handleInputChange("weight")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    placeholder="e.g., 30x20x10 cm"
                    value={formData.dimensions}
                    onChange={handleInputChange("dimensions")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  placeholder="e.g., Cotton, Plastic, Metal"
                  value={formData.material}
                  onChange={handleInputChange("material")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Colors & Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Colors & Sizes</CardTitle>
              <CardDescription>Select available colors and sizes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Colors</Label>
                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-8 p-0 border-0"
                  />
                  <Input
                    placeholder="Custom color name"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={addCustomColor}>
                    <Plus className="h-4 w-4" />
                  </Button>
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
                <Label>Sizes</Label>
                <div className="grid grid-cols-3 gap-2">
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

                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Custom size"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={addCustomSize}>
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

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload multiple images for your product. First image will be the main image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div className="mt-4">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button type="button" variant="outline">
                      Upload Images
                    </Button>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    PNG, JPG up to 10MB each. You can select multiple images.
                  </p>
                </div>
              </div>

              {imagePreviews.length > 0 && (
                <div className="space-y-4">
                  <Label>Uploaded Images ({imagePreviews.length})</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Badge
                          variant={index === 0 ? "default" : "secondary"}
                          className="absolute top-2 left-2 text-xs"
                        >
                          {index === 0 ? "Main" : `${index + 1}`}
                        </Badge>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Details */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Details</CardTitle>
              <CardDescription>Add custom product specifications and details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

          {/* SEO & Additional Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>SEO & Additional Information</CardTitle>
              <CardDescription>
                Optional fields for better search optimization and customer information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">SEO Keywords</Label>
                  <Input
                    id="seoKeywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={formData.seoKeywords}
                    onChange={handleInputChange("seoKeywords")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="tag1, tag2, tag3"
                    value={formData.tags}
                    onChange={handleInputChange("tags")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnPolicy">Return Policy</Label>
                  <Textarea
                    id="returnPolicy"
                    placeholder="Describe return policy"
                    value={formData.returnPolicy}
                    onChange={handleInputChange("returnPolicy")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Textarea
                    id="warranty"
                    placeholder="Describe warranty terms"
                    value={formData.warranty}
                    onChange={handleInputChange("warranty")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-4">
          <Button type="submit" disabled={isLoading || !formData.categoryId || !formData.subcategoryId}>
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
