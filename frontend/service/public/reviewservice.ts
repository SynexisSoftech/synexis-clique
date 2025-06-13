// services/review.service.ts
import apiClient from '../../utils/axiosInstance'; // Adjust path as needed

/**
 * Represents the structure of a public-facing review object.
 * User information is limited for privacy.
 */
export interface IPublicReview {
  _id: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  userId: {
    _id: string;
    username: string; // Only username is exposed publicly
  };
  createdAt: string;
}

/**
 * Represents the data needed to create a new review.
 */
export interface ICreateReviewData {
  rating: number;
  comment?: string;
}

/**
 * Defines the structure for the paginated public reviews response.
 */
export interface PublicReviewsResponse {
  reviews: IPublicReview[];
  page: number;
  pages: number;
  count: number;
}


/**
 * Fetches all active reviews for a specific product.
 * @param productId - The ID of the product whose reviews are being fetched.
 * @param page - The page number for pagination.
 * @param limit - The number of reviews per page.
 * @returns A promise that resolves to a paginated list of active reviews.
 */
export const getProductReviews = async (
    productId: string,
    page: number = 1,
    limit: number = 5
): Promise<PublicReviewsResponse> => {
  try {
    const response = await apiClient.get<PublicReviewsResponse>(
      `/api/products/${productId}/reviews`, {
        params: { page, limit }
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'An unknown error occurred while fetching reviews.';
    console.error(`Failed to fetch reviews for product ${productId}:`, errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Creates a new review for a product. Requires authentication.
 * @param productId - The ID of the product to review.
 * @param reviewData - The review data (rating and optional comment).
 * @returns A promise that resolves to the newly created review object.
 */
export const createReview = async (
  productId: string,
  reviewData: ICreateReviewData
): Promise<IPublicReview> => {
  try {
    const response = await apiClient.post<IPublicReview>(
      `/api/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'An unknown error occurred while posting your review.';
    console.error(`Failed to create review for product ${productId}:`, errorMsg);
    throw new Error(errorMsg);
  }
};
