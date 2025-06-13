import { getProductReviews } from "../service/public/reviewservice"

export const fetchProductReviewSummary = async (productId: string) => {
  try {
    const response = await getProductReviews(productId, 1, 1)

    if (response.reviews.length === 0) {
      return { rating: 0, count: 0 }
    }

    const averageRating = response.reviews.reduce((sum, review) => sum + review.rating, 0) / response.reviews.length

    return {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      count: response.count,
    }
  } catch (error) {
    console.error(`Error fetching review summary for product ${productId}:`, error)
    return { rating: 0, count: 0 }
  }
}

export const batchFetchReviewSummaries = async (productIds: string[]) => {
  const results = new Map<string, { rating: number; count: number }>()

  // Process in batches to avoid overwhelming the API
  const batchSize = 10
  for (let i = 0; i < productIds.length; i += batchSize) {
    const batch = productIds.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async (productId) => {
        const summary = await fetchProductReviewSummary(productId)
        results.set(productId, summary)
      }),
    )
  }

  return results
}
