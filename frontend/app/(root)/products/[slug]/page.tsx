"use client"

import { useState, useRef, useEffect } from "react"
import { CardFooter } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Star, RotateCw, Check, ThumbsUp, ThumbsDown, Loader2, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"
import { productsService } from "../../../../service/ProductsService"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "../../components/navbar/navbar"
import Footer from "../../components/footer/footer"
import {AddToCartButton} from "@/components/AddToCartButton"
import { useCart } from "@/hooks/useCart"

// Add proper TypeScript interfaces
interface ICategory {
  _id: string
  title: string
}

interface ISubcategory {
  _id: string
  title: string
}

interface IDimensions {
  length: number
  width: number
  height: number
  unit?: string
}

interface ICustomDetail {
  label: string
  value: string
}

// Update the Product interface to match your model
interface Product {
  _id: string
  title: string
  description: string
  shortDescription?: string
  categoryId: string | ICategory
  subcategoryId: string | ISubcategory
  originalPrice: number
  discountPrice?: number
  stockQuantity: number
  features?: string[]
  colors?: string[]
  sizes?: string[]
  brand?: string
  tags?: string[]
  returnPolicy?: string
  warranty?: string
  weight?: string
  dimensions?: IDimensions
  material?: string
  images: string[]
  customDetails?: ICustomDetail[]
  status: "active" | "inactive" | "out-of-stock"
  isCashOnDeliveryAvailable: boolean
  createdAt: string
  updatedAt: string
}

