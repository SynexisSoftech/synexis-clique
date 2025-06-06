"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"

// Mock cart data - replace with your actual cart state management
const initialCartItems = [
  {
    id: 1,
    name: "Air Zoom Runner",
    price: 8500,
    quantity: 2,
    size: "42",
    color: "Blue",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Classic Leather Loafers",
    price: 7200,
    quantity: 1,
    size: "41",
    color: "Brown",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Urban Canvas Sneakers",
    price: 4500,
    quantity: 1,
    size: "40",
    color: "Black",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1998&auto=format&fit=crop",
  },
]

export default function CartPage() {
  const [items, setItems] = useState(initialCartItems)
  const [promoCode, setPromoCode] = useState("")

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = 500 // Fixed shipping cost
  const tax = Math.round(subtotal * 0.13) // 13% tax
  const total = subtotal + shipping + tax

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setItems(items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const applyPromoCode = () => {
    // Handle promo code logic here
    console.log("Applying promo code:", promoCode)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-[#6F4E37]/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#6F4E37] mb-2 font-cormorant">Your cart is empty</h1>
          <p className="text-[#6F4E37]/70 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild className="bg-[#6F4E37] hover:bg-[#5d4230] font-cormorant">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
 

    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-medium mb-4 text-[#6F4E37]/70 hover:text-[#6F4E37] transition-colors font-cormorant"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Continue Shopping
        </Link>
        <h1 className="text-3xl font-bold text-[#6F4E37] font-cormorant">Shopping Cart</h1>
        <p className="text-[#6F4E37]/70 font-cormorant">
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card className="border-[#6F4E37]/20">
            <CardHeader>
              <CardTitle className="text-[#6F4E37] font-cormorant">Cart Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 border border-[#6F4E37]/10 rounded-lg bg-gradient-to-r from-[#6F4E37]/5 to-amber-50/30"
                >
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#6F4E37]/10 to-amber-100/50">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.id}`}
                      className="font-medium text-[#6F4E37] hover:text-[#5d4230] transition-colors font-cormorant"
                    >
                      {item.name}
                    </Link>
                    <div className="text-sm text-[#6F4E37]/60 mt-1">
                      <span>Size: {item.size}</span>
                      <span className="mx-2">|</span>
                      <span>Color: {item.color}</span>
                    </div>
                    <div className="text-lg font-medium text-[#6F4E37] mt-2 font-cormorant">
                      NPR {item.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[#6F4E37]/5 rounded-lg border border-[#6F4E37]/20">
                      <button
                        className="h-8 w-8 rounded-l-lg flex items-center justify-center text-[#6F4E37] hover:bg-[#6F4E37]/10 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 text-[#6F4E37] font-medium min-w-[40px] text-center">{item.quantity}</span>
                      <button
                        className="h-8 w-8 rounded-r-lg flex items-center justify-center text-[#6F4E37] hover:bg-[#6F4E37]/10 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-lg font-bold text-[#6F4E37] min-w-[100px] text-right font-cormorant">
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </div>
                    <button
                      className="text-[#6F4E37]/40 hover:text-[#6F4E37] p-2 rounded-lg hover:bg-[#6F4E37]/10 transition-colors"
                      onClick={() => removeItem(item.id)}
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
            <Card className="border-[#6F4E37]/20 bg-gradient-to-b from-white to-amber-50/30">
              <CardHeader>
                <CardTitle className="text-[#6F4E37] font-cormorant">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[#6F4E37]/70">
                    <span>Subtotal</span>
                    <span>NPR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#6F4E37]/70">
                    <span>Shipping</span>
                    <span>NPR {shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#6F4E37]/70">
                    <span>Tax (13%)</span>
                    <span>NPR {tax.toLocaleString()}</span>
                  </div>
                  <Separator className="bg-[#6F4E37]/20" />
                  <div className="flex justify-between text-lg font-bold text-[#6F4E37] font-cormorant">
                    <span>Total</span>
                    <span>NPR {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#6F4E37] font-cormorant">Promo Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="border-[#6F4E37]/20 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20"
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    className="w-full bg-[#6F4E37] hover:bg-[#5d4230] text-white font-cormorant font-medium"
                    size="lg"
                    asChild
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
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

       </div>
  )
}
