import apiClient from "../utils/axiosInstance"

// <<< CHANGED: Define an interface for a single item within the order
export interface AdminOrderItem {
  productId: {
    _id: string
    title: string
    originalPrice: number
    discountPrice?: number // Added discountPrice for consistency
    images: string[]
  }
  quantity: number
  price: number // The price of the item at the time of purchase
}

// <<< CHANGED: Update the main AdminOrder interface
export interface AdminOrder {
  _id: string
  userId: {
    _id: string
    username: string
    email: string
    photoURL?: string
  }
  // <<< REMOVED: The old 'productId' field is gone
  // productId: { ... }

  // <<< ADDED: The new 'items' array
  items: AdminOrderItem[]
  transaction_uuid: string
  amount: number // This is the subtotal
  totalAmount: number // This is the grand total
  status: "PENDING" | "COMPLETED" | "FAILED"
  createdAt: string
  updatedAt: string
}

export interface AdminOrdersResponse {
  orders: AdminOrder[]
  page: number
  pages: number
  count: number
}

export interface UpdateOrderStatusRequest {
  status: "PENDING" | "COMPLETED" | "FAILED"
}

// The service functions themselves don't need to change,
// but their TypeScript return types are now correctly aligned with the API.
export const adminOrderService = {
  /**
   * Get all orders (admin)
   */
  getAllOrders: async (page = 1, limit = 10, status?: string, search?: string): Promise<AdminOrdersResponse> => {
    let url = `/api/admin/orders?page=${page}&limit=${limit}`
    if (status) url += `&status=${status}`
    if (search) url += `&search=${search}`

    const response = await apiClient.get(url)
    return response.data
  },

  /**
   * Get order by ID (admin)
   */
  getOrderById: async (orderId: string): Promise<AdminOrder> => {
    const response = await apiClient.get(`/api/admin/orders/${orderId}`)
    return response.data
  },

  /**
   * Update order status (admin)
   */
  updateOrderStatus: async (orderId: string, data: UpdateOrderStatusRequest): Promise<AdminOrder> => {
    const response = await apiClient.put(`/api/admin/orders/${orderId}/status`, data)
    return response.data
  },
}
