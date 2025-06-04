// File: ../models/socialMediaLink.model.ts

import { Schema, model, Document, Types } from 'mongoose';
import { SocialPlatform } from '../common/enums'; // Adjust path as necessary

export interface ISocialMediaLink extends Document {
  id: string; // Virtual getter
  platformName: SocialPlatform;
  linkUrl: string;
  iconClass?: string; // e.g., 'fab fa-facebook', 'bi bi-twitter'
  isActive: boolean;
  displayOrder?: number;
  createdBy?: Types.ObjectId; // Reference to User model (admin who created)
  updatedBy?: Types.ObjectId; // Reference to User model (admin who last updated)
  createdAt: Date;
  updatedAt: Date;
}

const socialMediaLinkSchema = new Schema<ISocialMediaLink>(
  {
    platformName: {
      type: String,
      enum: Object.values(SocialPlatform),
      required: [true, 'Platform name is required.'],
      trim: true,
    },
    linkUrl: {
      type: String,
      required: [true, 'Link URL is required.'],
      trim: true,
      match: [
        /^(ftp|http|https|):\/\/[^ "]+$/, // Basic URL validation
        'Please fill a valid URL for the social media link.',
      ],
    },
    iconClass: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0, // Default order, can be managed by admin
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Ensure you have a User model
      // required: true, // Uncomment if an admin must always be linked
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Ensure you have a User model
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false,
    toJSON: {
      virtuals: true, // Ensure virtuals are included when document is converted to JSON
      transform(doc, ret) {
        ret.id = ret._id; // Rename _id to id
        delete ret._id;   // Remove _id
      },
    },
    toObject: { // Also apply transformations for toObject if needed
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Indexes for better query performance
socialMediaLinkSchema.index({ platformName: 1 });
socialMediaLinkSchema.index({ isActive: 1 });
socialMediaLinkSchema.index({ displayOrder: 1, createdAt: -1 });


const SocialMediaLinkModel = model<ISocialMediaLink>(
  'SocialMediaLink',
  socialMediaLinkSchema
);

export default SocialMediaLinkModel;