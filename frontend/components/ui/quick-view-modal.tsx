"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Eye, ShoppingCart, Heart, Truck, Shield, Package, Star } from "lucide-react"
import { ProductImage } from "./product-image"
import { AddToCartButton } from "@/components/AddToCartButton"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description?: string
  shortDescription?: string
  price: number
  originalPrice: number
  discountPrice?: number
  images: string[]
  category: string
  brand: string
  rating?: number
  reviews?: number
  stock: number
  status: string
  colors?: string[]
  features?: string[]
  isCashOnDeliveryAvailable?: boolean
  warranty?: string
  returnPolicy?: string
  isNew?: boolean
  createdAt?: string
}

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  if (!product) return null

  // Calculate discount percentage
  const discountPercentage = product.discountPrice && product.discountPrice > 0
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0

  // Check if product is new
  const isNew = Boolean(product.isNew) || Boolean(product.createdAt && 
    new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Check if out of stock
  const isOutOfStock = product.stock <= 0 || product.status === "out-of-stock"

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            {/* Header */}
            <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
              <DialogTitle className="text-lg font-semibold text-amber-900">
                Quick View
              </DialogTitle>
            </DialogHeader>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="p-4 lg:p-6">
                <div className="relative">
                  <ProductImage
                    src={product.images}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="rounded-lg"
                    aspectRatio="square"
                    showBadges={true}
                    discountPercentage={discountPercentage}
                    isNew={isNew}
                    isOutOfStock={isOutOfStock}
                  />
                  
                  {/* Wishlist Button */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white shadow-md"
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-amber-700'}`} />
                  </Button>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-4 lg:p-6 space-y-4">
                {/* Category & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                    {product.category}
                  </Badge>
                  {isNew && (
                    <Badge className="bg-emerald-500 text-white">
                      NEW
                    </Badge>
                  )}
                  {discountPercentage > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>

                {/* Product Name */}
                <h2 className="text-xl lg:text-2xl font-bold text-amber-900 leading-tight">
                  {product.name}
                </h2>

                {/* Brand */}
                <p className="text-sm text-amber-600">
                  Brand: {product.brand}
                </p>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating!) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                  </div>
                )}

                {/* Description */}
                {(product.shortDescription || product.description) && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {product.shortDescription || product.description}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl lg:text-3xl font-bold text-amber-900">
                    NPR {product.discountPrice || product.price}
                  </span>
                  {discountPercentage > 0 && (
                    <span className="text-lg text-amber-500 line-through">
                      NPR {product.originalPrice}
                    </span>
                  )}
                </div>

                {/* VAT Badge */}
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  VAT Included
                </Badge>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-900">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                          {feature}
                        </Badge>
                      ))}
                      {product.features.length > 3 && (
                        <span className="text-xs text-amber-500">
                          +{product.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Services */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-900">Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.isCashOnDeliveryAvailable && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        <Truck className="h-3 w-3 mr-1" />
                        Cash on Delivery
                      </Badge>
                    )}
                    {product.warranty && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Warranty
                      </Badge>
                    )}
                    {product.returnPolicy && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        <Package className="h-3 w-3 mr-1" />
                        Returns
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stock Status */}
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="text-sm text-orange-600 font-medium bg-orange-50 px-3 py-2 rounded-lg">
                    Only {product.stock} left in stock
                  </div>
                )}

                {isOutOfStock && (
                  <div className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">
                    Out of Stock
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {isOutOfStock ? (
                    <Button className="w-full bg-gray-300 text-gray-600 cursor-not-allowed" disabled>
                      Out of Stock
                    </Button>
                  ) : (
                    <AddToCartButton
                      productId={product.id}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    />
                  )}
                  
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-amber-600 text-amber-600 hover:bg-amber-50"
                  >
                    <Link href={`/products/${product.id}`} className="flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
} 
