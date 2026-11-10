import crypto from "crypto";

/**
 * Generates an HMAC-based token for guest order invoice downloads
 */
export function generateInvoiceToken(orderId: string, email: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Invoice signing is not configured");
  return crypto.createHmac("sha256", secret).update(`${orderId}:${email.toLowerCase().trim()}`).digest("hex");
}

export function safeTokenCompare(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
