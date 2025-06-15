"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  productId: string
  className?: string
  variant?: "default" | "outline" | "secondary"
  size?: "sm" | "default" | "lg"
}

export function AddToCartButton({ productId, className, variant = "default", size = "default" }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, isLoading, cart } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Check if item is already in cart
  const existingItem = cart?.items?.find((item) => item.productId === productId)
  const currentQuantity = existingItem?.quantity || 0

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    try {
      await addToCart(productId, quantity)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {currentQuantity === 0 ? (
        <>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-3 py-1 min-w-[3rem] text-center">{quantity}</span>
            <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(quantity + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleAddToCart} disabled={isLoading} variant={variant} size={size} className={className}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isLoading ? "Adding..." : "Add to Cart"}
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-600">In cart: {currentQuantity}</span>
          <Button onClick={handleAddToCart} disabled={isLoading} variant="outline" size={size} className={className}>
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? "Adding..." : "Add More"}
          </Button>
        </div>
      )}
    </div>
  )
}
