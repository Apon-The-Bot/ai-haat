/**
 * Compatibility bridge for @/utils/email
 * Directs all email dispatching to @/lib/email-service
 */

import {
  sendOrderDeliveryEmail as dispatchDeliveryEmail,
  sendSecurityOtpEmail as dispatchOtpEmail,
  sendWelcomeEmail as dispatchWelcomeEmail,
  sendWalletTopupEmail as dispatchWalletTopupEmail,
  sendReplacementStatusEmail as dispatchReplacementStatusEmail,
  getEmailTransporter,
  isSmtpConfigured,
  type OrderDeliveryEmailParams,
  type WalletTopupEmailParams,
  type ReplacementUpdateEmailParams,
  type SecurityOtpEmailParams,
} from "@/lib/email-service";
import { generateDeliveryHtml } from "@/lib/email-templates";

export {
  getEmailTransporter as getTransporter,
  isSmtpConfigured,
  generateDeliveryHtml,
  dispatchDeliveryEmail,
  dispatchOtpEmail,
  dispatchWelcomeEmail,
  dispatchWalletTopupEmail,
  dispatchReplacementStatusEmail,
};

/**
 * Send Welcome Email to newly registered user
 */
export async function sendWelcomeEmail(user: { name: string; email: string }): Promise<boolean> {
  const result = await dispatchWelcomeEmail(user);
  return result.success;
}

/**
 * Send Delivery HTML Email via Hostinger SMTP / Resilient Fallback
 */
export async function sendOrderDeliveryEmail(data: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  productName: string;
  variationName?: string;
  credentials: string;
  downloadUrl?: string | null;
  instructions?: string | null;
  subject?: string;
  items?: Array<{
    productName: string;
    variationName?: string;
    quantity?: number;
    priceBDT?: number;
  }>;
  totalAmountBDT?: number;
}) {
  return dispatchDeliveryEmail(data);
}

/**
 * Send OTP Email for MFA/Security Actions
 */
export async function sendOtpEmail(to: string, otp: string, purpose: string): Promise<boolean> {
  const result = await dispatchOtpEmail({
    customerEmail: to,
    otp,
    purpose,
    expiresInMinutes: 10,
  });
  return result.success;
}
