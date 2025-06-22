// File: src/services/public/publicContact.service.ts

import apiClient from '../../utils/axiosInstance';
import { ContactQueryType } from '../admincontact';


/**
 * @file Public service for interacting with the contact us endpoints.
 * @author Your Name
 */

/**
 * Represents the structure of a new contact message to be sent to the API.
 */
export interface ICreateContactMessage {
  name: string;
  email: string;
  phone?: string; // Optional
  queryType: ContactQueryType;
  description: string;
}

/**
 * Represents the structure of a successful response when creating a contact message.
 * This should mirror the 'data' field returned by the backend.
 */
export interface IContactMessageResponse {
  _id: string;
  userId?: string; // Optional: Mongoose ObjectId is a string when serialized
  name: string;
  email: string;
  phone?: string;
  queryType: ContactQueryType;
  description: string;
  status: string; // Will be 'UNREAD' initially
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Submits a new contact message to the API.
 *
 * This function makes a POST request to the `/api/contact-us` endpoint with the
 * provided contact message data.
 *
 * @param {ICreateContactMessage} messageData The data for the contact message.
 * @returns {Promise<{ message: string; data: IContactMessageResponse }>} A promise that resolves to an object containing a success message and the created message data.
 * @throws {Error} Throws an error if the API call fails, allowing for component-level error handling.
 */
export const createContactMessage = async (messageData: ICreateContactMessage): Promise<{ message: string; data: IContactMessageResponse }> => {
  try {
    const response = await apiClient.post<{ message: string; data: IContactMessageResponse }>('/api/contact-us', messageData);

    return response.data;
  } catch (error: any) {
    console.error('Failed to submit contact message:', error.response?.data?.message || error.message);

    // Re-throw the error with a more user-friendly message if available
    throw new Error(error.response?.data?.message || 'An unknown error occurred while submitting your message.');
  }
};