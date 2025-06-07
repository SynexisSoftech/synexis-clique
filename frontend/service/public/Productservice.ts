import apiClient from '../../utils/axiosInstance';

export interface ProductDetails {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string | { _id: string; title: string; slug: string };
  subcategoryId?: string | { _id: string; title: string; slug: string };
  originalPrice: number;
  discountPrice?: number;
  finalPrice: number;
  stockQuantity: number;
  features?: string[];
  colors?: string[];
  sizes?: string[];
  brand?: string;
  images: string[];
  status: 'active' | 'inactive' | 'out-of-stock';
  isCashOnDeliveryAvailable: boolean;
  views?: number;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: ProductDetails[];
  page: number;
  pages: number;
  count: number;
}

export interface ProductFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'popular' | 'name' | 'newest';
}
class ProductService {
  /**
   * Get all products (public endpoint)
   * @param params Filtering, sorting, and pagination options
   * @returns Paginated list of products
   */
  static async getAllProducts(params?: ProductFilterOptions) {
    try {
      const response = await apiClient.get<ProductListResponse>('/api/public/products', {
        params
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get product by ID or slug (public endpoint)
   * @param identifier Product ID or slug
   * @returns Product details
   */
  static async getProductById(identifier: string) {
    try {
      const response = await apiClient.get<ProductDetails>(`/api/public/products/${identifier}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get featured products (public endpoint)
   * @param limit Number of products to return
   * @returns Array of featured products
   */
  static async getFeaturedProducts(limit: number = 8) {
    try {
      const response = await apiClient.get<ProductDetails[]>(
        '/api/public/products/featured',
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get products on sale (public endpoint)
   * @param limit Number of products to return
   * @returns Array of products on sale
   */
  static async getProductsOnSale(limit: number = 8) {
    try {
      const response = await apiClient.get<ProductDetails[]>(
        '/api/public/products/on-sale',
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get related products (public endpoint)
   * @param productId ID of the product to find related items for
   * @param limit Number of related products to return
   * @returns Array of related products
   */
  static async getRelatedProducts(productId: string, limit: number = 4) {
    try {
      const response = await apiClient.get<ProductDetails[]>(
        `/api/public/products/${productId}/related`,
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get products by category (public endpoint)
   * @param categoryId Category ID
   * @param params Filtering and pagination options
   * @returns Paginated list of products in category
   */
  static async getProductsByCategory(categoryId: string, params?: ProductFilterOptions) {
    try {
      const response = await apiClient.get<ProductListResponse>(
        `/api/public/products/category/${categoryId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get products by subcategory (public endpoint)
   * @param subcategoryId Subcategory ID
   * @param params Filtering and pagination options
   * @returns Paginated list of products in subcategory
   */
  static async getProductsBySubcategory(subcategoryId: string, params?: ProductFilterOptions) {
    try {
      const response = await apiClient.get<ProductListResponse>(
        `/api/public/products/subcategory/${subcategoryId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ADMIN ENDPOINTS (require authentication)

  /**
   * Create a new product (admin endpoint)
   * @param productData Product data to create
   * @returns Created product details
   */
  static async createProduct(productData: FormData) {
    try {
      const response = await apiClient.post<ProductDetails>(
        '/api/admin/products',
        productData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a product (admin endpoint)
   * @param productId ID of product to update
   * @param productData Updated product data
   * @returns Updated product details
   */
  static async updateProduct(productId: string, productData: FormData | object) {
    try {
      const headers = productData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const response = await apiClient.put<ProductDetails>(
        `/api/admin/products/${productId}`,
        productData,
        { headers }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a product (admin endpoint)
   * @param productId ID of product to delete
   * @returns Success message
   */
  static async deleteProduct(productId: string) {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/api/admin/products/${productId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @param error The error object
   * @returns Formatted error message
   */
  private static handleError(error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || 'An error occurred';
      const status = error.response.status;
      return { message, status, isApiError: true };
    } else if (error.request) {
      // The request was made but no response was received
      return { message: 'No response from server', status: 0, isApiError: true };
    } else {
      // Something happened in setting up the request that triggered an Error
      return { message: error.message, status: 0, isApiError: false };
    }
  }
}

export default ProductService;