"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

// --- Service Imports ---
import { productsService, CreateProductData as ServiceCreateProductData, IDimensions } from "../../../service/ProductsService";
import { categoriesService, Category as ServiceCategory } from "../../../service/categoryApi"
import { subcategoriesService, Subcategory as ServiceSubcategory } from "../../../service/subcategories";

import AdminRouteGuard from "@/app/AdminRouteGuard"; // Assuming this exists for route protection

// --- Local Interfaces for State Management ---
interface ICustomDetailClient extends ICustomDetail {
  id: string; // Client-side unique ID for list rendering
}

interface ICustomDetail {
    label: string;
    value: string;
}

// This interface holds the form state, mostly as strings from inputs
interface IProductFormData {
  title: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  subcategoryId: string;
  originalPrice: string;
  discountPrice: string;
  stockQuantity: string;
  features: string;
  seoKeywords: string;
  tags: string;
  colors: string[];
  sizes: string[];
  brand: string;
  returnPolicy: string;
  warranty: string;
  weight: string;
  // --- Fields for structured dimensions ---
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnit: string;
  // ---
  material: string;
  images: File[]; // Holds File objects before conversion to base64
  isCashOnDeliveryAvailable: boolean;
}

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<ServiceSubcategory[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [customDetails, setCustomDetails] = useState<ICustomDetailClient[]>([]);
    const [newDetailLabel, setNewDetailLabel] = useState<string>("");
    const [newDetailValue, setNewDetailValue] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<IProductFormData>({
        title: "",
        description: "",
        shortDescription: "",
        categoryId: "",
        subcategoryId: "",
        originalPrice: "",
        discountPrice: "",
        stockQuantity: "",
        features: "",
        seoKeywords: "",
        tags: "",
        colors: [],
        sizes: [],
        brand: "",
        returnPolicy: "",
        warranty: "",
        weight: "",
        dimensionLength: "",
        dimensionWidth: "",
        dimensionHeight: "",
        dimensionUnit: "cm", // Default unit
        material: "",
        images: [],
        isCashOnDeliveryAvailable: true,
    });

    // --- Data Loading & Filtering (No changes needed) ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const [categoriesResponse, subcategoriesResponse] = await Promise.all([
                    categoriesService.getCategories({ limit: 1000, status: "active" }),
                    subcategoriesService.getSubcategories({ limit: 1000, status: "active" }),
                ]);
                setCategories(categoriesResponse.categories);
                setSubcategories(subcategoriesResponse.subcategories);
            } catch (err: any) {
                setError(err.message || "Failed to load initial data.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (formData.categoryId) {
            const filtered = subcategories.filter((sub) => {
                const catId = typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId;
                return catId === formData.categoryId;
            });
            setFilteredSubcategories(filtered);
            if (!filtered.find(sub => sub._id === formData.subcategoryId)) {
                setFormData(prev => ({ ...prev, subcategoryId: "" }));
            }
        } else {
            setFilteredSubcategories([]);
            setFormData(prev => ({ ...prev, subcategoryId: "" }));
        }
    }, [formData.categoryId, subcategories]);


    // --- Form Input & Image Handlers (No changes needed) ---
    const handleInputChange = (field: keyof IProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSelectChange = (field: keyof IProductFormData) => (value: string): void => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = () => setImagePreviews((prev) => [...prev, reader.result as string]);
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number): void => {
        setFormData((prev) => ({
            ...prev, images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const addCustomDetail = (): void => {
      if (newDetailLabel && newDetailValue) {
        setCustomDetails((prev) => [...prev, { id: Date.now().toString(), label: newDetailLabel, value: newDetailValue }]);
        setNewDetailLabel("");
        setNewDetailValue("");
      }
    };
  
    const removeCustomDetail = (id: string): void => {
      setCustomDetails((prev) => prev.filter((detail) => detail.id !== id));
    };


    // --- Form Submission (UPDATED) ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Client-side validation
        if (!formData.title || !formData.categoryId || !formData.originalPrice || !formData.stockQuantity || !formData.description) {
            setError("Title, Description, Category, Original Price, and Stock Quantity are required.");
            setIsLoading(false);
            return;
        }
        if (formData.images.length === 0) {
            setError("At least one product image is required.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. Convert images to Base64
            const imageBase64Promises = formData.images.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            const imageBase64Strings = await Promise.all(imageBase64Promises);

            // 2. Helper to convert comma-separated string to string array
            const stringToArray = (str: string): string[] | undefined => {
                const arr = str.split(',').map(item => item.trim()).filter(Boolean);
                return arr.length > 0 ? arr : undefined;
            };

            // 3. Construct structured dimensions object
            let dimensionsPayload: IDimensions | undefined = undefined;
            const length = parseFloat(formData.dimensionLength);
            const width = parseFloat(formData.dimensionWidth);
            const height = parseFloat(formData.dimensionHeight);

            if (!isNaN(length) && !isNaN(width) && !isNaN(height)) {
                dimensionsPayload = {
                    length,
                    width,
                    height,
                    unit: formData.dimensionUnit || 'cm',
                };
            }

            // 4. Prepare the final API payload
            const productPayload: ServiceCreateProductData = {
                title: formData.title,
                description: formData.description,
                shortDescription: formData.shortDescription || undefined,
                categoryId: formData.categoryId,
                subcategoryId: formData.subcategoryId || undefined,
                originalPrice: Number(formData.originalPrice),
                discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
                stockQuantity: Number(formData.stockQuantity),
                features: stringToArray(formData.features),
                colors: formData.colors.length > 0 ? formData.colors : undefined,
                sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
                brand: formData.brand || undefined,
                seoKeywords: stringToArray(formData.seoKeywords),
                tags: stringToArray(formData.tags),
                returnPolicy: formData.returnPolicy || undefined,
                warranty: formData.warranty || undefined,
                weight: formData.weight || undefined,
                dimensions: dimensionsPayload,
                material: formData.material || undefined,
                images: imageBase64Strings,
                customDetails: customDetails.length > 0 ? customDetails.map(({ label, value }) => ({ label, value })) : undefined,
                isCashOnDeliveryAvailable: formData.isCashOnDeliveryAvailable,
                status: 'active' // Set a default status
            };
            
            console.log("Sending payload to backend:", JSON.stringify(productPayload, null, 2));

            await productsService.createProduct(productPayload);
            router.push("/dashboard/products");

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to create product.";
            setError(errorMessage);
            console.error("Product creation failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminRouteGuard>
            <div className="space-y-6 p-4 sm:p-6 md:p-8">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/products"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Product</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Create a new product for your inventory.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* --- Main Content Column --- */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Information</CardTitle>
                                    <CardDescription>Fill in the basic details for your product.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Product Title *</Label>
                                        <Input id="title" placeholder="e.g., Premium Cotton T-Shirt" value={formData.title} onChange={handleInputChange("title")} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Full Description *</Label>
                                        <Textarea id="description" placeholder="Describe the product in detail..." className="min-h-[120px]" value={formData.description} onChange={handleInputChange("description")} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shortDescription">Short Description</Label>
                                        <Textarea id="shortDescription" placeholder="A brief summary for product listings." className="min-h-[60px]" value={formData.shortDescription} onChange={handleInputChange("shortDescription")} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                               <CardHeader><CardTitle>Properties & Variants</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    {/* --- NEW DIMENSIONS INPUTS --- */}
                                    <div className="space-y-2">
                                        <Label>Dimensions</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Input placeholder="Length" type="number" value={formData.dimensionLength} onChange={handleInputChange("dimensionLength")} />
                                            <Input placeholder="Width" type="number" value={formData.dimensionWidth} onChange={handleInputChange("dimensionWidth")} />
                                            <Input placeholder="Height" type="number" value={formData.dimensionHeight} onChange={handleInputChange("dimensionHeight")} />
                                            <Select value={formData.dimensionUnit} onValueChange={(val) => setFormData(p => ({...p, dimensionUnit: val}))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cm">cm</SelectItem>
                                                    <SelectItem value="inch">inch</SelectItem>
                                                    <SelectItem value="mm">mm</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                          <Label htmlFor="weight">Weight (e.g., 500g, 1.2kg)</Label>
                                          <Input id="weight" placeholder="Specify weight with unit" value={formData.weight} onChange={handleInputChange("weight")} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="material">Material</Label>
                                          <Input id="material" placeholder="e.g., Cotton, Plastic, Metal" value={formData.material} onChange={handleInputChange("material")} />
                                      </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="returnPolicy">Return Policy</Label>
                                        <Input id="returnPolicy" placeholder="e.g., 30-day returns" value={formData.returnPolicy} onChange={handleInputChange("returnPolicy")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="warranty">Warranty</Label>
                                        <Input id="warranty" placeholder="e.g., 1 Year Manufacturer Warranty" value={formData.warranty} onChange={handleInputChange("warranty")} />
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Custom Specifications</Label>
                                        {customDetails.map((detail) => (
                                          <div key={detail.id} className="flex items-center gap-2 rounded-md border p-2">
                                              <p className="flex-1 text-sm"><span className="font-medium">{detail.label}:</span> {detail.value}</p>
                                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCustomDetail(detail.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                          </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <Input placeholder="Label (e.g., 'Screen Size')" value={newDetailLabel} onChange={(e) => setNewDetailLabel(e.target.value)} />
                                            <Input placeholder="Value (e.g., '6.1 inches')" value={newDetailValue} onChange={(e) => setNewDetailValue(e.target.value)} />
                                            <Button type="button" size="sm" onClick={addCustomDetail}><Plus className="h-4 w-4" /> Add</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* --- Sidebar Column --- */}
                        <div className="space-y-6 lg:col-span-1">
                            <Card>
                                <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={formData.categoryId} onValueChange={handleSelectChange("categoryId")} required>
                                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                            <SelectContent>{categories.map((c) => (<SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subcategory">Subcategory</Label>
                                        <Select value={formData.subcategoryId} onValueChange={handleSelectChange("subcategoryId")} disabled={!formData.categoryId || filteredSubcategories.length === 0}>
                                            <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                                            <SelectContent>{filteredSubcategories.map((s) => (<SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="brand">Brand</Label>
                                        <Input id="brand" placeholder="e.g., Nike, Apple" value={formData.brand} onChange={handleInputChange("brand")} />
                                    </div>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="originalPrice">Original Price *</Label>
                                            <Input id="originalPrice" type="number" step="0.01" placeholder="0.00" value={formData.originalPrice} onChange={handleInputChange("originalPrice")} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="discountPrice">Discount Price</Label>
                                            <Input id="discountPrice" type="number" step="0.01" placeholder="Optional" value={formData.discountPrice} onChange={handleInputChange("discountPrice")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                                        <Input id="stockQuantity" type="number" placeholder="0" value={formData.stockQuantity} onChange={handleInputChange("stockQuantity")} required min="0" />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                      <Label htmlFor="cashOnDelivery" className="font-medium">Cash on Delivery</Label>
                                      <Switch id="cashOnDelivery" checked={formData.isCashOnDeliveryAvailable} onCheckedChange={(c) => setFormData((p) => ({ ...p, isCashOnDeliveryAvailable: c }))} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Product Images *</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Label htmlFor="imageUpload" className="flex items-center justify-center rounded-md border border-dashed p-4 text-center cursor-pointer hover:bg-accent">
                                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                          <Upload className="h-6 w-6" />
                                          <span className="text-sm font-medium">Click to upload</span>
                                        </div>
                                    </Label>
                                    <Input id="imageUpload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {imagePreviews.map((src, index) => (
                                                <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                                                    <img src={src} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                                                    <Button type="button" variant="destructive" size="icon" className="absolute right-1 top-1 h-6 w-6 rounded-full" onClick={() => removeImage(index)}><X className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader><CardTitle>SEO & Tags</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input id="tags" placeholder="Comma-separated, e.g., summer, casual" value={formData.tags} onChange={handleInputChange("tags")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seoKeywords">SEO Keywords</Label>
                                        <Input id="seoKeywords" placeholder="Comma-separated keywords" value={formData.seoKeywords} onChange={handleInputChange("seoKeywords")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="features">Features</Label>
                                        <Textarea id="features" placeholder="Comma-separated, e.g., Water-resistant, Fast-charging" value={formData.features} onChange={handleInputChange("features")} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Product"}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminRouteGuard>
    );
}