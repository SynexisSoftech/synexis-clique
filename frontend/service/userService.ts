// services/userService.ts

import apiClient from "../utils/axiosInstance"; // Assuming you have this set up for authenticated requests

// --- Interfaces for User Data ---

// Represents the full user object received from the API
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin'; // Assuming roles are defined like this
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  // Exclude sensitive fields like password, passwordResetOTP etc., as per your controller
}

// Interface for API response when fetching multiple users
export interface UsersResponse {
  message: string;
  count: number;
  users: IUser[];
  // You might want to add pagination details here if your API supports it
  // page?: number;
  // pages?: number;
}

// Interface for data to update a user's block status
export interface UpdateUserBlockStatusData {
  isBlocked: boolean;
}


class UserService {
  private readonly baseUrl = "/api/admin/users"; // Base URL for admin user endpoints

  /**
   * Fetches all users from the system. (Admin only)
   * @returns A promise that resolves to a UsersResponse object.
   */
  async getAllUsers(): Promise<UsersResponse> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to retrieve users.';
      console.error("Error fetching all users:", errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Toggles the block status of a specific user. (Admin only)
   * @param userId The ID of the user to update.
   * @param data An object containing the new block status (isBlocked: boolean).
   * @returns A promise that resolves to the updated user object.
   */
  async toggleUserBlockStatus(userId: string, data: UpdateUserBlockStatusData): Promise<IUser> {
    try {
      // The PATCH endpoint is /api/admin/users/:userId/block
      const response = await apiClient.patch(`${this.baseUrl}/${userId}/block`, data);
      return response.data.user; // Assuming your controller returns { message, user }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update user block status.';
      console.error(`Error toggling block status for user ${userId}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }

  // --- Add other user-related methods as needed (e.g., getting a single user, updating user profiles) ---

  /**
   * Fetches a single user by ID. (Can be used by admin or potentially by a user for their own profile)
   * Note: You might have a separate non-admin endpoint for general user profile access.
   */
  // async getUserById(id: string): Promise<IUser> {
  //   try {
  //     // If this is an admin-specific endpoint, it stays under /api/admin/users/:id
  //     // If it's a general user endpoint, the baseUrl might be different (e.g., /api/users)
  //     const response = await apiClient.get(`${this.baseUrl}/${id}`);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error(`Error fetching user ${id}:`, error);
  //     throw new Error(error.response?.data?.message || "Failed to fetch user");
  //   }
  // }
}

// Export a singleton instance of the UserService
export const userService = new UserService();