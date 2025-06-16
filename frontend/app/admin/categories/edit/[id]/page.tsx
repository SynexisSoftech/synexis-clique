"use client"

import { Badge } from "@/components/ui/badge"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, X, AlertCircle, Loader2, CheckCircle2, ImageOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import AdminRouteGuard from "@/app/AdminRouteGuard"
import { categoriesService, type UpdateCategoryPayload, getValidationErrors } from "../../../../../service/categoryApi"
import Image from "next/image"

interface ICategoryEditForm {
  title: string
  description: string
  seoKeywords: string
  tags: string
  status: "active" | "inactive"
}

interface ValidationErrors {
  [key: string]: string[]
}

interface FormErrors {
  title?: string
  description?: string
  seoKeywords?: string
  tags?: string
  image?: string
  general?: string
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ICategoryEditForm>({
    title: "",
    description: "",
    seoKeywords: "",
    tags: "",
    status: "active",
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isImageDirty, setIsImageDirty] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Clear field-specific error when user starts typing
  const clearFieldError = (fieldName: keyof FormErrors) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }))
    }
    if (apiError) {
      setApiError(null)
    }
  }

  useEffect(() => {
    if (!categoryId) return
    const fetchCategoryData = async () => {
      try {
        setApiError(null)
        const category = await categoriesService.getCategoryById(categoryId)
        setFormData({
          title: category.title,
          description: category.description,
          status: category.status,
          seoKeywords: category.seoKeywords?.join(", ") || "",
          tags: category.tags?.join(", ") || "",
        })

        if (category.image) {
          setImagePreview(category.image)
          setCurrentImageUrl(category.image)
        }
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch category data"
        setApiError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        router.push("/admin/categories")
      } finally {
        setIsFetching(false)
      }
    }
    fetchCategoryData()
  }, [categoryId, router, toast])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 2) {
      newErrors.title = "Title must be at least 2 characters"
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    if (formData.seoKeywords && formData.seoKeywords.length > 200) {
      newErrors.seoKeywords = "SEO keywords must be less than 200 characters"
    }

    if (formData.tags && formData.tags.length > 200) {
      newErrors.tags = "Tags must be less than 200 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      clearFieldError("image")

      // Validate file type
      if (!file.type.match("image.*")) {
        const errorMsg = "Please upload an image file (JPEG, PNG, etc.)"
        setErrors((prev) => ({ ...prev, image: errorMsg }))
        toast({
          title: "Invalid file type",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = "Please upload an image smaller than 5MB"
        setErrors((prev) => ({ ...prev, image: errorMsg }))
        toast({
          title: "File too large",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      setImageLoading(true)
      setIsImageDirty(true)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
        setImageLoading(false)
      }
      reader.onerror = () => {
        const errorMsg = "Failed to read image file"
        setErrors((prev) => ({ ...prev, image: errorMsg }))
        setImageLoading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setIsImageDirty(true)
    setImagePreview(null)
    clearFieldError("image")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    clearFieldError(id as keyof FormErrors)
  }

  const handleStatusChange = (value: "active" | "inactive") => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const parseBackendErrors = (error: any): FormErrors => {
    const backendErrors: FormErrors = {}

    if (error?.response?.data?.errors) {
      const validationErrors = error.response.data.errors

      Object.keys(validationErrors).forEach((field) => {
        const fieldErrors = validationErrors[field]
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          backendErrors[field as keyof FormErrors] = fieldErrors[0]
        }
      })
    } else if (error?.response?.data?.message) {
      backendErrors.general = error.response.data.message
    } else if (error?.message) {
      backendErrors.general = error.message
    }

    return backendErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})
    setApiError(null)

    // Frontend validation
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const payload: UpdateCategoryPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      seoKeywords: formData.seoKeywords
        .split(",")
        .map((kw) => kw.trim())
        .filter(Boolean),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    // Image handling - send full base64 if changed
    if (isImageDirty) {
      payload.image = imagePreview || null
    }

    try {
      await categoriesService.updateCategory(categoryId, payload)

      toast({
        title: "Success!",
        description: "Category has been updated successfully.",
        duration: 3000,
      })

      // Small delay to show success message
      setTimeout(() => {
        router.push("/admin/categories")
      }, 1000)
    } catch (error: any) {
      console.error("Update category error:", error)

      // Parse backend validation errors
      const backendErrors = parseBackendErrors(error)
      setErrors(backendErrors)

      // Set general API error
      const generalError = backendErrors.general || "Failed to update category. Please try again."
      setApiError(generalError)

      // Show toast with detailed error information
      const errorMessage = getValidationErrors(error)
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })

      // Show individual field errors as separate toasts
      Object.entries(backendErrors).forEach(([field, message]) => {
        if (field !== "general" && message) {
          setTimeout(() => {
            toast({
              title: `${field.charAt(0).toUpperCase() + field.slice(1)} Error`,
              description: message,
              variant: "destructive",
              duration: 4000,
            })
          }, 500)
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const retryFetch = () => {
    setIsFetching(true)
    setApiError(null)
    window.location.reload()
  }

  if (isFetching) {
    return (
      <AdminRouteGuard>
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Loading category...</p>
              <p className="text-sm text-muted-foreground">Please wait while we fetch the category data</p>
            </div>
          </div>
        </div>
      </AdminRouteGuard>
    )
  }

  return (
    <AdminRouteGuard>
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button variant="outline" size="icon" asChild className="w-10 h-10 flex-shrink-0">
              <Link href="/admin/categories">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">Edit Category</h1>
              <p className="text-sm text-muted-foreground mt-1">Update category information and settings</p>
            </div>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm">{apiError}</span>
                <Button variant="outline" size="sm" onClick={retryFetch} className="w-full sm:w-auto">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Category Information Card */}
              <Card className="w-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Category Information</CardTitle>
                  <CardDescription className="text-sm">Update the basic details of your category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title Field */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className={`w-full ${errors.title ? "border-red-500 focus:border-red-500" : ""}`}
                      placeholder="Enter category title"
                      maxLength={100}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
                  </div>

                  {/* Description Field */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className={`min-h-[100px] sm:min-h-[120px] resize-none ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
                      placeholder="Enter category description"
                      maxLength={500}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{formData.description.length}/500 characters</p>
                  </div>

                  {/* Status Field */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4 text-red-600" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* SEO Keywords Field */}
                  <div className="space-y-2">
                    <Label htmlFor="seoKeywords" className="text-sm font-medium">
                      SEO Keywords
                    </Label>
                    <Input
                      id="seoKeywords"
                      value={formData.seoKeywords}
                      onChange={handleInputChange}
                      placeholder="keyword1, keyword2, keyword3"
                      className={`w-full ${errors.seoKeywords ? "border-red-500 focus:border-red-500" : ""}`}
                      maxLength={200}
                    />
                    {errors.seoKeywords && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.seoKeywords}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Separate keywords with commas ({formData.seoKeywords.length}/200)
                    </p>
                  </div>

                  {/* Tags Field */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-medium">
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="tag1, tag2, tag3"
                      className={`w-full ${errors.tags ? "border-red-500 focus:border-red-500" : ""}`}
                      maxLength={200}
                    />
                    {errors.tags && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.tags}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Separate tags with commas ({formData.tags.length}/200)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload Card */}
              <Card className="w-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Category Image</CardTitle>
                  <CardDescription className="text-sm">
                    {currentImageUrl && !isImageDirty
                      ? "Current image - click to change"
                      : "Upload a new image for this category"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imageLoading ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-muted/50">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Processing image...</p>
                    </div>
                  ) : imagePreview ? (
                    <div className="relative group">
                      <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border bg-muted">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Category preview"
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                          onClick={triggerFileInput}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {isImageDirty && (
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            Modified
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 sm:p-8 cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
                      onClick={triggerFileInput}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <ImageOff className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload image</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {errors.image && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.image}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
              <Button variant="outline" asChild className="w-full sm:w-auto order-2 sm:order-1">
                <Link href="/admin/categories">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
