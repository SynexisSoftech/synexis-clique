// Shared types that can be used across components
export type OrderStatus = "PENDING" | "COMPLETED" | "FAILED"

export interface BaseOrder {
  _id: string
  transaction_uuid: string
  totalAmount: number
  status: OrderStatus
  eSewaRefId?: string
  createdAt: string
  updatedAt: string
}

export interface OrderUser {
  _id: string
  username: string
  email: string
  photoURL?: string
}

export interface OrderProduct {
  _id: string
  title: string
  originalPrice: number
  discountPrice?: number
  images: string[]
  description?: string
  category?: string
}

// Status badge colors for UI
export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800"
    case "COMPLETED":
      return "bg-green-100 text-green-800"
    case "FAILED":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Format order status for display
export const formatOrderStatus = (status: OrderStatus): string => {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

// Calculate discounted price
export const getEffectivePrice = (originalPrice: number, discountPrice?: number): number => {
  return discountPrice && discountPrice < originalPrice ? discountPrice : originalPrice
}

// eSewa Payment related types
export interface ESewaPaymentData {
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

export interface PaymentFormData {
  formAction: string
  fields: ESewaPaymentData
  orderId: string
}

// Payment status for UI
export type PaymentStatus = "INITIATED" | "PROCESSING" | "SUCCESS" | "FAILED"

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "INITIATED":
      return "bg-blue-100 text-blue-800"
    case "PROCESSING":
      return "bg-yellow-100 text-yellow-800"
    case "SUCCESS":
      return "bg-green-100 text-green-800"
    case "FAILED":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Format currency for display (assuming NPR)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Validate product ID format
export const isValidProductId = (productId: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(productId)
}
