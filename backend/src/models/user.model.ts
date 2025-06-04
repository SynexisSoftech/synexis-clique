import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt'; // Needed for hashing password reset OTP if done in model methods

export enum UserRole {
  BUYER = 'buyer',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string; // Hashed password for login
  photoURL: string;
  isVerified: boolean;
  role: UserRole;
  passwordResetOTP?: string; // Hashed OTP for password reset
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 30 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: { type: String, required: true, minlength: 8 },
    photoURL: { type: String, required: true }, // Consider URL validation
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
    },
    passwordResetOTP: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);



export default mongoose.model<IUser>('User', UserSchema);