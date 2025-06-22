import apiClient from "../utils/axiosInstance"; // Your configured axios instance

// --- Type Definitions and Interfaces ---

// Represents the roles defined in your backend User model
export type UserRole = 'buyer' | 'admin';

/**
 * Represents the full user object received from the API.
 * This should match the structure returned by your backend controllers.
 */
export interface IUser {
  _id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  photoURL: string;
  isVerified: boolean;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for the API response when fetching all users.
 */
export interface UsersResponse {
  message: string;
  count: number;
  users: IUser[];
}

/**
 * Interface for the request body when updating a user's block status.
 */
export interface UpdateUserBlockStatusData {
  isBlocked: boolean;
}

/**
 * Interface for the request body when updating a user's role.
 */
export interface UpdateUserRoleData {
  role: UserRole;
}


// --- User Service Class ---

class UserService {
  private readonly baseUrl = "/api/admin/users"; // Base URL for admin user endpoints

  /**
   * Fetches all users from the system (Admin only).
   * @returns A promise that resolves to a UsersResponse object.
   */
  async getAllUsers(): Promise<UsersResponse> {
    try {
      const response = await apiClient.get<UsersResponse>(this.baseUrl);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to retrieve users.';
      console.error("Error fetching all users:", errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Toggles the block status of a specific user (Admin only).
   * @param userId The ID of the user to update.
   * @param data An object containing the new block status { isBlocked: boolean }.
   * @returns A promise that resolves to the updated user object.
   */
  async toggleUserBlockStatus(userId: string, data: UpdateUserBlockStatusData): Promise<IUser> {
    try {
      const response = await apiClient.patch<{ message: string; user: IUser }>(`${this.baseUrl}/${userId}/block`, data);
      return response.data.user;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update user block status.';
      console.error(`Error toggling block status for user ${userId}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Changes the role of a specific user (Admin only).
   * @param userId The ID of the user to update.
   * @param data An object containing the new role { role: UserRole }.
   * @returns A promise that resolves to the updated user object.
   */
  async changeUserRole(userId: string, data: UpdateUserRoleData): Promise<IUser> {
    try {
      const response = await apiClient.patch<{ message: string; user: IUser }>(`${this.baseUrl}/${userId}/role`, data);
      return response.data.user;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update user role.';
      console.error(`Error changing role for user ${userId}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }
}

// Export a singleton instance of the UserService for use across your application
export const userService = new UserService();
