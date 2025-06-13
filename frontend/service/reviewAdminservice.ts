// services/admin/reviewAdmin.service.ts
import apiClient from '../utils/axiosInstance'; // Adjust path as needed

/**
 * Represents the full structure of a review object, including populated user/product info.
 */
export interface IAdminReview {
  _id: string;
  rating: number;
  comment?: string;
  status: 'pending' | 'active' | 'hidden' | 'flagged';
  isVerifiedPurchase: boolean;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  productId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Defines the structure of the paginated response for reviews.
 */
export interface ReviewsResponse {
  reviews: IAdminReview[];
  page: number;
  pages: number;
  count: number;
}

/**
 * Defines the valid statuses for a review.
 */
export type ReviewStatus = 'pending' | 'active' | 'hidden' | 'flagged';


class ReviewAdminService {
  private readonly baseUrl = '/api/admin/reviews';

  /**
   * Fetches a paginated list of all reviews, with optional status filtering.
   * @param page - The page number to fetch.
   * @param limit - The number of reviews per page.
   * @param status - An optional status to filter the reviews by.
   * @returns A promise that resolves to a paginated list of reviews.
   */
  async getReviews(
    page: number = 1,
    limit: number = 10,
    status?: ReviewStatus
  ): Promise<ReviewsResponse> {
    try {
      const response = await apiClient.get<ReviewsResponse>(this.baseUrl, {
        params: { page, limit, status },
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch reviews';
      console.error('Error fetching reviews:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Fetches a single review by its unique ID.
   * @param id - The ID of the review to fetch.
   * @returns A promise that resolves to the review object.
   */
  async getReviewById(id: string): Promise<IAdminReview> {
    try {
      const response = await apiClient.get<IAdminReview>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching review ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch review');
    }
  }

  /**
   * Updates the status of a specific review.
   * @param id - The ID of the review to update.
   * @param status - The new status for the review.
   * @returns A promise that resolves to the updated review object.
   */
  async updateReviewStatus(id: string, status: ReviewStatus): Promise<IAdminReview> {
    try {
      const response = await apiClient.put<IAdminReview>(`${this.baseUrl}/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update review status';
      console.error(`Error updating status for review ${id}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Deletes a review by its ID.
   * @param id - The ID of the review to delete.
   * @returns A promise that resolves to an object with a success message.
   */
  async deleteReview(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting review ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete review');
    }
  }
}

export const reviewAdminService = new ReviewAdminService();
