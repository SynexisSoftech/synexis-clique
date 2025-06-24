"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Package, Edit, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/utils/axiosInstance"
import { adminOrderService, type AdminOrder } from "../../../../service/orderService"

interface UserProfile {
  _id: string
  username: string
  email: string
  photoURL?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userOrders, setUserOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = params.id as string

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user details and their orders
        // Note: You'll need to create these API endpoints in your backend
        const [userResponse, ordersResponse] = await Promise.all([
          apiClient.get(`/api/admin/users/${userId}`),
          apiClient.get(`/api/admin/users/${userId}/orders`)
        ])

        const userData = userResponse.data
        const ordersData = ordersResponse.data
        
        setUser(userData)
        setUserOrders(ordersData.orders || [])
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user profile')
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId, toast])

  const handleBack = () => {
    router.back()
  }

  const handleEditUser = () => {
    router.push(`/admin/users/edit/${userId}`)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="ml-1 pt-16">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64 md:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen">
        <div className="ml-1 pt-16">
          <div className="p-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 text-[#6F4E37]/30 mx-auto mb-4" />
              <p className="text-red-600 font-cormorant">{error || 'User not found'}</p>
              <Button
                onClick={handleBack}
                variant="outline"
                className="mt-4 border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="ml-1 pt-16">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#6F4E37] font-cormorant">Customer Profile</h1>
                <p className="text-[#6F4E37]/70 font-cormorant">View customer details and order history</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEditUser}
                variant="outline"
                className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#6F4E37] font-cormorant">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                    <AvatarFallback className="bg-[#6F4E37]/10 text-[#6F4E37] text-2xl">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-[#6F4E37] font-cormorant">{user.username}</h2>
                    <p className="text-[#6F4E37]/70 font-cormorant">Customer ID: {user._id.slice(-8)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#6F4E37]/60" />
                    <div>
                      <p className="text-sm text-[#6F4E37]/70 font-cormorant">Email</p>
                      <p className="text-[#6F4E37] font-cormorant">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-[#6F4E37]/60" />
                      <div>
                        <p className="text-sm text-[#6F4E37]/70 font-cormorant">Phone</p>
                        <p className="text-[#6F4E37] font-cormorant">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-[#6F4E37]/60" />
                      <div>
                        <p className="text-sm text-[#6F4E37]/70 font-cormorant">Address</p>
                        <p className="text-[#6F4E37] font-cormorant">{user.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#6F4E37]/60" />
                    <div>
                      <p className="text-sm text-[#6F4E37]/70 font-cormorant">Member Since</p>
                      <p className="text-[#6F4E37] font-cormorant">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order History Card */}
            <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-[#6F4E37] font-cormorant">Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-[#6F4E37]/30 mx-auto mb-4" />
                    <p className="text-[#6F4E37]/70 font-cormorant">No orders found for this customer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-[#6F4E37]/20 rounded-lg hover:bg-[#6F4E37]/5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#6F4E37] font-cormorant">
                              Order #{order._id.slice(-8)}
                            </p>
                            <p className="text-sm text-[#6F4E37]/60 font-cormorant">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#6F4E37] font-cormorant">
                              {formatPrice(order.totalAmount)}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge className="text-xs">{order.status}</Badge>
                              <Badge className="text-xs">{order.deliveryStatus}</Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 