// services/products.ts
import apiClient from "../utils/axiosInstance"; // Adjust path as needed

// --- Interface Definitions ---

/**
 * Represents a Product entity.
 */
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  sku?: string; // Stock Keeping Unit
  stock: number; // Quantity in stock
  categoryId: string | { _id: string; title: string }; // Populated or ID
  subcategoryId?: string | { _id: string; title: string }; // Populated or ID, optional
  brand?: string; // Or an object like: { _id: string; name: string } if Brand is a separate managed entity
  images?: string[]; // Array of image URLs (e.g., Cloudinary URLs from backend)
  status: "active" | "inactive" | "draft"; // Product status
  tags?: string; // Comma-separated tags
  seoKeywords?: string; // Comma-separated SEO keywords
  isFeatured?: boolean;
  weight?: number; // e.g., in kg
  dimensions?: { // e.g., in cm
    length: number;
    width: number;
    height: number;
  };
  // Consider adding:
  // discountPrice?: number;
  // averageRating?: number; (Usually calculated and read-only from client)
  // reviewCount?: number; (Usually calculated and read-only from client)
  // variants?: ProductVariant[]; (For products with options like size/color)
  createdAt: string;
  updatedAt: string;
  createdBy?: { // Information about the user who created the product
    _id: string;
    username: string;
    email: string;
  };
}

/**
 * Data required to create a new product.
 * `images` should be an array of base64 data URIs for upload.
 */
export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string; // ID of the parent category
  subcategoryId?: string; // ID of the parent subcategory (optional)
  sku?: string;
  brand?: string;
  images?: string[]; // Array of base64 data URIs
  status?: "active" | "inactive" | "draft"; // Default to "draft" or "active" as needed
  tags?: string;
  seoKeywords?: string;
  isFeatured?: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

/**
 * Data for updating an existing product.
 * All fields are optional.
 * `images`:
 * - `string[]`: Replace current images with this new set of base64 encoded images.
 * - `null`: Remove all existing images.
 * - `undefined`: No change to images.
 * For more granular image updates (e.g., add/remove specific images without re-uploading all),
 * the backend API might need a different structure (e.g., `addImages?: string[]`, `deleteImageUrls?: string[]`).
 * This interface uses a simpler "replace or remove all" strategy for the `images` field.
 */
export interface UpdateProductData extends Partial<Omit<CreateProductData, 'images'>> {
  id: string; // The ID of the product to update
  images?: string[] | null; // Array of new base64 images, or null to remove all. Undefined means no change.
}

/**
 * Response structure for fetching multiple products with pagination.
 */
export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  count: number;
}

/**
 * Filters for querying products.
 */
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "draft";
  categoryId?: string;
  subcategoryId?: string;
  brand?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "title" | "price" | "stock" | "createdAt" | "updatedAt"; // Add more as needed
  sortOrder?: "asc" | "desc";
}

// --- ProductsService Class ---

class ProductsService {
  private readonly baseUrl = "/api/admin/products"; // Matches router prefix used in other services

  /**
   * Get all products with optional filtering and pagination.
   * Corresponds to: GET /api/admin/products
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.subcategoryId) params.append("subcategoryId", filters.subcategoryId);
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.isFeatured !== undefined) params.append("isFeatured", String(filters.isFeatured));
      if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching products:", error);
      const message = error.response?.data?.message || "Failed to fetch products";
      throw new Error(message);
    }
  }

  /**
   * Get a single product by its ID.
   * Corresponds to: GET /api/admin/products/:id
   */
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching product ${id}:`, error);
      const message = error.response?.data?.message || "Failed to fetch product";
      throw new Error(message);
    }
  }

  /**
   * Create a new product.
   * Corresponds to: POST /api/admin/products
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await apiClient.post(this.baseUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error creating product:", error);
      const message = error.response?.data?.message || "Failed to create product";
      throw new Error(message);
    }
  }

  /**
   * Update an existing product.
   * Corresponds to: PUT /api/admin/products/:id
   */
  async updateProduct(data: UpdateProductData): Promise<Product> {
    try {
      const { id, ...updateData } = data;
      const response = await apiClient.put(`${this.baseUrl}/${id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating product ${data.id}:`, error);
      const message = error.response?.data?.message || "Failed to update product";
      throw new Error(message);
    }
  }

  /**
   * Delete a product by its ID.
   * Corresponds to: DELETE /api/admin/products/:id
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting product ${id}:`, error);
      const message = error.response?.data?.message || "Failed to delete product";
      throw new Error(message);
    }
  }

  /**
   * Bulk delete products by their IDs.
   * Assumes an endpoint like: DELETE /api/admin/products/bulk
   */
  async bulkDeleteProducts(ids: string[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk`, {
        data: { ids }, // Payload for bulk delete
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      console.error("Error bulk deleting products:", error);
      const message = error.response?.data?.message || "Failed to delete products";
      throw new Error(message);
    }
  }

  /**
   * Toggle the status of a product (e.g., active <-> inactive).
   * Assumes an endpoint like: PATCH /api/admin/products/:id/toggle-status
   * The backend should handle the logic of which statuses can be toggled.
   */
  async toggleProductStatus(id: string): Promise<Product> {
    try {
      // This endpoint might require a payload if you want to specify the next status,
      // or it could be a simple toggle handled by the backend.
      // For now, assuming a simple toggle without a payload.
      const response = await apiClient.patch(`${this.baseUrl}/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      console.error(`Error toggling product status for ${id}:`, error);
      const message = error.response?.data?.message || "Failed to toggle product status";
      throw new Error(message);
    }
  }
}

// Export a singleton instance of the service
export const productsService = new ProductsService();