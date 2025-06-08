import apiClient from '../../utils/axiosInstance'

/**
 * @file Public service for interacting with the hero slide endpoints.
 * @author Your Name
 */

/**
 * Represents the structure of a hero slide object returned from the API.
 *
 * This type is based on the 'select' statement in the backend controller,
 * ensuring type safety for the data consumed by the frontend.
 */
export interface IHeroSlide {
  _id: string; // Mongoose ObjectId is a string when serialized
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Fetches all active hero slides from the API.
 *
 * This function makes a GET request to the `/api/hero-slides` endpoint and
 * returns a promise that resolves to an array of hero slides.
 * The slides are pre-sorted by the 'order' field by the backend.
 *
 * @returns {Promise<IHeroSlide[]>} A promise that resolves to an array of active hero slides.
 * @throws {Error} Throws an error if the API call fails, allowing for component-level error handling.
 */
export const getActiveHeroSlides = async (): Promise<IHeroSlide[]> => {
  try {
    // Make the GET request using the pre-configured apiClient.
    // The base URL is already set, so we only need the specific endpoint.
    const response = await apiClient.get<IHeroSlide[]>('/api/hero-slides');

    // The actual data from the response is in the `data` property.
    return response.data;
  } catch (error: any) {
    // Log the error for debugging purposes.
    console.error('Failed to fetch active hero slides:', error.response?.data?.message || error.message);

    // Re-throw the error so it can be caught by the calling component
    // (e.g., in a try-catch block or by a query library like React Query).
    throw new Error(error.response?.data?.message || 'An unknown error occurred while fetching hero slides.');
  }
};