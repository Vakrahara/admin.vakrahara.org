export interface UserStats {
  totalUsers: number;
  totalRevenue: number;
  mrr: number;
  activeSubscribers: number;
  activeStats: {
    active24h: number;
    active7d: number;
    inactive: number;
  };
  demographics: {
    role: Record<string, number>;
    board: Record<string, number>;
    class: Record<string, number>;
  };
}
