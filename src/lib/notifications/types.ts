/**
 * AI Haat Notification System - Event Types and Definitions
 */

export type NotificationChannel = "IN_APP" | "EMAIL" | "TELEGRAM";

export type NotificationPriority = "HIGH" | "NORMAL" | "LOW";

export type NotificationStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED" | "RETRY_WAIT";

export type NotificationErrorCategory = "TRANSIENT" | "PERMANENT" | "CONFIGURATION" | "RATE_LIMITED";

export const NOTIFICATION_EVENTS = {
  // Order Events
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_CANCELLED: "ORDER_CANCELLED",

  // Payment Events
  PAYMENT_VERIFIED: "PAYMENT_VERIFIED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_MISMATCH: "PAYMENT_MISMATCH",

  // Delivery Events
  ORDER_DELIVERED: "ORDER_DELIVERED",
  DELIVERY_PARTIAL: "DELIVERY_PARTIAL",
  DELIVERY_FAILED: "DELIVERY_FAILED",

  // Wallet Events
  WALLET_TOPUP_COMPLETED: "WALLET_TOPUP_COMPLETED",
  WALLET_TOPUP_FAILED: "WALLET_TOPUP_FAILED",
  WALLET_ADJUSTMENT: "WALLET_ADJUSTMENT",

  // Refund Events
  REFUND_REQUESTED: "REFUND_REQUESTED",
  REFUND_APPROVED: "REFUND_APPROVED",
  REFUND_REJECTED: "REFUND_REJECTED",
  REFUND_COMPLETED: "REFUND_COMPLETED",

  // Replacement Events
  REPLACEMENT_REQUESTED: "REPLACEMENT_REQUESTED",
  REPLACEMENT_APPROVED: "REPLACEMENT_APPROVED",
  REPLACEMENT_REJECTED: "REPLACEMENT_REJECTED",
  REPLACEMENT_COMPLETED: "REPLACEMENT_COMPLETED",

  // Support Events
  SUPPORT_TICKET_CREATED: "SUPPORT_TICKET_CREATED",
  SUPPORT_REPLY_CUSTOMER: "SUPPORT_REPLY_CUSTOMER",
  SUPPORT_REPLY_ADMIN: "SUPPORT_REPLY_ADMIN",
  SUPPORT_RESOLVED: "SUPPORT_RESOLVED",

  // Inventory & Sourcing Alerts (Operational)
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  FULFILLMENT_FAILED: "FULFILLMENT_FAILED",
  SUPPLIER_INGESTION: "SUPPLIER_INGESTION",

  // Security Alerts
  AUTH_OTP: "AUTH_OTP",
  MFA_ENABLED: "MFA_ENABLED",
  MFA_DISABLED: "MFA_DISABLED",
  RECOVERY_CODES_REGENERATED: "RECOVERY_CODES_REGENERATED",
  SECURITY_ALERT: "SECURITY_ALERT",

  // Affiliate & Payout Events
  AFFILIATE_COMMISSION_EARNED: "AFFILIATE_COMMISSION_EARNED",
  AFFILIATE_COMMISSION_HOLDING: "AFFILIATE_COMMISSION_HOLDING",
  AFFILIATE_COMMISSION_RELEASED: "AFFILIATE_COMMISSION_RELEASED",
  AFFILIATE_PAYOUT_REQUESTED: "AFFILIATE_PAYOUT_REQUESTED",
  AFFILIATE_PAYOUT_APPROVED: "AFFILIATE_PAYOUT_APPROVED",
  AFFILIATE_PAYOUT_REJECTED: "AFFILIATE_PAYOUT_REJECTED",
  AFFILIATE_PAYOUT_COMPLETED: "AFFILIATE_PAYOUT_COMPLETED",
  AFFILIATE_TIER_UPGRADED: "AFFILIATE_TIER_UPGRADED",
} as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

// ─── SAFE TYPED PAYLOADS ─────────────────────────────────────────────────────

export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    productName: string;
    variationName: string;
    quantity: number;
    priceBDT: number;
  }>;
  totalBDT: number;
  paymentMethod: string;
  orderUrl: string;
}

export interface PaymentVerifiedPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amountBDT: number;
  trxId?: string;
  paymentMethod: string;
  itemsCount: number;
  orderUrl: string;
}

export interface OrderDeliveredPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  isConsolidated: boolean;
  deliveredItems: Array<{
    productName: string;
    variationName: string;
    quantity: number;
    hasCredentials?: boolean;
    instructions?: string;
  }>;
  pendingItemsCount: number;
  vaultUrl: string;
  orderUrl: string;
}

export interface WalletTopupPayload {
  userId: string;
  userEmail: string;
  userName: string;
  amountBDT: number;
  newBalanceBDT?: number;
  trxId?: string;
  method: string;
  status: "COMPLETED" | "FAILED";
  walletUrl: string;
}

export interface RefundUpdatePayload {
  refundId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amountBDT: number;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  payoutMethod?: string;
  adminNote?: string;
  refundsUrl: string;
}

export interface ReplacementUpdatePayload {
  replacementId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  variationName: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  adminNote?: string;
  vaultUrl: string;
}

export interface SupportUpdatePayload {
  ticketId: string;
  ticketSubject: string;
  customerName: string;
  customerEmail: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  senderType: "CUSTOMER" | "ADMIN";
  messageSnippet: string;
  isInternalNote: boolean;
  ticketUrl: string;
}

export interface LowStockAlertPayload {
  productId: string;
  productName: string;
  variationId?: string;
  variationName?: string;
  availableCount: number;
  threshold: number;
  supplierName?: string;
  adminInventoryUrl: string;
}

export interface OutOfStockAlertPayload {
  orderNumber: string;
  productId: string;
  productName: string;
  variationName?: string;
  customerEmail: string;
  paidAmountBDT: number;
  adminOrderUrl: string;
}

export interface SecurityOtpPayload {
  recipientEmail: string;
  otpCode: string; // ONLY passed in memory during dispatch; NEVER stored in persistent DB queue
  purpose: "LOGIN" | "RECOVERY" | "MFA_SETUP" | "EMAIL_VERIFY";
  expiresInMinutes: number;
}

export interface AffiliateCommissionEarnedPayload {
  affiliateId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  amountBDT: number;
  orderNumber: string;
  orderTotalBDT: number;
  commissionRatePercent: number;
  isHolding?: boolean;
  holdUntilDays?: number;
  dashboardUrl?: string;
}

export interface AffiliatePayoutUpdatePayload {
  payoutId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  amountBDT: number;
  payoutMethod: string;
  payoutPhone?: string;
  status: "REQUESTED" | "APPROVED" | "COMPLETED" | "REJECTED";
  payoutTrxId?: string;
  adminNotes?: string;
  dashboardUrl?: string;
}

export interface AffiliateTierUpgradedPayload {
  userId: string;
  customerName: string;
  customerEmail: string;
  oldTier?: string;
  newTier: string;
  newRatePercent: number;
  dashboardUrl?: string;
}

export interface NotificationEventInput<T = any> {
  eventType: NotificationEventType;
  entityType?: "ORDER" | "WALLET" | "REFUND" | "REPLACEMENT" | "SUPPORT" | "INVENTORY" | "USER" | "AFFILIATE" | "PAYOUT";
  entityId?: string;
  userId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  dedupeKey: string;
  payload: T;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
}
