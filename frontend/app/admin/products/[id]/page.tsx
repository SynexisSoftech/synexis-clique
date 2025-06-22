"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, DollarSign, Tag, Calendar, Edit, Trash2, Eye, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { adminOrderService, type AdminOrder } from "../../../../service/orderService"

interface ProductProfile {
  _id: string
  title: string
  description: string
  originalPrice: number
  discountPrice?: number
  images: string[]
  category: string
  subcategory?: string
  stock: number
  createdAt: string
  updatedAt: string
}

export default function ProductProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [product, setProduct] = useState<ProductProfile | null>(null)
  const [productOrders, setProductOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const productId = params.id as string

  useEffect(() => {
    const fetchProductProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch product details and orders containing this product
        // Note: You'll need to create these API endpoints in your backend
        const [productResponse, ordersResponse] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch(`/api/admin/products/${productId}/orders`)
        ])

        if (!productResponse.ok) {
          throw new Error('Product not found')
        }

        const productData = await productResponse.json()
        const ordersData = await ordersResponse.json()
        
        setProduct(productData)
        setProductOrders(ordersData.orders || [])
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product profile')
        toast({
          title: "Error",
          description: "Failed to fetch product profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProductProfile()
    }
  }, [productId, toast])

  const handleBack = () => {
    router.back()
  }

  const handleEditProduct = () => {
    router.push(`/admin/products/edit/${productId}`)
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

  const getStockStatus = (stock: number): { color: string; text: string } => {
    if (stock === 0) return { color: "bg-red-100 text-red-800", text: "Out of Stock" }
    if (stock < 10) return { color: "bg-yellow-100 text-yellow-800", text: "Low Stock" }
    return { color: "bg-green-100 text-green-800", text: "In Stock" }
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

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <div className="ml-1 pt-16">
          <div className="p-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-[#6F4E37]/30 mx-auto mb-4" />
              <p className="text-red-600 font-cormorant">{error || 'Product not found'}</p>
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

  const stockStatus = getStockStatus(product.stock)

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
                <h1 className="text-3xl font-bold text-[#6F4E37] font-cormorant">Product Profile</h1>
                <p className="text-[#6F4E37]/70 font-cormorant">View product details and order history</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEditProduct}
                variant="outline"
                className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Info Card */}
            <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#6F4E37] font-cormorant">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-[#6F4E37]/10">
                    <img
                      src={product.images[selectedImage] || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            selectedImage === index
                              ? "border-[#6F4E37]"
                              : "border-[#6F4E37]/20"
                          }`}
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${product.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#6F4E37] font-cormorant mb-2">{product.title}</h2>
                  <p className="text-[#6F4E37]/70 font-cormorant text-sm mb-4">{product.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6F4E37]/70 font-cormorant">Original Price:</span>
                      <span className="font-bold text-[#6F4E37] font-cormorant">{formatPrice(product.originalPrice)}</span>
                    </div>
                    
                    {product.discountPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#6F4E37]/70 font-cormorant">Discount Price:</span>
                        <span className="font-bold text-green-600 font-cormorant">{formatPrice(product.discountPrice)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[#6F4E37]/70 font-cormorant">Stock:</span>
                      <Badge className={stockStatus.color}>{stockStatus.text} ({product.stock})</Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-[#6F4E37]/60" />
                      <div>
                        <p className="text-sm text-[#6F4E37]/70 font-cormorant">Category</p>
                        <p className="text-[#6F4E37] font-cormorant">{product.category}</p>
                      </div>
                    </div>

                    {product.subcategory && (
                      <div className="flex items-center gap-3">
                        <Tag className="h-4 w-4 text-[#6F4E37]/60" />
                        <div>
                          <p className="text-sm text-[#6F4E37]/70 font-cormorant">Subcategory</p>
                          <p className="text-[#6F4E37] font-cormorant">{product.subcategory}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-[#6F4E37]/60" />
                      <div>
                        <p className="text-sm text-[#6F4E37]/70 font-cormorant">Added</p>
                        <p className="text-[#6F4E37] font-cormorant">{formatDate(product.createdAt)}</p>
                      </div>
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
                {productOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-[#6F4E37]/30 mx-auto mb-4" />
                    <p className="text-[#6F4E37]/70 font-cormorant">No orders found for this product</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productOrders.map((order, index) => (
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
                              Customer: {order.userId.username}
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