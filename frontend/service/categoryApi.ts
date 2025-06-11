


// services/categories.ts
import apiClient from "../utils/axiosInstance" // Adjust path as needed

// Types for category data
export interface Category {
  _id: string
  title: string
  description: string
  seoKeywords?: string
  tags?: string
  image?: string // This will be the Cloudinary URL from the backend
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  createdBy?: {
    _id: string
    username: string
    email: string
  }
}

export interface CreateCategoryData {
  title: string
  description: string
  seoKeywords?: string
  tags?: string
  image?: string // Changed from File to string (to send base64 data URI)
  status?: "active" | "inactive"
}
export interface CreateCategoryPayload {
  title: string
  description: string
  seoKeywords?: string[] // CORRECTED
  tags?: string[]        // CORRECTED
  image?: string         // Base64 string
  status?: "active" | "inactive"
}
// For Update, image can be a new base64 string or undefined/null if not changing/removing
export type UpdateCategoryPayload = Partial<Omit<CreateCategoryPayload, 'image'>> & {
    image?: string | null; // string (base64) | null (remove) | undefined (no change)
}

export interface CategoriesResponse {
  categories: Category[]
  page: number
  pages: number
  count: number
}

export interface CategoryFilters {
  page?: number
  limit?: number
  search?: string
  status?: "active" | "inactive"
  sortBy?: "title" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}

class CategoriesService {
  private readonly baseUrl = "/api/admin/categories" // Adjust if your API prefix is different

  async getCategories(filters: CategoryFilters = {}): Promise<CategoriesResponse> {
    try {
      const params = new URLSearchParams()

      if (filters.page) params.append("page", filters.page.toString())
      if (filters.limit) params.append("limit", filters.limit.toString())
      if (filters.search) params.append("search", filters.search)
      if (filters.status) params.append("status", filters.status)
      if (filters.sortBy) params.append("sortBy", filters.sortBy)
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`)
      return response.data
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      const message = error.response?.data?.message || "Failed to fetch categories"
      throw new Error(message)
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching category ${id}:`, error)
      const message = error.response?.data?.message || "Failed to fetch category"
      throw new Error(message)
    }
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    try {
      const response = await apiClient.post(this.baseUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error: any) {
      console.error("Error creating category:", error)
      const message = error.response?.data?.message || "Failed to create category"
      throw new Error(message)
    }
  }

 async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    try {
      // The id is used directly in the URL, and payload is the body. Clean and simple.
      const response = await apiClient.put(`${this.baseUrl}/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      // Error handling is still robust
      console.error(`Error updating category ${id}:`, error);
      // You can re-use your getValidationErrors helper here if needed
      const message = error.response?.data?.message || "Failed to update category";
      throw new Error(message);
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error: any) {
      console.error(`Error deleting category ${id}:`, error)
      const message = error.response?.data?.message || "Failed to delete category"
      throw new Error(message)
    }
  }

  async bulkDeleteCategories(ids: string[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk`, {
        data: { ids },
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (error: any) {
      console.error("Error bulk deleting categories:", error)
      const message = error.response?.data?.message || "Failed to delete categories"
      throw new Error(message)
    }
  }

  async toggleCategoryStatus(id: string): Promise<Category> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/toggle-status`)
      return response.data
    } catch (error: any) {
      console.error(`Error toggling category status ${id}:`, error)
      const message = error.response?.data?.message || "Failed to toggle category status"
      throw new Error(message)
    }
  }
}

export const getValidationErrors = (error: any): string => {
    if (error.response?.data?.errors) {
        return Object.values(error.response.data.errors)
            .map((err: any) => err.message)
            .join('\n'); // Join with newlines for toast display
    }
    return error.response?.data?.message || "An unexpected error occurred.";
}
// Export a singleton instance
export const categoriesService = new CategoriesService()
