export type ProviderType = "HOSTINGER_SMTP" | "CUSTOM_SMTP" | "RESEND" | "BREVO" | "SES" | "SIMULATED";

export interface EmailMarketingSettings {
  senderName: string;
  fromEmail: string;
  replyToEmail: string;
  providerType: ProviderType;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
  apiKey?: string;
  batchSize: number;
  rateLimitDelayMs: number;
  maxRetries: number;
  testMode: boolean;
  trackingEnabled: boolean;
  openTracking: boolean;
  clickTracking: boolean;
  defaultTimezone: string;
}

export interface SegmentCondition {
  id: string;
  field:
    | "registration_date"
    | "email_verified"
    | "marketing_consent"
    | "order_count"
    | "total_spent"
    | "purchased_product"
    | "purchased_category"
    | "last_order_date"
    | "registered_days_ago"
    | "inactive_days";
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in" | "not_in";
  value: any;
}

export interface SegmentRuleGroup {
  logic: "AND" | "OR";
  conditions: SegmentCondition[];
}

export interface EmailTemplateSeed {
  name: string;
  description: string;
  category: string;
  subject: string;
  contentHtml: string;
  thumbnail?: string;
}

export interface CampaignRecipientSnapshot {
  email: string;
  name?: string;
  userId?: string;
  orderCount?: number;
  totalSpent?: number;
  lastOrderDate?: string;
}

export interface SendBatchResult {
  sent: number;
  failed: number;
  suppressed: number;
  errors: Array<{ email: string; error: string }>;
}