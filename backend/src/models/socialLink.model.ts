import mongoose, { Document, Schema ,Types} from 'mongoose';

// Interface for type-safety with TypeScript
export interface ISocialLink extends Document {
   _id: Types.ObjectId;
    title: string;
    link: string;
    description?: string;
    icon: string;
    status: 'active' | 'inactive';
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SocialLinkSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            unique: true,
        },
        link: {
            type: String,
            required: [true, 'Social media link (URL) is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            required: [true, 'An icon image is required'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Assumes you have a 'User' model
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
);

export const SocialLink = mongoose.model<ISocialLink>('SocialLink', SocialLinkSchema);