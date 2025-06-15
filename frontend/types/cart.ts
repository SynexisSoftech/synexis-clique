// Shared cart types and utilities
export interface CartProduct {
  _id: string
  title: string
  images: string[]
  originalPrice: number
  discountPrice?: number
  stockQuantity: number
  description?: string
  category?: string
}

export interface CartItem {
  productId: CartProduct
  quantity: number
  price: number
}

export interface Cart {
  _id?: string
  userId: string
  items: CartItem[]
  createdAt?: string
  updatedAt?: string
}

// Cart validation types
export interface CartValidationResult {
  isValid: boolean
  errors: CartValidationError[]
}

export interface CartValidationError {
  type: "OUT_OF_STOCK" | "INSUFFICIENT_STOCK" | "INVALID_PRODUCT"
  productId: string
  message: string
  available?: number
  requested?: number
}

// Cart summary types
export interface CartTotals {
  subtotal: number
  totalSavings: number
  totalItems: number
  totalQuantity: number
}

// Utility functions
export const calculateItemTotal = (item: CartItem): number => {
  const effectivePrice = item.productId.discountPrice || item.productId.originalPrice
  return effectivePrice * item.quantity
}

export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + calculateItemTotal(item), 0)
}

export const calculateTotalSavings = (items: CartItem[]): number => {
  return items.reduce((savings, item) => {
    if (item.productId.discountPrice) {
      const itemSavings = (item.productId.originalPrice - item.productId.discountPrice) * item.quantity
      return savings + itemSavings
    }
    return savings
  }, 0)
}

export const getTotalQuantity = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(price)
}

export const isCartEmpty = (cart: Cart): boolean => {
  return !cart.items || cart.items.length === 0
}

export const findCartItem = (cart: Cart, productId: string): CartItem | undefined => {
  return cart.items.find((item) => item.productId._id === productId)
}

export const getCartItemCount = (cart: Cart): number => {
  return getTotalQuantity(cart.items)
}

// Cart status for UI
export type CartStatus = "EMPTY" | "VALID" | "HAS_ISSUES" | "LOADING"

export const getCartStatus = (cart: Cart, validationResult?: CartValidationResult): CartStatus => {
  if (isCartEmpty(cart)) return "EMPTY"
  if (validationResult && !validationResult.isValid) return "HAS_ISSUES"
  return "VALID"
}
