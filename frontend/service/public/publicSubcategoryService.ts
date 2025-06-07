import axios from 'axios';
import apiClient from "../../utils/axiosInstance"; // Adjust path as needed

// Interface for a single public subcategory
export interface PublicSubcategory {
    _id: string;
    title: string;
    slug: string;
    description: string;
    image?: string;
    seoKeywords?: string[];
    tags?: string[];
    categoryId: { // Parent category is populated
        _id: string;
        title: string;
        slug: string;
    };
}

// Interface for filters when fetching multiple subcategories
export interface PublicSubcategoryFilters {
    categorySlug?: string; // To fetch subcategories of a specific category
}

/**
 * Service for fetching public-facing subcategory data.
 */
const publicSubcategoryService = {
    /**
     * Fetches all active subcategories, optionally filtered by parent category.
     * Corresponds to GET /api/public/subcategories
     */
    async getPublicSubcategories(filters: PublicSubcategoryFilters = {}): Promise<PublicSubcategory[]> {
        try {
            const params = new URLSearchParams();
            if (filters.categorySlug) {
                params.append("categorySlug", filters.categorySlug);
            }

            const response = await apiClient.get<PublicSubcategory[]>(`/api/public/subcategories?${params.toString()}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || `Error fetching subcategories: ${error.message}`);
            }
            throw new Error('An unknown error occurred while fetching subcategories');
        }
    },

    /**
     * Fetches a single active subcategory by its parent and its own slug.
     * Corresponds to GET /api/public/subcategories/:categorySlug/:subcategorySlug
     */
    async getPublicSubcategoryBySlug(categorySlug: string, subcategorySlug: string): Promise<PublicSubcategory> {
        try {
            const response = await apiClient.get<PublicSubcategory>(`/api/public/subcategories/${categorySlug}/${subcategorySlug}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || `Error fetching subcategory: ${error.message}`);
            }
            throw new Error('An unknown error occurred while fetching the subcategory');
        }
    },
};

export default publicSubcategoryService;