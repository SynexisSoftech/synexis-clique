"use client"

import { useState, useRef, useEffect } from "react"
import { CardFooter } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  Share2,
  Star,
  RotateCw,
  Check,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ChevronRight,
  ShoppingCart,
  Eye,
  Sparkles,
  Package,
  Shield,
  Truck,
  Award,
  Zap,
  MessageSquare,
  Plus,
  Minus,
  ArrowRight,
  Filter,
  Calendar,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"
import ProductService, { type ProductDetails } from "../../../../service/public/Productservice"
import {
  getProductReviews,
  createReview,
  type IPublicReview,
  type ICreateReviewData,
} from "../../../../service/public/reviewservice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "../../components/navbar/navbar"
import Footer from "../../components/footer/footer"
import { AddToCartButton } from "@/components/AddToCartButton"
import { useCart } from "@/hooks/useCart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Helper function to map API product to UI product
const mapApiProductToUiProduct = (product: ProductDetails) => {
  const finalPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.originalPrice
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
    isCashOnDeliveryAvailable: product.isCashOnDeliveryAvailable,
    warranty: product.warranty,
    returnPolicy: product.returnPolicy,
    material: product.material,
    weight: product.weight,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    rating: product.rating || 4.5,
    reviews: product.reviewsCount || 24,
    stock: product.stockQuantity,
  }
}


interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [is360Active, setIs360Active] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [slug, setSlug] = useState<string | null>(null)

  // Enhanced Review states
  const [reviews, setReviews] = useState<IPublicReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalReviewPages, setTotalReviewPages] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState<ICreateReviewData>({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [ratingDistribution, setRatingDistribution] = useState([
    { stars: 5, percentage: 0, count: 0 },
    { stars: 4, percentage: 0, count: 0 },
    { stars: 3, percentage: 0, count: 0 },
    { stars: 2, percentage: 0, count: 0 },
    { stars: 1, percentage: 0, count: 0 },
  ])

  // New review filtering and sorting states
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all")
  const [reviewSort, setReviewSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")
  const [showFilters, setShowFilters] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  const { getItemQuantity } = useCart()

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
        setError(null)

        const apiProduct = await ProductService.getProductById(slug)
        const mappedProduct = mapApiProductToUiProduct(apiProduct)
        setProduct(mappedProduct)

        if (mappedProduct.availableSizes && mappedProduct.availableSizes.length > 0) {
          setSelectedSize(mappedProduct.availableSizes[0])
        }
        if (mappedProduct.availableColors && mappedProduct.availableColors.length > 0) {
          setSelectedColor(mappedProduct.availableColors[0])
        }

        try {
          const relatedResponse = await ProductService.getRelatedProducts(apiProduct._id, 3)
          const mappedRelated = relatedResponse.map(mapApiProductToUiProduct)
          setRelatedProducts(mappedRelated)
        } catch (relatedError) {
          console.warn("Failed to fetch related products:", relatedError)
          setRelatedProducts([])
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

    if (slug) {
      fetchProduct()
    }
  }, [slug, toast])

  // Enhanced fetch reviews with filtering and sorting
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return

      try {
        setReviewsLoading(true)
        setReviewsError(null)

        // Reset to page 1 when filter/sort changes
        const currentPage = reviewPage === 1 ? 1 : reviewPage
        const reviewsResponse = await getProductReviews(product.id, currentPage, 10)

        if (currentPage === 1) {
          setReviews(reviewsResponse.reviews)
        } else {
          setReviews((prev) => [...prev, ...reviewsResponse.reviews])
        }

        setTotalReviews(reviewsResponse.count)
        setTotalReviewPages(reviewsResponse.pages)
      } catch (err: any) {
        console.error("Error fetching reviews:", err)
        setReviewsError(err.message || "Failed to fetch reviews")
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [product?.id, reviewPage])

  // Calculate rating distribution dynamically based on reviews
  useEffect(() => {
    if (reviews.length === 0) return

    // Initialize counts for each star rating
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    // Count reviews for each star rating
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating]++
      }
    })

    // Calculate percentages and create distribution array
    const newDistribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = ratingCounts[stars]
      const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
      return { stars, percentage, count }
    })

    setRatingDistribution(newDistribution)
  }, [reviews])

  // Reset reviews when filter/sort changes
  useEffect(() => {
    if (product?.id) {
      setReviewPage(1)
      setReviews([])
    }
  }, [reviewFilter, reviewSort, product?.id])

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter((review) => {
      if (reviewFilter === "all") return true
      return review.rating === Number.parseInt(reviewFilter)
    })
    .sort((a, b) => {
      switch (reviewSort) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        default:
          return 0
      }
    })

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

  const markHelpful = (reviewId: string, isHelpful: boolean) => {
    toast({
      title: "Thank you for your feedback",
      description: `You marked this review as ${isHelpful ? "helpful" : "not helpful"}`,
    })
  }

  const handleSubmitReview = async () => {
    if (!product?.id || !newReview.comment?.trim()) {
      toast({
        title: "Error",
        description: "Please provide a comment for your review",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingReview(true)
      await createReview(product.id, newReview)

      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your review! It will be visible after moderation.",
      })

      setShowReviewForm(false)
      setNewReview({ rating: 5, comment: "" })

      // Refresh reviews
      setReviewPage(1)
      const reviewsResponse = await getProductReviews(product.id, 1, 10)
      setReviews(reviewsResponse.reviews)
      setTotalReviews(reviewsResponse.count)
      setTotalReviewPages(reviewsResponse.pages)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const loadMoreReviews = async () => {
    if (reviewPage >= totalReviewPages || reviewsLoading) return

    try {
      setReviewsLoading(true)
      const nextPage = reviewPage + 1
      setReviewPage(nextPage)
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load more reviews",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <Navbar />
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-100 rounded-full animate-pulse" />
                <Loader2 className="h-8 w-8 text-amber-700 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-900">Loading product details...</p>
                <p className="text-sm text-slate-500">Please wait while we fetch the latest information</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <Navbar />
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error || "Product not found"}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-4">
            <Button asChild className="bg-amber-800 hover:bg-amber-900">
              <Link href="/products">Back to Products</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-amber-200 text-amber-800 hover:bg-amber-50"
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-12"
      >
        {/* Enhanced Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6 md:mb-8 bg-white/60 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 border border-slate-200/50 overflow-x-auto"
        >
          <Link href="/" className="hover:text-amber-700 transition-colors font-medium">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
          <Link href="/products" className="hover:text-amber-700 transition-colors font-medium">
            Products
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-amber-700 transition-colors font-medium"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px]">{product.name}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
          {/* Enhanced Image Gallery */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            {is360Active ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl">
                <Image
                  src={getRotationImage() || "/placeholder.svg"}
                  alt={`${product.name} - 360 view`}
                  width={600}
                  height={600}
                  className="object-cover w-full aspect-square"
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <RotateCw className="h-4 w-4 text-amber-700" />
                      <span className="text-sm font-medium text-slate-700">360° View</span>
                    </div>
                    <Slider
                      value={[rotation]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleRotation}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border-slate-200"
                  onClick={toggle360View}
                >
                  Exit 360° View
                </Button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg sm:shadow-xl group">
                <Image
                  src={product.images[activeImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="object-cover w-full aspect-square transition-transform hover:scale-105 duration-500"
                />

                {/* Image overlay with badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Product badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.discountPercentage > 0 && (
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1 shadow-lg">
                      {product.discountPercentage}% OFF
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      FEATURED
                    </Badge>
                  )}
                </div>

                {/* Quick action buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white border-0"
                          onClick={shareProduct}
                        >
                          <Share2 className="h-4 w-4 text-amber-800" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share product</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}

            {/* Enhanced Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {product.images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    activeImage === index && !is360Active
                      ? "ring-2 ring-amber-500 border-amber-300 shadow-lg"
                      : "border-slate-200 hover:border-amber-300 hover:shadow-md"
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
                  {activeImage === index && !is360Active && (
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-amber-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Enhanced 360 View Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="flex items-center gap-3 border-amber-200 text-amber-800 hover:bg-amber-50 transition-all duration-300 px-6 py-3 rounded-full shadow-md hover:shadow-lg"
                onClick={toggle360View}
              >
                <RotateCw className="h-5 w-5" />
                <span className="font-medium">{is360Active ? "Exit 360° View" : "View 360°"}</span>
              </Button>
            </div>
          </motion.div>

          {/* Enhanced Product Information */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 sm:space-y-6 md:space-y-8"
          >
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0 px-3 py-1 font-medium"
                >
                  {product.category}
                </Badge>
                {product.brand && (
                  <Badge variant="outline" className="border-slate-300 text-slate-700 px-3 py-1">
                    {product.brand}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Enhanced Rating Display */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "text-amber-400 fill-amber-400"
                            : i < product.rating
                              ? "text-amber-400 fill-amber-400 opacity-50"
                              : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-slate-900">{product.rating}</span>
                </div>
                <Link
                  href="#reviews"
                  className="text-amber-700 hover:text-amber-800 transition-colors font-medium underline decoration-amber-300 underline-offset-4"
                >
                  ({totalReviews} reviews)
                </Link>
              </div>

              {/* Enhanced Price Display */}
              <div className="space-y-2">
                {product.discountPrice && product.discountPrice > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <p className="text-3xl sm:text-4xl font-bold text-amber-800">
                      NPR {product.finalPrice.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg sm:text-xl text-slate-500 line-through">
                        NPR {product.originalPrice.toLocaleString()}
                      </p>
                      <Badge className="bg-amber-600 text-white font-semibold px-2 py-1 text-xs sm:text-sm">
                        Save NPR {(product.originalPrice - product.finalPrice).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-3xl sm:text-4xl font-bold text-amber-800">
                    NPR {product.originalPrice.toLocaleString()}
                  </p>
                )}
                
                {/* VAT Included Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-1 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    VAT Included
                  </Badge>
                  <span className="text-xs text-slate-500">All prices include 13% VAT</span>
                </div>

                {/* Enhanced Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={product.inStock ? "default" : "destructive"}
                    className={`px-3 py-1 font-medium ${
                      product.inStock ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800"
                    }`}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    {product.inStock
                      ? `In Stock (${product.stockQuantity} available)`
                      : product.status === "out-of-stock"
                        ? "Out of Stock"
                        : "Unavailable"}
                  </Badge>

                  {cartQuantity > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 font-medium">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {cartQuantity} in cart
                    </Badge>
                  )}

                  {product.isCashOnDeliveryAvailable && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 font-medium"
                    >
                      <Truck className="h-3 w-3 mr-1" />
                      Cash on Delivery
                    </Badge>
                  )}

                  {product.warranty && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 font-medium"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Warranty
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Description */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <p className="text-slate-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Enhanced Variant Selection */}
            <div className="space-y-6">
              {/* Color Selection */}
              {product.availableColors.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base font-semibold text-slate-900">
                    Color: <span className="font-normal text-amber-700">{selectedColor}</span>
                  </Label>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {product.availableColors.map((color) => {
                      const colorMap = {
                        Black: "#000000",
                        Brown: "#8B4513",
                        Blue: "#1E90FF",
                        Red: "#FF4136",
                        Green: "#2ECC40",
                        Grey: "#AAAAAA",
                        White: "#FFFFFF",
                        Yellow: "#FFDC00",
                        Purple: "#B10DC9",
                        Orange: "#FF851B",
                      }

                      const bgColor = colorMap[color] || "#CCCCCC"

                      return (
                        <TooltipProvider key={color}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer border-3 transition-all duration-200 ${
                                  color === selectedColor
                                    ? "border-amber-500 ring-2 ring-amber-200"
                                    : "border-slate-300 hover:border-amber-300"
                                }`}
                                style={{
                                  backgroundColor: bgColor,
                                  boxShadow: color === "White" ? "inset 0 0 0 1px #e2e8f0" : "none",
                                }}
                                onClick={() => setSelectedColor(color)}
                              >
                                {color === selectedColor && (
                                  <Check
                                    className={`h-4 w-4 sm:h-5 sm:w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                                      ["White", "Yellow"].includes(color) ? "text-black" : "text-white"
                                    }`}
                                  />
                                )}
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{color}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.availableSizes.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base font-semibold text-slate-900">
                    Size: <span className="font-normal text-amber-700">EU {selectedSize}</span>
                  </Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full h-12 border-slate-300 focus:border-amber-500 focus:ring-amber-200 rounded-xl">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.availableSizes.map((size) => (
                        <SelectItem key={size} value={size} className="py-3">
                          EU {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-slate-900">Quantity</Label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-none hover:bg-amber-50 hover:text-amber-800"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <div className="w-12 h-10 sm:w-16 sm:h-12 flex items-center justify-center font-semibold text-slate-900 bg-slate-50 text-sm sm:text-base">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-none hover:bg-amber-50 hover:text-amber-800"
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      disabled={quantity >= product.stockQuantity}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-600">{product.stockQuantity} available</span>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <AddToCartButton
                      productId={product.id}
                      productTitle={product.name}
                      selectedSize={selectedSize}
                      selectedColor={selectedColor}
                      quantity={quantity}
                      maxQuantity={product.stockQuantity}
                      disabled={!product.inStock || product.stock <= 0}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className={`h-12 sm:h-14 px-4 sm:px-6 rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                        isInWishlist
                          ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                          : "border-amber-300 text-amber-800 hover:bg-amber-50"
                      }`}
                      onClick={toggleWishlist}
                    >
                      <Heart className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist ? "fill-amber-600" : ""}`} />
                      <span className="hidden sm:inline">{isInWishlist ? "In Wishlist" : "Add to Wishlist"}</span>
                      <span className="sm:hidden">{isInWishlist ? "Saved" : "Save"}</span>
                    </Button>
                  </motion.div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600">
                    <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                    <span>Quality Assured</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600">
                    <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Product Details */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  {product.brand && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Brand</span>
                      <span className="text-slate-900 font-semibold">{product.brand}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Category</span>
                    <span className="text-slate-900 font-semibold">{product.category}</span>
                  </div>
                  {product.subcategory && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Subcategory</span>
                      <span className="text-slate-900 font-semibold">{product.subcategory}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Availability</span>
                    <span className={`font-semibold ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                      {product.inStock ? `In Stock (${product.stockQuantity} available)` : "Out of Stock"}
                    </span>
                  </div>
                  {product.material && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Material</span>
                      <span className="text-slate-900 font-semibold">{product.material}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Weight</span>
                      <span className="text-slate-900 font-semibold">{product.weight}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 font-medium">Cash on Delivery</span>
                    <span
                      className={`font-semibold ${product.isCashOnDeliveryAvailable ? "text-green-600" : "text-red-600"}`}
                    >
                      {product.isCashOnDeliveryAvailable ? "Available" : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Tabs Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 sm:mt-12 md:mt-16"
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14 bg-slate-100 rounded-xl p-1">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 transition-all duration-300 rounded-lg font-semibold text-xs sm:text-sm"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 transition-all duration-300 rounded-lg font-semibold text-xs sm:text-sm"
              >
                Specs
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 transition-all duration-300 rounded-lg font-semibold text-xs sm:text-sm"
                id="reviews"
              >
                Reviews ({totalReviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 text-lg leading-relaxed mb-6">{product.longDescription}</p>

                  {product.features && product.features.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-600" />
                        Key Features
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.features.map((feature, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start gap-3 text-slate-700 bg-slate-50 rounded-lg p-3"
                          >
                            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Package className="h-5 w-5 text-amber-600" />
                      Product Details
                    </h3>
                    <div className="space-y-4">
                      {product.brand && (
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                          <span className="text-slate-600 font-medium">Brand</span>
                          <span className="text-slate-900 font-semibold">{product.brand}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Stock Quantity</span>
                        <span className="text-slate-900 font-semibold">{product.stockQuantity} units</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Status</span>
                        <Badge
                          variant={product.status === "active" ? "default" : "secondary"}
                          className="font-semibold"
                        >
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </Badge>
                      </div>
                      {product.material && (
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                          <span className="text-slate-600 font-medium">Material</span>
                          <span className="text-slate-900 font-semibold">{product.material}</span>
                        </div>
                      )}
                      {product.weight && (
                        <div className="flex justify-between items-center py-3">
                          <span className="text-slate-600 font-medium">Weight</span>
                          <span className="text-slate-900 font-semibold">{product.weight}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      Additional Information
                    </h3>
                    <div className="space-y-4">
                      {product.colors && product.colors.length > 0 && (
                        <div className="py-3 border-b border-slate-100">
                          <span className="text-slate-600 font-medium block mb-3">Available Colors</span>
                          <div className="flex flex-wrap gap-2">
                            {product.colors.map((color, index) => (
                              <Badge key={index} variant="outline" className="text-sm font-medium">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {product.sizes && product.sizes.length > 0 && (
                        <div className="py-3 border-b border-slate-100">
                          <span className="text-slate-600 font-medium block mb-3">Available Sizes</span>
                          <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size, index) => (
                              <Badge key={index} variant="outline" className="text-sm font-medium">
                                EU {size}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="py-3 border-b border-slate-100">
                        <span className="text-slate-600 font-medium block mb-3">Services</span>
                        <div className="space-y-2">
                          <Badge
                            variant={product.isCashOnDeliveryAvailable ? "default" : "destructive"}
                            className="block w-fit font-medium"
                          >
                            Cash on Delivery: {product.isCashOnDeliveryAvailable ? "Available" : "Not Available"}
                          </Badge>
                          {product.warranty && (
                            <Badge variant="default" className="block w-fit font-medium bg-green-100 text-green-800">
                              Warranty: Included
                            </Badge>
                          )}
                          {product.returnPolicy && (
                            <Badge variant="default" className="block w-fit font-medium bg-blue-100 text-blue-800">
                              Return Policy: Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Features Section */}
                {product.features && product.features.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-600" />
                      Key Features
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.features.map((feature, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start gap-3 text-slate-700 bg-slate-50 rounded-lg p-4"
                        >
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Enhanced Reviews Tab */}
            <TabsContent value="reviews" className="mt-6 sm:mt-8">
              <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
                <div className="space-y-6 sm:space-y-8">
                  {/* Enhanced Reviews Header */}
                  <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start">
                    <div className="flex flex-col items-center text-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 lg:w-1/3">
                      <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-2">
                        {product.rating}
                      </div>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${
                              i < Math.floor(product.rating)
                                ? "text-amber-400 fill-amber-400"
                                : i < product.rating
                                  ? "text-amber-400 fill-amber-400 opacity-50"
                                  : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm sm:text-base text-slate-600 font-medium">Based on {totalReviews} reviews</p>
                    </div>

                    <div className="lg:w-2/3">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-amber-600" />
                        Rating Distribution
                      </h3>
                      <div className="space-y-3">
                        {ratingDistribution.map((item) => (
                          <div key={item.stars} className="flex items-center gap-4">
                            <div className="flex items-center w-20 sm:w-24">
                              <span className="text-sm font-semibold text-slate-700 w-2">{item.stars}</span>
                              <Star className="h-4 w-4 text-amber-400 fill-amber-400 ml-1" />
                            </div>
                            <Progress value={item.percentage} className="h-3 flex-grow" />
                            <span className="text-sm text-slate-600 w-12 text-right font-medium">
                              {item.percentage}%
                            </span>
                            <span className="text-sm text-slate-500 w-12 sm:w-16 text-right">({item.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Review Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <h3 className="text-xl font-bold text-slate-900">Customer Reviews</h3>

                      {/* Mobile Filter Toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="sm:hidden border-amber-200 text-amber-800 hover:bg-amber-50"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>

                      {/* Desktop Filters */}
                      <div className="hidden sm:flex items-center gap-3">
                        <Select value={reviewFilter} onValueChange={(value: any) => setReviewFilter(value)}>
                          <SelectTrigger className="w-32 h-9 border-amber-200 focus:border-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={reviewSort} onValueChange={(value: any) => setReviewSort(value)}>
                          <SelectTrigger className="w-32 h-9 border-amber-200 focus:border-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="highest">Highest Rated</SelectItem>
                            <SelectItem value="lowest">Lowest Rated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                      <DialogTrigger asChild>
                        <Button className="bg-amber-800 hover:bg-amber-900 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Write Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] mx-4">
                        <DialogHeader>
                          <DialogTitle className="text-amber-800">Write a Review</DialogTitle>
                          <DialogDescription>Share your experience with {product.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="rating" className="text-base font-medium">
                              Rating
                            </Label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => setNewReview((prev) => ({ ...prev, rating }))}
                                  className="p-1 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className={`h-8 w-8 ${
                                      rating <= newReview.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="comment" className="text-base font-medium">
                              Comment
                            </Label>
                            <Textarea
                              id="comment"
                              placeholder="Tell us about your experience with this product..."
                              value={newReview.comment || ""}
                              onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                              className="min-h-[120px] resize-none border-slate-300 focus:border-amber-500 focus:ring-amber-200"
                            />
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={handleSubmitReview}
                              disabled={submittingReview || !newReview.comment?.trim()}
                              className="flex-1 bg-amber-800 hover:bg-amber-900 text-white"
                            >
                              {submittingReview ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit Review"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowReviewForm(false)}
                              className="border-amber-200 text-amber-800 hover:bg-amber-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Mobile Filters */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="sm:hidden bg-slate-50 rounded-xl p-4 border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900">Filter & Sort</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(false)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Filter by Rating</Label>
                            <Select value={reviewFilter} onValueChange={(value: any) => setReviewFilter(value)}>
                              <SelectTrigger className="w-full h-9 border-amber-200 focus:border-amber-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Stars</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Sort by</Label>
                            <Select value={reviewSort} onValueChange={(value: any) => setReviewSort(value)}>
                              <SelectTrigger className="w-full h-9 border-amber-200 focus:border-amber-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="oldest">Oldest</SelectItem>
                                <SelectItem value="highest">Highest Rated</SelectItem>
                                <SelectItem value="lowest">Lowest Rated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enhanced Reviews List */}
                  <div className="space-y-4 sm:space-y-6">
                    {reviewsLoading && reviews.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
                          <p className="text-slate-600">Loading reviews...</p>
                        </div>
                      </div>
                    ) : reviewsError ? (
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">{reviewsError}</AlertDescription>
                      </Alert>
                    ) : filteredAndSortedReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {reviews.length === 0 ? "No reviews yet" : "No reviews match your filters"}
                        </h3>
                        <p className="text-slate-600 mb-4">
                          {reviews.length === 0
                            ? "Be the first to review this product!"
                            : "Try adjusting your filters to see more reviews."}
                        </p>
                        {reviews.length === 0 && (
                          <Button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-amber-800 hover:bg-amber-900 text-white"
                          >
                            Write the first review
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-slate-600 mb-4">
                          Showing {filteredAndSortedReviews.length} of {totalReviews} reviews
                        </div>

                        {filteredAndSortedReviews.map((review, index) => (
                          <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="border border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-slate-50 to-white"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3 sm:gap-0">
                              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                                  <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Avatar" />
                                  <AvatarFallback className="bg-amber-100 text-amber-800 font-semibold text-sm sm:text-base">
                                    {getInitials(review.userId.username)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                    <div className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                                      {review.userId.username}
                                    </div>
                                    {review.isVerifiedPurchase && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200 font-medium w-fit"
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Verified Purchase
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(review.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 sm:ml-4">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                      i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm font-semibold text-slate-700">{review.rating}</span>
                              </div>
                            </div>

                            {review.comment && (
                              <div className="mb-4">
                                <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-white rounded-lg p-3 sm:p-4 border border-slate-100">
                                  {review.comment}
                                </p>
                              </div>
                            )}

                            <Separator className="my-4" />

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600 hover:text-amber-700 transition-colors font-medium bg-slate-100 hover:bg-amber-50 px-3 py-1.5 rounded-full"
                                  onClick={() => markHelpful(review._id, true)}
                                >
                                  <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Helpful
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600 hover:text-amber-700 transition-colors font-medium bg-slate-100 hover:bg-amber-50 px-3 py-1.5 rounded-full"
                                  onClick={() => markHelpful(review._id, false)}
                                >
                                  <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Not Helpful
                                </motion.button>
                              </div>
                              <button className="text-xs sm:text-sm text-amber-700 hover:text-amber-800 transition-colors font-medium self-start sm:self-auto">
                                Report
                              </button>
                            </div>
                          </motion.div>
                        ))}

                        {/* Load More Reviews */}
                        {reviewPage < totalReviewPages && (
                          <div className="flex justify-center pt-6">
                            <Button
                              onClick={loadMoreReviews}
                              disabled={reviewsLoading}
                              variant="outline"
                              className="border-amber-200 text-amber-800 hover:bg-amber-50 px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base"
                            >
                              {reviewsLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  Load More Reviews
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Enhanced Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 sm:mt-12 md:mt-16"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-4">You Might Also Like</h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-4">
                Discover more premium products carefully selected to complement your choice
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full group bg-white/90 backdrop-blur-sm hover:bg-white">
                    <CardHeader className="p-0 relative">
                      <Link href={`/products/${relatedProduct.id}`}>
                        <div className="overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 relative h-48 sm:h-56 md:h-64">
                          <Image
                            src={relatedProduct.images[0] || "/placeholder.svg"}
                            alt={relatedProduct.name}
                            width={400}
                            height={400}
                            className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </Link>

                      {/* Product badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {relatedProduct.discountPercentage > 0 && (
                          <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-2 py-1 text-xs">
                            {relatedProduct.discountPercentage}% OFF
                          </Badge>
                        )}
                        {relatedProduct.featured && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 py-1 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            FEATURED
                          </Badge>
                        )}
                      </div>

                      {/* Quick actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
                              >
                                <Heart className="h-4 w-4 text-amber-800" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add to wishlist</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(relatedProduct.rating)
                                ? "text-amber-400 fill-amber-400"
                                : i < relatedProduct.rating
                                  ? "text-amber-400 fill-amber-400 opacity-50"
                                  : "text-slate-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">({relatedProduct.reviews})</span>
                      </div>

                      <Badge
                        variant="secondary"
                        className="mb-3 bg-amber-100 text-amber-800 hover:bg-amber-200 border-0"
                      >
                        {relatedProduct.category}
                      </Badge>

                      <Link href={`/products/${relatedProduct.id}`}>
                        <h3 className="font-bold text-lg text-slate-900 hover:text-amber-800 transition-colors duration-300 line-clamp-2 mb-2">
                          {relatedProduct.name}
                        </h3>
                      </Link>

                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {relatedProduct.shortDescription || relatedProduct.description}
                      </p>

                      {relatedProduct.discountPercentage > 0 ? (
                        <div className="flex items-center gap-2 mb-4">
                          <p className="font-bold text-xl text-amber-800">
                            NPR {relatedProduct.finalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500 line-through">
                            NPR {relatedProduct.originalPrice.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="font-bold text-xl text-amber-800 mb-4">
                          NPR {relatedProduct.price.toLocaleString()}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <AddToCartButton
                        productId={relatedProduct.id}
                        productTitle={relatedProduct.name}
                        maxQuantity={relatedProduct.stockQuantity}
                        disabled={!relatedProduct.inStock}
                        className="w-full bg-amber-800 hover:bg-amber-900 text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg rounded-xl"
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
    </div>
  )
}
