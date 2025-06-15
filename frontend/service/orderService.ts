import apiClient from "../utils/axiosInstance"

export interface AdminOrder {
  _id: string
  userId: {
    _id: string
    username: string
    email: string
    photoURL?: string
  }
  productId: {
    _id: string
    title: string
    originalPrice: number
    images: string[]
  }
  transaction_uuid: string
  amount: number
  total_amount: number
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

export const adminOrderService = {
  // Get all orders (admin)
  getAllOrders: async (page = 1, limit = 10, status?: string, search?: string): Promise<AdminOrdersResponse> => {
    let url = `/api/admin/orders?page=${page}&limit=${limit}`
    if (status) url += `&status=${status}`
    if (search) url += `&search=${search}`

    const response = await apiClient.get(url)
    return response.data
  },

  // Get order by ID (admin)
  getOrderById: async (orderId: string): Promise<AdminOrder> => {
    const response = await apiClient.get(`/api/admin/orders/${orderId}`)
    return response.data
  },

  // Update order status (admin)
  updateOrderStatus: async (orderId: string, data: UpdateOrderStatusRequest): Promise<AdminOrder> => {
    const response = await apiClient.put(`/api/admin/orders/${orderId}/status`, data)
    return response.data
  },
}
