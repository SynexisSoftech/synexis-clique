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
  items: {
    productId: {
      _id: string
      title: string
      images: string[]
      originalPrice: number
      discountPrice?: number
    }
    quantity: number
    price: number
  }[]
  transaction_uuid: string
  amount: number
  totalAmount: number
  status: "PENDING" | "COMPLETED" | "FAILED"
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

// Input validation functions
const validateCreateOrderRequest = (data: CreateOrderRequest): { valid: boolean; error?: string } => {
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { valid: false, error: 'Order must contain at least one item' };
  }

  for (const item of data.items) {
    if (!item.productId || typeof item.productId !== 'string') {
      return { valid: false, error: 'Invalid product ID' };
    }
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 100) {
      return { valid: false, error: 'Invalid quantity (must be between 1 and 100)' };
    }
  }

  if (!data.shippingInfo) {
    return { valid: false, error: 'Shipping information is required' };
  }

  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'province', 'city', 'country'];
  for (const field of requiredFields) {
    if (!data.shippingInfo[field as keyof typeof data.shippingInfo] || 
        typeof data.shippingInfo[field as keyof typeof data.shippingInfo] !== 'string' ||
        data.shippingInfo[field as keyof typeof data.shippingInfo].trim() === '') {
      return { valid: false, error: `${field} is required` };
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.shippingInfo.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Validate phone format
  const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,15}$/;
  if (!phoneRegex.test(data.shippingInfo.phone)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true };
};

const validatePaymentVerificationRequest = (data: PaymentVerificationRequest): { valid: boolean; error?: string } => {
  if (!data.transaction_uuid || typeof data.transaction_uuid !== 'string') {
    return { valid: false, error: 'Transaction UUID is required' };
  }

  if (!data.transaction_code || typeof data.transaction_code !== 'string') {
    return { valid: false, error: 'Transaction code is required' };
  }

  if (!data.status || typeof data.status !== 'string') {
    return { valid: false, error: 'Status is required' };
  }

  if (!data.total_amount || typeof data.total_amount !== 'string') {
    return { valid: false, error: 'Total amount is required' };
  }

  const amount = parseFloat(data.total_amount);
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Invalid total amount' };
  }

  return { valid: true };
};

class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // Validate input data
      const validation = validateCreateOrderRequest(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      console.log("OrderService: Sending request with data:", data);
      
      const response = await apiClient.post("/api/orders", data);
      console.log("OrderService: Received response:", response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("OrderService: Request failed:", error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid order data';
        throw new Error(errorMessage);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Your account may be blocked.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to create order');
      }
    }
  }

  async getMyOrders(page = 1, limit = 10): Promise<OrdersResponse> {
    try {
      // Validate pagination parameters
      const validPage = Math.max(1, Math.floor(page));
      const validLimit = Math.min(50, Math.max(1, Math.floor(limit)));

      const response = await apiClient.get(`/api/orders/my-orders?page=${validPage}&limit=${validLimit}`);
      return response.data;
    } catch (error: any) {
      console.error("OrderService: Failed to fetch orders:", error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch orders');
      }
    }
  }

  async getMyOrderById(orderId: string): Promise<Order> {
    try {
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Invalid order ID');
      }

      const response = await apiClient.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error("OrderService: Failed to fetch order:", error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found or access denied.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch order');
      }
    }
  }

  /**
   * Verify payment with backend and reduce stock
   */
  async verifyPayment(data: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      // Validate input data
      const validation = validatePaymentVerificationRequest(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      console.log('🔍 OrderService: Sending payment verification request:', data);
      const response = await apiClient.post('/api/orders/verify-payment', data);
      console.log('✅ OrderService: Payment verification successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ OrderService: Payment verification failed:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid payment data';
        throw new Error(errorMessage);
      } else if (error.response?.status === 404) {
        throw new Error('Order not found for payment verification.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many verification attempts. Please wait before trying again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error during payment verification. Please contact support.');
      } else {
        throw new Error(error.response?.data?.message || 'Payment verification failed');
      }
    }
  }
}

export const orderService = new OrderService()
