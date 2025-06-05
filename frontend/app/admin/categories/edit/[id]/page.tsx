// app/dashboard/categories/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
// Import your service and types
import { categoriesService, Category, UpdateCategoryData } from "../../../../../service/categoryApi"
import AdminRouteGuard from "@/app/AdminRouteGuard";

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string // Get ID from URL
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // State for error messages
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({ // Use Partial<Category> for initial state
    // _id will be from the fetched category, not part of form data directly
    title: "",
    description: "",
    seoKeywords: "",
    tags: "",
    status: "active",
    image: undefined, // Initialize as undefined or null
  })

  // State to track if image was changed (new upload) or removed (null)
  const [imageFile, setImageFile] = useState<File | null>(null); // To store the actual file if newly uploaded
  const [imageRemoved, setImageRemoved] = useState<boolean>(false); // To explicitly indicate image removal

  useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId)
    }
  }, [categoryId]) // Depend on categoryId

  const fetchCategory = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const category = await categoriesService.getCategoryById(id)
      // Map fetched data to form data, using _id as id
      setFormData({
        _id: category._id, // Keep the original _id
        title: category.title,
        description: category.description,
        seoKeywords: category.seoKeywords || "",
        tags: category.tags || "",
        status: category.status,
        image: category.image || undefined, // Set existing image URL
      })
      if (category.image) {
        setImagePreview(category.image) // Set preview to existing image
      }
    } catch (err: any) {
      console.error("Error fetching category:", err)
      setError(err.message || "Failed to fetch category details.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file); // Store the actual file
      setImageRemoved(false); // Reset image removed flag
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file) // Read as data URL for preview
    }
  }

  const removeImage = () => {
    setImagePreview(null) // Clear preview
    setImageFile(null); // Clear any newly selected file
    setImageRemoved(true); // Mark for removal
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData._id) {
        setError("Category ID is missing for update.");
        setIsLoading(false);
        return;
    }

    try {
      let imageBase64: string | null | undefined = undefined; // Default: no change

      if (imageRemoved) {
        imageBase64 = null; // Explicitly send null to remove image
      } else if (imageFile) {
        // If a new file is selected, convert it to base64
        const reader = new FileReader();
        const fileToBase64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageBase64 = await fileToBase64Promise;
      }
      // If imageFile is null and not removed, imageBase64 remains undefined, meaning no change to image

      const updateData: UpdateCategoryData = {
        id: formData._id, // Use the actual _id for the service call
        title: formData.title || "",
        description: formData.description || "",
        seoKeywords: formData.seoKeywords,
        tags: formData.tags,
        status: formData.status,
        image: imageBase64, // Pass the base64 string or null/undefined
      }

      await categoriesService.updateCategory(updateData)
      router.push("/admin/categories")
    } catch (err: any) {
      console.error("Error updating category:", err)
      setError(err.message || "Failed to update category.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading category details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64 text-red-500">
          <p className="text-lg">Error: {error}</p>
        </div>
      </div>
    )
  }

  // Handle case where categoryId is not available (e.g., direct access without ID)
  if (!categoryId) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64 text-red-500">
          <p className="text-lg">Category ID is missing.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminRouteGuard>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" size="icon" asChild className="w-fit">
          <Link href="/dashboard/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Update category information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Category Information</CardTitle>
              <CardDescription className="text-sm">Update the basic details about your category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Category Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter category title"
                  value={formData.title || ""} // Ensure value is a string
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter category description"
                  className="min-h-[80px] sm:min-h-[100px] w-full resize-none"
                  value={formData.description || ""} // Ensure value is a string
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={formData.status || "active"} // Default to active if undefined
                  onValueChange={(value: "active" | "inactive") => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords" className="text-sm font-medium">
                    SEO Keywords
                  </Label>
                  <Input
                    id="seoKeywords"
                    placeholder="keyword1, keyword2"
                    value={formData.seoKeywords || ""} // Ensure value is a string
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
                    value={formData.tags || ""} // Ensure value is a string
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Category Image</CardTitle>
              <CardDescription className="text-sm">Update the image for this category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Category preview"
                    className="w-full h-32 sm:h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 sm:h-8 sm:w-8"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm">
                        Upload Image
                      </Button>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Updating..." : "Update Category"}
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/categories">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
    </AdminRouteGuard>
  )
}