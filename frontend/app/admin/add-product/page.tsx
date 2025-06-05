// app/dashboard/products/add/page.tsx (or your equivalent path)
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
import type { ICustomDetail, IProductFormData, ColorOption } from "@/types"; // Ensure correct path to your local types
import { Switch } from "@/components/ui/switch";

// Updated Service Imports
import { productsService, CreateProductData as ServiceCreateProductData } from "../../../service/ProductsService";
import { categoriesService, Category as ServiceCategory } from "../../../service/categoryApi";
import { subcategoriesService, Subcategory as ServiceSubcategory } from "../../../service/subcategories";

import AdminRouteGuard from "@/app/AdminRouteGuard";

const predefinedSizes: string[] = ["XS", "S", "M", "L", "XL", "XXL"];
const predefinedColors: ColorOption[] = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#808080" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
];

// Helper function to parse dimensions string (e.g., "LxWxH")
const parseDimensionsString = (dimensionsStr: string): { length: number; width: number; height: number } | undefined => {
  if (!dimensionsStr) return undefined;
  const parts = dimensionsStr.toLowerCase().split("x");
  if (parts.length === 3) {
    const length = parseFloat(parts[0]);
    const width = parseFloat(parts[1]);
    const height = parseFloat(parts[2]);
    if (!isNaN(length) && !isNaN(width) && !isNaN(height)) {
      return { length, width, height };
    }
  }
  return undefined; // Or throw an error, or handle partial parsing
};


