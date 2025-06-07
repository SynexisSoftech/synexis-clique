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
  const [isImageDirty, setIsImageDirty] = useState<boolean>(false);

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
        setImagePreview(category.image || null);
      } catch (err) {
        toast({ title: "Error", description: "Failed to fetch category data.", variant: "destructive" });
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
      setIsImageDirty(true);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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

    if (isImageDirty) {
      if (imagePreview) {
        payload.image = imagePreview.split(',')[1];
      } else {
        payload.image = null;
      }
    }

    try {
      await categoriesService.updateCategory(categoryId, payload);
      toast({ title: "Success!", description: "Category has been updated." });
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
    return <p>Loading category...</p>;
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
                  <Input id="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={formData.description} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seoKeywords">SEO Keywords (comma-separated)</Label>
                  <Input id="seoKeywords" value={formData.seoKeywords} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" value={formData.tags} onChange={handleInputChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Category preview"
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 mb-2" />
                        <p className="mb-2 text-sm">Click to upload</p>
                        <p className="text-xs">PNG, JPG (MAX. 800x400px)</p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/categories">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AdminRouteGuard>
  );
}