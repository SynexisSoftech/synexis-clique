"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

// --- Service Imports ---
import {
  productsService,
  Product as ServiceProduct,
  UpdateProductData,
  IDimensions,
} from "../../../../../service/ProductsService"; // Adjust path as needed
import {
  categoriesService,
  Category as ServiceCategory,
} from "../../../../../service/categoryApi"; // Adjust path
import {
  subcategoriesService,
  Subcategory as ServiceSubcategory,
} from "../../../../../service/subcategories"; // Adjust path

// --- Local Interface for Form State ---
// Holds form data, converting numbers and arrays to strings for input elements
interface EditProductFormData {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  subcategoryId: string;
  originalPrice: string;
  discountPrice: string;
  stockQuantity: string;
  features: string; // Comma-separated
  tags: string; // Comma-separated
  seoKeywords: string; // Comma-separated
  brand: string;
  returnPolicy: string;
  warranty: string;
  weight: string;
  material: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnit: string;
  status: "active" | "inactive" | "out-of-stock";
  isCashOnDeliveryAvailable: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<ServiceSubcategory[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<EditProductFormData>>({});

  // --- Data Fetching and Form Population ---
  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const [categoriesRes, subcategoriesRes, productRes] = await Promise.all([
          categoriesService.getCategories({ limit: 1000, status: "active" }),
          subcategoriesService.getSubcategories({ limit: 1000, status: "active" }),
          productsService.getProductById(productId),
        ]);

        setCategories(categoriesRes.categories);
        setSubcategories(subcategoriesRes.subcategories);

        // Populate form with fetched product data, converting types for inputs
        setFormData({
          _id: productRes._id,
          title: productRes.title,
          description: productRes.description,
          shortDescription: productRes.shortDescription || "",
          categoryId: typeof productRes.categoryId === 'string' ? productRes.categoryId : productRes.categoryId._id,
          subcategoryId: productRes.subcategoryId ? (typeof productRes.subcategoryId === 'string' ? productRes.subcategoryId : productRes.subcategoryId._id) : "",
          originalPrice: String(productRes.originalPrice),
          discountPrice: productRes.discountPrice ? String(productRes.discountPrice) : "",
          stockQuantity: String(productRes.stockQuantity),
          features: productRes.features?.join(', ') || "",
          tags: productRes.tags?.join(', ') || "",
          seoKeywords: productRes.seoKeywords?.join(', ') || "",
          brand: productRes.brand || "",
          returnPolicy: productRes.returnPolicy || "",
          warranty: productRes.warranty || "",
          weight: productRes.weight || "",
          material: productRes.material || "",
          dimensionLength: String(productRes.dimensions?.length || ""),
          dimensionWidth: String(productRes.dimensions?.width || ""),
          dimensionHeight: String(productRes.dimensions?.height || ""),
          dimensionUnit: productRes.dimensions?.unit || "cm",
          status: productRes.status,
          isCashOnDeliveryAvailable: productRes.isCashOnDeliveryAvailable,
        });

        setExistingImageUrls(productRes.images || []);
      } catch (err: any) {
        setError("Failed to fetch product data. " + err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [productId]);

  // --- Subcategory Filtering ---
  useEffect(() => {
    if (formData.categoryId && subcategories.length > 0) {
      const filtered = subcategories.filter(sub => (typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId) === formData.categoryId);
      setFilteredSubcategories(filtered);
    }
  }, [formData.categoryId, subcategories]);

  // --- Input Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof EditProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof EditProductFormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImageUrls((prev) => prev.filter(url => url !== urlToRemove));
  };


  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData._id) {
      setError("Product ID is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Helper to parse comma-separated strings back to arrays
      const stringToArray = (str: string | undefined): string[] | undefined => {
        if (!str) return undefined;
        const arr = str.split(',').map(item => item.trim()).filter(Boolean);
        return arr.length > 0 ? arr : undefined;
      };
      
      // Construct dimensions object
      let dimensionsPayload: IDimensions | undefined = undefined;
      const length = parseFloat(formData.dimensionLength || "");
      const width = parseFloat(formData.dimensionWidth || "");
      const height = parseFloat(formData.dimensionHeight || "");
      if (!isNaN(length) && !isNaN(width) && !isNaN(height)) {
          dimensionsPayload = { length, width, height, unit: formData.dimensionUnit };
      }

      // Build the final payload matching the service's UpdateProductData interface
      const updatePayload: UpdateProductData = {
        id: formData._id,
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        originalPrice: Number(formData.originalPrice),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stockQuantity: Number(formData.stockQuantity),
        features: stringToArray(formData.features),
        tags: stringToArray(formData.tags),
        seoKeywords: stringToArray(formData.seoKeywords),
        brand: formData.brand,
        returnPolicy: formData.returnPolicy,
        warranty: formData.warranty,
        weight: formData.weight,
        material: formData.material,
        dimensions: dimensionsPayload,
        status: formData.status,
        isCashOnDeliveryAvailable: formData.isCashOnDeliveryAvailable,
        // The update controller expects an array of URLs.
        // We send the list of remaining existing URLs.
        images: existingImageUrls,
      };
      
      console.log("Submitting Payload:", updatePayload);

      await productsService.updateProduct(updatePayload);
      router.push("/admin/products");

    } catch (err: any) {
      setError("Failed to update product. " + (err.message || "Please check console for details."));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-8 text-center">Loading product details...</div>;
  }
  
  if (error && !isFetching && !formData._id) {
     return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground text-sm">{formData.title || "Loading..."}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error: </strong><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Product Title *</Label>
                        <Input id="title" name="title" value={formData.title || ""} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Full Description *</Label>
                        <Textarea id="description" name="description" value={formData.description || ""} onChange={handleInputChange} rows={6} required />
                    </div>
                     <div>
                        <Label htmlFor="shortDescription">Short Description</Label>
                        <Textarea id="shortDescription" name="shortDescription" value={formData.shortDescription || ""} onChange={handleInputChange} rows={3} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Properties</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Label>Dimensions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input name="dimensionLength" placeholder="Length" type="number" value={formData.dimensionLength || ""} onChange={handleInputChange} />
                        <Input name="dimensionWidth" placeholder="Width" type="number" value={formData.dimensionWidth || ""} onChange={handleInputChange} />
                        <Input name="dimensionHeight" placeholder="Height" type="number" value={formData.dimensionHeight || ""} onChange={handleInputChange} />
                         <Select value={formData.dimensionUnit || 'cm'} onValueChange={(val) => handleSelectChange("dimensionUnit", val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cm">cm</SelectItem>
                                <SelectItem value="inch">inch</SelectItem>
                                <SelectItem value="mm">mm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="weight">Weight (e.g., 500g, 1.2kg)</Label>
                           <Input id="weight" name="weight" value={formData.weight || ""} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="material">Material</Label>
                            <Input id="material" name="material" value={formData.material || ""} onChange={handleInputChange} placeholder="e.g., Cotton, Plastic"/>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader><CardTitle>Images</CardTitle></CardHeader>
                 <CardContent>
                    <Label className="block mb-2 text-sm font-medium">Current Images</Label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                         {existingImageUrls.map((url, index) => (
                             <div key={index} className="relative group aspect-square">
                                 <Image src={url} alt={`Existing image ${index + 1}`} layout="fill" className="rounded object-cover" />
                                 <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100" onClick={() => removeExistingImage(url)}>
                                     <X className="h-4 w-4" />
                                 </Button>
                             </div>
                         ))}
                     </div>
                     <p className="text-xs text-muted-foreground mt-4">
                        To add new images, you must first upload them via a dedicated asset manager. The update operation only accepts a list of image URLs.
                     </p>
                 </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="originalPrice">Original Price *</Label>
                            <Input id="originalPrice" name="originalPrice" type="number" step="0.01" value={formData.originalPrice || ""} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="discountPrice">Discount Price</Label>
                            <Input id="discountPrice" name="discountPrice" type="number" step="0.01" value={formData.discountPrice || ""} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                        <Input id="stockQuantity" name="stockQuantity" type="number" step="1" value={formData.stockQuantity || ""} onChange={handleInputChange} required />
                    </div>
                     <div className="flex items-center justify-between pt-2">
                        <Label htmlFor="isCashOnDeliveryAvailable" className="font-medium">Cash on Delivery</Label>
                        <Switch id="isCashOnDeliveryAvailable" checked={formData.isCashOnDeliveryAvailable || false} onCheckedChange={(checked) => handleSwitchChange("isCashOnDeliveryAvailable", checked)} />
                    </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status || "active"} onValueChange={(value) => handleSelectChange("status", value as any)}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="categoryId">Category *</Label>
                        <Select value={formData.categoryId || ""} onValueChange={(value) => handleSelectChange("categoryId", value)} required>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="subcategoryId">Subcategory</Label>
                        <Select value={formData.subcategoryId || ""} onValueChange={(value) => handleSelectChange("subcategoryId", value)} disabled={!formData.categoryId || filteredSubcategories.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                            <SelectContent>
                                {filteredSubcategories.map(sub => <SelectItem key={sub._id} value={sub._id}>{sub.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Input id="brand" name="brand" value={formData.brand || ""} onChange={handleInputChange} />
                    </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader><CardTitle>Details & SEO</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="features">Features (comma-separated)</Label>
                        <Textarea id="features" name="features" value={formData.features || ""} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input id="tags" name="tags" value={formData.tags || ""} onChange={handleInputChange} />
                    </div>
                     <div>
                        <Label htmlFor="seoKeywords">SEO Keywords (comma-separated)</Label>
                        <Input id="seoKeywords" name="seoKeywords" value={formData.seoKeywords || ""} onChange={handleInputChange} />
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-background py-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading || isFetching}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}