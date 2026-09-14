export interface Order {
  id: string;
  order_id: string;
  user_id: string;
  plan: string;
  amount_paise: number;
  subtotal_paise?: number;
  discount_paise?: number;
  taxable_paise?: number;
  igst_paise?: number;
  cgst_paise?: number;
  sgst_paise?: number;
  place_of_supply?: string;
  order_type?: string;
  coupon_code?: string;
  status: string;
  gateway: string;
  cf_order_id: string;
  gateway_payment_id: string;
  created: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  hsn_sac_code: string;
  gst_rate_pct: number;
  unit_price_paise: number;
  gst_amount_paise: number;
}

export interface GSTBreakdown {
  hsn_sac_code: string;
  rate: number;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
}

