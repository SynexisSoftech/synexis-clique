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
  originalPrice: number; // Tax-inclusive price
  discountPrice?: number; // Tax-inclusive discounted price
  basePrice: number; // Price before tax
  discountBasePrice?: number; // Discounted price before tax
  taxRate: number; // Tax rate (default 13% for Nepal)
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
export type CreateProductData = Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'categoryId' | 'subcategoryId' | 'basePrice' | 'discountBasePrice'> & {
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

function handleApiError(error: any, context: string): never {
  console.error(`Error ${context}:`, error.response?.data || error);

  const errorResponse = error.response?.data;

  // If the backend provides a structured response, throw it directly.
  // This allows the UI to handle it intelligently.
  if (errorResponse && errorResponse.message) {
    // If there's a detailed 'errors' object from Mongoose validation...
    if (errorResponse.errors && typeof errorResponse.errors === 'object') {
      const specificMessages = Object.values<{ message: string }>(errorResponse.errors)
        .map(err => err.message) // Correctly extract the message string
        .join('. ');
      // Combine the main message with specific details
      errorResponse.fullMessage = `${errorResponse.message}: ${specificMessages}`;
    }
    throw errorResponse; // Throw the whole object
  }

  // Fallback for network errors or unexpected error structures
  throw { message: `A network error occurred while ${context}. Please try again.` };
}


class ProductsService {
  private readonly baseUrl = "/api/admin/products";

  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      // ... (your existing params logic)
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
      handleApiError(error, "fetching products");
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, `fetching product ${id}`);
    }
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await apiClient.post(this.baseUrl, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error, "creating a product");
    }
  }

  async updateProduct(data: UpdateProductData): Promise<Product> {
    try {
      const { id, ...updateData } = data;
      const response = await apiClient.put(`${this.baseUrl}/${id}`, updateData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error, `updating product ${data.id}`);
    }
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      // The bug is fixed here by calling the central handler
      handleApiError(error, `deleting product ${id}`);
    }
  }
}
export const productsService = new ProductsService();