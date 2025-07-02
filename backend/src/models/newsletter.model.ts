import mongoose, { Schema, Document } from "mongoose"

export interface INewsletter extends Document {
  email: string
  isActive: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
  source?: string // Where they subscribed from (homepage, footer, etc.)
  ipAddress?: string
  userAgent?: string
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      default: "homepage",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Index for better query performance
newsletterSchema.index({ email: 1 })
newsletterSchema.index({ isActive: 1 })
newsletterSchema.index({ subscribedAt: -1 })

export default mongoose.model<INewsletter>("Newsletter", newsletterSchema) 