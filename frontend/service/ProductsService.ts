import apiClient from "../utils/axiosInstance"; // Adjust path as needed

// --- Interface Definitions Aligned with Mongoose Schema ---

export interface ICustomDetail {
  label: string;
  value: string;
}

export interface IDimensions {
  length: number;
  width: number;
  height: number;
  unit?: string;
}

/**
 * Represents a Product entity, matching the backend IProduct model.
 */
export interface Product {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string | { _id: string; title: string };
  subcategoryId?: string | { _id: string; title: string }; // Optional
  originalPrice: number;
  discountPrice?: number;
  stockQuantity: number;
  features?: string[];
  colors?: string[];
  sizes?: string[];
  brand?: string;
  seoKeywords?: string[];
  tags?: string[];
  returnPolicy?: string;
  warranty?: string;
  weight?: string;
  dimensions?: IDimensions;
  material?: string;
  images: string[]; // Array of image URLs from backend
  customDetails?: ICustomDetail[];
  status: 'active' | 'inactive' | 'out-of-stock';
  isCashOnDeliveryAvailable: boolean;
  createdBy: { _id: string; username: string; email: string };
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new product.
 * `images` is an array of base64 data URIs for upload, as expected by the controller.
 */
export type CreateProductData = Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'categoryId' | 'subcategoryId'> & {
  categoryId: string;
  subcategoryId?: string;
  images: string[]; // Base64 data URIs for new product creation
};


/**
 * Data for updating an existing product. All fields are optional.
 * `images` here are expected to be an array of image URLs, as the controller
 * does not handle base64 re-uploads on the update endpoint.
 */
export type UpdateProductData = Partial<Omit<CreateProductData, 'images'>> & {
  id: string;
  images?: string[]; // Array of image URLs for update
};


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
 * Filters for querying products, matching the backend controller.
 */
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'out-of-stock';
  categoryId?: string;
  subcategoryId?: string;
  brand?: string;
  cod?: boolean; // isCashOnDeliveryAvailable
}

// --- ProductsService Class ---

class ProductsService {
  private readonly baseUrl = "/api/admin/products";

  /**
   * Get all products with filtering and pagination.
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
      if (filters.cod !== undefined) params.append("cod", String(filters.cod));

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
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await apiClient.post(this.baseUrl, data, {
        headers: { "Content-Type": "application/json" },
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
   */
  async updateProduct(data: UpdateProductData): Promise<Product> {
    try {
      const { id, ...updateData } = data;
      const response = await apiClient.put(`${this.baseUrl}/${id}`, updateData, {
        headers: { "Content-Type": "application/json" },
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
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting product ${id}:`, error);
      const message = error.response?.data?.message || "Failed to delete product";
      throw new Error(message);
    }
  }
}

export const productsService = new ProductsService();