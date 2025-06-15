"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Edit, MoreHorizontal, Download, RefreshCw, Calendar, Package } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { adminOrderService, AdminOrdersResponse, type AdminOrder } from "../../../service/orderService"
import OrderDetailsModal from "./OrderDetailsModal"
import OrderStatusUpdateModal from "./OrderStatusUpdateModal"

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
    month: "short",
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const { toast } = useToast()

  const fetchOrders = async (page = 1, search = "", status = "") => {
    try {
      setLoading(true)
      setError(null)
      const response: AdminOrdersResponse = await adminOrderService.getAllOrders(
        page,
        10,
        status || undefined,
        search || undefined,
      )
      setOrders(response.orders)
      setCurrentPage(response.page)
      setTotalPages(response.pages)
      setTotalCount(response.count)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch orders")
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter)
  }, [currentPage, searchTerm, statusFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = (order: AdminOrder) => {
    setSelectedOrder(order)
    setShowStatusModal(true)
  }

  const handleStatusUpdated = (updatedOrder: AdminOrder) => {
    setOrders(orders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)))
    setShowStatusModal(false)
    setSelectedOrder(null)
    toast({
      title: "Status Updated",
      description: `Order status updated to ${updatedOrder.status}`,
    })
  }

  const handleExportOrders = () => {
    toast({
      title: "Export Started",
      description: "Orders export will be downloaded shortly",
    })
    // Implement export functionality
  }

  const handleRefresh = () => {
    fetchOrders(currentPage, searchTerm, statusFilter)
  }

  // Calculate total items across all orders for the current order
  const getTotalItems = (order: AdminOrder): number => {
    return order.items.reduce((total, item) => total + item.quantity, 0)
  }

  // Get first product image for display
  const getFirstProductImage = (order: AdminOrder): string => {
    return order.items[0]?.productId?.images?.[0] || "/placeholder.svg?height=40&width=40"
  }

  // Get product titles summary
  const getProductTitles = (order: AdminOrder): string => {
    if (order.items.length === 1) {
      return order.items[0].productId.title
    }
    return `${order.items[0].productId.title} +${order.items.length - 1} more`
  }

  return (
    <div className="min-h-screen ">"
      {/* Main Content Area - Leave space for sidebar and header */}
      <div className="ml-1 pt-16">
        {" "}
        {/* ml-64 for sidebar, pt-16 for header */}
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#6F4E37] font-cormorant">Order Management</h1>
              <p className="text-[#6F4E37]/70 font-cormorant">Manage and track all customer orders</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleExportOrders}
                variant="outline"
                size="sm"
                className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6F4E37]/70 font-cormorant">Total Orders</p>
                    <p className="text-xl font-bold text-[#6F4E37] font-cormorant">{totalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6F4E37]/70 font-cormorant">Pending</p>
                    <p className="text-xl font-bold text-[#6F4E37] font-cormorant">
                      {orders.filter((o) => o.status === "PENDING").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6F4E37]/70 font-cormorant">Completed</p>
                    <p className="text-xl font-bold text-[#6F4E37] font-cormorant">
                      {orders.filter((o) => o.status === "COMPLETED").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6F4E37]/70 font-cormorant">Failed</p>
                    <p className="text-xl font-bold text-[#6F4E37] font-cormorant">
                      {orders.filter((o) => o.status === "FAILED").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6F4E37]/50" />
                    <Input
                      placeholder="Search by order ID, customer email, or transaction UUID..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 border-[#6F4E37]/30 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-40 border-[#6F4E37]/30 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#6F4E37] font-cormorant">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 font-cormorant">{error}</p>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="mt-4 border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
                  >
                    Try Again
                  </Button>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-[#6F4E37]/30 mx-auto mb-4" />
                  <p className="text-[#6F4E37]/70 font-cormorant">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#6F4E37]/20">
                        <TableHead className="text-[#6F4E37] font-cormorant">Order</TableHead>
                        <TableHead className="text-[#6F4E37] font-cormorant">Customer</TableHead>
                        <TableHead className="text-[#6F4E37] font-cormorant">Products</TableHead>
                        <TableHead className="text-[#6F4E37] font-cormorant">Amount</TableHead>
                        <TableHead className="text-[#6F4E37] font-cormorant">Status</TableHead>
                        <TableHead className="text-[#6F4E37] font-cormorant">Date</TableHead>
                        <TableHead className="text-[#6F4E37] font-cormorant">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order, index) => (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-[#6F4E37]/10 hover:bg-[#6F4E37]/5"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-[#6F4E37] font-cormorant">#{order._id.slice(-8)}</p>
                              <p className="text-xs text-[#6F4E37]/60 font-mono">{order.transaction_uuid}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={order.userId.photoURL || "/placeholder.svg"} />
                                <AvatarFallback className="bg-[#6F4E37]/10 text-[#6F4E37]">
                                  {order.userId.username?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-[#6F4E37] font-cormorant">{order.userId.username}</p>
                                <p className="text-xs text-[#6F4E37]/60 font-cormorant">{order.userId.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={getFirstProductImage(order) || "/placeholder.svg"}
                                alt="Product"
                                className="w-10 h-10 rounded-lg object-cover bg-[#6F4E37]/10"
                              />
                              <div>
                                <p className="font-medium text-[#6F4E37] font-cormorant text-sm">
                                  {getProductTitles(order)}
                                </p>
                                <p className="text-xs text-[#6F4E37]/60 font-cormorant">
                                  {getTotalItems(order)} item{getTotalItems(order) !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-bold text-[#6F4E37] font-cormorant">
                                {formatPrice(order.totalAmount)}
                              </p>
                              {order.amount !== order.totalAmount && (
                                <p className="text-xs text-[#6F4E37]/60 font-cormorant">
                                  Subtotal: {formatPrice(order.amount)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-[#6F4E37] font-cormorant">{formatDate(order.createdAt)}</p>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#6F4E37]/10">
                                  <MoreHorizontal className="h-4 w-4 text-[#6F4E37]" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border-[#6F4E37]/20">
                                <DropdownMenuLabel className="text-[#6F4E37] font-cormorant">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#6F4E37]/20" />
                                <DropdownMenuItem
                                  onClick={() => handleViewOrder(order)}
                                  className="text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(order)}
                                  className="text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-[#6F4E37]/70 font-cormorant">
                    Showing {orders.length} of {totalCount} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-[#6F4E37] font-cormorant px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <>
          <OrderDetailsModal
            order={selectedOrder}
            open={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedOrder(null)
            }}
          />
          <OrderStatusUpdateModal
            order={selectedOrder}
            open={showStatusModal}
            onClose={() => {
              setShowStatusModal(false)
              setSelectedOrder(null)
            }}
            onStatusUpdated={handleStatusUpdated}
          />
        </>
      )}
    </div>
  )
}
