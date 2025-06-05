"use client"; // Ensures this is treated as a client component

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox"; // Not used in this version for core fields
import { Badge } from "@/components/ui/badge"; // Potentially for displaying tags or other multi-value fields
import { ArrowLeft, X, Plus, Trash2 } from "lucide-react"; // Icons
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import Image from "next/image"; // For displaying product images

// --- Service Imports ---
// Ensure these paths are correct relative to your file
import {
  productsService,
  Product as ServiceProduct, // Main product type from service
  UpdateProductData,
  // CreateProductData, // Not used for edit, but good to have if merging add/edit later
} from "../../../../../service/ProductsService"; // Adjusted path

// Assuming CategoryService and SubcategoryService exist and are structured similarly
// You'll need to create these services if they don't exist
import {
  categoriesService,
  Category as ServiceCategory, // Category type from your service
} from "../../../../../service/categoryApi"; // Example path, adjust as needed
import {
  subcategoriesService,
  Subcategory as ServiceSubcategory, // Subcategory type from your service
} from "../../../../../service/subcategories"; // Example path, adjust as needed

// --- Local Interfaces (if needed for form structure beyond service types) ---

// Form data structure - primarily derived from ServiceProduct, but with stringified numbers for inputs
interface EditProductFormData {
  _id: string;
  title: string;
  description: string;
  price: string; // Stored as string in form, converted to number on submit
  sku?: string;
  stock: string; // Stored as string in form, converted to number on submit
  categoryId: string;
  subcategoryId?: string;
  brand?: string;
  status: "active" | "inactive" | "draft";
  tags?: string; // Comma-separated
  seoKeywords?: string; // Comma-separated
  isFeatured?: boolean;
  weight?: string; // Stored as string, converted to number
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  // The following fields were in your original EditProductFormData
  // They are not part of the standard ServiceProduct based on the previous example.
  // If they ARE part of your ServiceProduct or UpdateProductData, uncomment and use them.
  // Otherwise, they are form-only fields unless your backend service is updated.
  // shortDescription?: string;
  // discountPrice?: string;
  // features?: string;
  // returnPolicy?: string;
  // warranty?: string;
  // material?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isFetchingProduct, setIsFetchingProduct] = useState(true); // For initial product load
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<ServiceSubcategory[]>([]);

