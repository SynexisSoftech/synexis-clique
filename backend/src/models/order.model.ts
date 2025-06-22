import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface for a single item within an order
export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number; // Price at the time of purchase
}

// Main interface for the Order document
export interface IOrder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: IOrderItem[]; // Replaced productId with an array of items
  transaction_uuid: string;
  amount: number; // Represents the subtotal before shipping/tax
  totalAmount: number; // The final grand total
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  eSewaRefId?: string;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingCharge: number;
  tax: number;
  createdAt: Date;
  updatedAt: Date;
}

// 1. Define the schema for a single order item
const OrderItemSchema: Schema<IOrderItem> = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // It's crucial to store the price here for historical accuracy.
    // This prevents the order total from changing if the product's price is updated later.
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false } // We don't need a separate _id for each item in the array
);

// 2. Define the main Order Schema
const OrderSchema: Schema<IOrder> = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 3. Use the OrderItemSchema for an array of items
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    transaction_uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    eSewaRefId: {
      type: String,
    },
    shippingInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      province: String,
      city: String,
      postalCode: String,
      country: String,
    },
    shippingCharge: Number,
    tax: Number,
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);