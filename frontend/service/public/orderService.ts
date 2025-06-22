import apiClient from "../../utils/axiosInstance"

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    city: string;
    postalCode: string;
    country: string;
  };
}
export interface CreateOrderResponse {
  orderId: string
  formAction: string
  fields: {
    amount: number
    tax_amount: number
    total_amount: number
    transaction_uuid: string
    product_code: string
    success_url: string
    failure_url: string
    signed_field_names: string
    signature: string
  }
}

export interface Order {
  _id: string
  userId: string
  productId: {
    _id: string
    title: string
    images: string[]
    originalPrice: number
    discountPrice?: number
  }
  transaction_uuid: string
  amount: number
  total_amount: number
  status: "PENDING" | "COMPLETED" | "FAILED"
  createdAt: string
  updatedAt: string
}

export interface OrdersResponse {
  orders: Order[]
  page: number
  pages: number
  count: number
}

export interface PaymentVerificationRequest {
  transaction_uuid: string;
  transaction_code: string;
  status: string;
  total_amount: string;
  signature?: string;
}

export interface PaymentVerificationResponse {
  message: string;
  orderId: string;
  status: string;
}

class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log("OrderService: Sending request with data:", data);
      if (!data.items || data.items.length === 0) {
        throw new Error("Cannot create order with empty items");
      }
      const response = await apiClient.post("/api/orders", data);
      console.log("OrderService: Received response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("OrderService: Request failed:", error)
      console.error("OrderService: Error response:", error.response?.data)
      throw error
    }
  }

  async getMyOrders(page = 1, limit = 10): Promise<OrdersResponse> {
    const response = await apiClient.get(`/api/orders/my-orders?page=${page}&limit=${limit}`)
    return response.data
  }

  async getMyOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get(`/api/orders/${orderId}`)
    return response.data
  }

  /**
   * Verify payment with backend and reduce stock
   */
  async verifyPayment(data: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      console.log('🔍 OrderService: Sending payment verification request:', data);
      const response = await apiClient.post('/api/orders/verify-payment', data);
      console.log('✅ OrderService: Payment verification successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ OrderService: Payment verification failed:', error);
      console.error('❌ OrderService: Error response:', error.response?.data);
      throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

export const orderService = new OrderService()
