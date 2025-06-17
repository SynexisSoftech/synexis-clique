import apiClient from "../utils/axiosInstance";

// --- CORRECTION 1: Aligned interface with the backend model ---
// Changed 'name' to 'title' and 'url' to 'link'.
// Added the optional 'description' field.
export interface SocialLink {
  _id: string;
  title: string; // Was 'name'
  link: string;  // Was 'url'
  description?: string;
  icon?: string; 
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

// --- CORRECTION 2: Aligned DTO with the backend model ---
export interface CreateSocialLinkDto {
  title: string; // Was 'name'
  link: string;  // Was 'url'
  description?: string;
  icon: string; // Changed to required as backend expects it on creation
  status?: "active" | "inactive";
}

// --- CORRECTION 3: Aligned Update DTO ---
// Update DTO should also use the correct field names.
export interface UpdateSocialLinkDto extends Partial<Omit<CreateSocialLinkDto, 'icon'>> {
  id: string;
  icon?: string; // Icon is optional on update
}

class SocialLinkService {
  private readonly baseUrl = "/api/admin/social-links";

  /**
   * Fetch all social links
   */
  async getAll(): Promise<SocialLink[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      // --- CORRECTION 4: Unwrapped the nested array from the response ---
      return response.data.socialLinks; 
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
      // The data object now correctly has { title, link, icon, ... }
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
      // The data object now correctly has { title, link, ... }
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
  async delete(id: string): Promise<{ message: string }> { // Return type updated for more context
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.data; // e.g., { message: 'Social link removed successfully' }
    } catch (error: any) {
      console.error(`Error deleting social link ${id}:`, error);
      const message = error.response?.data?.message || "Failed to delete social link";
      throw new Error(message);
    }
  }
}

export const socialLinkService = new SocialLinkService();