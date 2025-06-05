// services/subcategories.ts
import apiClient from "../utils/axiosInstance"; // Adjust path as needed

// Extend the Category interface if needed, or define a new one for Subcategory
// Make sure this matches your backend's ISubcategory model
export interface Subcategory {
  _id: string;
  title: string;
  description: string;
  categoryId: string | { _id: string; title: string }; // Can be populated or just ID
  seoKeywords?: string;
  tags?: string;
  image?: string; // Cloudinary URL from backend
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    username: string;
    email: string;
  };
}

export interface CreateSubcategoryData {
  title: string;
  description: string;
  categoryId: string;
  seoKeywords?: string;
  tags?: string;
  image?: string; // Base64 string for upload
  status?: "active" | "inactive";
}

// For Update, image can be a new base64 string or undefined/null if not changing/removing
export interface UpdateSubcategoryData extends Partial<Omit<CreateSubcategoryData, 'image'>> {
  id: string; // The ID of the subcategory to update
  image?: string | null; // string for new base64, null to remove, undefined to not change
}

export interface SubcategoriesResponse {
  subcategories: Subcategory[];
  page: number;
  pages: number;
  count: number;
}

export interface SubcategoryFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: "active" | "inactive";
  // You might want to add search, sortBy, sortOrder here as well
  // search?: string;
  // sortBy?: "title" | "createdAt" | "updatedAt";
  // sortOrder?: "asc" | "desc";
}

class SubcategoriesService {
  private readonly baseUrl = "/api/admin/subcategories"; // Matches your router path

  /**
   * Get all subcategories with optional filtering and pagination
   */
  async getSubcategories(filters: SubcategoryFilters = {}): Promise<SubcategoriesResponse> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.status) params.append("status", filters.status);
      // Add other filters if your backend supports them (e.g., search, sortBy)

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching subcategories:", error);
      const message = error.response?.data?.message || "Failed to fetch subcategories";
      throw new Error(message);
    }
  }

  /**
   * Get a single subcategory by ID
   */
  async getSubcategoryById(id: string): Promise<Subcategory> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching subcategory ${id}:`, error);
      const message = error.response?.data?.message || "Failed to fetch subcategory";
      throw new Error(message);
    }
  }

  /**
   * Create a new subcategory
   */
  async createSubcategory(data: CreateSubcategoryData): Promise<Subcategory> {
    try {
      const response = await apiClient.post(this.baseUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error creating subcategory:", error);
      const message = error.response?.data?.message || "Failed to create subcategory";
      throw new Error(message);
    }
  }

  /**
   * Update an existing subcategory
   */
  async updateSubcategory(data: UpdateSubcategoryData): Promise<Subcategory> {
    try {
      const { id, ...updateData } = data;
      const response = await apiClient.put(`${this.baseUrl}/${id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating subcategory ${data.id}:`, error);
      const message = error.response?.data?.message || "Failed to update subcategory";
      throw new Error(message);
    }
  }

  /**
   * Delete a subcategory by ID
   */
  async deleteSubcategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting subcategory ${id}:`, error);
      const message = error.response?.data?.message || "Failed to delete subcategory";
      throw new Error(message);
    }
  }

  // Add more methods as needed, e.g., bulk delete, toggle status, etc.
}

// Export a singleton instance
export const subcategoriesService = new SubcategoriesService();