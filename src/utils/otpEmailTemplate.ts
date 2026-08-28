/**
 * AI Haat OTP Email Template Generator
 * Re-exports modern branded security OTP templates from @/lib/email-templates
 */

import { renderSecurityOtpEmail } from "@/lib/email-templates";

export function generateOtpEmailHtml(data: {
  otp: string;
  purpose: string;
  expiresInMinutes: number;
}): string {
  return renderSecurityOtpEmail({
    customerEmail: "",
    otp: data.otp,
    purpose: data.purpose,
    expiresInMinutes: data.expiresInMinutes,
  }).html;
}
