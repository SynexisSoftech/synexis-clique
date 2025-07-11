// models/user.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
 BUYER = 'buyer',
 ADMIN = 'admin',
}

export interface IUser extends Document {
 _id: mongoose.Types.ObjectId;
 username?: string;
 firstName: string;
 lastName: string;
 email: string;
 password: string;
 photoURL: string;
 isVerified: boolean;
 role: UserRole;
 isBlocked: boolean;
 loginAttempts: number;
 lockUntil?: Date;
 passwordResetOTP?: string;
 passwordResetExpires?: Date;
 createdAt: Date;
 updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
 {
 username: { type: String, trim: true, minlength: 3, maxlength: 30 },
 firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
 lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
 email: {
 type: String,
 required: true,
 unique: true,
lowercase: true,
 trim: true,
 match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
 },
 password: { type: String, required: true, minlength: 8 },
 photoURL: { 
    type: String, 
    default: process.env.CLOUDINARY_DEFAULT_AVATAR_URL || 'https://via.placeholder.com/150'
  },
 isVerified: { type: Boolean, default: false },
 isBlocked: { type: Boolean, default: false },
 loginAttempts: { type: Number, default: 0 },
 lockUntil: { type: Date },
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