"use client"

import { useState, useRef, useEffect } from "react"
import { CardFooter } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import {
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Star,
  RotateCw,
  Check,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"
import { productsService, type Product } from "../../../../service/ProductsService"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Helper function to map API product to UI product
const mapApiProductToUiProduct = (product: Product) => {
  return {
    id: Number(product._id),
    name: product.title,
    description: product.description,
    longDescription: product.description, // Use description as long description for now
    price: product.price,
    images: product.images && product.images.length > 0 ? product.images : ["/placeholder.svg?height=600&width=600"],
    videos: [], // Default empty array, adjust based on your data model
    rotationImages:
      product.images && product.images.length > 0 ? product.images : ["/placeholder.svg?height=600&width=600"],
    category: typeof product.categoryId === "object" ? product.categoryId.title : "Unknown",
    featured: product.isFeatured || false,
    inStock: product.stock > 0,
    color: "Blue/White", // Default value, adjust based on your data model
    availableColors: ["Blue", "Black", "Red", "Green"], // Default value, adjust based on your data model
    availableSizes: ["38", "39", "40", "41", "42", "43", "44"], // Default value, adjust based on your data model
    material: "Synthetic mesh, rubber sole", // Default value, adjust based on your data model
    weight: product.weight ? `${product.weight}kg` : "280g (per shoe, size 42)", // Default value
    origin: "Made in Nepal", // Default value, adjust based on your data model
    rating: 4.5, // Default value, adjust based on your data model
    reviews: 24, // Default value, adjust based on your data model
    features: [
      "High-quality construction",
      "Durable materials",
      "Comfortable fit",
      "Stylish design",
      "Great value for money",
    ], // Default features, adjust based on your data model
    brand: product.brand || "Unknown",
    stock: product.stock,
    tags: product.tags ? product.tags.split(",") : [],
    seoKeywords: product.seoKeywords ? product.seoKeywords.split(",") : [],
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState("40")
  const [quantity, setQuantity] = useState(1)
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  const addToCart = () => {
    if (!product) return

    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} (Size: ${selectedSize}) would be added to your cart`,
    })
  }

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const apiProduct = await productsService.getProductById(params.id)
        const mappedProduct = mapApiProductToUiProduct(apiProduct)
        setProduct(mappedProduct)

        // Fetch related products (same category)
        if (typeof apiProduct.categoryId === "string") {
          const relatedResponse = await productsService.getProducts({
            categoryId: apiProduct.categoryId,
            status: "active",
            limit: 3,
          })
          const mappedRelated = relatedResponse.products
            .filter((p) => p._id !== apiProduct._id)
            .slice(0, 3)
            .map(mapApiProductToUiProduct)
          setRelatedProducts(mappedRelated)
        }
      } catch (err: any) {
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

    fetchProduct()
  }, [params.id, toast])

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
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading product...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <Alert variant="destructive">
          <AlertDescription>{error || "Product not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container px-4 py-8 md:px-6 md:py-12"
    >
      <Link
        href="/products"
        className="inline-flex items-center text-sm font-medium mb-4 text-slate-600 hover:text-rose-600 transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Products
      </Link>
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
                <Slider value={[rotation]} min={0} max={100} step={1} onValueChange={handleRotation} className="mt-2" />
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
            <p className="text-2xl font-bold mt-2 text-rose-600">NPR {product.price.toLocaleString()}</p>
          </div>
          <p className="text-slate-600">{product.description}</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Color</label>
              <div className="flex gap-2">
                {product.availableColors.map((color) => (
                  <motion.div
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      color === product.color.split("/")[0]
                        ? "border-rose-500"
                        : "border-transparent hover:border-slate-300"
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
                  >
                    {color === product.color.split("/")[0] && <Check className="h-4 w-4 text-white m-auto" />}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Quantity</label>
                <div className="flex items-center border rounded-md">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">{quantity}</div>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="sm:flex-1">
                <Button
                  size="lg"
                  className="w-full bg-rose-600 hover:bg-rose-700 transition-colors"
                  onClick={addToCart}
                  disabled={!product.inStock || product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
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
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Color:</span>
              <span className="text-sm font-medium text-slate-900">{product.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Material:</span>
              <span className="text-sm font-medium text-slate-900">{product.material}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Weight:</span>
              <span className="text-sm font-medium text-slate-900">{product.weight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Origin:</span>
              <span className="text-sm font-medium text-slate-900">{product.origin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Availability:</span>
              <span className={`text-sm font-medium ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                {product.inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-slate-900">Product Details</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-slate-600">Material</span>
                    <span className="text-slate-900">{product.material}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Weight</span>
                    <span className="text-slate-900">{product.weight}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Origin</span>
                    <span className="text-slate-900">{product.origin}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Color</span>
                    <span className="text-slate-900">{product.color}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Available Sizes</span>
                    <span className="text-slate-900">{product.availableSizes.join(", ")}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Brand</span>
                    <span className="text-slate-900">{product.brand}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Stock</span>
                    <span className="text-slate-900">{product.stock} units</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-slate-900">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                {product.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-slate-900">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                    <Button
                      className="w-full bg-rose-600 hover:bg-rose-700 transition-colors"
                      disabled={!relatedProduct.inStock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {relatedProduct.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
