"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingCart, Heart, Star, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProductDetails } from "../../../../service/public/Productservice"

interface ProductQuickViewModalProps {
  product: ProductDetails | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductQuickViewModal({ product, isOpen, onClose }: ProductQuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const calculateDiscount = (originalPrice: number, finalPrice: number) => {
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Product Quick View</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.images[selectedImage] || "/placeholder.png"}
                alt={product.title}
                fill
                className="object-cover"
              />
              {product.discountPrice && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                  -{calculateDiscount(product.originalPrice, product.finalPrice)}% OFF
                </Badge>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-[#6F4E37]" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
              {product.brand && <p className="text-gray-600 mb-2">Brand: {product.brand}</p>}

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating!) ? "fill-current" : ""}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-[#6F4E37]">{formatPrice(product.finalPrice)}</span>
              {product.discountPrice && (
                <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700">{product.shortDescription || product.description}</p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Color:</h4>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                        selectedColor === color
                          ? "border-[#6F4E37] bg-[#6F4E37] text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Size:</h4>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h4 className="font-semibold mb-2">Quantity:</h4>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{product.stockQuantity} items available</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-[#6F4E37] hover:bg-[#5d4230] text-white"
                disabled={product.stockQuantity === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Cash on Delivery:</span>
                <span className={product.isCashOnDeliveryAvailable ? "text-green-600" : "text-red-600"}>
                  {product.isCashOnDeliveryAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>

            {/* View Full Details Link */}
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/products/${product._id}`}>View Full Details</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
