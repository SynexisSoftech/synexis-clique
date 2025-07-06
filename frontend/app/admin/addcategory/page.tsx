"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, X, AlertCircle, CheckCircle, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdminRouteGuard from "../../AdminRouteGuard"
import { categoriesService } from "../../../service/categoryApi"
import { useToast } from "@/hooks/use-toast"

interface ICategoryFormData {
  title: string
  description: string
  seoKeywords: string
  tags: string
  image: File | null
}

interface ValidationError {
  field?: string
  message: string
  code?: string
}

interface ApiError {
  message: string
  errors?: ValidationError[]
  status?: number
}

interface FormErrors {
  title?: string
  description?: string
  seoKeywords?: string
  tags?: string
  image?: string
  general?: string
}

export default function AddCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false)
  const [formData, setFormData] = useState<ICategoryFormData>({
    title: "",
    description: "",
    seoKeywords: "",
    tags: "",
    image: null,
  })

  const clearErrors = () => {
    setFormErrors({})
    setApiError(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, image: "Image size must be less than 10MB" }))
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFormErrors((prev) => ({ ...prev, image: "Please select a valid image file" }))
        return
      }

      setIsImageUploading(true)
      setFormErrors((prev) => ({ ...prev, image: undefined }))
      setFormData((prev) => ({ ...prev, image: file }))

      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
        setIsImageUploading(false)
      }
      reader.onerror = () => {
        setFormErrors((prev) => ({ ...prev, image: "Failed to read image file" }))
        setIsImageUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (): void => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
    setFormErrors((prev) => ({ ...prev, image: undefined }))
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const triggerFileInput = (): void => {
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    fileInput?.click()
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.title.trim()) {
      errors.title = "Category title is required"
    } else if (formData.title.length < 2) {
      errors.title = "Category title must be at least 2 characters"
    } else if (formData.title.length > 100) {
      errors.title = "Category title must be less than 100 characters"
    }

    if (!formData.description.trim()) {
      errors.description = "Category description is required"
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters"
    } else if (formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters"
    }

    if (formData.seoKeywords && formData.seoKeywords.length > 200) {
      errors.seoKeywords = "SEO keywords must be less than 200 characters"
    }

    if (formData.tags && formData.tags.length > 200) {
      errors.tags = "Tags must be less than 200 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    clearErrors()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again",
        variant: "error",
      })
      return
    }

    setIsLoading(true)

    const seoKeywordsArray = formData.seoKeywords
      ? formData.seoKeywords
          .split(",")
          .map((kw) => kw.trim())
          .filter((kw) => kw.length > 0)
      : []
    const tagsArray = formData.tags
      ? formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : []

    try {
      await categoriesService.createCategory({
        title: formData.title.trim(),
        description: formData.description.trim(),
        seoKeywords: seoKeywordsArray.length > 0 ? seoKeywordsArray : undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        image: imagePreview ? imagePreview : undefined,
      })

      toast({
        title: "Success",
        description: "Category created successfully",
      })

      router.push("/admin/categories")
    } catch (error: any) {
      console.error("Error creating category:", error)

      const apiError: ApiError = {
        message: error.message || "Failed to create category",
        errors: error.errors || [],
        status: error.status || 500,
      }

      setApiError(apiError)

      // Handle field-specific validation errors
      if (apiError.errors && apiError.errors.length > 0) {
        const fieldErrors: FormErrors = {}

        apiError.errors.forEach((err: ValidationError) => {
          if (err.field) {
            fieldErrors[err.field as keyof FormErrors] = err.message
          }

          // Show individual error toasts for better visibility
          toast({
            title: `Validation Error${err.field ? ` (${err.field})` : ""}`,
            description: err.message,
            variant: "error",
          })
        })

        setFormErrors((prev) => ({ ...prev, ...fieldErrors }))
      } else {
        // General error toast
        toast({
          title: "Error",
          description: apiError.message,
          variant: "error",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange =
    (field: keyof Omit<ICategoryFormData, "image">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      // Clear field-specific error when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  return (
    <AdminRouteGuard>
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href="/admin/categories" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Category</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Create a new category for your products</p>
            </div>
          </div>

          {/* API Error Display */}
          {apiError && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="break-words">
                <div className="font-medium mb-1">Failed to create category</div>
                <div className="text-sm">{apiError.message}</div>
                {apiError.status && <div className="text-xs mt-1 opacity-75">Error Code: {apiError.status}</div>}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Category Information Card */}
              <Card className="w-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Category Information</CardTitle>
                  <CardDescription className="text-sm">Basic details about your category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Title Field */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Category Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter category title"
                      value={formData.title}
                      onChange={handleInputChange("title")}
                      className={`w-full ${formErrors.title ? "border-red-500 focus:border-red-500" : ""}`}
                      required
                    />
                    {formErrors.title && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter category description"
                      className={`min-h-[100px] w-full resize-none ${formErrors.description ? "border-red-500 focus:border-red-500" : ""}`}
                      value={formData.description}
                      onChange={handleInputChange("description")}
                      required
                    />
                    <div className="flex justify-between items-center">
                      {formErrors.description ? (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.description}
                        </p>
                      ) : (
                        <div />
                      )}
                      <span className="text-xs text-muted-foreground">{formData.description.length}/500</span>
                    </div>
                  </div>

                  {/* SEO Keywords Field */}
                  <div className="space-y-2">
                    <Label htmlFor="seoKeywords" className="text-sm font-medium">
                      SEO Keywords
                    </Label>
                    <Input
                      id="seoKeywords"
                      placeholder="keyword1, keyword2, keyword3"
                      value={formData.seoKeywords}
                      onChange={handleInputChange("seoKeywords")}
                      className={`w-full ${formErrors.seoKeywords ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    {formErrors.seoKeywords ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.seoKeywords}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
                    )}
                  </div>

                  {/* Tags Field */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-medium">
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      placeholder="tag1, tag2, tag3"
                      value={formData.tags}
                      onChange={handleInputChange("tags")}
                      className={`w-full ${formErrors.tags ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    {formErrors.tags ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.tags}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Category Image Card */}
              <Card className="w-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Category Image</CardTitle>
                  <CardDescription className="text-sm">Upload an image to represent this category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isImageUploading ? (
                    <div className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Processing image...</p>
                      </div>
                    </div>
                  ) : imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Category preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <div className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4">
                        <ImageIcon className="h-full w-full" />
                      </div>
                      <div className="space-y-2">
                        <Button type="button" variant="outline" onClick={triggerFileInput} className="w-full sm:w-auto">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </Button>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                  {formErrors.image && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.image}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading || isImageUploading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Category
                  </>
                )}
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto order-1 sm:order-2" disabled={isLoading}>
                <Link href="/admin/categories">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
