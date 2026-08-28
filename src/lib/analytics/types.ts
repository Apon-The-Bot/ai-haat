// ─── AI Haat Analytics — Type Definitions ────────────────────────
// Typed interfaces for all analytics events. No `any` in analytics payloads.

/** GA4/Meta-compatible product item */
export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  coupon?: string;
  index?: number;
  item_list_id?: string;
  item_list_name?: string;
}

/** Server-authoritative purchase event data */
export interface PurchaseEventData {
  transaction_id: string;
  value: number;
  currency: "BDT";
  items: AnalyticsItem[];
  coupon?: string;
  shipping: number;
  tax: number;
  event_id: string; // For Meta dedup: purchase_AH-XXXXXXXX
}

/** Product view event */
export interface ProductViewEventData {
  item: AnalyticsItem;
  currency: "BDT";
  value: number;
}

/** Cart event (add/remove) */
export interface CartEventData {
  item: AnalyticsItem;
  currency: "BDT";
  value: number;
}

/** Checkout event */
export interface CheckoutEventData {
  items: AnalyticsItem[];
  currency: "BDT";
  value: number;
  coupon?: string;
}

/** Payment info event */
export interface PaymentInfoEventData {
  payment_type: string;
  items: AnalyticsItem[];
  currency: "BDT";
  value: number;
}

/** Search event */
export interface SearchEventData {
  search_term: string;
}

/** Attribution data persisted with orders */
export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  referrer?: string;
}

/** Meta CAPI user data (hashed) */
export interface MetaCapiUserData {
  em?: string;  // SHA-256 hashed email
  ph?: string;  // SHA-256 hashed phone
  external_id?: string; // SHA-256 hashed user ID
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
}

/** Meta CAPI event payload */
export interface MetaCapiEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url?: string;
  action_source: "website";
  user_data: MetaCapiUserData;
  custom_data?: Record<string, unknown>;
}

/** Analytics event outbox record */
export interface AnalyticsEventRecord {
  eventName: string;
  orderId?: string;
  provider: "meta_capi";
  eventId: string;
  payload: string;
  status: "PENDING" | "SENT" | "FAILED";
  attempts: number;
  lastError?: string;
}
