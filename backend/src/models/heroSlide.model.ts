import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroSlide extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string; // Call-to-action text
  ctaLink: string; // Call-to-action link
  order: number; // For sorting the slides
  status: 'active' | 'inactive';
  seoKeywords?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema: Schema<IHeroSlide> = new Schema<IHeroSlide>(
  {
    title: {
      type: String,
      required: [true, 'Slide title is required.'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters.'],
    },
    subtitle: {
      type: String,
      required: [true, 'Subtitle is required.'],
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters.'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required.'],
    },
    ctaText: {
      type: String,
      required: [true, 'Call-to-action text is required.'],
      trim: true,
      default: 'Learn More',
    },
    ctaLink: {
      type: String,
      required: [true, 'Call-to-action link is required.'],
      trim: true,
      default: '/',
    },
    order: {
      type: Number,
      default: 0,
      index: true, // Index for faster sorting
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    seoKeywords: [{
      type: String,
      trim: true,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const HeroSlide = mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);