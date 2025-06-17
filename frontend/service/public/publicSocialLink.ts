/**
 * @fileoverview Frontend service for fetching public social links.
 */

import apiClient from "../../utils/axiosInstance"

// Interface for a publicly displayed social link.
export interface PublicSocialLink {
  _id: string
  title: string
  link: string
  description?: string
  icon: string
  status?: "active" | "inactive"
}

// Interface for the expected API response structure from the public controller.
interface ApiResponse {
  success: boolean
  count: number
  data: PublicSocialLink[]
  message?: string
}

// Interface for error response
interface ApiErrorResponse {
  success: false
  message: string
  error?: any
}

class PublicSocialLinkService {
  private readonly baseUrl = "/api/social-links"

  /**
   * Fetch all active social links for public display.
   */
  async getAllPublic(): Promise<PublicSocialLink[]> {
    try {
      const response = await apiClient.get<ApiResponse>(this.baseUrl)

      // Check if the request was successful and return the data array.
      if (response.data?.success && Array.isArray(response.data.data)) {
        // Log the response to debug what we're receiving
        console.log("Social links API response:", response.data.data)

        // Ensure each social link has required fields
        const validatedLinks = response.data.data.filter((link) => {
          if (!link.title || !link.icon || !link.link) {
            console.warn("Invalid social link data:", link)
            return false
          }
          return true
        })

        return validatedLinks
      } else {
        // Handle cases where the API returns a success: false flag.
        const errorMessage = (response.data as ApiErrorResponse)?.message || "Failed to fetch social links."
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error("Error fetching public social links:", error)

      // Handle different types of errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error("An unexpected error occurred while fetching social links. Please try again.")
      }
    }
  }

  /**
   * Get a single social link by ID
   */
  async getById(id: string): Promise<PublicSocialLink | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: PublicSocialLink }>(`${this.baseUrl}/${id}`)

      if (response.data?.success && response.data.data) {
        return response.data.data
      }
      return null
    } catch (error: any) {
      console.error(`Error fetching social link ${id}:`, error)
      return null
    }
  }
}

export const publicSocialLinkService = new PublicSocialLinkService()
