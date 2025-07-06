"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"
import { useCart } from "../../context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/app/context/AuthContext"

// Helper function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function CartPage() {
  const { cart, isLoading, error, removeFromCart, clearCart, refetchCart, addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Calculate totals from cart data
  const getTotalItems = () => {
    return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0
  }

  const getTotalPrice = () => {
    return (
      cart?.items?.reduce((total, item) => {
        const price = item.productId.discountPrice || item.productId.originalPrice
        return total + price * item.quantity
      }, 0) || 0
    )
  }

  const subtotal = getTotalPrice()
  const shipping = 0 // Shipping will be calculated at checkout based on city
  const total = subtotal + shipping // Total already includes tax

  const handleRemoveItem = async (productId: string, productName: string) => {
    try {
      await removeFromCart(productId)
      toast({
        title: "Item Removed",
        description: `${productName} has been removed from your cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "error",
      })
    }
  }

  const handleUpdateQuantity = async (
    productId: string,
    currentQuantity: number,
    newQuantity: number,
    productName: string,
  ) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(productId, productName)
      return
    }

    if (newQuantity === currentQuantity) {
      return
    }

    setUpdatingItems((prev) => new Set(prev).add(productId))

    try {
      // For quantity updates, we'll remove the item and re-add with new quantity
      // This ensures the cart state is properly updated
      await removeFromCart(productId)
      await addToCart(productId, newQuantity)

      toast({
        title: "Quantity Updated",
        description: `${productName} quantity updated to ${newQuantity}`,
      })
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "error",
      })
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

const handleIncreaseQuantity = async (
  productId: string,
  currentQuantity: number,
  productName: string,
  maxStock: number,
) => {
  const newQuantity = currentQuantity + 1;
  if (newQuantity > maxStock) {
    toast({
      title: "Stock Limit Reached",
      description: `Maximum available quantity is ${maxStock}`,
      variant: "error",
    });
    return;
  }

  setUpdatingItems((prev) => new Set(prev).add(productId));

  try {
    // The fix is to pass the newQuantity to the addToCart function.
    await addToCart(productId, newQuantity);

    toast({
      title: "Quantity Updated",
      description: `${productName} quantity increased to ${newQuantity}`,
    });
  } catch (error) {
    console.error("Error increasing quantity:", error);
    toast({
      title: "Error",
      description: "Failed to increase quantity",
      variant: "error",
    });
  } finally {
    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  }
};
  const handleDecreaseQuantity = async (productId: string, currentQuantity: number, productName: string) => {
    if (currentQuantity <= 1) {
      await handleRemoveItem(productId, productName)
      return
    }

    setUpdatingItems((prev) => new Set(prev).add(productId))

    try {
      // Remove item and re-add with decreased quantity
      await removeFromCart(productId)
      await addToCart(productId, currentQuantity - 1)

      toast({
        title: "Quantity Updated",
        description: `${productName} quantity decreased to ${currentQuantity - 1}`,
      })
    } catch (error) {
      console.error("Error decreasing quantity:", error)
      toast({
        title: "Error",
        description: "Failed to decrease quantity",
        variant: "error",
      })
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "error",
      })
    }
  }

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Invalid Promo Code",
        description: "Please enter a valid promo code",
        variant: "error",
      })
      return
    }

    setIsApplyingPromo(true)

    // Simulate API call
    setTimeout(() => {
      // For demo purposes, accept any promo code
      toast({
        title: "Promo Code Applied",
        description: `Promo code "${promoCode}" has been applied successfully!`,
      })
      setIsApplyingPromo(false)
      setPromoCode("")
    }, 1000)
  }

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#6F4E37]" />
              <p className="text-slate-600 font-cormorant">Loading your cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Show error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-4">
            <Button onClick={refetchCart} className="bg-[#6F4E37] hover:bg-[#5d4230]">
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Show empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-[#6F4E37]/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#6F4E37] mb-2 font-cormorant">Your cart is empty</h1>
            <p className="text-slate-600 mb-6 font-cormorant">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild className="bg-[#6F4E37] hover:bg-[#5d4230] font-cormorant">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium mb-4 text-slate-600 hover:text-[#6F4E37] transition-colors font-cormorant"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#6F4E37] font-cormorant">Shopping Cart</h1>
              <p className="text-slate-600 font-cormorant">
                {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            {cart.items.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-600 border-red-200 hover:bg-red-50 font-cormorant"
              >
                Clear Cart
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="border-[#6F4E37]/20">
              <CardHeader>
                <CardTitle className="text-[#6F4E37] font-cormorant">Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item, index) => {
                  const isUpdating = updatingItems.has(item.productId._id)

                  return (
                    <motion.div
                      key={`${item.productId._id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 border border-[#6F4E37]/20 rounded-lg bg-gradient-to-r from-amber-50/30 to-[#6F4E37]/5"
                    >
                      <div className="h-20 w-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#6F4E37]/10 to-amber-100">
                        <Image
                          src={item.productId.images?.[0] || "/placeholder.svg"}
                          alt={item.productId.title}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.productId._id}`}
                          className="font-medium text-[#6F4E37] hover:text-[#5d4230] transition-colors font-cormorant"
                        >
                          {item.productId.title}
                        </Link>
                        <div className="text-sm text-slate-600 mt-1 font-cormorant">
                          <span>Stock: {item.productId.stockQuantity} available</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {item.productId.discountPrice && item.productId.discountPrice > 0 ? (
                            <>
                              <span className="text-lg font-medium text-[#6F4E37] font-cormorant">
                                {formatPrice(item.productId.discountPrice)}
                              </span>
                              <span className="text-sm text-slate-500 line-through font-cormorant">
                                {formatPrice(item.productId.originalPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-medium text-[#6F4E37] font-cormorant">
                              {formatPrice(item.productId.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-amber-50 rounded-lg border border-[#6F4E37]/20">
                          <button
                            type="button"
                            className="h-8 w-8 rounded-l-lg flex items-center justify-center text-[#6F4E37] hover:bg-[#6F4E37]/10 transition-colors disabled:opacity-50"
                            onClick={() =>
                              handleDecreaseQuantity(item.productId._id, item.quantity, item.productId.title)
                            }
                            disabled={isUpdating}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 text-[#6F4E37] font-medium min-w-[40px] text-center font-cormorant">
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : item.quantity}
                          </span>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-r-lg flex items-center justify-center text-[#6F4E37] hover:bg-[#6F4E37]/10 transition-colors disabled:opacity-50"
                            onClick={() =>
                              handleIncreaseQuantity(
                                item.productId._id,
                                item.quantity,
                                item.productId.title,
                                item.productId.stockQuantity,
                              )
                            }
                            disabled={item.quantity >= item.productId.stockQuantity || isUpdating}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-lg font-bold text-[#6F4E37] min-w-[100px] text-right font-cormorant">
                          {formatPrice((item.productId.discountPrice || item.productId.originalPrice) * item.quantity)}
                        </div>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          onClick={() => handleRemoveItem(item.productId._id, item.productId.title)}
                          disabled={isUpdating}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-[#6F4E37]/20 bg-gradient-to-b from-white to-amber-50/30">
                <CardHeader>
                  <CardTitle className="text-[#6F4E37] font-cormorant">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600 font-cormorant">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-cormorant">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="text-xs text-slate-500 italic font-cormorant">
                      * All prices include 13% VAT
                    </div>
                    <Separator className="bg-[#6F4E37]/20" />
                    <div className="flex justify-between text-lg font-bold text-[#6F4E37] font-cormorant">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#6F4E37] font-cormorant">Promo Code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="border-[#6F4E37]/20 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20 font-cormorant"
                      />
                      <Button
                        variant="outline"
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant"
                      >
                        {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    {isAuthenticated ? (
                      <Button
                        className="w-full bg-[#6F4E37] hover:bg-[#5d4230] text-white font-medium font-cormorant"
                        size="lg"
                        asChild
                      >
                        <Link href="/checkout">Proceed to Checkout</Link>
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-[#6F4E37] hover:bg-[#5d4230] text-white font-medium font-cormorant"
                        size="lg"
                        asChild
                      >
                        <Link href="/auth/login">Login to Checkout</Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant"
                      asChild
                    >
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
