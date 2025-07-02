import { Request, Response } from "express"
import Newsletter, { INewsletter } from "../models/newsletter.model"
import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"

const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;

// Subscribe to newsletter
const subscribeToNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email, source = "homepage" } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format")
  }

  // Check if already subscribed
  const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() })

  if (existingSubscription) {
    if (existingSubscription.isActive) {
      throw new ApiError(400, "Email is already subscribed to newsletter")
    } else {
      // Reactivate subscription
      existingSubscription.isActive = true
      existingSubscription.unsubscribedAt = undefined
      existingSubscription.source = source
      existingSubscription.ipAddress = req.ip
      existingSubscription.userAgent = req.get("User-Agent")
      await existingSubscription.save()

      return res.status(200).json(
        new ApiResponse(200, existingSubscription, "Newsletter subscription reactivated successfully")
      )
    }
  }

  // Create new subscription
  const subscription = await Newsletter.create({
    email: email.toLowerCase(),
    source,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
  })

  return res.status(201).json(
    new ApiResponse(201, subscription, "Successfully subscribed to newsletter")
  )
})

// Unsubscribe from newsletter
const unsubscribeFromNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format")
  }

  const subscription = await Newsletter.findOne({ email: email.toLowerCase() })

  if (!subscription) {
    throw new ApiError(404, "Email not found in newsletter subscriptions")
  }

  if (!subscription.isActive) {
    throw new ApiError(400, "Email is already unsubscribed")
  }

  subscription.isActive = false
  subscription.unsubscribedAt = new Date()
  await subscription.save()

  return res.status(200).json(
    new ApiResponse(200, {}, "Successfully unsubscribed from newsletter")
  )
})

// Get all newsletter subscriptions (Admin only)
const getAllNewsletterSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, search } = req.query

  const pageNumber = parseInt(page as string)
  const limitNumber = parseInt(limit as string)
  const skip = (pageNumber - 1) * limitNumber

  // Build query
  const query: any = {}
  
  if (status === "active") {
    query.isActive = true
  } else if (status === "inactive") {
    query.isActive = false
  }

  if (search) {
    query.email = { $regex: search, $options: "i" }
  }

  const subscriptions = await Newsletter.find(query)
    .sort({ subscribedAt: -1 })
    .skip(skip)
    .limit(limitNumber)

  const total = await Newsletter.countDocuments(query)

  return res.status(200).json(
    new ApiResponse(200, {
      subscriptions,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalSubscriptions: total,
        hasNextPage: pageNumber * limitNumber < total,
        hasPrevPage: pageNumber > 1,
      },
    }, "Newsletter subscriptions retrieved successfully")
  )
})

// Get newsletter statistics (Admin only)
const getNewsletterStats = asyncHandler(async (req: Request, res: Response) => {
  const totalSubscriptions = await Newsletter.countDocuments()
  const activeSubscriptions = await Newsletter.countDocuments({ isActive: true })
  const inactiveSubscriptions = await Newsletter.countDocuments({ isActive: false })

  // Get subscriptions by month for the last 12 months
  const monthlyStats = await Newsletter.aggregate([
    {
      $match: {
        subscribedAt: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$subscribedAt" },
          month: { $month: "$subscribedAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ])

  // Get subscriptions by source
  const sourceStats = await Newsletter.aggregate([
    {
      $group: {
        _id: "$source",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ])

  return res.status(200).json(
    new ApiResponse(200, {
      totalSubscriptions,
      activeSubscriptions,
      inactiveSubscriptions,
      monthlyStats,
      sourceStats,
    }, "Newsletter statistics retrieved successfully")
  )
})

// Delete newsletter subscription (Admin only)
const deleteNewsletterSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const subscription = await Newsletter.findByIdAndDelete(id)

  if (!subscription) {
    throw new ApiError(404, "Newsletter subscription not found")
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Newsletter subscription deleted successfully")
  )
})

// Export subscribers to CSV (Admin only)
const exportNewsletterSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query

  const query: any = {}
  if (status === "active") {
    query.isActive = true
  } else if (status === "inactive") {
    query.isActive = false
  }

  const subscribers = await Newsletter.find(query).sort({ subscribedAt: -1 })

  // Create CSV content
  const csvHeader = "Email,Status,Subscribed At,Source,IP Address\n"
  const csvRows = subscribers.map(sub => 
    `${sub.email},${sub.isActive ? "Active" : "Inactive"},${sub.subscribedAt.toISOString()},${sub.source || ""},${sub.ipAddress || ""}`
  ).join("\n")

  const csvContent = csvHeader + csvRows

  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", `attachment; filename=newsletter-subscribers-${Date.now()}.csv`)
  
  return res.status(200).send(csvContent)
})

const NewsletterController = {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getAllNewsletterSubscriptions,
  getNewsletterStats,
  deleteNewsletterSubscription,
  exportNewsletterSubscribers,
};

export default NewsletterController;

export {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getAllNewsletterSubscriptions,
  getNewsletterStats,
  deleteNewsletterSubscription,
  exportNewsletterSubscribers,
}; 