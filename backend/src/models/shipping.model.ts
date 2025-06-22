import mongoose, { Document, Schema } from 'mongoose';

export interface ICity extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  shippingCharge: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProvince extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  cities: ICity[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// City sub-schema
const CitySchema: Schema<ICity> = new Schema<ICity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    shippingCharge: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, _id: true }
);

// Province schema
const ProvinceSchema: Schema<IProvince> = new Schema<IProvince>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    cities: {
      type: [CitySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Province = mongoose.model<IProvince>('Province', ProvinceSchema);
export const City = mongoose.model<ICity>('City', CitySchema); 