export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]); // Use ServiceCategory
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]); // Use ServiceSubcategory
  const [filteredSubcategories, setFilteredSubcategories] = useState<ServiceSubcategory[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState<string>("");
  const [customSize, setCustomSize] = useState<string>("");
  const [customDetails, setCustomDetails] = useState<ICustomDetail[]>([]);
  const [newDetailLabel, setNewDetailLabel] = useState<string>("");
  const [newDetailValue, setNewDetailValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<IProductFormData>({
    title: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    subcategoryId: "",
    originalPrice: "", // Stored as string, will be converted to number
    discountPrice: "",
    stockQuantity: "", // Stored as string, will be converted to number
    features: "",
    colors: [],
    sizes: [],
    brand: "",
    seoKeywords: "",
    tags: "",
    returnPolicy: "",
    warranty: "",
    weight: "", // Stored as string, will be converted to number or string
    dimensions: "", // Stored as string, e.g., "30x20x10 cm"
    material: "",
    images: [], // Stores File objects
    cashOnDelivery: false,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          categoriesService.getCategories({ limit: 1000, status: "active" }), // Fetch active categories
          subcategoriesService.getSubcategories({ limit: 1000, status: "active" }), // Fetch active subcategories
        ]);
        setCategories(categoriesResponse.categories);
        setSubcategories(subcategoriesResponse.subcategories);
      } catch (err: any) {
        console.error("Error loading categories/subcategories:", err);
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
        // First, check if sub.categoryId exists and is not null
        if (sub.categoryId) {
          if (typeof sub.categoryId === 'string') {
            // If categoryId is a string, compare directly
            return sub.categoryId === formData.categoryId;
          } else if (typeof sub.categoryId === 'object' && sub.categoryId._id) {
            // If categoryId is an object and has an _id property, compare _id
            return sub.categoryId._id === formData.categoryId;
          }
        }
        // If sub.categoryId is null, or an object without _id, or any other unexpected type,
        // it should not be included in the filtered list for the selected category.
        return false;
      });
      setFilteredSubcategories(filtered);

      // Reset subcategory if the selected category doesn't contain the current subcategory
      if (!filtered.find(sub => sub._id === formData.subcategoryId)) {
        setFormData(prev => ({ ...prev, subcategoryId: "" }));
      }
    } else {
      setFilteredSubcategories([]);
      setFormData(prev => ({ ...prev, subcategoryId: "" }));
    }
  }, [formData.categoryId, subcategories, formData.subcategoryId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Store File objects in formData
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));

      // Generate previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => setImagePreviews((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    // Validate required fields first
    if (!formData.title || !formData.categoryId || !formData.description) {
      setError("Title, category, and description are required fields.");
      setIsLoading(false);
      return;
    }

    // Validate original price
    if (formData.originalPrice.trim() === "") {
      setError("Original Price is required.");
      setIsLoading(false);
      return;
    }
    
    const numericOriginalPrice = parseFloat(formData.originalPrice);
    if (isNaN(numericOriginalPrice)) {
      setError("Original Price must be a valid number.");
      setIsLoading(false);
      return;
    }
    
    if (numericOriginalPrice < 0) {
      setError("Original Price cannot be negative.");
      setIsLoading(false);
      return;
    }

    // Validate stock quantity
    if (formData.stockQuantity.trim() === "") {
      setError("Stock Quantity is required.");
      setIsLoading(false);
      return;
    }
    
    const numericStockQuantity = parseInt(formData.stockQuantity, 10);
    if (isNaN(numericStockQuantity)) {
      setError("Stock Quantity must be a valid integer.");
      setIsLoading(false);
      return;
    }
    
    if (numericStockQuantity < 0) {
      setError("Stock Quantity cannot be negative.");
      setIsLoading(false);
      return;
    }

    // Validate discount price if provided
    let numericDiscountPrice: number | null = null;
    if (formData.discountPrice && formData.discountPrice.trim() !== "") {
      numericDiscountPrice = parseFloat(formData.discountPrice);
      if (isNaN(numericDiscountPrice)) {
        setError("Discount Price must be a valid number if provided.");
        setIsLoading(false);
        return;
      }
      
      if (numericDiscountPrice < 0) {
        setError("Discount Price cannot be negative.");
        setIsLoading(false);
        return;
      }
      
      if (numericDiscountPrice >= numericOriginalPrice) {
        setError("Discount Price must be less than Original Price.");
        setIsLoading(false);
        return;
      }
    }

    // Convert images to base64
    const imageBase64Promises = formData.images.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    const imageBase64Strings = await Promise.all(imageBase64Promises);

    // Prepare payload for API
    const productPayload: ServiceCreateProductData = {
      title: formData.title,
      description: formData.description,
      shortDescription: formData.shortDescription || undefined,
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId || undefined,
      originalPrice: numericOriginalPrice,
      discountPrice: numericDiscountPrice,
      stockQuantity: numericStockQuantity,
      features: formData.features || undefined,
      colors: formData.colors.length > 0 ? formData.colors : undefined,
      sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
      brand: formData.brand || undefined,
      seoKeywords: formData.seoKeywords || undefined,
      tags: formData.tags || undefined,
      returnPolicy: formData.returnPolicy || undefined,
      warranty: formData.warranty || undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      dimensions: formData.dimensions || undefined,
      material: formData.material || undefined,
      images: imageBase64Strings,
      customDetails: customDetails.length > 0 ? customDetails : undefined,
      isCashOnDeliveryAvailable: formData.cashOnDelivery,
    };

    await productsService.createProduct(productPayload);
    router.push("/admin/products");
  } catch (err: any) {
    console.error("Error creating product:", err);
    setError(err.message || "Failed to create product. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  // --- Input Handlers (no change, assumed correct) ---
  const handleColorChange = (color: string, checked: boolean): void => {
    setFormData((prev) => ({
      ...prev,
      colors: checked ? [...prev.colors, color] : prev.colors.filter((c) => c !== color),
    }));
  };

  const addCustomColor = (): void => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, customColor],
      }));
      setCustomColor("");
    }
  };

  const handleSizeChange = (size: string, checked: boolean): void => {
    setFormData((prev) => ({
      ...prev,
      sizes: checked ? [...prev.sizes, size] : prev.sizes.filter((s) => s !== size),
    }));
  };

  const addCustomSize = (): void => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, customSize],
      }));
      setCustomSize("");
    }
  };

  const removeColor = (color: string): void => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  const removeSize = (size: string): void => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  const addCustomDetail = (): void => {
    if (newDetailLabel && newDetailValue) {
      const newDetail: ICustomDetail = {
        id: Date.now().toString(), // Client-side ID, might not be needed for backend
        label: newDetailLabel,
        value: newDetailValue,
      };
      setCustomDetails((prev) => [...prev, newDetail]);
      setNewDetailLabel("");
      setNewDetailValue("");
    }
  };

  const removeCustomDetail = (id: string): void => {
    setCustomDetails((prev) => prev.filter((detail) => detail.id !== id));
  };
  const handleInputChange =
    (field: keyof IProductFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleSelectChange =
    (field: keyof IProductFormData) =>
      (value: string): void => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      };

  return (
    <AdminRouteGuard>
    <div className="space-y-6 p-4 sm:p-6 md:p-8"> {/* Added some padding */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products"> {/* Ensure this route is correct */}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Create a new product for your inventory.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Product Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic details about your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={handleSelectChange("categoryId")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 && <SelectItem value="loading" disabled>Loading categories...</SelectItem>}
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}> {/* Use _id */}
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label> {/* Changed to optional based on CreateProductData */}
                <Select
                  value={formData.subcategoryId}
                  onValueChange={handleSelectChange("subcategoryId")}
                  disabled={!formData.categoryId || filteredSubcategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.length === 0 && formData.categoryId && <SelectItem value="no-subcategories" disabled>No subcategories found</SelectItem>}
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory._id} value={subcategory._id}> {/* Use _id */}
                        {subcategory.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Other fields: title, shortDescription, description, brand */}
               <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input id="title" placeholder="Enter product title" value={formData.title} onChange={handleInputChange("title")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea id="shortDescription" placeholder="Brief product description (1-2 sentences)" className="min-h-[60px]" value={formData.shortDescription} onChange={handleInputChange("shortDescription")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea id="description" placeholder="Enter detailed product description" className="min-h-[120px]" value={formData.description} onChange={handleInputChange("description")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" placeholder="Enter brand name" value={formData.brand} onChange={handleInputChange("brand")} />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Stock</CardTitle>
              <CardDescription>Set pricing and inventory details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price *</Label>
                 <Input 
  id="originalPrice" 
  type="number" 
  step="0.01" 
  placeholder="0.00" 
  value={formData.originalPrice} 
  onChange={handleInputChange("originalPrice")} 
  required 
/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price</Label>
                  <Input id="discountPrice" type="number" step="0.01" placeholder="0.00" value={formData.discountPrice} onChange={handleInputChange("discountPrice")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input 
  id="stockQuantity" 
  type="number" 
  placeholder="0" 
  value={formData.stockQuantity} 
  onChange={handleInputChange("stockQuantity")} 
  required 
  min="0"
/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Product Features</Label>
                <Textarea id="features" placeholder="List key features (one per line or comma-separated)" value={formData.features} onChange={handleInputChange("features")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (e.g., in kg)</Label>
                  <Input id="weight" placeholder="e.g., 1.5" value={formData.weight} onChange={handleInputChange("weight")} type="number" step="0.01"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (e.g., LxWxH cm)</Label>
                  <Input id="dimensions" placeholder="e.g., 30x20x10" value={formData.dimensions} onChange={handleInputChange("dimensions")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input id="material" placeholder="e.g., Cotton, Plastic, Metal" value={formData.material} onChange={handleInputChange("material")} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cashOnDelivery" className="text-sm font-medium">Cash on Delivery</Label>
                  <p className="text-xs text-muted-foreground">Allow customers to pay when the product is delivered</p>
                </div>
                <Switch id="cashOnDelivery" checked={formData.cashOnDelivery} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, cashOnDelivery: checked }))} />
              </div>
            </CardContent>
          </Card>

          {/* Colors & Sizes Card (This data is not directly sent by current productsService, needs CreateProductData update) */}
           <Card>
            <CardHeader>
              <CardTitle>Colors & Sizes (Variants)</CardTitle>
              <CardDescription>Select available colors and sizes. (Note: Current service doesn't store this directly. You may need to update `CreateProductData` for variant support).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Colors</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {predefinedColors.map((color) => (
                      <div key={color.name} className="flex items-center space-x-2">
                        <Checkbox id={`color-${color.name}`} checked={formData.colors.includes(color.value)} onCheckedChange={(checked) => handleColorChange(color.value, checked as boolean)} />
                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.value }} />
                        <Label htmlFor={`color-${color.name}`} className="text-sm">{color.name}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="w-12 h-8 p-0 border-0" />
                    <Input placeholder="Custom color hex (e.g., #RRGGBB)" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="flex-1" />
                    <Button type="button" size="sm" onClick={addCustomColor}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map((color) => (
                        <Badge key={color} variant="secondary" className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                          {predefinedColors.find((c) => c.value === color)?.name || color}
                          <Button type="button" variant="ghost" size="icon" className="h-4 w-4" onClick={() => removeColor(color)}><X className="h-3 w-3" /></Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <Label>Sizes</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {predefinedSizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox id={`size-${size}`} checked={formData.sizes.includes(size)} onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)} />
                        <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Add custom size" value={customSize} onChange={(e) => setCustomSize(e.target.value)} className="flex-1" />
                    <Button type="button" size="sm" onClick={addCustomSize}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {formData.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.sizes.map((size) => (
                        <Badge key={size} variant="secondary" className="flex items-center gap-1">
                          {size}
                          <Button type="button" variant="ghost" size="icon" className="h-4 w-4" onClick={() => removeSize(size)}><X className="h-3 w-3" /></Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>


          {/* Product Images Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload images for your product. (Max 5 recommended)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center rounded-md border border-dashed p-4 text-center">
                <Label htmlFor="imageUpload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Click to upload images</span>
                  </div>
                </Label>
                <Input id="imageUpload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <img src={src} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover" />
                      <Button type="button" variant="destructive" size="icon" className="absolute right-1 top-1 h-6 w-6 rounded-full" onClick={() => removeImage(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO & Meta Card */}
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta</CardTitle>
              <CardDescription>Optimize for search engines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Input id="seoKeywords" placeholder="Comma-separated keywords" value={formData.seoKeywords} onChange={handleInputChange("seoKeywords")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" placeholder="Comma-separated tags" value={formData.tags} onChange={handleInputChange("tags")} />
              </div>
            </CardContent>
          </Card>


          {/* Additional Details Card (This data is not directly sent by current productsService) */}
          <Card>
             <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Return policy, warranty, and custom specs. (Note: Current service doesn't store this directly. You may need to update `CreateProductData`).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="returnPolicy">Return Policy</Label>
                  <Textarea id="returnPolicy" placeholder="e.g., 30-day return policy" className="min-h-[60px]" value={formData.returnPolicy} onChange={handleInputChange("returnPolicy")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input id="warranty" placeholder="e.g., 1 year limited warranty" value={formData.warranty} onChange={handleInputChange("warranty")} />
                </div>
                <div className="space-y-4">
                  <Label>Custom Details/Specifications</Label>
                  {customDetails.length > 0 && (
                    <div className="space-y-2">
                      {customDetails.map((detail) => (
                        <div key={detail.id} className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <p className="text-sm font-medium">{detail.label}</p>
                            <p className="text-sm text-muted-foreground">{detail.value}</p>
                          </div>
                          <Button type="button" variant="destructive" size="icon" className="h-7 w-7" onClick={() => removeCustomDetail(detail.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input placeholder="Label (e.g., 'Power')" value={newDetailLabel} onChange={(e) => setNewDetailLabel(e.target.value)} className="flex-1" />
                    <Input placeholder="Value (e.g., '100W')" value={newDetailValue} onChange={(e) => setNewDetailValue(e.target.value)} className="flex-1" />
                    <Button type="button" size="sm" onClick={addCustomDetail}><Plus className="h-4 w-4" /> Add</Button>
                  </div>
                </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}> {/* Ensure this route is correct */}
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formData.title || !formData.categoryId || !formData.originalPrice || !formData.stockQuantity}>
            {isLoading ? "Adding Product..." : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
    </AdminRouteGuard>
  );
}