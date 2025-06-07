// A shared interface for the public category data.

import apiClient from "@/utils/axiosInstance";

// Based on the `.select()` fields in your controller.
export interface PublicCategory {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  seoKeywords?: string[];
  tags?: string[];
}

/**
 * Service for fetching public-facing category data.
 */
const publicCategoryService = {
  /**
   * Fetches all active categories for public display.
   * Corresponds to GET /api/public/categories
   * @returns {Promise<PublicCategory[]>} A list of active categories.
   */
  async getAllPublicCategories(): Promise<PublicCategory[]> {
    try {
      const response = await apiClient.get<PublicCategory[]>('/api/public/categories');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Error fetching categories: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching categories');
    }
  },

  /**
   * Fetches a single active category by its public slug.
   * Corresponds to GET /api/public/categories/:slug
   * @param {string} slug - The slug of the category to fetch.
   * @returns {Promise<PublicCategory>} The requested category.
   */
  async getPublicCategoryBySlug(slug: string): Promise<PublicCategory> {
    try {
      const response = await apiClient.get<PublicCategory>(`/api/public/categories/${slug}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Error fetching category: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching category');
    }
  }
};

export default publicCategoryService;