"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// --- Service Imports ---
import {
  productsService,
  type CreateProductData as ServiceCreateProductData,
  type IDimensions,
} from "../../../service/ProductsService"
import { categoriesService, type Category as ServiceCategory } from "../../../service/categoryApi"
import { subcategoriesService, type Subcategory as ServiceSubcategory } from "../../../service/subcategories"

import AdminRouteGuard from "@/app/AdminRouteGuard"

// --- Local Interfaces for State Management ---
interface ICustomDetailClient {
  id: string
  label: string
  value: string
}

interface IColorOption {
  name: string
  hex: string
}

interface IProductFormData {
  title: string
  description: string
  shortDescription: string
  categoryId: string
  subcategoryId: string
  originalPrice: string
  discountPrice: string
  stockQuantity: string
  features: string[]
  seoKeywords: string[]
  tags: string[]
  colors: IColorOption[]
  sizes: string[]
  brand: string
  returnPolicy: string
  warranty: string
  weight: string
  dimensionLength: string
  dimensionWidth: string
  dimensionHeight: string
  dimensionUnit: string
  material: string
  images: File[]
  isCashOnDeliveryAvailable: boolean
  status: "active" | "inactive" | "out-of-stock"
}

// Predefined color options
const PREDEFINED_COLORS: IColorOption[] = [
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#008000" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" },
  { name: "Navy", hex: "#000080" },
]

