"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, X, Trash2, Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

// Mock cart data - replace with your actual cart state management
const mockCartItems = [
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
]

interface CartDropdownProps {
  count: number
  onClick?: () => void
}

export default function CartDropdown({ count, onClick }: CartDropdownProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(mockCartItems)

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

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

  const handleCartClick = () => {
    if (onClick) {
      onClick()
    }
    setOpen(!open)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full bg-gradient-to-r from-[#6F4E37]/10 to-amber-500/10 hover:from-[#6F4E37]/20 hover:to-amber-500/20 transition-all duration-300 hover:scale-110"
          onClick={handleCartClick}
        >
          <ShoppingCart className="h-5 w-5 text-[#6F4E37]" />
          <AnimatePresence>
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-[#6F4E37] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
              >
                {itemCount}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="sr-only">Shopping Cart</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-gradient-to-b from-white to-amber-50/30 border-[#6F4E37]/20" align="end">
        <DropdownMenuLabel className="flex justify-between items-center text-[#6F4E37] font-cormorant font-medium">
          <span>Shopping Cart ({itemCount})</span>
          {itemCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-[#6F4E37]/10" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 text-[#6F4E37]" />
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#6F4E37]/20" />
        {items.length === 0 ? (
          <div className="py-6 text-center">
            <div className="flex justify-center mb-3">
              <ShoppingCart className="h-10 w-10 text-[#6F4E37]/30" />
            </div>
            <p className="text-sm text-[#6F4E37]/70 mb-4 font-cormorant">Your cart is empty</p>
            <Button
              variant="outline"
              size="sm"
              className="text-[#6F4E37] border-[#6F4E37]/30 hover:bg-[#6F4E37]/10 font-cormorant"
              onClick={() => setOpen(false)}
              asChild
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px]">
              <DropdownMenuGroup className="p-2">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}-${item.color}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownMenuItem className="flex p-0 focus:bg-[#6F4E37]/5 rounded-lg">
                        <div className="flex items-center gap-3 py-2 w-full px-2">
                          <div className="h-16 w-16 rounded-md overflow-hidden bg-gradient-to-br from-[#6F4E37]/10 to-amber-100/50">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.id}`}
                              className="text-sm font-medium hover:text-[#6F4E37] truncate block font-cormorant"
                              onClick={() => setOpen(false)}
                            >
                              {item.name}
                            </Link>
                            <div className="text-xs text-[#6F4E37]/60 mt-1">
                              <span>Size: {item.size}</span>
                              <span className="mx-1">|</span>
                              <span>Color: {item.color}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-[#6F4E37]/5 rounded-md">
                                <button
                                  className="h-6 w-6 rounded-l-md border border-[#6F4E37]/20 flex items-center justify-center text-[#6F4E37] hover:bg-[#6F4E37]/10 transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    updateQuantity(item.id, item.quantity - 1)
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="mx-2 text-xs font-medium text-[#6F4E37] min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  className="h-6 w-6 rounded-r-md border border-[#6F4E37]/20 flex items-center justify-center text-[#6F4E37] hover:bg-[#6F4E37]/10 transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    updateQuantity(item.id, item.quantity + 1)
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="text-sm font-medium text-[#6F4E37] font-cormorant">
                                NPR {(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <button
                            className="text-[#6F4E37]/40 hover:text-[#6F4E37] p-1 rounded-md hover:bg-[#6F4E37]/10 transition-colors"
                            onClick={(e) => {
                              e.preventDefault()
                              removeItem(item.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </DropdownMenuItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </DropdownMenuGroup>
            </ScrollArea>
            <DropdownMenuSeparator className="bg-[#6F4E37]/20" />
            <div className="p-4">
              <div className="flex justify-between mb-4">
                <span className="text-sm text-[#6F4E37]/70 font-cormorant">Subtotal</span>
                <span className="text-sm font-medium text-[#6F4E37] font-cormorant">
                  NPR {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-[#6F4E37] hover:bg-[#5d4230] text-white font-cormorant font-medium transition-colors"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant font-medium"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
