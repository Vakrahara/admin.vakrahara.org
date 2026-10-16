export interface ShadowData {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    is_premium: boolean;
    premium_plan: string;
    subscription_expiry: string;
    trial_end_date: string;
    ad_premium_end_date: string;
    created: string;
    updated: string;
    discipline_stats: any;
  };
  devices: any[];
  orders: any[];
  yatraProgress: any[];
  arenaMatches: any[];
}

export interface FeedbackReport {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  admin_notes: string;
  device_info: string;
  app_version: string;
  created: string;
}
