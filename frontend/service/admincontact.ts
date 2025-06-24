// File: src/services/adminContactUs.service.ts

import apiClient from "../utils/axiosInstance"; // Adjust path to your axios instance

// Enums to be shared between frontend and backend for consistency
export enum ContactQueryStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  PENDING_RESPONSE = 'PENDING_RESPONSE',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ContactQueryType {
  DELIVERY_OFFERS = 'DELIVERY_OFFERS',
  GENERAL_QUERY = 'GENERAL_QUERY',
  PAYMENT_ISSUES = 'PAYMENT_ISSUES',
  ACCOUNT_HELP = 'ACCOUNT_HELP',
  FEEDBACK = 'FEEDBACK',
  OTHER = 'OTHER',
}

// Interface for a single contact message object from the API
export interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  queryType: ContactQueryType;
  description: string;
  status: ContactQueryStatus;
  adminNotes?: string;
  userId?: { // Populated user info
      _id: string;
      username: string;
      email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface for the data needed to update a message
export interface UpdateContactMessageData {
  status?: ContactQueryStatus;
  adminNotes?: string;
}

// Interface for the paginated response from the API
export interface ContactMessagesResponse {
  messages: IContactMessage[];
  page: number;
  pages: number;
  count: number;
}

class AdminContactService {
  private readonly baseUrl = "/api/admin/contact-us";

  /**
   * Fetch all contact messages with pagination and filtering
   */
  async getMessages(
    page: number = 1, 
    limit: number = 10,
    status?: ContactQueryStatus,
    queryType?: ContactQueryType
  ): Promise<ContactMessagesResponse> {
    try {
      const response = await apiClient.get(this.baseUrl, {
        params: { page, limit, status, queryType },
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch contact messages';
      console.error("Error fetching contact messages:", errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Fetch a single contact message by its ID
   */
  async getMessageById(id: string): Promise<IContactMessage> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to fetch contact message";
      console.error(`Error fetching contact message ${id}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Update an existing contact message (e.g., change status or add notes)
   */
  async updateMessage(id: string, data: UpdateContactMessageData): Promise<IContactMessage> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update contact message';
      console.error(`Error updating contact message ${id}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Delete a contact message by its ID
   */
  async deleteMessage(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to delete contact message";
      console.error(`Error deleting contact message ${id}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }
}

// Export a singleton instance of the service for use across the application
export const adminContactUsService = new AdminContactService();
