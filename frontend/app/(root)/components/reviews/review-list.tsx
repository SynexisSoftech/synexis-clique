"use client"

import { useState } from "react"
import ProductReviews from "./product-review"
import ReviewForm from "./review-form"
import { Button } from "@/components/ui/button"

interface ReviewsTabProps {
  productId: string
  initialRating?: number
  initialReviewCount?: number
}

export default function ReviewsTab({ productId, initialRating, initialReviewCount }: ReviewsTabProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleReviewSubmitted = () => {
    setShowReviewForm(false)
    // Increment refresh key to trigger a re-render of the ProductReviews component
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-8">
      {showReviewForm ? (
        <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
      ) : (
        <div className="flex justify-end">
          <Button className="bg-rose-600 hover:bg-rose-700 transition-colors" onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        </div>
      )}

      <ProductReviews
        key={refreshKey}
        productId={productId}
        initialRating={initialRating}
        initialReviewCount={initialReviewCount}
      />
    </div>
  )
}
