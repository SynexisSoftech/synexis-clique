import mongoose, { Document, Schema } from 'mongoose';

// Category Model
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  seoKeywords?: string;
  tags?: string;
  image?: string;
  status: 'active' | 'inactive';
  createdBy: mongoose.Types.ObjectId; // Reference to User (admin)
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema<ICategory>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 2, 
      maxlength: 100,
      unique: true 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 10, 
      maxlength: 500 
    },
    seoKeywords: { 
      type: String, 
      trim: true, 
      maxlength: 200 
    },
    tags: { 
      type: String, 
      trim: true, 
      maxlength: 200 
    },
    image: { 
      type: String, 
      trim: true 
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

// Subcategory Model
export interface ISubcategory extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  categoryId: mongoose.Types.ObjectId; // Reference to Category
  seoKeywords?: string;
  tags?: string;
  image?: string;
  status: 'active' | 'inactive';
  createdBy: mongoose.Types.ObjectId; // Reference to User (admin)
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema: Schema<ISubcategory> = new Schema<ISubcategory>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 2, 
      maxlength: 100 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 10, 
      maxlength: 500 
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    seoKeywords: { 
      type: String, 
      trim: true, 
      maxlength: 200 
    },
    tags: { 
      type: String, 
      trim: true, 
      maxlength: 200 
    },
    image: { 
      type: String, 
      trim: true 
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique subcategory names within a category
SubcategorySchema.index({ title: 1, categoryId: 1 }, { unique: true });

export const Subcategory = mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);

// Product Model
export interface ICustomDetail {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: mongoose.Types.ObjectId; // Reference to Category
  subcategoryId: mongoose.Types.ObjectId; // Reference to Subcategory
  originalPrice: number;
  discountPrice?: number;
  stockQuantity: number;
  features?: string;
  colors?: string[];
  sizes?: string[];
  brand?: string;
  seoKeywords?: string;
  tags?: string;
  returnPolicy?: string;
  warranty?: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  images: string[]; // Array of image URLs
  customDetails?: ICustomDetail[];
  status: 'active' | 'inactive' | 'out-of-stock';
  createdBy: mongoose.Types.ObjectId; // Reference to User (admin)
  createdAt: Date;
  updatedAt: Date;
}

const CustomDetailSchema: Schema<ICustomDetail> = new Schema<ICustomDetail>(
  {
    label: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 50 
    },
    value: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 200 
    }
  },
  { _id: false }
);

const ProductSchema: Schema<IProduct> = new Schema<IProduct>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 2, 
      maxlength: 200 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 10, 
      maxlength: 2000 
    },
    shortDescription: { 
      type: String, 
      trim: true, 
      maxlength: 300 
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true
    },
    originalPrice: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    discountPrice: { 
      type: Number, 
      min: 0,
      validate: {
        validator: function(this: IProduct, value: number) {
          return !value || value < this.originalPrice;
        },
        message: 'Discount price must be less than original price'
      }
    },
    stockQuantity: { 
      type: Number, 
      required: true, 
      min: 0,
      default: 0 
    },
    features: { 
      type: String, 
      trim: true, 
      maxlength: 1000 
    },
    colors: [{ 
      type: String, 
      trim: true 
    }],
    sizes: [{ 
      type: String, 
      trim: true 
    }],
    brand: { 
      type: String, 
      trim: true, 
      maxlength: 50 
    },
    seoKeywords: { 
      type: String, 
      trim: true, 
      maxlength: 300 
    },
    tags: { 
      type: String, 
      trim: true, 
      maxlength: 300 
    },
    returnPolicy: { 
      type: String, 
      trim: true, 
      maxlength: 500 
    },
    warranty: { 
      type: String, 
      trim: true, 
      maxlength: 500 
    },
    weight: { 
      type: String, 
      trim: true, 
      maxlength: 50 
    },
    dimensions: { 
      type: String, 
      trim: true, 
      maxlength: 100 
    },
    material: { 
      type: String, 
      trim: true, 
      maxlength: 100 
    },
    images: [{ 
      type: String, 
      required: true,
      trim: true 
    }],
    customDetails: [CustomDetailSchema],
    status: {
      type: String,
      enum: ['active', 'inactive', 'out-of-stock'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
ProductSchema.index({ categoryId: 1, subcategoryId: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ originalPrice: 1 });
ProductSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

// Review Model
export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId; // Reference to Product
  userId: mongoose.Types.ObjectId; // Reference to User (buyer)
  rating: number; // 1-5 stars
  comment?: string;
  isVerified: boolean; // Whether the reviewer actually purchased the product
  status: 'active' | 'hidden' | 'flagged';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema<IReview>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      type: String, 
      trim: true, 
      maxlength: 1000 
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'flagged'],
      default: 'active'
    }
  },
  { timestamps: true }
);

// Compound index to ensure one review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1, status: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);