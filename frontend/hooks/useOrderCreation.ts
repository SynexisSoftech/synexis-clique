"use client"

import { useState } from "react"
import { orderService, type CreateOrderRequest, type CreateOrderResponse } from "../service/public/orderService"
import { useAuth } from "@/app/context/AuthContext"

export function useOrderCreation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const createOrder = async (
    productId: string,
    totalAmount: number,
    quantity = 1,
  ): Promise<CreateOrderResponse | null> => {
    if (!isAuthenticated) {
      setError("You must be logged in to create an order")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const orderData: CreateOrderRequest = {
        productId,
        totalAmount,
        quantity,
      }
      const response = await orderService.createOrder(orderData)
      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to create order"
      setError(errorMessage)
      console.error("Error creating order:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createOrder,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
