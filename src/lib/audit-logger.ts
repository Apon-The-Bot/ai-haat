import { prisma } from "@/lib/prisma";

export type AdminAuditAction =
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DELETE"
  | "PRODUCT_DUPLICATE"
  | "PRODUCT_ARCHIVE"
  | "CATEGORY_CREATE"
  | "CATEGORY_UPDATE"
  | "CATEGORY_DELETE"
  | "COUPON_CREATE"
  | "COUPON_UPDATE"
  | "COUPON_DELETE"
  | "COUPON_DUPLICATE"
  | "ORDER_STATUS_UPDATE"
  | "ORDER_CANCEL"
  | "ORDER_REOPEN"
  | "ORDER_DELIVERY_DISPATCH"
  | "ORDER_NOTE_ADD"
  | "WALLET_DEPOSIT_APPROVE"
  | "WALLET_DEPOSIT_REJECT"
  | "WALLET_MANUAL_ADJUSTMENT"
  | "ROLE_PROMOTED"
  | "ROLE_DEMOTED"
  | "USER_STATUS_UPDATE"
  | "STOCK_ITEM_CREATE"
  | "STOCK_BULK_IMPORT"
  | "STOCK_ITEM_INVALIDATE"
  | "STOCK_CREDENTIAL_REVEAL"
  | "REPLACEMENT_APPROVE"
  | "REPLACEMENT_REJECT"
  | "SETTINGS_GENERAL_UPDATE"
  | "SETTINGS_TELEGRAM_UPDATE"
  | "SETTINGS_GATEWAYS_UPDATE"
  | "BLOG_CREATE"
  | "BLOG_UPDATE"
  | "BLOG_DELETE"
  | "PROOF_CREATE"
  | "PROOF_DELETE"
  | "CAMPAIGN_CREATE"
  | "CAMPAIGN_UPDATE"
  | "CAMPAIGN_DELETE"
  | "CAMPAIGN_SEND"
  | "CAMPAIGN_SCHEDULE"
  | "CAMPAIGN_CANCEL"
  | "CAMPAIGN_TEST_SEND"
  | "TEMPLATE_CREATE"
  | "TEMPLATE_UPDATE"
  | "TEMPLATE_DELETE"
  | "TEMPLATE_DUPLICATE"
  | "SEGMENT_CREATE"
  | "SEGMENT_UPDATE"
  | "SEGMENT_DELETE"
  | "CONTACT_CREATE"
  | "CONTACT_IMPORT"
  | "CONTACT_STATUS_UPDATE"
  | "SUPPRESSION_CREATE"
  | "SUPPRESSION_DELETE"
  | "SETTINGS_EMAIL_MARKETING_UPDATE";

export type AuditTargetType =
  | "ORDER"
  | "PRODUCT"
  | "CATEGORY"
  | "USER"
  | "WALLET"
  | "COUPON"
  | "INVENTORY"
  | "REPLACEMENT"
  | "SETTINGS"
  | "BLOG"
  | "PROOF"
  | "EMAIL_CAMPAIGN"
  | "EMAIL_TEMPLATE"
  | "EMAIL_SEGMENT"
  | "EMAIL_CONTACT"
  | "EMAIL_SUPPRESSION";

interface LogAuditParams {
  actorId?: string | null;
  actorEmail?: string | null;
  action: AdminAuditAction | string;
  targetType: AuditTargetType | string;
  targetId?: string | null;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
}

const SENSITIVE_KEYS = [
  "password",
  "secret",
  "totp",
  "otp",
  "token",
  "credentials",
  "payload",
  "key",
  "private",
  "hash",
  "apiKey",
  "botToken",
];

function sanitizeMetadata(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeMetadata);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()));
    if (isSensitive && typeof val === "string") {
      sanitized[key] = "[REDACTED_SECRET]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizeMetadata(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export async function logAdminAudit(params: LogAuditParams): Promise<void> {
  try {
    let sanitizedDetails: string | null = null;
    if (params.details) {
      if (typeof params.details === "string") {
        sanitizedDetails = params.details;
      } else {
        sanitizedDetails = JSON.stringify(sanitizeMetadata(params.details));
      }
    }

    await prisma.adminAuditLog.create({
      data: {
        actorId: params.actorId || null,
        actorEmail: params.actorEmail || null,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId || null,
        details: sanitizedDetails,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("[AdminAuditLogger Error - Non-fatal]:", error);
  }
}
