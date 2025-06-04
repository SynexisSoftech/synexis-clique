import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISocialMediaLinkEntry extends Document { // Sub-document
    platform: string; // e.g., 'Facebook', 'Instagram', 'X', 'YouTube'
    url: string;      // Full URL to the profile/page
    iconClass?: string; // Optional: For frontend icon rendering (e.g., Font Awesome class)
}

export interface IContactDetails extends Document { // Sub-document
    email: string;           // Primary contact email
    phone?: string;          // Primary contact phone
    secondaryPhone?: string;
    address?: string;        // Physical store address or main office
    mapEmbedUrl?: string;    // e.g., Google Maps iframe URL
    workingHours?: string;   // e.g., "Mon - Fri: 9 AM - 6 PM"
}

export interface ISiteInfo extends Document {
    _id: Types.ObjectId; // Should be a fixed ID for singleton, or logic to always fetch/create one
    siteName: string;
    tagline?: string;
    logoUrl?: string;       // URL to the main site logo
    faviconUrl?: string;    // URL to the site favicon
    aboutUsContent: string; // HTML or Markdown content for About Us page
    contactDetails: IContactDetails;
    socialMediaLinks: Types.DocumentArray<ISocialMediaLinkEntry>;
    // SEO Defaults
    defaultMetaTitle?: string;
    defaultMetaDescription?: string;
    // Legal Pages (can be content or links to dedicated pages)
    termsAndConditionsContent?: string; // Or termsUrl: string;
    privacyPolicyContent?: string;      // Or privacyUrl: string;
    // Store Settings
    // defaultCurrency?: { code: string; symbol: string; }; // e.g., { code: "NPR", symbol: "₨" }
    // maintenanceMode?: { isActive: boolean; message?: string; allowedIPs?: string[]; };
    updatedAt: Date; // Only updatedAt makes sense for a singleton
}

const SocialMediaLinkSchema: Schema<ISocialMediaLinkEntry> = new Schema({
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true }, // Controller should validate as URL
    iconClass: { type: String, trim: true },
}, {_id: true});

const ContactDetailsSchema: Schema<IContactDetails> = new Schema({
    email: { type: String, required: true, trim: true, lowercase: true }, // Controller should validate
    phone: { type: String, trim: true },
    secondaryPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    mapEmbedUrl: { type: String, trim: true }, // Controller should validate
    workingHours: { type: String, trim: true },
});

const SiteInfoSchema: Schema<ISiteInfo> = new Schema<ISiteInfo>(
    {
        // _id: { type: String, default: 'singleton_site_info_id' }, // One way to enforce singleton
        siteName: { type: String, required: true, default: "My Awesome Store" },
        tagline: { type: String, trim: true },
        logoUrl: { type: String, trim: true },
        faviconUrl: { type: String, trim: true },
        aboutUsContent: { type: String, required: true, default: "<h1>About Us</h1><p>Update this content from the admin panel.</p>" },
        contactDetails: { type: ContactDetailsSchema, required: true, default: () => ({ email: "contact@example.com" }) },
        socialMediaLinks: [SocialMediaLinkSchema],
        defaultMetaTitle: { type: String, trim: true },
        defaultMetaDescription: { type: String, trim: true },
        termsAndConditionsContent: { type: String, trim: true },
        privacyPolicyContent: { type: String, trim: true },
        // defaultCurrency: { code: {type: String, default: "NPR"}, symbol: {type: String, default: "₨"} },
        // maintenanceMode: { isActive: {type: Boolean, default: false}, message: String, allowedIPs: [String] }
    },
    // Singleton doesn't really have a 'createdAt', only 'updatedAt' matters.
    // Or, use a fixed _id and upsert.
    { timestamps: { createdAt: false, updatedAt: true } }
);

// Static method to get or create the singleton document
SiteInfoSchema.statics.getSingleton = async function (): Promise<ISiteInfo> {
    // Using a known query criteria, or just findOne if there should only ever be one.
    const fixedQuery = { siteName: { $exists: true } }; // Or a more specific fixed field/value.
    let doc = await this.findOne(fixedQuery);
    if (!doc) {
        console.log("SiteInfo document not found, creating with defaults.");
        doc = await this.create({
            // Default values set in schema will apply
            siteName: "My E-Commerce Platform", // Explicit default if schema default isn't enough
            contactDetails: { email: "info@example.com", phone: "123-456-7890" },
            aboutUsContent: "<p>Welcome! Please update this About Us section.</p>",
            socialMediaLinks: [{platform: "Our Website", url: "#"}]
        });
    }
    return doc;
};

export default mongoose.model<ISiteInfo>('SiteInfo', SiteInfoSchema);