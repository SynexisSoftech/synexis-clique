// src/common/enums.ts (or wherever you keep your enums)

export enum ContactQueryType {
  DELIVERY_OFFERS = 'DELIVERY_OFFERS',
  GENERAL_QUERY = 'GENERAL_QUERY',
  PAYMENT_ISSUES = 'PAYMENT_ISSUES',
  ACCOUNT_HELP = 'ACCOUNT_HELP',
  FEEDBACK = 'FEEDBACK',
  OTHER = 'OTHER',
}

export enum ContactQueryStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  PENDING_RESPONSE = 'PENDING_RESPONSE',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED', // For queries that are resolved and finalized
}


export enum SocialPlatform {
  FACEBOOK = 'Facebook',
  TWITTER = 'Twitter',
  X_TWITTER = 'X (Twitter)', // Adding X as an option
  INSTAGRAM = 'Instagram',
  LINKEDIN = 'LinkedIn',
  YOUTUBE = 'YouTube',
  PINTEREST = 'Pinterest',
  TIKTOK = 'TikTok',
  GITHUB = 'GitHub',
  WEBSITE = 'Website', // For general website links
  OTHER = 'Other',     // For platforms not listed
}