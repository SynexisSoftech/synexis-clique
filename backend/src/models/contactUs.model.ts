import { Schema, model, Document, Types } from 'mongoose';
import { ContactQueryType, ContactQueryStatus } from '../common/enums'; // Adjust path as needed

// Interface describing the properties of a ContactUs document
export interface IContactUs extends Document {
  userId?: Types.ObjectId; // Optional: if submitted by a logged-in user
  name: string;
  email: string;
  phone?: string; // Optional
  queryType: ContactQueryType;
  description: string;
  status: ContactQueryStatus; // Now uses the updated enum
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string; // Optional field for admins to add notes
}

const ContactUsSchema = new Schema<IContactUs>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a 'User' model
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long.'],
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email address.'],
    },
    phone: {
      type: String,
      trim: true,
      required: false,
    },
    queryType: {
      type: String,
      enum: Object.values(ContactQueryType), // Use enum values from enums.ts
      required: [true, 'Query type is required.'],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long.'],
      maxlength: [2000, 'Description cannot exceed 2000 characters.'],
    },
    status: {
      type: String,
      enum: Object.values(ContactQueryStatus), // Use the updated, more descriptive enum
      default: ContactQueryStatus.UNREAD,     // Default status remains UNREAD
      required: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexing for frequently queried fields can improve performance
ContactUsSchema.index({ status: 1 });
ContactUsSchema.index({ email: 1 });
ContactUsSchema.index({ userId: 1 });
ContactUsSchema.index({ queryType: 1 });

const ContactUsModel = model<IContactUs>('ContactUs', ContactUsSchema);

export default ContactUsModel;