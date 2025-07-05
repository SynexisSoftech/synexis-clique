"use client"

import { Button } from "@/components/ui/button"
import { useCart } from ".././app/context/CartContext"
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  productId: string
  productTitle?: string
  selectedSize?: string
  selectedColor?: string
  quantity?: number
  maxQuantity?: number
  disabled?: boolean
  className?: string
  variant?: "default" | "outline" | "secondary"
  size?: "sm" | "default" | "lg"
}

export function AddToCartButton({ 
  productId, 
  productTitle,
  selectedSize,
  selectedColor,
  quantity: initialQuantity = 1,
  maxQuantity,
  disabled = false,
  className, 
  variant = "default", 
  size = "default" 
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart, getItemQuantity, isLoading } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Get current quantity in cart
  const currentQuantity = getItemQuantity(productId)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    setIsAdding(true)
    try {
      await addToCart(productId, quantity)
      // Reset quantity to 1 after successful add
      setQuantity(1)
    } catch (error) {
    } finally {
      setIsAdding(false)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && (!maxQuantity || newQuantity <= maxQuantity)) {
      setQuantity(newQuantity)
    }
  }

  const isButtonLoading = isLoading || isAdding
  const isDisabled = Boolean(disabled) || isButtonLoading

  return (
    <div className="flex items-center gap-2">
      {currentQuantity === 0 ? (
        <>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isButtonLoading}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-3 py-1 min-w-[3rem] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isButtonLoading || (maxQuantity && quantity >= maxQuantity)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isDisabled}
            variant={variant}
            size={size}
            className={className}
          >
            {isButtonLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-600 font-medium">In cart: {currentQuantity}</span>
          <Button
            onClick={handleAddToCart}
            disabled={isDisabled}
            variant="outline"
            size={size}
            className={className}
          >
            {isButtonLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
