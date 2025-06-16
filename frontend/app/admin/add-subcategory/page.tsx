"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { categoriesService, type Category as ParentCategory } from "../../../service/categoryApi"
import { subcategoriesService, type CreateSubcategoryData } from "../../../service/subcategories"
import AdminRouteGuard from "@/app/AdminRouteGuard"

export default function AddSubcategoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // For general errors (e.g., "Parent category not found")
  // New state for field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<ParentCategory[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<CreateSubcategoryData>({
    title: "",
    description: "",
    categoryId: "",
    seoKeywords: "",
    tags: "",
    status: "active",
    image: "", // The image will be a URL string
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await categoriesService.getCategories({
        status: "active",
      })
      setCategories(response.categories)
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setError(err.message || "Failed to load parent categories.")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size should not exceed 10MB.")
        return
      }

      setError(null)
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null) // Clear previous general errors
    setFieldErrors({}) // Clear previous field-specific errors

    if (!formData.categoryId) {
      setError("Please select a parent category.")
      setIsLoading(false)
      return
    }

    try {
      const submitData: CreateSubcategoryData = {
        ...formData,
        image: imagePreview || undefined,
      }

      await subcategoriesService.createSubcategory(submitData)

      router.push("/admin/subcategories") // Redirect on success
    } catch (err: any) {
      console.error("Error creating subcategory:", err)

      // Check if there's a response and data in the response
      if (err.response && err.response.data) {
        const { message, errors } = err.response.data

        if (message === "Validation Error" && errors) {
          // Process Mongoose validation errors to populate fieldErrors state
          const newFieldErrors: Record<string, string> = {}
          for (const key in errors) {
            if (Object.prototype.hasOwnProperty.call(errors, key)) {
              if (errors[key] && errors[key].message) {
                newFieldErrors[key] = errors[key].message
              }
            }
          }
          setFieldErrors(newFieldErrors)
          // Optionally, set a general error message if you still want a top-level alert
          setError("Please correct the errors in the form.")
        } else if (message) {
          // For other backend errors that just send a 'message' field
          setError(message)
        }
      } else if (err.message) {
        // Fallback for network errors or other generic JS errors
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
          {/* Header Section - Enhanced for mobile */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button variant="outline" size="icon" asChild className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                <Link href="/admin/subcategories">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">Add Subcategory</h1>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-1">
                  Create a new subcategory under an existing category.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display - Enhanced for mobile */}
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-3 rounded-lg relative text-sm sm:text-base"
              role="alert"
            >
              <div className="flex items-start space-x-2">
                <strong className="font-semibold shrink-0">Error:</strong>
                <span className="break-words">{error}</span>
              </div>
            </div>
          )}

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Subcategory Information Card */}
              <Card className="w-full">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">Subcategory Information</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Basic details about your subcategory.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5">
                  {/* Parent Category Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm sm:text-base font-medium">
                      Parent Category *
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                      required
                    >
                      <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="no-categories" disabled>
                            No categories available
                          </SelectItem>
                        ) : (
                          categories
                            .filter((category) => category._id && category._id !== "")
                            .map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.title}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.categoryId && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1 break-words">{fieldErrors.categoryId}</p>
                    )}
                  </div>

                  {/* Title Input */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm sm:text-base font-medium">
                      Subcategory Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter subcategory title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full h-10 sm:h-11 text-sm sm:text-base"
                    />
                    {fieldErrors.title && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1 break-words">{fieldErrors.title}</p>
                    )}
                  </div>

                  {/* Description Textarea */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm sm:text-base font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter subcategory description"
                      className="min-h-[100px] sm:min-h-[120px] w-full resize-none text-sm sm:text-base"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      required
                    />
                    {fieldErrors.description && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1 break-words">{fieldErrors.description}</p>
                    )}
                  </div>

                  {/* SEO Keywords and Tags - Stacked on mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seoKeywords" className="text-sm sm:text-base font-medium">
                        SEO Keywords
                      </Label>
                      <Input
                        id="seoKeywords"
                        placeholder="keyword1, keyword2"
                        value={formData.seoKeywords}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoKeywords: e.target.value,
                          }))
                        }
                        className="w-full h-10 sm:h-11 text-sm sm:text-base"
                      />
                      <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
                      {fieldErrors.seoKeywords && (
                        <p className="text-xs sm:text-sm text-red-600 mt-1 break-words">{fieldErrors.seoKeywords}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-sm sm:text-base font-medium">
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        placeholder="tag1, tag2"
                        value={formData.tags}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                        className="w-full h-10 sm:h-11 text-sm sm:text-base"
                      />
                      <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                      {fieldErrors.tags && (
                        <p className="text-xs sm:text-sm text-red-600 mt-1 break-words">{fieldErrors.tags}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm sm:text-base font-medium">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.status && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1 break-words">{fieldErrors.status}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload Card */}
              <Card className="w-full">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">Subcategory Image</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Upload an image to represent this subcategory.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Subcategory preview"
                        className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 sm:h-9 sm:w-9 shadow-lg"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 sm:p-8 text-center">
                      <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                      <div className="mt-4 space-y-2">
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-9 sm:h-10 px-4 sm:px-6 text-sm sm:text-base"
                          >
                            <span>Upload Image</span>
                          </Button>
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                  {fieldErrors.image && (
                    <p className="text-xs sm:text-sm text-red-600 mt-1 break-words">{fieldErrors.image}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons - Enhanced for mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button
                type="submit"
                disabled={isLoading || !formData.categoryId || !formData.title || !formData.description}
                className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base font-medium px-6 sm:px-8"
              >
                {isLoading ? "Creating..." : "Create Subcategory"}
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base font-medium px-6 sm:px-8"
              >
                <Link href="/admin/subcategories">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
