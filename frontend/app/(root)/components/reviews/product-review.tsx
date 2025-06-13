"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { getProductReviews, type IPublicReview } from "../../../../service/public/reviewservice"

interface ProductReviewsProps {
  productId: string
  initialRating?: number
  initialReviewCount?: number
}

export default function ProductReviews({
  productId,
  initialRating = 4.5,
  initialReviewCount = 0,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<IPublicReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(initialReviewCount)
  const [averageRating, setAverageRating] = useState(initialRating)
  const { toast } = useToast()

  // Rating distribution - will be calculated from actual reviews
  const [ratingDistribution, setRatingDistribution] = useState([
    { stars: 5, percentage: 0, count: 0 },
    { stars: 4, percentage: 0, count: 0 },
    { stars: 3, percentage: 0, count: 0 },
    { stars: 2, percentage: 0, count: 0 },
    { stars: 1, percentage: 0, count: 0 },
  ])

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await getProductReviews(productId, page, 5)
        setReviews(response.reviews)
        setTotalPages(response.pages)
        setTotalReviews(response.count)

        // Calculate rating distribution
        if (response.reviews.length > 0) {
          const distribution = [
            { stars: 5, percentage: 0, count: 0 },
            { stars: 4, percentage: 0, count: 0 },
            { stars: 3, percentage: 0, count: 0 },
            { stars: 2, percentage: 0, count: 0 },
            { stars: 1, percentage: 0, count: 0 },
          ]

          // Count reviews for each rating
          response.reviews.forEach((review) => {
            const ratingIndex = 5 - review.rating
            if (ratingIndex >= 0 && ratingIndex < 5) {
              distribution[ratingIndex].count++
            }
          })

          // Calculate percentages
          distribution.forEach((item) => {
            item.percentage = (item.count / response.count) * 100
          })

          setRatingDistribution(distribution)

          // Calculate average rating
          const totalRating = response.reviews.reduce((sum, review) => sum + review.rating, 0)
          setAverageRating(totalRating / response.reviews.length)
        }
      } catch (err: any) {
        console.error("Error fetching reviews:", err)
        setError(err.message || "Failed to fetch reviews")
        toast({
          title: "Error",
          description: err.message || "Failed to fetch reviews",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productId, page, toast])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    // Scroll to reviews section
    document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })
  }

  const markHelpful = (reviewId: string, isHelpful: boolean) => {
    toast({
      title: "Thank you for your feedback",
      description: `You marked this review as ${isHelpful ? "helpful" : "not helpful"}`,
    })
    // Here you would typically call an API to update the helpful/unhelpful count
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} ${months === 1 ? "month" : "months"} ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} ${years === 1 ? "year" : "years"} ago`
    }
  }

  return (
    <div className="space-y-6" id="reviews-section">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="md:w-1/3 flex flex-col items-center text-center">
          <div className="text-5xl font-bold text-slate-900">{averageRating.toFixed(1)}</div>
          <div className="flex mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : i < averageRating
                      ? "text-yellow-400 fill-yellow-400 opacity-50"
                      : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-1">Based on {totalReviews} reviews</p>
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
                <span className="text-sm text-slate-600 w-16 text-right">
                  {item.percentage.toFixed(0)}% ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-slate-900">Customer Reviews</h3>
        <Button className="bg-rose-600 hover:bg-rose-700 transition-colors">Write a Review</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            <p className="mt-4 text-slate-600">Loading reviews...</p>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-slate-600">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                    <AvatarFallback className="bg-rose-100 text-rose-700">
                      {review.userId.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <div className="font-semibold text-slate-900">{review.userId.username}</div>
                      {review.isVerifiedPurchase && (
                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">{formatDate(review.createdAt)}</div>
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
              {review.comment && <p className="mt-2 text-slate-700">{review.comment}</p>}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-rose-600 transition-colors"
                    onClick={() => markHelpful(review._id, true)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Helpful (0)
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-rose-600 transition-colors"
                    onClick={() => markHelpful(review._id, false)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Not Helpful (0)
                  </motion.button>
                </div>
                <button className="text-sm text-rose-600 hover:text-rose-700 transition-colors">Report</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="border-slate-300"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <span className="sr-only">Previous page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={`page-${pageNum}`}
                variant="outline"
                size="sm"
                className={`font-medium ${
                  page === pageNum ? "bg-rose-100 border-rose-200 text-rose-700" : "border-slate-300"
                }`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="border-slate-300"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              <span className="sr-only">Next page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
