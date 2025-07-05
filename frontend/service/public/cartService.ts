import apiClient from "../../utils/axiosInstance"

// Types for public cart service
export interface IUserCartItem {
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
}

export interface IUserCart {
  _id?: string
  userId: string
  items: IUserCartItem[]
  createdAt?: string
  updatedAt?: string
}

export interface AddItemToCartRequest {
  productId: string
  quantity: number
}

export interface CartSummary {
  totalItems: number
  totalPrice: number
  totalOriginalPrice: number
  totalSavings: number
}

export interface CartItem {
  productId: string
  quantity: number
  price: number
}

export interface Cart {
  _id: string
  userId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export const cartService = {
  // Get user's cart
  getMyCart: async (): Promise<IUserCart> => {
    const response = await apiClient.get("/api/cart")
    return response.data
  },

  // Add item to cart
  addItemToCart: async (productId: string, quantity: number): Promise<any> => {
    const response = await apiClient.post("/api/cart/items", {
      productId,
      quantity,
    })
    return response.data
  },

  // Remove item from cart
  removeItemFromCart: async (productId: string): Promise<IUserCart> => {
    const response = await apiClient.delete(`/api/cart/items/${productId}`)
    return response.data
  },

  // Clear cart
  clearCart: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete("/api/cart")
    return response.data
  },

  // Validate cart
  validateCart: async (): Promise<any> => {
    const response = await apiClient.post("/api/cart/validate")
    return response.data
  },
}

class PublicCartService {
  private readonly baseUrl = "/api/cart"

  /**
   * Get the logged-in user's cart
   */
  async getMyCart(): Promise<IUserCart> {
    try {
      const response = await apiClient.get<IUserCart>(this.baseUrl)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Add or update an item in the cart
   */
  async addItemToCart(itemData: AddItemToCartRequest): Promise<IUserCart> {
    try {
      const response = await apiClient.post<IUserCart>(`${this.baseUrl}/items`, itemData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Remove an item from the cart
   */
  async removeItemFromCart(productId: string): Promise<IUserCart> {
    try {
      const response = await apiClient.delete<IUserCart>(`${this.baseUrl}/items/${productId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Clear all items from the cart
   */
  async clearCart(): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(this.baseUrl)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(productId: string, quantity: number): Promise<IUserCart> {
    try {
      return await this.addItemToCart({ productId, quantity })
    } catch (error) {
      throw error
    }
  }

  /**
   * Get cart summary with totals
   */
  async getCartSummary(): Promise<CartSummary> {
    try {
      const cart = await this.getMyCart()

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = cart.items.reduce((sum, item) => {
        const effectivePrice = item.productId.discountPrice || item.productId.originalPrice
        return sum + effectivePrice * item.quantity
      }, 0)
      const totalOriginalPrice = cart.items.reduce((sum, item) => {
        return sum + item.productId.originalPrice * item.quantity
      }, 0)
      const totalSavings = totalOriginalPrice - totalPrice

      return {
        totalItems,
        totalPrice,
        totalOriginalPrice,
        totalSavings,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Check if product is in cart
   */
  async isProductInCart(productId: string): Promise<boolean> {
    try {
      const cart = await this.getMyCart()
      return cart.items.some((item) => item.productId._id === productId)
    } catch (error) {
      return false
    }
  }

  /**
   * Get item quantity in cart
   */
  async getItemQuantity(productId: string): Promise<number> {
    try {
      const cart = await this.getMyCart()
      const item = cart.items.find((item) => item.productId._id === productId)
      return item ? item.quantity : 0
    } catch (error) {
      return 0
    }
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getMyCart()
      return cart.items.reduce((sum, item) => sum + item.quantity, 0)
    } catch (error) {
      return 0
    }
  }

  /**
   * Validate cart items (check stock availability)
   */
  async validateCartItems(): Promise<{
    isValid: boolean
    outOfStockItems: string[]
    insufficientStockItems: { productId: string; available: number; requested: number }[]
  }> {
    try {
      const cart = await this.getMyCart()
      const outOfStockItems: string[] = []
      const insufficientStockItems: { productId: string; available: number; requested: number }[] = []

      cart.items.forEach((item) => {
        if (item.productId.stockQuantity === 0) {
          outOfStockItems.push(item.productId._id)
        } else if (item.productId.stockQuantity < item.quantity) {
          insufficientStockItems.push({
            productId: item.productId._id,
            available: item.productId.stockQuantity,
            requested: item.quantity,
          })
        }
      })

      return {
        isValid: outOfStockItems.length === 0 && insufficientStockItems.length === 0,
        outOfStockItems,
        insufficientStockItems,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Bulk add items to cart
   */
  async bulkAddItems(items: AddItemToCartRequest[]): Promise<IUserCart> {
    try {
      let cart = await this.getMyCart()

      for (const item of items) {
        cart = await this.addItemToCart(item)
      }

      return cart
    } catch (error) {
      throw error
    }
  }
}

export const publicCartService = new PublicCartService()
