"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { adminOrderService, type AdminOrder } from "../../../service/orderService"

interface OrderDeliveryStatusUpdateModalProps {
  order: AdminOrder
  open: boolean
  onClose: () => void
  onDeliveryStatusUpdated: (updatedOrder: AdminOrder) => void
}

const getDeliveryStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "SHIPPED":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "DELIVERED":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function OrderDeliveryStatusUpdateModal({ order, open, onClose, onDeliveryStatusUpdated }: OrderDeliveryStatusUpdateModalProps) {
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<string>(order.deliveryStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateDeliveryStatus = async () => {
    if (newDeliveryStatus === order.deliveryStatus) {
      toast({
        title: "No Changes",
        description: "The delivery status is already set to this value",
        variant: "error",
      })
      return
    }

    setIsUpdating(true)
    try {
      const updatedOrder = await adminOrderService.updateOrderDeliveryStatus(order._id, {
        deliveryStatus: newDeliveryStatus as "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
      })
      onDeliveryStatusUpdated(updatedOrder)
      toast({
        title: "Delivery Status Updated",
        description: `Order delivery status has been updated to ${newDeliveryStatus}`,
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update order delivery status",
        variant: "error",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#6F4E37] font-cormorant">Update Delivery Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Info */}
          <div className="p-4 bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5 rounded-lg">
            <h3 className="font-semibold text-[#6F4E37] font-cormorant mb-2">Order #{order._id.slice(-8)}</h3>
            <p className="text-sm text-[#6F4E37]/70 font-cormorant">Customer: {order.userId.username}</p>
            <p className="text-sm text-[#6F4E37]/70 font-cormorant">
              Current Delivery Status: <Badge className={getDeliveryStatusColor(order.deliveryStatus)}>{order.deliveryStatus}</Badge>
            </p>
          </div>

          {/* Delivery Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="deliveryStatus" className="text-[#6F4E37] font-cormorant">
              New Delivery Status
            </Label>
            <Select value={newDeliveryStatus} onValueChange={setNewDeliveryStatus}>
              <SelectTrigger className="border-[#6F4E37]/30 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="SHIPPED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Shipped
                  </div>
                </SelectItem>
                <SelectItem value="DELIVERED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Delivered
                  </div>
                </SelectItem>
                <SelectItem value="CANCELLED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Cancelled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Change Preview */}
          {newDeliveryStatus !== order.deliveryStatus && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-cormorant">
                Delivery status will change from <Badge className={getDeliveryStatusColor(order.deliveryStatus)}>{order.deliveryStatus}</Badge> to{" "}
                <Badge className={getDeliveryStatusColor(newDeliveryStatus)}>{newDeliveryStatus}</Badge>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant"
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDeliveryStatus}
            className="bg-[#6F4E37] hover:bg-[#5d4230] font-cormorant"
            disabled={isUpdating || newDeliveryStatus === order.deliveryStatus}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Delivery Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
