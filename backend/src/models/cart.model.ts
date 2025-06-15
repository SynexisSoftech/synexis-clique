import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './product.model'; // Assuming product model is in this path
import { IUser } from './user.model'; // Assuming user model is in this path

/**
 * @interface ICartItem
 * @description Represents a single item within the shopping cart.
 * @property {mongoose.Types.ObjectId | IProduct} productId - Reference to the product.
 * @property {number} quantity - The number of units for the product.
 * @property {number} price - The price of the product at the time it was added to the cart.
 */
export interface ICartItem {
  productId: mongoose.Types.ObjectId | IProduct;
  quantity: number;
  price: number;
}

/**
 * @interface ICart
 * @description Represents a user's shopping cart.
 * @property {mongoose.Types.ObjectId} _id - The unique identifier for the cart.
 * @property {mongoose.Types.ObjectId | IUser} userId - The user who owns the cart.
 * @property {ICartItem[]} items - An array of items in the cart.
 * @property {Date} createdAt - The timestamp for when the cart was created.
 * @property {Date} updatedAt - The timestamp for the last update to the cart.
 */
export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | IUser;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Sub-schema for items within the cart
const CartItemSchema: Schema<ICartItem> = new Schema<ICartItem>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1.'],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required for cart item.'],
      min: [0, 'Price cannot be negative.'],
    },
  },
  { _id: false } // No separate _id for subdocuments is needed here
);

// Main schema for the cart
const CartSchema: Schema<ICart> = new Schema<ICart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Enforces that each user can only have one cart
      index: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);