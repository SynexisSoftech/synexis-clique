import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlacklistedToken extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userId?: string;
  reason?: string;
}

export interface IBlacklistedTokenModel extends Model<IBlacklistedToken> {
  isBlacklisted(token: string): Promise<boolean>;
  blacklistToken(token: string, expiresAt: Date, userId?: string, reason?: string): Promise<void>;
  getUserBlacklistedTokens(userId: string): Promise<IBlacklistedToken[]>;
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired tokens
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  userId: {
    type: String,
    required: false,
    index: true
  },
  reason: {
    type: String,
    enum: ['logout', 'security_breach', 'admin_revoke', 'token_rotation'],
    default: 'logout'
  }
});

// Compound index for efficient queries
blacklistedTokenSchema.index({ token: 1, expiresAt: 1 });

// Method to check if token is blacklisted
blacklistedTokenSchema.statics.isBlacklisted = async function(token: string): Promise<boolean> {
  const blacklistedToken = await this.findOne({ token });
  return !!blacklistedToken;
};

// Method to blacklist a token
blacklistedTokenSchema.statics.blacklistToken = async function(
  token: string, 
  expiresAt: Date, 
  userId?: string, 
  reason: string = 'logout'
): Promise<void> {
  try {
    // Check if token is already blacklisted
    const existingToken = await this.findOne({ token });
    if (existingToken) {
      console.log(`[BlacklistedToken] Token already blacklisted, skipping duplicate blacklist`);
      return;
    }

    // Use findOneAndUpdate with upsert to handle duplicates gracefully
    await this.findOneAndUpdate(
      { token },
      {
        token,
        expiresAt,
        userId,
        reason,
        createdAt: new Date()
      },
      { 
        upsert: true, // Create if doesn't exist, update if exists
        new: true 
      }
    );
    
    console.log(`[BlacklistedToken] Token blacklisted successfully for reason: ${reason}`);
  } catch (error: any) {
    // Log the error but don't throw it to prevent breaking the auth flow
    console.warn(`[BlacklistedToken] Error blacklisting token: ${error.message}`);
  }
};

// Method to get blacklisted tokens for a user
blacklistedTokenSchema.statics.getUserBlacklistedTokens = async function(userId: string): Promise<IBlacklistedToken[]> {
  return await this.find({ userId }).sort({ createdAt: -1 });
};

export default mongoose.model<IBlacklistedToken, IBlacklistedTokenModel>('BlacklistedToken', blacklistedTokenSchema); 