// category.model.ts

import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify'; // Import slugify

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string; // <-- ADD THIS FIELD
  description: string;
  seoKeywords?: string[];
  tags?: string[];
  image?: string;
  status: 'active' | 'inactive';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema<ICategory>(
  {
    title: {
      type: String,
      required: [true, 'Category title is required.'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long.'],
      maxlength: [100, 'Title cannot exceed 100 characters.'],
      unique: true,
    },
    slug: { // <-- ADD THE SLUG DEFINITION
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Category description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long.'],
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    seoKeywords: [{
      type: String,
      trim: true,
      maxlength: [200, 'SEO keywords cannot exceed 200 characters.'],
    }],
    tags: [{
      type: String,
      trim: true,
      maxlength: [200, 'Tags cannot exceed 200 characters.'],
    }],
    image: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Mongoose Pre-Save Hook to Generate Slug
// This function will run automatically before any document is saved
CategorySchema.pre<ICategory>('save', function (next) {
  if (this.isModified('title')) { // Only generate slug if title is new or has been changed
    this.slug = slugify(this.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  }
  next();
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);