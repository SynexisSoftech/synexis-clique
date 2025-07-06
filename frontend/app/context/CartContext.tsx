"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type IUserCart, cartService } from "../../service/public/cartService"
import { useAuth } from "./AuthContext"
import { toast } from "@/hooks/use-toast"

interface CartContextType {
  cart: IUserCart | null
  isLoading: boolean
  error: string | null
  addToCart: (productId: string, quantity: number) => Promise<IUserCart>
  removeFromCart: (productId: string) => Promise<IUserCart>
  clearCart: () => Promise<void>
  refetchCart: () => Promise<void>
  validateCart: () => Promise<any>
  cartItemsCount: number
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<IUserCart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }

    // Additional check: make sure we have a stored user before making API calls
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      setCart(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const cartData = await cartService.getMyCart()
      setCart(cartData)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch cart")
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number): Promise<IUserCart> => {
    if (!isAuthenticated) {
      throw new Error("User not authenticated")
    }

    // Input validation
    if (!productId || quantity < 1) {
      const errorMessage = "Invalid product or quantity"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "error",
      })
      throw new Error(errorMessage)
    }

    // Optimistic update for better UX
    const optimisticCart = cart ? {
      ...cart,
      items: [...cart.items]
    } : null

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await cartService.addItemToCart(productId, quantity)
      
      // Handle the new response format with type safety
      const updatedCart = response.cart || response

      // Update cart state
      setCart(updatedCart)

      // Enhanced toast message based on response
      const message = response.message || "Item has been added to your cart"
      const action = response.action || "added"
      const productName = response.productName || "Item"
      
      toast({
        title: action === "updated" ? "Cart Updated" : "Added to Cart",
        description: action === "updated" 
          ? `${productName} quantity updated to ${response.newQuantity || quantity}`
          : `${productName} added to your cart`,
        variant: "success",
      })

      return updatedCart
    } catch (err: any) {
      
      // Revert optimistic update on error
      if (optimisticCart) {
        setCart(optimisticCart)
      }
      
      const errorMessage = err.response?.data?.message || "Failed to add item to cart"
      setError(errorMessage)

      // Enhanced error toast with more specific messages
      let toastTitle = "Error"
      let toastDescription = errorMessage
      
      if (err.response?.status === 400) {
        if (errorMessage.includes("stock")) {
          toastTitle = "Stock Unavailable"
          toastDescription = errorMessage
        } else if (errorMessage.includes("Maximum quantity")) {
          toastTitle = "Quantity Limit"
          toastDescription = errorMessage
        } else if (errorMessage.includes("not available")) {
          toastTitle = "Product Unavailable"
          toastDescription = errorMessage
        }
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        variant: "error",
      })

      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (productId: string): Promise<IUserCart> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedCart = await cartService.removeItemFromCart(productId)
      setCart(updatedCart)
      return updatedCart
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove item from cart")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await cartService.clearCart()
      setCart(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clear cart")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const validateCart = async (): Promise<any> => {
    if (!isAuthenticated) {
      throw new Error("User not authenticated")
    }

    setIsLoading(true)
    setError(null)
    try {
      const validationResult = await cartService.validateCart()
      
      // If cart has issues, show appropriate toast
      if (!validationResult.isValid && validationResult.issues?.length > 0) {
        const issueCount = validationResult.issues.length
        toast({
          title: "Cart Issues Found",
          description: `${issueCount} item${issueCount > 1 ? 's' : ''} in your cart need attention`,
          variant: "warning",
        })
      }
      
      return validationResult
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to validate cart"
      setError(errorMessage)
      
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "error",
      })
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getItemQuantity = (productId: string): number => {
    if (!cart || !cart.items) return 0
    const item = cart.items.find((item) => item.productId._id === productId)
    return item ? item.quantity : 0
  }

  // Fetch cart when authentication status changes
  useEffect(() => {
    fetchCart()
  }, [isAuthenticated])

  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0

  const value: CartContextType = {
    cart,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    refetchCart: fetchCart,
    validateCart,
    cartItemsCount,
    getItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
