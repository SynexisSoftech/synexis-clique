"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import AdminRouteGuard from "@/app/AdminRouteGuard";
import { categoriesService, UpdateCategoryPayload, getValidationErrors } from "../../../../../service/categoryApi";
import Image from "next/image";

interface ICategoryEditForm {
  title: string;
  description: string;
  seoKeywords: string;
  tags: string;
  status: "active" | "inactive";
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [formData, setFormData] = useState<ICategoryEditForm>({
    title: "",
    description: "",
    seoKeywords: "",
    tags: "",
    status: "active",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageDirty, setIsImageDirty] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
 const fileInputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!categoryId) return;
    const fetchCategoryData = async () => {
      try {
        const category = await categoriesService.getCategoryById(categoryId);
        setFormData({
          title: category.title,
          description: category.description,
          status: category.status,
          seoKeywords: category.seoKeywords?.join(", ") || "",
          tags: category.tags?.join(", ") || "",
        });
        
        if (category.image) {
          setImagePreview(category.image);
          setCurrentImageUrl(category.image); // Store the original URL
        }
      } catch (err) {
        toast({ 
          title: "Error", 
          description: "Failed to fetch category data.", 
          variant: "destructive" 
        });
        router.push("/admin/categories");
      } finally {
        setIsFetching(false);
      }
    };
    fetchCategoryData();
  }, [categoryId, router, toast]);



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setIsImageDirty(true);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setIsImageDirty(true);
    setImagePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleStatusChange = (value: "active" | "inactive") => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: UpdateCategoryPayload = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      seoKeywords: formData.seoKeywords.split(',').map(kw => kw.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    // Image handling - send full base64 if changed
    if (isImageDirty) {
      payload.image = imagePreview || null; // Send full data URI or null if removed
    }

    try {
      await categoriesService.updateCategory(categoryId, payload);
      toast({ 
        title: "Success!", 
        description: "Category has been updated." 
      });
      router.push("/admin/categories");
    } catch (error: any) {
      const errorMessage = getValidationErrors(error);
      toast({
        title: "Update Failed",
        description: <div style={{ whiteSpace: 'pre-line' }}>{errorMessage}</div>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading category...</p>
    </div>;
  }

  return (
    <AdminRouteGuard>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Category</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input 
                    id="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                    className="min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seoKeywords">SEO Keywords (comma-separated)</Label>
                  <Input 
                    id="seoKeywords" 
                    value={formData.seoKeywords} 
                    onChange={handleInputChange} 
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input 
                    id="tags" 
                    value={formData.tags} 
                    onChange={handleInputChange} 
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </CardContent>
            </Card>

          <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
                <CardDescription>
                  {currentImageUrl && !isImageDirty 
                    ? "Current image" 
                    : "Upload a new image"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="relative group">
                    <Image
                      src={imagePreview}
                      alt="Category preview"
                      width={600}
                      height={400}
                      className="w-full h-64 object-contain rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-2">Click to upload</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminRouteGuard>
  );
}