"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Eye, ShoppingCart, Package, Shield, Truck } from "lucide-react"
import { ProductImageCompact } from "./product-image"
import { AddToCartButton } from "@/components/AddToCartButton"
import { useToast } from "@/hooks/use-toast"
import { QuickViewModal } from "./quick-view-modal"

interface ProductCardProps {
  product: {
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
  variant?: "default" | "compact" | "featured"
  showQuickView?: boolean
  showWishlist?: boolean
  className?: string | undefined
}

export function ProductCard({
  product,
  variant = "default",
  showQuickView = true,
  showWishlist = true,
  className = "",
}: ProductCardProps) {
  const { toast } = useToast()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  // Calculate discount percentage
  const discountPercentage = product.discountPrice && product.discountPrice > 0
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0

  // Check if product is new (created within last 7 days)
  const isNew = Boolean(product.isNew) || Boolean(product.createdAt && 
    new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Check if out of stock
  const isOutOfStock = product.stock <= 0 || product.status === "out-of-stock"

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted ? `${product.name} removed from your wishlist` : `${product.name} added to your wishlist`,
      variant: "success",
    })
  }

  const handleQuickView = () => {
    setIsQuickViewOpen(true)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -4, scale: 1.01 }
  }

  const renderCompactCard = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group cursor-pointer ${className}`}
    >
      <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
        {/* Image Section */}
        <div className="relative">
          <Link href={`/products/${product.id}`}>
            <ProductImageCompact
              src={product.images}
              alt={product.name}
              discountPercentage={discountPercentage}
              isNew={isNew}
              isOutOfStock={isOutOfStock}
            />
          </Link>

          {/* Action Buttons */}
          <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            {showWishlist && (
              <Button
                size="icon"
                variant="secondary"
                className="h-7 w-7 bg-white/90 hover:bg-white shadow-md"
                onClick={handleWishlistToggle}
              >
                <Heart className={`h-3 w-3 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-amber-700'}`} />
              </Button>
            )}
            {showQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className="h-7 w-7 bg-white/90 hover:bg-white shadow-md"
                onClick={handleQuickView}
              >
                <Eye className="h-3 w-3 text-amber-700" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-3">
          {/* Category */}
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              {product.category}
            </Badge>
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2 hover:text-amber-700 transition-colors text-amber-900">
              {product.name}
            </h3>
          </Link>

          {/* Brand */}
          <p className="text-xs text-amber-600 mb-2">{product.brand}</p>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-base text-amber-900">
              NPR {product.discountPrice || product.price}
            </span>
            {discountPercentage > 0 && (
              <span className="text-xs text-amber-500 line-through">
                NPR {product.originalPrice}
              </span>
            )}
          </div>

          {/* VAT Badge */}
          <div className="mb-2">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              VAT Included
            </Badge>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-2 pt-0">
          {isOutOfStock ? (
            <Button className="w-full bg-gray-300 text-gray-600 cursor-not-allowed text-sm py-1" disabled>
              Out of Stock
            </Button>
          ) : (
            <>
              <div className="flex gap-2 w-full">
                <AddToCartButton
                  productId={product.id}
                  className="flex-1 w-1/2 bg-amber-600 hover:bg-amber-700 text-white text-sm py-2"
                />
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 w-1/2 border-amber-200 text-amber-800 hover:bg-amber-50 text-sm py-2"
                >
                  <Link href={`/products/${product.id}`}>View Product</Link>
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )

  const renderDefaultCard = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group cursor-pointer ${className}`}
    >
      <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
        {/* Image Section */}
        <div className="relative">
          <Link href={`/products/${product.id}`}>
            <ProductImageCompact
              src={product.images}
              alt={product.name}
              discountPercentage={discountPercentage}
              isNew={isNew}
              isOutOfStock={isOutOfStock}
            />
          </Link>

          {/* Action Buttons */}
          <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}>
            {showWishlist && (
              <Button
                size="icon"
                variant="secondary"
                className="h-7 w-7 bg-white/90 hover:bg-white shadow-md"
                onClick={handleWishlistToggle}
              >
                <Heart className={`h-3 w-3 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-amber-700'}`} />
              </Button>
            )}
            {showQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className="h-7 w-7 bg-white/90 hover:bg-white shadow-md"
                onClick={handleQuickView}
              >
                <Eye className="h-3 w-3 text-amber-700" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-2">
          {/* Category */}
          <div className="mb-1">
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
              {product.category}
            </Badge>
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-sm mb-1 line-clamp-1 hover:text-amber-700 transition-colors text-amber-900">
              {product.name}
            </h3>
          </Link>

          {/* Brand */}
          <p className="text-xs text-amber-600 mb-1">{product.brand}</p>

          {/* Price */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-amber-900">
              NPR {product.discountPrice || product.price}
            </span>
            {discountPercentage > 0 && (
              <span className="text-xs text-amber-500 line-through">
                NPR {product.originalPrice}
              </span>
            )}
          </div>

          {/* VAT Badge */}
          <div className="mb-1">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              VAT Included
            </Badge>
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-1 mb-1">
            {product.isCashOnDeliveryAvailable && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                <Truck className="h-2 w-2 mr-1" />
                COD
              </Badge>
            )}
            {product.warranty && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                <Shield className="h-2 w-2 mr-1" />
                Warranty
              </Badge>
            )}
            {product.returnPolicy && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                <Package className="h-2 w-2 mr-1" />
                Returns
              </Badge>
            )}
          </div>

          {/* Stock Status */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-lg mb-1">
              Only {product.stock} left in stock
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-2 pt-0">
          {isOutOfStock ? (
            <Button className="w-full bg-gray-300 text-gray-600 cursor-not-allowed text-sm py-1" disabled>
              Out of Stock
            </Button>
          ) : (
            <>
              <AddToCartButton
                productId={product.id}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm py-1"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full mt-1 border-amber-200 text-amber-800 hover:bg-amber-50 text-xs py-1"
              >
                <Link href={`/products/${product.id}`}>View Product</Link>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )

  return (
    <>
      {variant === "compact" ? renderCompactCard() : renderDefaultCard()}
      
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  )
} 
