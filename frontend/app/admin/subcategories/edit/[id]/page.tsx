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
import { categoriesService, Category as ParentCategory } from "../../../../../service/categoryApi"; // Adjust path
import { subcategoriesService, UpdateSubcategoryData } from "../../../../../service/subcategories"; // Adjust path
import AdminRouteGuard from "@/app/AdminRouteGuard";

export default function EditSubcategoryPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // State to hold field-specific validation errors
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [categories, setCategories] = useState<ParentCategory[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isRemovingImage, setIsRemovingImage] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        seoKeywords: "",
        tags: "",
        status: "active" as "active" | "inactive",
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null); // Clear any previous errors on load
            try {
                const catResponse = await categoriesService.getCategories({ status: "active" });
                setCategories(catResponse.categories);

                if (id) {
                    const subcategory = await subcategoriesService.getSubcategoryById(id);
                    setFormData({
                        title: subcategory.title,
                        description: subcategory.description,
                        categoryId: typeof subcategory.categoryId === 'string' ? subcategory.categoryId : subcategory.categoryId._id,
                        seoKeywords: subcategory.seoKeywords || '',
                        tags: subcategory.tags || '',
                        status: subcategory.status,
                    });
                    if (subcategory.image) {
                        setImagePreview(subcategory.image);
                    }
                }
            } catch (err: any) {
                // Initial data fetch errors are general, so we set the main error state
                setError(err.response?.data?.message || err.message || "Failed to load initial data.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError("File size must be under 10MB.");
                return;
            }
            setError(null);
            setImageFile(file);
            setIsRemovingImage(false);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setIsRemovingImage(true);
        const fileInput = document.getElementById("image-upload") as HTMLInputElement;
        if(fileInput) fileInput.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null); // Clear general error
        setFieldErrors({}); // Clear field-specific errors

        if (!formData.categoryId) {
            setError("Please select a parent category.");
            setIsLoading(false);
            return;
        }

        try {
            const submitData: UpdateSubcategoryData = {
                id,
                ...formData
            };

            if (imageFile) {
                submitData.image = imagePreview;
            } else if (isRemovingImage) {
                submitData.image = null;
            }
            // If neither, `submitData` will NOT have an `image` key,
            // signaling the backend not to change the image.

            await subcategoriesService.updateSubcategory(submitData);
            
            router.push("/admin/subcategories"); 

        } catch (err: any) {
            console.error("Error updating subcategory:", err);
            
            // --- UPDATED ERROR HANDLING LOGIC ---
            if (err.response) {
                const { message, errors } = err.response.data || {}; // Destructure message and errors
                
                if (err.response.status === 400 && errors) {
                    // This is likely a validation error from the backend
                    const newFieldErrors: Record<string, string> = {};
                    for (const key in errors) {
                        if (Object.prototype.hasOwnProperty.call(errors, key)) {
                            // Assuming backend sends { fieldName: { message: "error message" } }
                            newFieldErrors[key] = errors[key].message || `Invalid value for ${key}`;
                        }
                    }
                    setFieldErrors(newFieldErrors);
                    // Set a general error message for validation issues
                    setError(message || "Please correct the highlighted errors.");
                } else {
                    // Other types of backend errors (e.g., 404, 500, or a general 400 without specific field errors)
                    setError(message || `An error occurred: ${err.response.status}`);
                }
            } else if (err.request) {
                // The request was made but no response was received (e.g., network error)
                setError("Network error: Please check your internet connection.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`An unexpected error occurred: ${err.message || "Failed to update subcategory."}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !formData.title) return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">Loading editor...</div>;
    if (!id) return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">Invalid subcategory ID.</div>;

    return (
        <AdminRouteGuard>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button variant="outline" size="icon" asChild className="w-fit">
                        <Link href="/admin/subcategories">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Subcategory</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Update the details for this subcategory.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Column 1: Subcategory Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg sm:text-xl">Subcategory Information</CardTitle>
                                <CardDescription className="text-sm">Update basic details about your subcategory.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-medium">Parent Category *</Label>
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(value) => {
                                            setFormData((prev) => ({ ...prev, categoryId: value }));
                                            setFieldErrors((prev) => ({ ...prev, categoryId: undefined })); // Clear error on change
                                        }}
                                        required
                                    >
                                        <SelectTrigger className={fieldErrors.categoryId ? "border-red-500" : ""}><SelectValue placeholder="Select a category" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category._id} value={category._id}>
                                                    {category.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.categoryId && <p className="text-red-500 text-xs mt-1">{fieldErrors.categoryId}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium">Subcategory Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter subcategory title"
                                        value={formData.title}
                                        onChange={(e) => {
                                            setFormData((prev) => ({ ...prev, title: e.target.value }));
                                            setFieldErrors((prev) => ({ ...prev, title: undefined })); // Clear error on change
                                        }}
                                        required
                                        className={fieldErrors.title ? "border-red-500" : ""}
                                    />
                                    {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter subcategory description"
                                        className={`min-h-[80px] resize-none ${fieldErrors.description ? "border-red-500" : ""}`}
                                        value={formData.description}
                                        onChange={(e) => {
                                            setFormData((prev) => ({ ...prev, description: e.target.value }));
                                            setFieldErrors((prev) => ({ ...prev, description: undefined })); // Clear error on change
                                        }}
                                        required
                                    />
                                    {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="seoKeywords" className="text-sm font-medium">SEO Keywords</Label>
                                        <Input
                                            id="seoKeywords"
                                            placeholder="keyword1, keyword2"
                                            value={formData.seoKeywords}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                                        />
                                        <p className="text-xs text-muted-foreground">Separate with commas</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                                        <Input
                                            id="tags"
                                            placeholder="tag1, tag2"
                                            value={formData.tags}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                                        />
                                        <p className="text-xs text-muted-foreground">Separate with commas</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: "active" | "inactive") => setFormData((prev) => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Column 2: Image Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg sm:text-xl">Subcategory Image</CardTitle>
                                <CardDescription className="text-sm">Update the image for this subcategory.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Subcategory preview"
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
                                            <span className="sr-only">Remove Image</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                        <div className="mt-4 flex flex-col items-center">
                                            <Label htmlFor="image-upload" className="cursor-pointer inline-block">
                                                <Button type="button" variant="outline" asChild>
                                                    <span>Upload Image</span>
                                                </Button>
                                            </Label>
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? "Updating..." : "Update Subcategory"}
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