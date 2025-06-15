"use client"
import Image from "next/image"
import { Package, User, CreditCard, Calendar } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { adminOrderService, type AdminOrder } from "../../../service/orderService"

interface OrderDetailsModalProps {
  order: AdminOrder
  open: boolean
  onClose: () => void
}

// Helper function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(price)
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200"
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function OrderDetailsModal({ order, open, onClose }: OrderDetailsModalProps) {
  // Calculate totals
  const subtotal = order.items.reduce((total, item) => item.price * item.quantity, 0)
  const totalItems = order.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-[#6F4E37]/20 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-[#6F4E37] font-cormorant">Order Details</DialogTitle>
              <p className="text-[#6F4E37]/70 font-cormorant">
                Order #{order._id.slice(-8)} • {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Information */}
          <Card className="border-[#6F4E37]/20">
            <CardHeader className="bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5">
              <CardTitle className="flex items-center gap-2 text-[#6F4E37] font-cormorant">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={order.userId.photoURL || "/placeholder.svg"} />
                  <AvatarFallback className="bg-[#6F4E37]/10 text-[#6F4E37] text-lg">
                    {order.userId.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[#6F4E37] font-cormorant">{order.userId.username}</h3>
                  <p className="text-[#6F4E37]/70 font-cormorant">{order.userId.email}</p>
                  <p className="text-sm text-[#6F4E37]/60 font-cormorant">Customer ID: {order.userId._id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-[#6F4E37]/20">
            <CardHeader className="bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5">
              <CardTitle className="flex items-center gap-2 text-[#6F4E37] font-cormorant">
                <Package className="h-5 w-5" />
                Order Items ({totalItems} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-[#6F4E37]/10 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#6F4E37]/10">
                      <Image
                        src={item.productId.images?.[0] || "/placeholder.svg"}
                        alt={item.productId.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#6F4E37] font-cormorant">{item.productId.title}</h4>
                      <p className="text-sm text-[#6F4E37]/60 font-cormorant">Product ID: {item.productId._id}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-[#6F4E37]/70 font-cormorant">Quantity: {item.quantity}</span>
                        <span className="text-sm text-[#6F4E37]/70 font-cormorant">
                          Unit Price: {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#6F4E37] font-cormorant">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.productId.discountPrice && item.productId.discountPrice < item.productId.originalPrice && (
                        <p className="text-sm text-[#6F4E37]/60 line-through font-cormorant">
                          {formatPrice(item.productId.originalPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Payment Information */}
            <Card className="border-[#6F4E37]/20">
              <CardHeader className="bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5">
                <CardTitle className="flex items-center gap-2 text-[#6F4E37] font-cormorant">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#6F4E37]/70 font-cormorant">Transaction UUID:</span>
                  <span className="font-mono text-sm text-[#6F4E37]">{order.transaction_uuid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F4E37]/70 font-cormorant">Payment Method:</span>
                  <span className="text-[#6F4E37] font-cormorant">eSewa</span>
                </div>
                <Separator className="bg-[#6F4E37]/20" />
                <div className="flex justify-between">
                  <span className="text-[#6F4E37]/70 font-cormorant">Subtotal:</span>
                  <span className="text-[#6F4E37] font-cormorant">{formatPrice(order.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F4E37]/70 font-cormorant">Total Amount:</span>
                  <span className="font-bold text-lg text-[#6F4E37] font-cormorant">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F4E37]/70 font-cormorant">Status:</span>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="border-[#6F4E37]/20">
              <CardHeader className="bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5">
                <CardTitle className="flex items-center gap-2 text-[#6F4E37] font-cormorant">
                  <Calendar className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-[#6F4E37] rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-[#6F4E37] font-cormorant">Order Created</p>
                      <p className="text-sm text-[#6F4E37]/60 font-cormorant">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.status === "COMPLETED" && (
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-600 rounded-full mt-1"></div>
                      <div>
                        <p className="font-medium text-[#6F4E37] font-cormorant">Order Completed</p>
                        <p className="text-sm text-[#6F4E37]/60 font-cormorant">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.status === "FAILED" && (
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-red-600 rounded-full mt-1"></div>
                      <div>
                        <p className="font-medium text-[#6F4E37] font-cormorant">Order Failed</p>
                        <p className="text-sm text-[#6F4E37]/60 font-cormorant">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#6F4E37]/20">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
