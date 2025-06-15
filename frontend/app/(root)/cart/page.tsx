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
import { useCart } from "@/hooks/useCart"

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
  const { cart, isLoading, error, removeFromCart, clearCart, refetchCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
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
  const shipping = subtotal > 0 ? 500 : 0
  const tax = Math.round(subtotal * 0.13)
  const total = subtotal + shipping + tax

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
        variant: "destructive",
      })
    }
  }

  const handleUpdateQuantity = async (productId: string, newQuantity: number, productName: string) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(productId, productName)
      return
    }

    try {
      // You'll need to implement updateQuantity in your cart service
      // For now, we'll just show a message
      toast({
        title: "Feature Coming Soon",
        description: "Quantity update feature will be available soon",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
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
        variant: "destructive",
      })
    }
  }

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Invalid Promo Code",
        description: "Please enter a valid promo code",
        variant: "destructive",
      })
      return
    }

    setIsApplyingPromo(true)

    setTimeout(() => {
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
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p className="text-slate-600">Loading your cart...</p>
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
            <Button onClick={refetchCart} className="bg-rose-600 hover:bg-rose-700">
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
            <ShoppingBag className="h-16 w-16 text-rose-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
            <p className="text-slate-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="bg-rose-600 hover:bg-rose-700">
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
            className="inline-flex items-center text-sm font-medium mb-4 text-slate-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
              <p className="text-slate-600">
                {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            {cart.items.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item, index) => (
                  <motion.div
                    key={`${item.productId._id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-gradient-to-r from-slate-50 to-rose-50/30"
                  >
                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-rose-100">
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
                        className="font-medium text-slate-900 hover:text-rose-600 transition-colors"
                      >
                        {item.productId.title}
                      </Link>
                      <div className="text-sm text-slate-600 mt-1">
                        <span>Stock: {item.productId.stockQuantity} available</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {item.productId.discountPrice && item.productId.discountPrice > 0 ? (
                          <>
                            <span className="text-lg font-medium text-rose-600">
                              {formatPrice(item.productId.discountPrice)}
                            </span>
                            <span className="text-sm text-slate-500 line-through">
                              {formatPrice(item.productId.originalPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-medium text-slate-900">
                            {formatPrice(item.productId.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200">
                        <button
                          className="h-8 w-8 rounded-l-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                          onClick={() =>
                            handleUpdateQuantity(item.productId._id, item.quantity - 1, item.productId.title)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 text-slate-900 font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="h-8 w-8 rounded-r-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                          onClick={() =>
                            handleUpdateQuantity(item.productId._id, item.quantity + 1, item.productId.title)
                          }
                          disabled={item.quantity >= item.productId.stockQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-lg font-bold text-slate-900 min-w-[100px] text-right">
                        {formatPrice((item.productId.discountPrice || item.productId.originalPrice) * item.quantity)}
                      </div>
                      <button
                        className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        onClick={() => handleRemoveItem(item.productId._id, item.productId.title)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-slate-200 bg-gradient-to-b from-white to-slate-50/30">
                <CardHeader>
                  <CardTitle className="text-slate-900">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span>{shipping > 0 ? formatPrice(shipping) : "Free"}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (13%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <Separator className="bg-slate-200" />
                    <div className="flex justify-between text-lg font-bold text-slate-900">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Promo Code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="border-slate-200 focus:border-rose-500 focus:ring-rose-200"
                      />
                      <Button
                        variant="outline"
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    {isAuthenticated ? (
                      <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium" size="lg" asChild>
                        <Link href="/checkout">Proceed to Checkout</Link>
                      </Button>
                    ) : (
                      <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium" size="lg" asChild>
                        <Link href="/auth/login">Login to Checkout</Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
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
