import mongoose, { Document, Schema } from 'mongoose';

// Assuming ICategory, ISubcategory, IUser interfaces are defined elsewhere
export interface ICategory extends Document { _id: mongoose.Types.ObjectId; title: string; }
export interface ISubcategory extends Document { _id: mongoose.Types.ObjectId; title: string; }
export interface IUser extends Document { _id: mongoose.Types.ObjectId; }

// --- Sub-schemas and Interfaces ---

// For customDetails (already good, just including for completeness)
export interface ICustomDetail {
  label: string;
  value: string;
}

const CustomDetailSchema: Schema<ICustomDetail> = new Schema<ICustomDetail>(
  {
    label: {
      type: String,
      required: [true, 'Custom detail label is required.'],
      trim: true,
      maxlength: [50, 'Custom detail label cannot exceed 50 characters.'],
    },
    value: {
      type: String,
      required: [true, 'Custom detail value is required.'],
      trim: true,
      maxlength: [200, 'Custom detail value cannot exceed 200 characters.'],
    },
  },
  { _id: false } // No separate _id for subdocuments unless needed
);

// For Dimensions (new specific schema)
export interface IDimensions {
  length: number;
  width: number;
  height: number;
  unit?: string; // e.g., "cm", "inch"
}

const DimensionsSchema: Schema<IDimensions> = new Schema<IDimensions>(
  {
    length: { type: Number, required: true, min: [0, 'Length cannot be negative.'] },
    width: { type: Number, required: true, min: [0, 'Width cannot be negative.'] },
    height: { type: Number, required: true, min: [0, 'Height cannot be negative.'] },
    unit: { type: String, trim: true, default: 'cm' }, // Default unit
  },
  { _id: false }
);

// -------------------- Product Model --------------------
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: mongoose.Types.ObjectId | ICategory;
  subcategoryId: mongoose.Types.ObjectId | ISubcategory;
  originalPrice: number; // Tax-inclusive price (like Daraz)
  discountPrice?: number; // Tax-inclusive discounted price
  basePrice: number; // Price before tax (for internal calculations)
  discountBasePrice?: number; // Discounted price before tax
  taxRate: number; // Tax rate (default 13% for Nepal)
  stockQuantity: number;
  features?: string[]; // CHANGED to array of strings
  colors?: string[];
  sizes?: string[];
  brand?: string;
  seoKeywords?: string[]; // CHANGED to array of strings
  tags?: string[]; // CHANGED to array of strings
  returnPolicy?: string;
  warranty?: string;
  weight?: string;
  dimensions?: IDimensions; // CHANGED to the IDimensions object
  material?: string;
  images: string[];
  customDetails?: ICustomDetail[];
  status: 'active' | 'inactive' | 'out-of-stock';
  isCashOnDeliveryAvailable: boolean;
  createdBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required.'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long.'],
      maxlength: [200, 'Title cannot exceed 200 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long.'],
      maxlength: [2000, 'Description cannot exceed 2000 characters.'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters.'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required.'],
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: [true, 'Product subcategory is required.'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required.'],
      min: [0, 'Price cannot be negative.'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative.'],
      validate: [
        {
          validator: function (this: IProduct, value: number | null | undefined) {
            if (value === null || value === undefined) return true;
            return value < this.originalPrice;
          },
          message: 'Discount price must be less than original price.',
        },
      ],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price (before tax) is required.'],
      min: [0, 'Base price cannot be negative.'],
    },
    discountBasePrice: {
      type: Number,
      min: [0, 'Discount base price cannot be negative.'],
      validate: [
        {
          validator: function (this: IProduct, value: number | null | undefined) {
            if (value === null || value === undefined) return true;
            return value < this.basePrice;
          },
          message: 'Discount base price must be less than base price.',
        },
      ],
    },
    taxRate: {
      type: Number,
      default: 0.13, // 13% VAT for Nepal
      min: [0, 'Tax rate cannot be negative.'],
      max: [1, 'Tax rate cannot exceed 100%.'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required.'],
      min: [0, 'Stock quantity cannot be negative.'],
      default: 0,
    },
    features: [{ // CHANGED to array of strings
      type: String,
      trim: true,
      maxlength: [200, 'Individual feature cannot exceed 200 characters.'],
    }],
    colors: [{
      type: String,
      trim: true,
    }],
    sizes: [{
      type: String,
      trim: true,
    }],
    brand: {
      type: String,
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters.'],
    },
    seoKeywords: [{ // CHANGED to array of strings
      type: String,
      trim: true,
      maxlength: [100, 'Individual SEO keyword cannot exceed 100 characters.'],
    }],
    tags: [{ // CHANGED to array of strings
      type: String,
      trim: true,
      maxlength: [100, 'Individual tag cannot exceed 100 characters.'],
    }],
    returnPolicy: {
      type: String,
      trim: true,
      maxlength: [500, 'Return policy cannot exceed 500 characters.'],
    },
    warranty: {
      type: String,
      trim: true,
      maxlength: [500, 'Warranty information cannot exceed 500 characters.'],
    },
    weight: {
      type: String, // Keeping as string if you want units like "500g"
      trim: true,
      maxlength: [50, 'Weight cannot exceed 50 characters.'],
    },
    dimensions: DimensionsSchema, // CHANGED to use the dedicated DimensionsSchema
    material: {
      type: String,
      trim: true,
      maxlength: [100, 'Material cannot exceed 100 characters.'],
    },
    images: [{
      type: String,
      required: [true, 'At least one product image is required.'],
      trim: true,
    }],
    customDetails: [CustomDetailSchema],
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'out-of-stock'],
        message: '{VALUE} is not a supported status.',
      },
      default: 'active',
    },
    isCashOnDeliveryAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
ProductSchema.index({ categoryId: 1, subcategoryId: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ originalPrice: 1 });
// Text index for search across multiple fields
ProductSchema.index({ 
    title: 'text', 
    description: 'text', 
    'features': 'text', // Include features in text search
    'seoKeywords': 'text', // Include SEO keywords
    'tags': 'text', // Include tags
    brand: 'text' 
});
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isCashOnDeliveryAvailable: 1 });

// Pre-save hook to update status if stock is 0
ProductSchema.pre('save', function(next) {
  if (this.isModified('stockQuantity')) {
    if (this.stockQuantity === 0 && this.status !== 'out-of-stock') {
      this.status = 'out-of-stock';
    } else if (this.stockQuantity > 0 && this.status === 'out-of-stock') {
      this.status = 'active'; // Or whatever status you prefer when stock becomes available
    }
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);