import apiClient from "../utils/axiosInstance"

// Define an interface for a single item within the order
export interface AdminOrderItem {
  productId: {
    _id: string
    title: string
    originalPrice: number
    discountPrice?: number
    images: string[]
  }
  quantity: number
  price: number
}

// Update the main AdminOrder interface
export interface AdminOrder {
  _id: string
  userId: {
    _id: string
    username: string
    email: string
    photoURL?: string
  }
  items: AdminOrderItem[]
  transaction_uuid: string
  amount: number
  totalAmount: number
  status: "PENDING" | "COMPLETED" | "DELIVERED" | "FAILED"
  deliveryStatus: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    province: string
    city: string
    postalCode: string
    country: string
  }
  shippingCharge: number
  tax: number
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
  status: "PENDING" | "COMPLETED" | "DELIVERED" | "FAILED"
}

export interface UpdateOrderDeliveryStatusRequest {
  deliveryStatus: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
}

// Input validation functions
const validateUpdateOrderStatusRequest = (data: UpdateOrderStatusRequest): { valid: boolean; error?: string } => {
  if (!data.status || typeof data.status !== 'string') {
    return { valid: false, error: 'Status is required' };
  }

  const validStatuses = ['PENDING', 'COMPLETED', 'DELIVERED', 'FAILED'];
  if (!validStatuses.includes(data.status.toUpperCase())) {
    return { valid: false, error: 'Invalid status value' };
  }

  return { valid: true };
};

const validateUpdateOrderDeliveryStatusRequest = (data: UpdateOrderDeliveryStatusRequest): { valid: boolean; error?: string } => {
  if (!data.deliveryStatus || typeof data.deliveryStatus !== 'string') {
    return { valid: false, error: 'Delivery status is required' };
  }

  const validDeliveryStatuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validDeliveryStatuses.includes(data.deliveryStatus.toUpperCase())) {
    return { valid: false, error: 'Invalid delivery status value' };
  }

  return { valid: true };
};

// The service functions with enhanced security and error handling
export const adminOrderService = {
  /**
   * Get all orders (admin)
   */
  getAllOrders: async (page = 1, limit = 10, status?: string, search?: string): Promise<AdminOrdersResponse> => {
    try {
      // Validate pagination parameters
      const validPage = Math.max(1, Math.floor(page));
      const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

      let url = `/api/admin/orders?page=${validPage}&limit=${validLimit}`;
      if (status) {
        const validStatuses = ['PENDING', 'COMPLETED', 'DELIVERED', 'FAILED'];
        if (validStatuses.includes(status.toUpperCase())) {
          url += `&status=${status.toUpperCase()}`;
        }
      }
      if (search && typeof search === 'string' && search.trim().length > 0) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error("AdminOrderService: Failed to fetch orders:", error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch orders');
      }
    }
  },

  /**
   * Get order by ID (admin)
   */
  getOrderById: async (orderId: string): Promise<AdminOrder> => {
    try {
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Invalid order ID');
      }

      const response = await apiClient.get(`/api/admin/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error("AdminOrderService: Failed to fetch order:", error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch order');
      }
    }
  },

  /**
   * Update order status (admin)
   */
  updateOrderStatus: async (orderId: string, data: UpdateOrderStatusRequest): Promise<AdminOrder> => {
    try {
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Invalid order ID');
      }

      // Validate input data
      const validation = validateUpdateOrderStatusRequest(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await apiClient.put(`/api/admin/orders/${orderId}/status`, data);
      return response.data;
    } catch (error: any) {
      console.error("AdminOrderService: Failed to update order status:", error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid status data';
        throw new Error(errorMessage);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update order status');
      }
    }
  },

  /**
   * Update order delivery status (admin)
   */
  updateOrderDeliveryStatus: async (orderId: string, data: UpdateOrderDeliveryStatusRequest): Promise<AdminOrder> => {
    try {
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Invalid order ID');
      }

      // Validate input data
      const validation = validateUpdateOrderDeliveryStatusRequest(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await apiClient.put(`/api/admin/orders/${orderId}/delivery-status`, data);
      return response.data;
    } catch (error: any) {
      console.error("AdminOrderService: Failed to update order delivery status:", error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid delivery status data';
        throw new Error(errorMessage);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update order delivery status');
      }
    }
  },

  /**
   * Get orders by product ID (admin)
   */
  getOrdersByProductId: async (productId: string, page = 1, limit = 10): Promise<AdminOrdersResponse> => {
    try {
      if (!productId || typeof productId !== 'string') {
        throw new Error('Invalid product ID');
      }

      // Validate pagination parameters
      const validPage = Math.max(1, Math.floor(page));
      const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

      const response = await apiClient.get(`/api/admin/products/${productId}/orders?page=${validPage}&limit=${validLimit}`);
      return response.data;
    } catch (error: any) {
      console.error("AdminOrderService: Failed to fetch orders by product:", error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Product not found.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch orders by product');
      }
    }
  },
};
