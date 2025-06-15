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

interface OrderStatusUpdateModalProps {
  order: AdminOrder
  open: boolean
  onClose: () => void
  onStatusUpdated: (updatedOrder: AdminOrder) => void
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

export default function OrderStatusUpdateModal({ order, open, onClose, onStatusUpdated }: OrderStatusUpdateModalProps) {
  const [newStatus, setNewStatus] = useState<string>(order.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) {
      toast({
        title: "No Changes",
        description: "The status is already set to this value",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const updatedOrder = await adminOrderService.updateOrderStatus(order._id, {
        status: newStatus as "PENDING" | "COMPLETED" | "FAILED",
      })
      onStatusUpdated(updatedOrder)
      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${newStatus}`,
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#6F4E37] font-cormorant">Update Order Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Info */}
          <div className="p-4 bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5 rounded-lg">
            <h3 className="font-semibold text-[#6F4E37] font-cormorant mb-2">Order #{order._id.slice(-8)}</h3>
            <p className="text-sm text-[#6F4E37]/70 font-cormorant">Customer: {order.userId.username}</p>
            <p className="text-sm text-[#6F4E37]/70 font-cormorant">
              Current Status: <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </p>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-[#6F4E37] font-cormorant">
              New Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
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
                <SelectItem value="COMPLETED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value="FAILED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Failed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Change Preview */}
          {newStatus !== order.status && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-cormorant">
                Status will change from <Badge className={getStatusColor(order.status)}>{order.status}</Badge> to{" "}
                <Badge className={getStatusColor(newStatus)}>{newStatus}</Badge>
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
            onClick={handleUpdateStatus}
            className="bg-[#6F4E37] hover:bg-[#5d4230] font-cormorant"
            disabled={isUpdating || newStatus === order.status}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
