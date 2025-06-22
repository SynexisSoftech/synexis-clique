"use client"

import { useState, useEffect } from "react"
import { type IUserCart, cartService } from "../service/public/cartService"
import { useAuth } from "@/app/context/AuthContext"
import { toast } from "@/hooks/use-toast"

export function useCart() {
  const [cart, setCart] = useState<IUserCart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const fetchCart = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)
    try {
      const cartData = await cartService.getMyCart()
      setCart(cartData)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch cart")
      console.error("Error fetching cart:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedCart = await cartService.addItemToCart(productId, quantity)
      setCart(updatedCart)

      // Show success toast
      toast({
        title: "Added to Cart",
        description: `Item has been added to your cart`,
      })

      return updatedCart
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add item to cart")
      console.error("Error adding to cart:", err)

      // Show error toast
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      })

      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedCart = await cartService.removeItemFromCart(productId)
      setCart(updatedCart)
      return updatedCart
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove item from cart")
      console.error("Error removing from cart:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await cartService.clearCart()
      setCart(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clear cart")
      console.error("Error clearing cart:", err)
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

  useEffect(() => {
    fetchCart()
  }, [isAuthenticated])

  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0

  return {
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
}
