import apiClient from "../utils/axiosInstance";

// Types matching your backend's SocialLink model
export interface SocialLink {
  _id: string;
  name: string;
  url: string;
  icon?: string; // e.g., a class name or image URL
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSocialLinkDto {
  name: string;
  url: string;
  icon?: string;
  status?: "active" | "inactive";
}

export interface UpdateSocialLinkDto extends Partial<CreateSocialLinkDto> {
  id: string;
}

class SocialLinkService {
  private readonly baseUrl = "/api/admin/social-links";

  /**
   * Fetch all social links
   */
  async getAll(): Promise<SocialLink[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching social links:", error);
      const message = error.response?.data?.message || "Failed to fetch social links";
      throw new Error(message);
    }
  }

  /**
   * Create a new social link
   */
  async create(data: CreateSocialLinkDto): Promise<SocialLink> {
    try {
      const response = await apiClient.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating social link:", error);
      const message = error.response?.data?.message || "Failed to create social link";
      throw new Error(message);
    }
  }

  /**
   * Update a social link by ID
   */
  async update({ id, ...data }: UpdateSocialLinkDto): Promise<SocialLink> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating social link ${id}:`, error);
      const message = error.response?.data?.message || "Failed to update social link";
      throw new Error(message);
    }
  }

  /**
   * Delete a social link by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting social link ${id}:`, error);
      const message = error.response?.data?.message || "Failed to delete social link";
      throw new Error(message);
    }
  }
}

export const socialLinkService = new SocialLinkService();
