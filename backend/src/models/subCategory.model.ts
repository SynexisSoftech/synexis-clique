import mongoose, { Document, Schema } from 'mongoose';
// import { ICategory } from './category.model'; // For type reference
// import { IUser } from './user.model'; // For type reference
import slugify from 'slugify';
export interface ISubcategory extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  categoryId: mongoose.Types.ObjectId; // Reference to Category
  seoKeywords?: string;
  tags?: string;
  image?: string; // URL to the image
  status: 'active' | 'inactive';
  createdBy: mongoose.Types.ObjectId; // Reference to User (admin)
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema: Schema<ISubcategory> = new Schema<ISubcategory>(
  {
    title: {
      type: String,
      required: [true, 'Subcategory title is required.'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long.'],
      maxlength: [100, 'Title cannot exceed 100 characters.'],
    },
     slug: {
    type: String,
    unique: true, // This is good, but the compound index is causing the error
  },
    description: {
      type: String,
      required: [true, 'Subcategory description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long.'],
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Referencing your Category model
      required: [true, 'Parent category ID is required.'],
    },
    seoKeywords: [{
      type: String,
      trim: true,
      maxlength: [200, 'SEO keywords cannot exceed 200 characters.'],
    }],
    tags: [{
      type: String, // Could be an array of strings: String[]
      trim: true,
      maxlength: [200, 'Tags cannot exceed 200 characters.'],
    }],
    image: {
      type: String, // URL to the subcategory image
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referencing your User model
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique subcategory titles within a specific category
// Add a pre-save hook to generate the slug from the title
SubcategorySchema.pre<ISubcategory>('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});
SubcategorySchema.index({ slug: 1, categoryId: 1 }, { unique: true });

export const Subcategory = mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);
// For usage: import { Subcategory, ISubcategory } from '../models/subcategory.model';