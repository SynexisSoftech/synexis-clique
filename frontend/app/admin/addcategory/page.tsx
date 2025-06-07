"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdminRouteGuard from "../../AdminRouteGuard" // Adjust path as needed
import { categoriesService } from "../../../service/categoryApi" // Adjust path as needed
import { useToast } from "@/hooks/use-toast" // Adjust path as needed

interface ICategoryFormData {
  title: string
  description: string
  seoKeywords: string
  tags: string
  image: File | null // Keep as File for form handling and preview generation
}

export default function AddCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null) // This will hold the base64 data URI
  const [formData, setFormData] = useState<ICategoryFormData>({
    title: "",
    description: "",
    seoKeywords: "",
    tags: "",
    image: null,
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string) // reader.result is the base64 data URI
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (): void => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
    // Also reset the file input if needed
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    if (fileInput) {
        fileInput.value = ""
    }
  }

  const triggerFileInput = (): void => {
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    fileInput?.click()
  }

 // AddCategoryPage.tsx (inside the component)

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
  setIsLoading(true);

  // --- FIX IS HERE ---
  // If imagePreview exists, split it at the comma and take the second part (the actual base64 data).
  // Otherwise, set it to undefined.
  const base64ImageContent = imagePreview ? imagePreview.split(',')[1] : undefined;
  // --- END OF FIX ---

  // Convert comma-separated strings to arrays of strings
  const seoKeywordsArray = formData.seoKeywords
    ? formData.seoKeywords.split(',').map(kw => kw.trim())
    : [];
  const tagsArray = formData.tags
    ? formData.tags.split(',').map(tag => tag.trim())
    : [];

  try {
    await categoriesService.createCategory({
      title: formData.title,
      description: formData.description,
      seoKeywords: seoKeywordsArray.length > 0 ? seoKeywordsArray : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      // Use the corrected variable here
      image: base64ImageContent,
    });

    toast({
      title: "Success",
      description: "Category created successfully",
    });

    router.push("/admin/categories");
  } catch (error) {
    console.error("Error creating category:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create category",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleInputChange =
    (field: keyof Omit<ICategoryFormData, "image">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  return (
    <AdminRouteGuard>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
         {/* <Button variant="outline" size="icon" asChild>
  <Link href="/dashboard/categories">
    <ArrowLeft className="h-4 w-4" />
  </Link>
</Button> */}
<button>
<Link href="/dashboard/categories">
    <ArrowLeft className="h-4 w-4" />
  </Link>
</button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Category</h1>
            <p className="text-muted-foreground">Create a new category for your products.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
                <CardDescription>Basic details about your category.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Category Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter category title"
                    value={formData.title}
                    onChange={handleInputChange("title")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter category description"
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={handleInputChange("description")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">SEO Keywords</Label>
                  <Input
                    id="seoKeywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={formData.seoKeywords}
                    onChange={handleInputChange("seoKeywords")}
                  />
                  <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="tag1, tag2, tag3"
                    value={formData.tags}
                    onChange={handleInputChange("tags")}
                  />
                  <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
                <CardDescription>Upload an image to represent this category.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview} // Use imagePreview for display
                      alt="Category preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <Button type="button" variant="outline" onClick={triggerFileInput}>
                        Upload Image
                      </Button>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <p className="text-sm text-muted-foreground mt-2">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Category"}
            </Button>
           <Button variant="outline" asChild>
  <Link href="/dashboard/categories">Cancel</Link>
</Button>
          </div>
        </form>
      </div>
    </AdminRouteGuard>
  )
}