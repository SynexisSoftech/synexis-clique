"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Cart, cartService } from "../../service/public/cartService"
import { useAuth } from "./AuthContext"
import { toast } from "@/hooks/use-toast"

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  error: string | null
  addToCart: (productId: string, quantity: number) => Promise<Cart>
  removeFromCart: (productId: string) => Promise<Cart>
  clearCart: () => Promise<void>
  refetchCart: () => Promise<void>
  cartItemsCount: number
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log("Fetching cart...")
      const cartData = await cartService.getMyCart()
      console.log("Cart fetched:", cartData)
      setCart(cartData)
    } catch (err: any) {
      console.error("Error fetching cart:", err)
      setError(err.response?.data?.message || "Failed to fetch cart")
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number): Promise<Cart> => {
    if (!isAuthenticated) {
      throw new Error("User not authenticated")
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log("Adding to cart:", { productId, quantity })
      const updatedCart = await cartService.addItemToCart(productId, quantity)
      console.log("Cart updated:", updatedCart)

      // Force update the cart state
      setCart(updatedCart)

      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      })

      return updatedCart
    } catch (err: any) {
      console.error("Error adding to cart:", err)
      const errorMessage = err.response?.data?.message || "Failed to add item to cart"
      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (productId: string): Promise<Cart> => {
    setIsLoading(true)
    setError(null)
    try {
      console.log("Removing from cart:", productId)
      const updatedCart = await cartService.removeItemFromCart(productId)
      console.log("Cart after removal:", updatedCart)
      setCart(updatedCart)
      return updatedCart
    } catch (err: any) {
      console.error("Error removing from cart:", err)
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
      console.error("Error clearing cart:", err)
      setError(err.response?.data?.message || "Failed to clear cart")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getItemQuantity = (productId: string): number => {
    if (!cart || !cart.items) return 0
    const item = cart.items.find((item) => item.productId === productId || item.productId._id === productId)
    return item ? item.quantity : 0
  }

  // Fetch cart when authentication status changes
  useEffect(() => {
    console.log("Auth status changed:", isAuthenticated)
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
