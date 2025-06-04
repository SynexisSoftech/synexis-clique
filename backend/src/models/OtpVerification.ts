import mongoose, { Document, Schema } from 'mongoose';

export enum OtpPurpose {
  SIGNUP_VERIFICATION = 'signup-verification',
  EMAIL_UPDATE_VERIFICATION = 'email-update-verification',
  TWO_FACTOR_AUTH = 'two-factor-auth',
  // Add other purposes as needed
}

export interface IOtpVerification extends Document {
  email: string;
  otp: string; // Hashed OTP
  purpose: OtpPurpose;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    otp: { type: String, required: true }, // This will store the hashed OTP
    purpose: { type: String, enum: Object.values(OtpPurpose), required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// Create an index for faster lookups and to auto-delete expired OTPs
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpVerificationSchema.index({ email: 1, purpose: 1 });


export default mongoose.model<IOtpVerification>('OtpVerification', OtpVerificationSchema);