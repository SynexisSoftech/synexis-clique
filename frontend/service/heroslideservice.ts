// services/heroSlidesService.ts
import apiClient from "../utils/axiosInstance";

export interface IHeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  status: "active" | "inactive";
  seoKeywords?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlideData {
  title: string;
  subtitle: string;
  image: string; // Base64 for new image
  ctaText: string;
  ctaLink: string;
  order?: number;
  status?: "active" | "inactive";
  seoKeywords?: string[];
}

export interface UpdateHeroSlideData extends Partial<HeroSlideData> {
  image?: string; // base64 | null | undefined
}

export interface HeroSlidesResponse {
  slides: IHeroSlide[];
  page: number;
  pages: number;
  count: number;
}
class HeroSlidesService {
  private readonly baseUrl = "/api/admin/hero-slides";

  async getSlides(
    page: number = 1, 
    limit: number = 10,
    status?: 'active' | 'inactive'
  ): Promise<HeroSlidesResponse> {
    try {
      const response = await apiClient.get(this.baseUrl, {
        params: { page, limit, status },
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Failed to fetch hero slides';
      console.error("Error fetching hero slides:", errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Fetch a single slide by ID
   */
  async getSlideById(id: string): Promise<IHeroSlide> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching hero slide ${id}:`, error);
      throw new Error(error.response?.data?.message || "Failed to fetch hero slide");
    }
  }

  /**
   * Create a new hero slide
   */
  async createSlide(data: HeroSlideData): Promise<IHeroSlide> {
    try {
      const response = await apiClient.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating hero slide:", error);
      throw new Error(error.response?.data?.message || "Failed to create hero slide");
    }
  }

  /**
   * Update an existing hero slide
   */
 async updateSlide(id: string, data: UpdateHeroSlideData): Promise<IHeroSlide> {
    try {
      // If image is null, it means we want to remove the existing image
      if (data.image === null) {
        data.image = ''; // Will be handled by backend
      }
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Failed to update hero slide';
      console.error(`Error updating hero slide ${id}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Delete a hero slide
   */
  async deleteSlide(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting hero slide ${id}:`, error);
      throw new Error(error.response?.data?.message || "Failed to delete hero slide");
    }
  }
}

// Export singleton instance
export const heroSlidesService = new HeroSlidesService();
