import mongoose, { Document, Schema } from 'mongoose';

// Interface for a single Phone Number object
export interface IPhoneNumber {
  label: string; // e.g., "Customer Support", "Sales"
  number: string;
}

// Interface for a single Email object
export interface IEmail {
  label: string; // e.g., "General Inquiries", "Press"
  email: string;
}

// Interface for a single Location object
export interface ILocation {
  label: string; // e.g., "Head Office", "Warehouse"
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  googleMapsUrl?: string;
}


// Main interface for the Contact Info document
export interface IContactInfo extends Document {
  _id: mongoose.Types.ObjectId;
  phoneNumbers: IPhoneNumber[];
  emails: IEmail[];
  locations: ILocation[];

  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContactInfoSchema: Schema<IContactInfo> = new Schema<IContactInfo>(
  {
    phoneNumbers: [
      {
        label: { type: String, required: true, trim: true },
        number: { type: String, required: true, trim: true },
      },
    ],
    emails: [
      {
        label: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
      },
    ],
    locations: [
      {
        label: { type: String, required: true, trim: true },
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        googleMapsUrl: { type: String, trim: true },
      },
    ],
   
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const ContactInfo = mongoose.model<IContactInfo>('ContactInfo', ContactInfoSchema);