  // Image management
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // URLs from fetched product
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]); // Base64 for new images to upload

  const [formData, setFormData] = useState<Partial<EditProductFormData>>({
    title: "",
    description: "",
    price: "0",
    stock: "0",
    categoryId: "",
    status: "draft",
    isFeatured: false,
    dimensions: { length: "0", width: "0", height: "0" },
  });
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingProduct(true);
      setError(null);
      try {
        // Fetch categories and subcategories using services
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          categoriesService.getCategories({ limit: 1000, status: "active" }), // Assuming getCategories supports params
          subcategoriesService.getSubcategories({ limit: 1000, status: "active" }), // Assuming getSubcategories supports params
        ]);

        setCategories(categoriesResponse.categories || []); // Adjust based on actual service response structure
        setSubcategories(subcategoriesResponse.subcategories || []); // Adjust based on actual service response structure

        if (productId) {
          const product = await productsService.getProductById(productId);
          setFormData({
            _id: product._id,
            title: product.title,
            description: product.description,
            price: product.price.toString(),
            sku: product.sku,
            stock: product.stock.toString(),
            // Ensure categoryId and subcategoryId are correctly assigned as strings
            categoryId: typeof product.categoryId === 'string' ? product.categoryId : product.categoryId._id,
            subcategoryId: product.subcategoryId ? (typeof product.subcategoryId === 'string' ? product.subcategoryId : product.subcategoryId._id) : undefined,
            brand: product.brand,
            status: product.status,
            tags: product.tags, // Assuming tags is a string. If array, .join(', ')
            seoKeywords: product.seoKeywords, // Assuming seoKeywords is a string. If array, .join(', ')
            isFeatured: product.isFeatured || false,
            weight: product.weight?.toString() || "",
            dimensions: product.dimensions
              ? {
                  length: product.dimensions.length.toString(),
                  width: product.dimensions.width.toString(),
                  height: product.dimensions.height.toString(),
                }
              : { length: "", width: "", height: "" },
          });
          setExistingImageUrls(product.images || []);
        }
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
        setError(err.message || "Failed to load data. Please try again.");
        // Optionally redirect or show a more prominent error
      } finally {
        setIsFetchingProduct(false);
      }
    };

    fetchData();
  }, [productId]);

  useEffect(() => {
    if (formData.categoryId && subcategories.length > 0) {
      const filtered = subcategories.filter(
        (sub) => (typeof sub.categoryId === 'string' ? sub.categoryId : sub.categoryId?._id) === formData.categoryId
      );
      setFilteredSubcategories(filtered);

      // Optional: Reset subcategory if current one doesn't belong to the new category
      if (formData.subcategoryId && !filtered.find(s => s._id === formData.subcategoryId)) {
        setFormData(prev => ({ ...prev, subcategoryId: undefined }));
      }

    } else {
      setFilteredSubcategories([]);
      if (formData.categoryId) { // If category is selected but no subcategories loaded yet or match
         setFormData(prev => ({ ...prev, subcategoryId: undefined }));
      }
    }
  }, [formData.categoryId, subcategories, formData.subcategoryId]); // Added formData.subcategoryId to deps for reset logic

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // name will be "length", "width", or "height"
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions!,
        [name]: value,
      },
    }));
  };

  const handleSelectChange = (name: keyof EditProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "categoryId") {
        // When category changes, reset subcategory field
        setFormData((prevForm) => ({ ...prevForm, subcategoryId: "" }));
    }
  };

  const handleSwitchChange = (name: keyof EditProductFormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentNewPreviews = [...newImagePreviews]; // operate on a copy
      let filesProcessed = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          currentNewPreviews.push(reader.result as string);
          filesProcessed++;
          if (filesProcessed === files.length) { // All files read
            setNewImagePreviews(currentNewPreviews);
          }
        };
        reader.onerror = () => {
            filesProcessed++; // count error as processed to not hang
            console.error("Error reading file");
            if (filesProcessed === files.length) {
              setNewImagePreviews(currentNewPreviews); // update with successfully read files
            }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImagePreview = (index: number) => {
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrlToRemove: string) => {
    // This removes the image from the displayed existing images.
    // The handleSubmit logic will determine how this translates to the API call.
    setExistingImageUrls((prev) => prev.filter(url => url !== imageUrlToRemove));
    // User needs to save to make this permanent.
    // alert("Image removed from list. Save changes to make it permanent. If no new images are added and this was the last image, all images will be cleared.");
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !formData._id) {
      setError("Product ID is missing. Cannot update.");
      return;
    }
    // Basic Validations (add more as needed)
    if (!formData.title?.trim()) {
        setError("Product Title is required.");
        return;
    }
    if (!formData.categoryId) {
        setError("Category is required.");
        return;
    }
    if (isNaN(parseFloat(formData.price || "")) || parseFloat(formData.price || "") < 0) {
        setError("Valid Price is required.");
        return;
    }
     if (isNaN(parseInt(formData.stock || "", 10)) || parseInt(formData.stock || "", 10) < 0) {
        setError("Valid Stock Quantity is required.");
        return;
    }

    setIsLoading(true);
    setError(null);

    const updatePayload: UpdateProductData = {
      id: formData._id,
      title: formData.title!,
      description: formData.description!,
      price: parseFloat(formData.price || "0"),
      stock: parseInt(formData.stock || "0", 10),
      categoryId: formData.categoryId!,
      ...(formData.subcategoryId && { subcategoryId: formData.subcategoryId }),
      ...(formData.sku && { sku: formData.sku }),
      ...(formData.brand && { brand: formData.brand }),
      status: formData.status || "draft",
      ...(formData.tags && { tags: formData.tags }), // Assuming service expects string
      ...(formData.seoKeywords && { seoKeywords: formData.seoKeywords }), // Assuming service expects string
      isFeatured: formData.isFeatured || false,
      ...(formData.weight && parseFloat(formData.weight) && !isNaN(parseFloat(formData.weight)) && { weight: parseFloat(formData.weight) }),
      ...(formData.dimensions && {
        dimensions: {
          length: parseFloat(formData.dimensions.length || "0"),
          width: parseFloat(formData.dimensions.width || "0"),
          height: parseFloat(formData.dimensions.height || "0"),
        },
      }),
    };

    // Image handling strategy:
    // 1. If new images are added, they replace ALL existing images. Send new base64s.
    // 2. If no new images are added, but ALL existing images were removed by the user, send `null` to clear images.
    // 3. If no new images are added, and some existing images remain, send `undefined` to make no changes to images.
    if (newImagePreviews.length > 0) {
      updatePayload.images = newImagePreviews;
    } else if (existingImageUrls.length === 0 && newImagePreviews.length === 0) { // All images (existing and new) are gone
      updatePayload.images = null; // Signal to backend to remove all images
    } else {
      // No new images were added, and some existing ones might still be there (or all if none were touched).
      // To keep the remaining existing images (if any), we send undefined for the 'images' field
      // This assumes the backend won't clear images if the field is not present in the payload.
      // If your backend *requires* existing image URLs to be sent back to preserve them, this logic needs adjustment.
      updatePayload.images = undefined;
    }

    try {
      await productsService.updateProduct(updatePayload);
      router.push("/dashboard/products"); // Navigate back to products list
      // Consider adding a success toast/message here
    } catch (err: any) {
      console.error("Error updating product:", err);
      setError(err.message || "Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProduct) {
    return <div className="container mx-auto p-6 text-center">Loading product details...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" size="icon" asChild className="w-fit">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Update information for: {formData.title || "product..."}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Update basic details about your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <Input id="title" name="title" value={formData.title || ""} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" name="description" value={formData.description || ""} onChange={handleInputChange} rows={5} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryId">Category *</Label>
                    <Select value={formData.categoryId || ""} onValueChange={(value) => handleSelectChange("categoryId", value)} required>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                        {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subcategoryId">Subcategory</Label>
                    <Select value={formData.subcategoryId || ""} onValueChange={(value) => handleSelectChange("subcategoryId", value)} disabled={!formData.categoryId || filteredSubcategories.length === 0}>
                      <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                      <SelectContent>
                        {filteredSubcategories.length === 0 && formData.categoryId && <SelectItem value="no-subs" disabled>No subcategories</SelectItem>}
                        {filteredSubcategories.map(sub => <SelectItem key={sub._id} value={sub._id}>{sub.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" name="brand" value={formData.brand || ""} onChange={handleInputChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price || ""} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input id="stock" name="stock" type="number" step="1" value={formData.stock || ""} onChange={handleInputChange} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                  <Input id="sku" name="sku" value={formData.sku || ""} onChange={handleInputChange} />
                </div>
              </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle>Images</CardTitle></CardHeader>
                <CardContent>
                    <Label htmlFor="images">Add New Images</Label>
                    <Input id="images" type="file" multiple onChange={handleImageUpload} accept="image/*" className="mb-4" />
                    
                    {newImagePreviews.length > 0 && <Label className="block mb-2 text-sm font-medium">New Images Preview:</Label>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                        {newImagePreviews.map((previewUrl, index) => (
                            <div key={`new-${index}`} className="relative group aspect-square">
                                <Image src={previewUrl} alt={`New preview ${index + 1}`} layout="fill" className="rounded object-cover" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100 z-10" onClick={() => removeNewImagePreview(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {existingImageUrls.length > 0 && <Label className="block mb-2 text-sm font-medium">Current Images:</Label>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {existingImageUrls.map((imageUrl, index) => (
                            <div key={`existing-${index}`} className="relative group aspect-square">
                                <Image src={imageUrl} alt={`Existing image ${index + 1}`} layout="fill" className="rounded object-cover" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100 z-10" onClick={() => removeExistingImage(imageUrl)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Adding new images will replace all current images upon saving.
                        To remove all images, clear new and current images, then save.
                    </p>
                </CardContent>
            </Card>
          </div>

          {/* Right Column - Organization & Advanced */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status || "draft"} onValueChange={(value) => handleSelectChange("status", value as "active" | "inactive" | "draft")}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" value={formData.tags || ""} onChange={handleInputChange} />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="isFeatured" checked={formData.isFeatured || false} onCheckedChange={(checked) => handleSwitchChange("isFeatured", checked)} />
                  <Label htmlFor="isFeatured" className="cursor-pointer">Featured Product</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Shipping & SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" name="weight" type="number" step="0.01" value={formData.weight || ""} onChange={handleInputChange} />
                </div>
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input name="length" placeholder="L" type="number" step="0.1" value={formData.dimensions?.length || ""} onChange={handleDimensionChange} />
                  <Input name="width" placeholder="W" type="number" step="0.1" value={formData.dimensions?.width || ""} onChange={handleDimensionChange} />
                  <Input name="height" placeholder="H" type="number" step="0.1" value={formData.dimensions?.height || ""} onChange={handleDimensionChange} />
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
          <Button type="submit" disabled={isLoading || isFetchingProduct}>
            {isLoading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}