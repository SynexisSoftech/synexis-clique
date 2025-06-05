// app/dashboard/subcategories/edit/[id]/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { subcategoriesService, Subcategory as ISubcategory } from "../../../../../service/subcategories"; // Renamed to ISubcategory to avoid conflict
import { categoriesService, Category as ICategory } from "../../../../../service/categoryApi"; // Renamed to ICategory
import AdminRouteGuard from "@/app/AdminRouteGuard";

export default function EditSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const subcategoryId = params.id as string; // Get ID from URL params

  const [isLoading, setIsLoading] = useState(true); // Initial loading state for data fetch
  const [isSaving, setIsSaving] = useState(false); // Loading state for form submission
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // To store the new image file

  // Initial state for form data, matches the structure of ISubcategory
  const [formData, setFormData] = useState<ISubcategory>({
    _id: "",
    title: "",
    categoryId: "",
    description: "",
    seoKeywords: "",
    tags: "",
    status: "active",
    image: undefined, // Explicitly set as undefined initially
    createdAt: "", // These fields will be populated from fetched data
    updatedAt: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchCategories();
        if (subcategoryId) {
          await fetchSubcategory(subcategoryId);
        }
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load page data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [subcategoryId]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesService.getCategories({ status: "active" });
      setCategories(response.categories || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      throw new Error("Failed to load parent categories.");
    }
  };

  const fetchSubcategory = async (id: string) => {
    try {
      const subcategory = await subcategoriesService.getSubcategoryById(id);
      // Ensure categoryId is a string if it's an object with _id (populated)
      setFormData({
        ...subcategory,
        categoryId: typeof subcategory.categoryId === 'object' && subcategory.categoryId !== null
          ? subcategory.categoryId._id
          : subcategory.categoryId // If already a string
      });
      if (subcategory.image) {
        setImagePreview(subcategory.image);
      }
    } catch (err: any) {
      console.error("Error fetching subcategory:", err);
      throw new Error("Failed to fetch subcategory details.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Store the new file
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file); // For instant preview
    }
  };

  const removeImage = () => {
    setImageFile(null); // Clear new file selection
    setImagePreview(null); // Remove preview
    setFormData((prev) => ({ ...prev, image: undefined })); // Explicitly set image to undefined for backend to handle
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!formData.categoryId) {
      setError("Please select a parent category.");
      setIsSaving(false);
      return;
    }

    try {
      let imageForUpload: string | null | undefined = undefined; // undefined: no change, string: new image, null: remove image
      if (imageFile) {
        // New image file selected
        const reader = new FileReader();
        const fileToBase64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageForUpload = await fileToBase64Promise;
      } else if (imagePreview === null && formData.image) {
        // Image was present and now removed (imagePreview is null, but formData.image was something)
        imageForUpload = null;
      } else if (imagePreview === formData.image) {
        // Image was present and not changed
        imageForUpload = undefined; // Do not send image data
      }

      const updateData: UpdateSubcategoryData = {
        id: formData._id,
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId as string, // Ensure categoryId is a string
        seoKeywords: formData.seoKeywords,
        tags: formData.tags,
        status: formData.status,
        image: imageForUpload, // Pass the processed image data
      };

      await subcategoriesService.updateSubcategory(updateData);
      router.push("/admin/subcategories");
    } catch (err: any) {
      console.error("Error updating subcategory:", err);
      setError(err.message || "Failed to update subcategory.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminRouteGuard>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading subcategory details...</p>
          </div>
        </div>
      </div>
      </AdminRouteGuard>
    );
  }

  // Handle case where subcategory not found or ID is invalid after initial load
  if (!formData._id && !isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <h2 className="text-xl font-bold">Subcategory Not Found</h2>
        <p className="text-muted-foreground mt-2">The subcategory you are looking for does not exist or has been deleted.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/subcategories">Go to Subcategories List</Link>
        </Button>
      </div>
    );
  }


  return (
    <AdminRouteGuard>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" size="icon" asChild className="w-fit">
          <Link href="/dashboard/subcategories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Subcategory</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Update subcategory information.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Subcategory Information</CardTitle>
              <CardDescription className="text-sm">Update the basic details about your subcategory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Parent Category *
                </Label>
                <Select
                  value={formData.categoryId as string} // Ensure it's a string for the Select component
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Subcategory Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter subcategory title"
                  value={formData.title}
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
                  placeholder="Enter subcategory description"
                  className="min-h-[80px] sm:min-h-[100px] w-full resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={formData.status}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Subcategory Image</CardTitle>
              <CardDescription className="text-sm">Update the image for this subcategory (optional).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Subcategory preview"
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
          <Button type="submit" disabled={isSaving || !formData.categoryId || !formData.title || !formData.description} className="w-full sm:w-auto">
            {isSaving ? "Updating..." : "Update Subcategory"}
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/subcategories">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
    </AdminRouteGuard>
  );
}