import { prisma } from "@/lib/prisma";

export type PaymentEventType =
  | "PAYMENT_INITIATED"
  | "PAYMENT_VERIFICATION_REQUESTED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_FAILED"
  | "PAYMENT_AMOUNT_MISMATCH"
  | "PAYMENT_TRX_REUSE_BLOCKED"
  | "PAYMENT_ALREADY_VERIFIED"
  | "DUPLICATE_EVENT_IGNORED"
  | "WALLET_CREDITED"
  | "WALLET_DEBITED"
  | "WALLET_CREDIT_DUPLICATE_BLOCKED"
  | "WEBHOOK_RECEIVED"
  | "CALLBACK_RECEIVED";

interface PaymentEventParams {
  orderId?: string;
  event: PaymentEventType;
  actor?: string; // "GATEWAY_CALLBACK", "GATEWAY_WEBHOOK", "CUSTOMER", "SYSTEM"
  details?: Record<string, any>;
}

export async function logPaymentEvent(params: PaymentEventParams): Promise<void> {
  try {
    if (params.orderId) {
      await prisma.orderTimelineEvent.create({
        data: {
          orderId: params.orderId,
          status: params.event,
          actor: params.actor || "SYSTEM",
          note: params.details ? JSON.stringify(sanitizePaymentDetails(params.details)) : null,
        },
      });
    }
    // Also log to console with structured prefix for observability
    console.log(`[PaymentAudit] ${params.event}`, {
      orderId: params.orderId,
      actor: params.actor,
      // Never log secrets
      ...(params.details ? sanitizePaymentDetails(params.details) : {}),
    });
  } catch (err) {
    // Audit logging must never break payment flow
    console.error("[PaymentAudit Error - Non-fatal]:", err);
  }
}

const SENSITIVE_KEYS = ["apiKey", "secret", "token", "password", "key", "authorization"];

function sanitizePaymentDetails(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      sanitized[key] = sanitizePaymentDetails(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}
