// app/dashboard/subcategories/add/page.tsx
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
import { useRouter } from "next/navigation";
import { categoriesService, Category as ParentCategory } from "../../../service/categoryApi"; // Import Category from categories service
import { subcategoriesService, CreateSubcategoryData } from "../../../service/subcategories"; // Import Subcategory service and types
import AdminRouteGuard from "@/app/AdminRouteGuard";

export default function AddSubcategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [categories, setCategories] = useState<ParentCategory[]>([]); // Use ParentCategory type
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // To store the actual file

  const [formData, setFormData] = useState<Omit<CreateSubcategoryData, 'image'>>({
    title: "",
    description: "",
    categoryId: "",
    seoKeywords: "",
    tags: "",
    status: "active", // Default status
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Use categoriesService to fetch parent categories
      const response = await categoriesService.getCategories({ status: "active" }); // Fetch only active categories
      setCategories(response.categories);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to load parent categories.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Store the actual file
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file); // Read as data URL for preview
    }
  };

  const removeImage = () => {
    setImageFile(null); // Clear the file
    setImagePreview(null); // Clear the preview
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.categoryId) {
      setError("Please select a parent category.");
      setIsLoading(false);
      return;
    }

    try {
      let imageBase64: string | undefined = undefined;
      if (imageFile) {
        // Convert image file to base64 string
        const reader = new FileReader();
        const fileToBase64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageBase64 = await fileToBase64Promise;
      }

      const submitData: CreateSubcategoryData = {
        ...formData,
        image: imageBase64, // Add the base64 image string
      };

      // Use subcategoriesService to create the subcategory
      await subcategoriesService.createSubcategory(submitData);
      router.push("/dashboard/subcategories"); // Redirect on success
    } catch (err: any) {
      console.error("Error creating subcategory:", err);
      setError(err.message || "Failed to create subcategory.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Subcategory</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Create a new subcategory under an existing category.</p>
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
              <CardDescription className="text-sm">Basic details about your subcategory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Parent Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  required
                >
                  <SelectTrigger className="w-full">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Subcategory Title *</Label>
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
                <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
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
                  <Label htmlFor="seoKeywords" className="text-sm font-medium">SEO Keywords</Label>
                  <Input
                    id="seoKeywords"
                    placeholder="keyword1, keyword2"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="tag1, tag2"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
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
              <CardDescription className="text-sm">Upload an image to represent this subcategory (optional).</CardDescription>
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
          <Button type="submit" disabled={isLoading || !formData.categoryId || !formData.title || !formData.description} className="w-full sm:w-auto">
            {isLoading ? "Creating..." : "Create Subcategory"}
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/admin/subcategories">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
    </AdminRouteGuard>
  );
}