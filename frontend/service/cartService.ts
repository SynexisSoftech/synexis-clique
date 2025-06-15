import apiClient from "../utils/axiosInstance"

export interface AdminCartResponse {
  carts: Cart[]
  page: number
  pages: number
  count: number
}

export interface Cart {
  _id: string
  userId: {
    _id: string
    username: string
    email: string
    photoURL?: string
  }
  items: Array<{
    productId: {
      _id: string
      title: string
      images: string[]
      originalPrice: number
      discountPrice?: number
      stockQuantity: number
    }
    quantity: number
    price: number
  }>
  createdAt: string
  updatedAt: string
}

export const adminCartService = {
  // Get all carts (admin)
  getAllCarts: async (page = 1, limit = 10): Promise<AdminCartResponse> => {
    const response = await apiClient.get(`/api/admin/carts?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get cart by ID (admin)
  getCartById: async (cartId: string): Promise<Cart> => {
    const response = await apiClient.get(`/api/admin/carts/${cartId}`)
    return response.data
  },
}
