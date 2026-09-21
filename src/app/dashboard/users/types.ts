export interface UserRecord {
  id: string;
  username: string;
  email: string;
  name: string;
  role?: string;
  created: string;
  updated?: string;
  verified?: boolean;
  canonical_email?: string;
  discipline_stats?: string | Record<string, any>;
  isPremium?: boolean;
  premium_plan?: string;
  subscription_expiry?: string;
  trial_end_date?: string;
  ad_premium_end_date?: string;
}