export default function AddProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<ServiceSubcategory[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [customDetails, setCustomDetails] = useState<ICustomDetailClient[]>([])
  const [newDetailLabel, setNewDetailLabel] = useState<string>("")
  const [newDetailValue, setNewDetailValue] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  // New state for managing individual inputs
  const [newFeature, setNewFeature] = useState<string>("")
  const [newKeyword, setNewKeyword] = useState<string>("")
  const [newTag, setNewTag] = useState<string>("")
  const [newSize, setNewSize] = useState<string>("")
  const [customColorName, setCustomColorName] = useState<string>("")
  const [customColorHex, setCustomColorHex] = useState<string>("#000000")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<IProductFormData>({
    title: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    subcategoryId: "",
    originalPrice: "",
    discountPrice: "",
    stockQuantity: "",
    features: [],
    seoKeywords: [],
    tags: [],
    colors: [],
    sizes: [],
    brand: "",
    returnPolicy: "",
    warranty: "",
    weight: "",
    dimensionLength: "",
    dimensionWidth: "",
    dimensionHeight: "",
    dimensionUnit: "cm",
    material: "",
    images: [],
    isCashOnDeliveryAvailable: true,
    status: "active",
  })

  // --- Data Loading & Filtering ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          categoriesService.getCategories({ limit: 1000, status: "active" }),
          subcategoriesService.getSubcategories({ limit: 1000, status: "active" }),
        ])
        setCategories(categoriesResponse.categories)
        setSubcategories(subcategoriesResponse.subcategories)
      } catch (err: any) {
        setError(err.message || "Failed to load initial data.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter((sub) => {
        const catId = typeof sub.categoryId === "object" ? sub.categoryId._id : sub.categoryId
        return catId === formData.categoryId
      })
      setFilteredSubcategories(filtered)
      if (!filtered.find((sub) => sub._id === formData.subcategoryId)) {
        setFormData((prev) => ({ ...prev, subcategoryId: "" }))
      }
    } else {
      setFilteredSubcategories([])
      setFormData((prev) => ({ ...prev, subcategoryId: "" }))
    }
  }, [formData.categoryId, subcategories])

  // --- Form Input Handlers ---
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

  // --- Array Management Functions ---
  const addFeature = (): void => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({ ...prev, features: [...prev.features, newFeature.trim()] }))
      setNewFeature("")
    }
  }

  const removeFeature = (index: number): void => {
    setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))
  }

  const addKeyword = (): void => {
    if (newKeyword.trim() && !formData.seoKeywords.includes(newKeyword.trim())) {
      setFormData((prev) => ({ ...prev, seoKeywords: [...prev.seoKeywords, newKeyword.trim()] }))
      setNewKeyword("")
    }
  }

  const removeKeyword = (index: number): void => {
    setFormData((prev) => ({ ...prev, seoKeywords: prev.seoKeywords.filter((_, i) => i !== index) }))
  }

  const addTag = (): void => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const removeTag = (index: number): void => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }))
  }

  const addSize = (): void => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, newSize.trim()] }))
      setNewSize("")
    }
  }

  const removeSize = (index: number): void => {
    setFormData((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }))
  }

  const addPredefinedColor = (color: IColorOption): void => {
    if (!formData.colors.find((c) => c.hex === color.hex)) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, color] }))
    }
  }

  const addCustomColor = (): void => {
    if (customColorName.trim() && !formData.colors.find((c) => c.hex === customColorHex)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { name: customColorName.trim(), hex: customColorHex }],
      }))
      setCustomColorName("")
      setCustomColorHex("#000000")
    }
  }

  const removeColor = (index: number): void => {
    setFormData((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }))
  }

  const addCustomDetail = (): void => {
    if (newDetailLabel && newDetailValue) {
      setCustomDetails((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          label: newDetailLabel,
          value: newDetailValue,
        },
      ])
      setNewDetailLabel("")
      setNewDetailValue("")
    }
  }

  const removeCustomDetail = (id: string): void => {
    setCustomDetails((prev) => prev.filter((detail) => detail.id !== id))
  }

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)
    setError(null) // Clear general errors on new submission
    setValidationErrors({}) // Clear validation errors on new submission

    // --- Client-side validation can stay as it is ---
    if (formData.images.length === 0) {
      setError("At least one product image is required.")
      setIsLoading(false)
      return
    }

    // Client-side validation
    if (
      !formData.title ||
      !formData.categoryId ||
      !formData.originalPrice ||
      !formData.stockQuantity ||
      !formData.description
    ) {
      setError("Title, Description, Category, Original Price, and Stock Quantity are required.")
      setIsLoading(false)
      return
    }
    if (formData.images.length === 0) {
      setError("At least one product image is required.")
      setIsLoading(false)
      return
    }

    try {
      // Convert images to Base64
      const imageBase64Promises = formData.images.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })
      const imageBase64Strings = await Promise.all(imageBase64Promises)

      // Construct structured dimensions object
      let dimensionsPayload: IDimensions | undefined = undefined
      const length = Number.parseFloat(formData.dimensionLength)
      const width = Number.parseFloat(formData.dimensionWidth)
      const height = Number.parseFloat(formData.dimensionHeight)

      if (!isNaN(length) && !isNaN(width) && !isNaN(height)) {
        dimensionsPayload = {
          length,
          width,
          height,
          unit: formData.dimensionUnit || "cm",
        }
      }

      // Prepare the final API payload
      const productPayload: ServiceCreateProductData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        originalPrice: Number(formData.originalPrice),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stockQuantity: Number(formData.stockQuantity),
        features: formData.features.length > 0 ? formData.features : undefined,
        colors: formData.colors.length > 0 ? formData.colors.map((c) => c.name) : undefined,
        sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
        brand: formData.brand || undefined,
        seoKeywords: formData.seoKeywords.length > 0 ? formData.seoKeywords : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        returnPolicy: formData.returnPolicy || undefined,
        warranty: formData.warranty || undefined,
        weight: formData.weight || undefined,
        dimensions: dimensionsPayload,
        material: formData.material || undefined,
        images: imageBase64Strings,
        customDetails:
          customDetails.length > 0 ? customDetails.map(({ label, value }) => ({ label, value })) : undefined,
        isCashOnDeliveryAvailable: formData.isCashOnDeliveryAvailable,
        status: formData.status,
      }

      console.log("Sending payload to backend:", JSON.stringify(productPayload, null, 2))

      await productsService.createProduct(productPayload)
      router.push("/admin/products")
    } catch (err: any) {
      // The service now throws the structured error object from the API
      const apiError = err

      // Set the general error message (e.g., "Validation Error")
      setError(apiError.message || "An unexpected error occurred.")

      // Check if there are specific field validation errors
      if (apiError.errors && typeof apiError.errors === "object") {
        // Mongoose sends errors like: { title: { message: "..." } }
        // We transform it into: { title: "..." }
        const newValidationErrors = Object.keys(apiError.errors).reduce(
          (acc, key) => {
            acc[key] = apiError.errors[key].message
            return acc
          },
          {} as Record<string, string>,
        )

        setValidationErrors(newValidationErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminRouteGuard>
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Product</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Create a new product for your inventory.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* --- Main Content Column --- */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>Fill in the basic details for your product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Premium Cotton T-Shirt"
                      value={formData.title}
                      onChange={handleInputChange("title")}
                      required
                      maxLength={200}
                      className={validationErrors.title ? "border-red-500" : ""}
                    />
                    {validationErrors.title && <p className="text-sm text-red-600">{validationErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the product in detail..."
                      className={`min-h-[120px] ${validationErrors.description ? "border-red-500" : ""}`}
                      value={formData.description}
                      onChange={handleInputChange("description")}
                      required
                      maxLength={2000}
                    />
                    {validationErrors.description && (
                      <p className="text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      placeholder="A brief summary for product listings."
                      className="min-h-[60px]"
                      value={formData.shortDescription}
                      onChange={handleInputChange("shortDescription")}
                      maxLength={300}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Features</Label>
                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {feature}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeFeature(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add feature (e.g., Water-resistant, Fast-charging)"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addFeature()
                          }
                        }}
                        maxLength={200}
                      />
                      <Button type="button" size="sm" onClick={addFeature}>
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Properties & Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* --- DIMENSIONS --- */}
                  <div className="space-y-2">
                    <Label>Dimensions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Input
                        placeholder="Length"
                        type="number"
                        value={formData.dimensionLength}
                        onChange={handleInputChange("dimensionLength")}
                        min="0"
                        step="0.01"
                      />
                      <Input
                        placeholder="Width"
                        type="number"
                        value={formData.dimensionWidth}
                        onChange={handleInputChange("dimensionWidth")}
                        min="0"
                        step="0.01"
                      />
                      <Input
                        placeholder="Height"
                        type="number"
                        value={formData.dimensionHeight}
                        onChange={handleInputChange("dimensionHeight")}
                        min="0"
                        step="0.01"
                      />
                      <Select
                        value={formData.dimensionUnit}
                        onValueChange={(val) => setFormData((p) => ({ ...p, dimensionUnit: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="inch">inch</SelectItem>
                          <SelectItem value="mm">mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (e.g., 500g, 1.2kg)</Label>
                      <Input
                        id="weight"
                        placeholder="Specify weight with unit"
                        value={formData.weight}
                        onChange={handleInputChange("weight")}
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        placeholder="e.g., Cotton, Plastic, Metal"
                        value={formData.material}
                        onChange={handleInputChange("material")}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* --- COLOR PICKER --- */}
                  <div className="space-y-2">
                    <Label>Available Colors</Label>
                    {formData.colors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.colors.map((color, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeColor(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Predefined Colors */}
                      <div>
                        <Label className="text-sm font-medium">Quick Colors</Label>
                        <div className="grid grid-cols-6 gap-2 mt-2">
                          {PREDEFINED_COLORS.map((color, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              className="h-10 w-full p-1 flex items-center gap-2"
                              onClick={() => addPredefinedColor(color)}
                              disabled={formData.colors.some((c) => c.hex === color.hex)}
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs truncate">{color.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Color */}
                      <div>
                        <Label className="text-sm font-medium">Custom Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Color name"
                            value={customColorName}
                            onChange={(e) => setCustomColorName(e.target.value)}
                            className="flex-1"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline" className="w-12 h-10 p-1">
                                <div
                                  className="w-full h-full rounded border border-gray-300"
                                  style={{ backgroundColor: customColorHex }}
                                />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                              <div className="space-y-3">
                                <Label>Pick Color</Label>
                                <input
                                  type="color"
                                  value={customColorHex}
                                  onChange={(e) => setCustomColorHex(e.target.value)}
                                  className="w-full h-10 rounded border border-gray-300"
                                />
                                <Input
                                  placeholder="Hex code"
                                  value={customColorHex}
                                  onChange={(e) => setCustomColorHex(e.target.value)}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button type="button" size="sm" onClick={addCustomColor}>
                            <Plus className="h-4 w-4" /> Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- SIZE MANAGEMENT --- */}
                  <div className="space-y-2">
                    <Label>Available Sizes</Label>
                    {formData.sizes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.sizes.map((size, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {size}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeSize(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add size (e.g., XS, S, M, L, XL, 32, 34)"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addSize()
                          }
                        }}
                      />
                      <Button type="button" size="sm" onClick={addSize}>
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">Return Policy</Label>
                    <Input
                      id="returnPolicy"
                      placeholder="e.g., 30-day returns"
                      value={formData.returnPolicy}
                      onChange={handleInputChange("returnPolicy")}
                      maxLength={500}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Warranty</Label>
                    <Input
                      id="warranty"
                      placeholder="e.g., 1 Year Manufacturer Warranty"
                      value={formData.warranty}
                      onChange={handleInputChange("warranty")}
                      maxLength={500}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Custom Specifications</Label>
                    {customDetails.map((detail) => (
                      <div key={detail.id} className="flex items-center gap-2 rounded-md border p-2">
                        <p className="flex-1 text-sm">
                          <span className="font-medium">{detail.label}:</span> {detail.value}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeCustomDetail(detail.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Label (e.g., 'Screen Size')"
                        value={newDetailLabel}
                        onChange={(e) => setNewDetailLabel(e.target.value)}
                        maxLength={50}
                      />
                      <Input
                        placeholder="Value (e.g., '6.1 inches')"
                        value={newDetailValue}
                        onChange={(e) => setNewDetailValue(e.target.value)}
                        maxLength={200}
                      />
                      <Button type="button" size="sm" onClick={addCustomDetail}>
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- Sidebar Column --- */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={handleSelectChange("categoryId")} required>
                      <SelectTrigger className={validationErrors.categoryId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.categoryId && (
                      <p className="text-sm text-red-600">{validationErrors.categoryId}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select
                      value={formData.subcategoryId}
                      onValueChange={handleSelectChange("subcategoryId")}
                      disabled={!formData.categoryId || filteredSubcategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubcategories.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="e.g., Nike, Apple"
                      value={formData.brand}
                      onChange={handleInputChange("brand")}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={handleSelectChange("status")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Stock</CardTitle>
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
                        min="0"
                        className={validationErrors.originalPrice ? "border-red-500" : ""}
                      />
                      {validationErrors.originalPrice && (
                        <p className="text-sm text-red-600">{validationErrors.originalPrice}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPrice">Discount Price</Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        value={formData.discountPrice}
                        onChange={handleInputChange("discountPrice")}
                        min="0"
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
                      min="0"
                      className={validationErrors.stockQuantity ? "border-red-500" : ""}
                    />
                    {validationErrors.stockQuantity && (
                      <p className="text-sm text-red-600">{validationErrors.stockQuantity}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="cashOnDelivery" className="font-medium">
                      Cash on Delivery
                    </Label>
                    <Switch
                      id="cashOnDelivery"
                      checked={formData.isCashOnDeliveryAvailable}
                      onCheckedChange={(c) => setFormData((p) => ({ ...p, isCashOnDeliveryAvailable: c }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Images *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label
                    htmlFor="imageUpload"
                    className="flex items-center justify-center rounded-md border border-dashed p-4 text-center cursor-pointer hover:bg-accent"
                  >
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm font-medium">Click to upload</span>
                    </div>
                  </Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                          <img
                            src={src || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO & Marketing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeTag(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag (e.g., summer, casual)"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                        maxLength={100}
                      />
                      <Button type="button" size="sm" onClick={addTag}>
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>

                  {/* SEO Keywords */}
                  <div className="space-y-2">
                    <Label>SEO Keywords</Label>
                    {formData.seoKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.seoKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {keyword}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeKeyword(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add SEO keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addKeyword()
                          }
                        }}
                        maxLength={100}
                      />
                      <Button type="button" size="sm" onClick={addKeyword}>
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </AdminRouteGuard>
  )
}
