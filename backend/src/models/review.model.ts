import mongoose, { Document, Schema } from 'mongoose';
// import { IProduct } from './product.model';
// import { IUser } from './user.model';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId; // Reference to Product
  userId: mongoose.Types.ObjectId; // Reference to User (buyer)
  rating: number; // 1-5 stars
  comment?: string;
  isVerifiedPurchase: boolean; // Renamed from isVerified for clarity
  status: 'pending' | 'active' | 'hidden' | 'flagged'; // Added 'pending' status
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema<IReview>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required for the review.'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for the review.'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters.'],
    },
    isVerifiedPurchase: { // Clearer name
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'hidden', 'flagged'], // Added 'pending' for moderation flow
      default: 'pending', // Default to pending for admin approval
    },
  },
  { timestamps: true }
);

// Compound index to ensure one review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1, status: 1 }); // For querying reviews of a product by status

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
// For usage: import { Review, IReview } from '../models/review.model';