const mapApiProductToUiProduct = (product: Product) => {
  // Calculate final price
  const finalPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.originalPrice

  // Calculate discount percentage
  const discountPercentage =
    product.discountPrice && product.discountPrice > 0
      ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
      : 0

  return {
    id: product._id,
    name: product.title,
    description: product.description,
    shortDescription: product.shortDescription || product.description,
    longDescription: product.description,
    price: product.originalPrice,
    originalPrice: product.originalPrice,
    discountPrice: product.discountPrice || 0,
    finalPrice: finalPrice,
    discountPercentage: discountPercentage,
    images: product.images && product.images.length > 0 ? product.images : ["/placeholder.svg?height=600&width=600"],
    rotationImages:
      product.images && product.images.length > 0 ? product.images : ["/placeholder.svg?height=600&width=600"],
    category: typeof product.categoryId === "object" && product.categoryId ? product.categoryId.title : "Unknown",
    subcategory:
      typeof product.subcategoryId === "object" && product.subcategoryId ? product.subcategoryId.title : "Unknown",
    featured: product.status === "active",
    inStock: product.stockQuantity > 0 && product.status !== "out-of-stock",
    stockQuantity: product.stockQuantity,
    status: product.status,
    colors: product.colors || [],
    availableColors: product.colors || [],
    sizes: product.sizes || [],
    availableSizes: product.sizes || [],
    features: product.features || [],
    brand: product.brand || "Unknown",
    material: product.material || "Not specified",
    weight: product.weight || "Not specified",
    dimensions: product.dimensions
      ? {
          length: product.dimensions.length,
          width: product.dimensions.width,
          height: product.dimensions.height,
          unit: product.dimensions.unit || "cm",
        }
      : null,
    returnPolicy: product.returnPolicy || "Standard return policy applies",
    warranty: product.warranty || "Standard warranty applies",
    tags: product.tags || [],
    customDetails: product.customDetails || [],
    isCashOnDeliveryAvailable: product.isCashOnDeliveryAvailable,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    // Default values for UI
    rating: 4.5, // You might want to calculate this from reviews
    reviews: 24, // You might want to get this from a reviews collection
    stock: product.stockQuantity, // Add this for compatibility
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [activeImage, setActiveImage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeVideo, setActiveVideo] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [is360Active, setIs360Active] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [slug, setSlug] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  const { getItemQuantity } = useCart()

  // Get current quantity in cart
  const cartQuantity = product ? getItemQuantity(product.id) : 0

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        setSlug(resolvedParams.slug)
      } catch (error) {
        console.error("Error resolving params:", error)
        setError("Failed to load product")
        setLoading(false)
      }
    }

    resolveParams()
  }, [params])

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null) // Reset error state

        // Use the slug parameter directly - it could be either a string ID or a slug
        const apiProduct = await productsService.getProductById(slug)
        const mappedProduct = mapApiProductToUiProduct(apiProduct)
        setProduct(mappedProduct)

        // Set default size and color if available
        if (mappedProduct.availableSizes && mappedProduct.availableSizes.length > 0) {
          setSelectedSize(mappedProduct.availableSizes[0])
        }
        if (mappedProduct.availableColors && mappedProduct.availableColors.length > 0) {
          setSelectedColor(mappedProduct.availableColors[0])
        }

        // Fetch related products (same category)
        if (typeof apiProduct.categoryId === "string") {
          try {
            const relatedResponse = await productsService.getProducts({
              categoryId: apiProduct.categoryId,
              status: "active",
              limit: 4,
            })
            const mappedRelated = relatedResponse.products
              .filter((p) => p._id !== apiProduct._id)
              .slice(0, 3)
              .map(mapApiProductToUiProduct)
            setRelatedProducts(mappedRelated)
          } catch (relatedError) {
            console.warn("Failed to fetch related products:", relatedError)
            setRelatedProducts([])
          }
        }
      } catch (err: any) {
        console.error("Error fetching product:", err)
        setError(err.message || "Failed to fetch product")
        toast({
          title: "Error",
          description: err.message || "Failed to fetch product",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if we have a slug
    if (slug) {
      fetchProduct()
    }
  }, [slug, toast])

  // Sample reviews data (you can replace this with API call)
  const reviews = [
    {
      id: 1,
      name: "Rajesh Gurung",
      avatar: "RG",
      date: "2 months ago",
      rating: 5,
      comment:
        "These are the most comfortable running shoes I've ever owned! Great cushioning and support for my daily runs. The color is exactly as shown in the pictures and they look amazing.",
      helpful: 12,
      unhelpful: 1,
      verified: true,
    },
    {
      id: 2,
      name: "Priya Thapa",
      avatar: "PT",
      date: "3 months ago",
      rating: 4,
      comment:
        "Great running shoes with excellent cushioning. They're lightweight and breathable. I would have given 5 stars but delivery took longer than expected.",
      helpful: 8,
      unhelpful: 2,
      verified: true,
    },
    {
      id: 3,
      name: "Anil Sharma",
      avatar: "AS",
      date: "1 month ago",
      rating: 5,
      comment:
        "Perfect fit and very comfortable for long runs. I've been using these for marathon training and they've held up really well. Highly recommend!",
      helpful: 15,
      unhelpful: 0,
      verified: true,
    },
  ]

  const ratingDistribution = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ]

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist)
    toast({
      title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: isInWishlist
        ? `${product?.name} removed from your wishlist`
        : `${product?.name} added to your wishlist`,
    })
  }

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      })
    } else {
      toast({
        title: "Share this product",
        description: "Link copied to clipboard!",
      })
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleVideoPlay = (index: number) => {
    if (videoRef.current && product?.videos && product.videos.length > 0) {
      if (activeVideo === index && isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        setActiveVideo(index)
        videoRef.current.src = product.videos[index].url
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error)
          setIsPlaying(false)
        })
        setIsPlaying(true)
      }
    }
  }

  const toggle360View = () => {
    setIs360Active(!is360Active)
    setRotation(0)
  }

  const handleRotation = (value: number[]) => {
    if (Array.isArray(value) && value.length > 0) {
      setRotation(value[0])
    }
  }

  const getRotationImage = () => {
    if (!product?.rotationImages || product.rotationImages.length === 0) {
      return product?.images[0] || "/placeholder.svg?height=600&width=600"
    }
    const index = Math.min(
      Math.floor((rotation / 100) * (product.rotationImages.length - 1)),
      product.rotationImages.length - 1,
    )
    return product.rotationImages[index]
  }

  const markHelpful = (reviewId: number, isHelpful: boolean) => {
    toast({
      title: "Thank you for your feedback",
      description: `You marked this review as ${isHelpful ? "helpful" : "not helpful"}`,
    })
  }

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ""
      }
    }
  }, [])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p className="text-slate-600">Loading product details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || "Product not found"}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-4">
            <Button asChild className="bg-rose-600 hover:bg-rose-700">
              <Link href="/products">Back to Products</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container px-4 py-8 md:px-6 md:py-12"
      >
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-rose-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/products" className="hover:text-rose-600 transition-colors">
            Products
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-rose-600 transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {is360Active ? (
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-rose-50 to-pink-50">
                <Image
                  src={getRotationImage() || "/placeholder.svg"}
                  alt={`${product.name} - 360 view`}
                  width={600}
                  height={600}
                  className="object-cover w-full aspect-square"
                />
                <div className="absolute bottom-4 left-0 right-0 px-4">
                  <Slider
                    value={[rotation]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleRotation}
                    className="mt-2"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                  onClick={toggle360View}
                >
                  Exit 360° View
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border bg-gradient-to-br from-rose-50 to-pink-50">
                <Image
                  src={product.images[activeImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="object-cover w-full aspect-square transition-transform hover:scale-105 duration-300"
                />
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className={`overflow-hidden rounded-lg border cursor-pointer ${
                    activeImage === index && !is360Active ? "ring-2 ring-rose-500" : ""
                  }`}
                  onClick={() => {
                    setActiveImage(index)
                    setIs360Active(false)
                  }}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - Image ${index + 1}`}
                    width={150}
                    height={150}
                    className="object-cover w-full aspect-square"
                  />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={toggle360View}
              >
                <RotateCw className="h-4 w-4" />
                {is360Active ? "Exit 360° View" : "View 360°"}
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <Badge variant="secondary" className="mb-2 bg-rose-100 text-rose-700">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : i < product.rating
                            ? "text-yellow-400 fill-yellow-400 opacity-50"
                            : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <Link href="#reviews" className="text-sm text-slate-600 hover:text-rose-600 transition-colors">
                  ({product.reviews} reviews)
                </Link>
              </div>

              {/* Price display with discount if applicable */}
              {product.discountPrice && product.discountPrice > 0 ? (
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-3xl font-bold text-rose-600">NPR {product.finalPrice.toLocaleString()}</p>
                  <p className="text-xl text-slate-500 line-through">NPR {product.originalPrice.toLocaleString()}</p>
                  <Badge className="bg-rose-600 text-white">{product.discountPercentage}% OFF</Badge>
                </div>
              ) : (
                <p className="text-3xl font-bold mt-3 text-rose-600">NPR {product.originalPrice.toLocaleString()}</p>
              )}

              {/* Stock status */}
              <div className="mt-2">
                <Badge
                  variant={product.inStock ? "default" : "destructive"}
                  className={product.inStock ? "bg-green-100 text-green-800" : ""}
                >
                  {product.inStock
                    ? `In Stock (${product.stockQuantity} available)`
                    : product.status === "out-of-stock"
                      ? "Out of Stock"
                      : "Unavailable"}
                </Badge>
              </div>

              {/* Cart quantity display */}
              {cartQuantity > 0 && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    🛒 {cartQuantity} in cart
                  </Badge>
                </div>
              )}

              {/* Cash on Delivery */}
              {product.isCashOnDeliveryAvailable && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    💰 Cash on Delivery Available
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-slate-600">{product.description}</p>
            <div className="space-y-4">
              {/* Color Selection */}
              {product.availableColors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Color</label>
                  <div className="flex gap-2">
                    {product.availableColors.map((color) => (
                      <motion.div
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                          color === selectedColor ? "border-rose-500" : "border-transparent hover:border-slate-300"
                        }`}
                        style={{
                          backgroundColor:
                            color === "Black"
                              ? "#000"
                              : color === "Brown"
                                ? "#8B4513"
                                : color === "Blue"
                                  ? "#1E90FF"
                                  : color === "Red"
                                    ? "#FF4136"
                                    : color === "Green"
                                      ? "#2ECC40"
                                      : "#FFFFFF",
                          boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                        }}
                        title={color}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color === selectedColor && <Check className="h-4 w-4 text-white m-auto" />}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.availableSizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="transition-all hover:border-rose-300 focus:ring-rose-200">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.availableSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          EU {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="sm:flex-1">
                  <AddToCartButton
                    productId={product.id}
                    productTitle={product.name}
                    selectedSize={selectedSize}
                    selectedColor={selectedColor}
                    maxQuantity={product.stockQuantity}
                    disabled={!product.inStock || product.stock <= 0}
                    className="w-full"
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="sm:flex-1">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`w-full ${
                      isInWishlist
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "border-rose-200 text-rose-600 hover:bg-rose-50"
                    } transition-colors`}
                    onClick={toggleWishlist}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? "fill-rose-500" : ""}`} />
                    {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-12 px-0 border-slate-200 hover:bg-slate-50 transition-colors"
                    onClick={shareProduct}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Brand:</span>
                  <span className="text-sm font-medium text-slate-900">{product.brand}</span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Material:</span>
                  <span className="text-sm font-medium text-slate-900">{product.material}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Weight:</span>
                  <span className="text-sm font-medium text-slate-900">{product.weight}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Dimensions:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height}{" "}
                    {product.dimensions.unit}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Category:</span>
                <span className="text-sm font-medium text-slate-900">{product.category}</span>
              </div>
              {product.subcategory && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Subcategory:</span>
                  <span className="text-sm font-medium text-slate-900">{product.subcategory}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Availability:</span>
                <span className={`text-sm font-medium ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                  {product.inStock ? `In Stock (${product.stockQuantity} available)` : "Out of Stock"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Cash on Delivery:</span>
                <span
                  className={`text-sm font-medium ${product.isCashOnDeliveryAvailable ? "text-green-600" : "text-red-600"}`}
                >
                  {product.isCashOnDeliveryAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section - Description, Specifications, Reviews */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 transition-colors"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 transition-colors"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 transition-colors"
                id="reviews"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="p-4 border rounded-md mt-4">
              <p className="text-slate-700">{product.longDescription}</p>
              <h3 className="font-semibold mt-4 mb-2 text-slate-900">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {product.features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="specifications" className="p-4 border rounded-md mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 text-slate-900">Product Details</h3>
                  <div className="space-y-3">
                    {product.brand && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Brand</span>
                        <span className="text-slate-900 font-medium">{product.brand}</span>
                      </div>
                    )}
                    {product.material && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Material</span>
                        <span className="text-slate-900 font-medium">{product.material}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Weight</span>
                        <span className="text-slate-900 font-medium">{product.weight}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Dimensions</span>
                        <span className="text-slate-900 font-medium">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height}{" "}
                          {product.dimensions.unit}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Stock Quantity</span>
                      <span className="text-slate-900 font-medium">{product.stockQuantity} units</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Status</span>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 text-slate-900">Additional Information</h3>
                  <div className="space-y-3">
                    {product.colors && product.colors.length > 0 && (
                      <div className="py-2 border-b border-slate-100">
                        <span className="text-slate-600 block mb-2">Available Colors</span>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.sizes && product.sizes.length > 0 && (
                      <div className="py-2 border-b border-slate-100">
                        <span className="text-slate-600 block mb-2">Available Sizes</span>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {size}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div className="py-2 border-b border-slate-100">
                        <span className="text-slate-600 block mb-2">Tags</span>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="py-2 border-b border-slate-100">
                      <span className="text-slate-600 block mb-2">Cash on Delivery</span>
                      <Badge variant={product.isCashOnDeliveryAvailable ? "default" : "destructive"}>
                        {product.isCashOnDeliveryAvailable ? "Available" : "Not Available"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              {product.features && product.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-slate-900">Key Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start gap-2 text-slate-700"
                      >
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Custom Details Section */}
              {product.customDetails && product.customDetails.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-slate-900">Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.customDetails.map((detail, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">{detail.label}</span>
                        <span className="text-slate-900 font-medium">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies Section */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.returnPolicy && (
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-900">Return Policy</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{product.returnPolicy}</p>
                  </div>
                )}

                {product.warranty && (
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-900">Warranty</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{product.warranty}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-4 border rounded-md mt-4">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="md:w-1/3 flex flex-col items-center text-center">
                    <div className="text-5xl font-bold text-slate-900">{product.rating}</div>
                    <div className="flex mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : i < product.rating
                                ? "text-yellow-400 fill-yellow-400 opacity-50"
                                : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">Based on {product.reviews} reviews</p>
                  </div>

                  <div className="md:w-2/3">
                    <h3 className="font-semibold mb-3 text-slate-900">Rating Distribution</h3>
                    <div className="space-y-2">
                      {ratingDistribution.map((item) => (
                        <div key={item.stars} className="flex items-center gap-2">
                          <div className="flex items-center w-20">
                            <span className="text-sm font-medium text-slate-700">{item.stars}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-1" />
                          </div>
                          <Progress value={item.percentage} className="h-2 flex-grow" />
                          <span className="text-sm text-slate-600 w-10 text-right">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-slate-900">Customer Reviews</h3>
                  <Button className="bg-rose-600 hover:bg-rose-700 transition-colors">Write a Review</Button>
                </div>

                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                            <AvatarFallback className="bg-rose-100 text-rose-700">{review.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <div className="font-semibold text-slate-900">{review.name}</div>
                              {review.verified && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-slate-600">{review.date}</div>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-slate-700">{review.comment}</p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 text-sm text-slate-600 hover:text-rose-600 transition-colors"
                            onClick={() => markHelpful(review.id, true)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Helpful ({review.helpful})
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 text-sm text-slate-600 hover:text-rose-600 transition-colors"
                            onClick={() => markHelpful(review.id, false)}
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Not Helpful ({review.unhelpful})
                          </motion.button>
                        </div>
                        <button className="text-sm text-rose-600 hover:text-rose-700 transition-colors">Report</button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Load More Reviews
                    </Button>
                  </motion.div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                    <CardHeader className="p-0">
                      <Link href={`/products/${relatedProduct.id}`}>
                        <div className="overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
                          <Image
                            src={relatedProduct.images[0] || "/placeholder.svg"}
                            alt={relatedProduct.name}
                            width={400}
                            height={400}
                            className="object-cover w-full aspect-square transition-transform hover:scale-105 duration-300"
                          />
                        </div>
                      </Link>
                    </CardHeader>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 bg-rose-100 text-rose-700 hover:bg-rose-200">
                        {relatedProduct.category}
                      </Badge>
                      <Link href={`/products/${relatedProduct.id}`}>
                        <h3 className="font-semibold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-600 mt-1">{relatedProduct.description}</p>
                      <p className="font-semibold mt-2 text-rose-600">NPR {relatedProduct.price.toLocaleString()}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <AddToCartButton
                        productId={relatedProduct.id}
                        productTitle={relatedProduct.name}
                        maxQuantity={relatedProduct.stockQuantity}
                        disabled={!relatedProduct.inStock}
                        className="w-full"
                      />
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
      <Footer />
    </>
  )
}
