// ─── AI Haat Analytics — Data Sanitization ───────────────────────
// Centralized sanitizer: whitelist-only field extraction, URL cleaning, PII prevention.
// NEVER forward arbitrary component props or request bodies to analytics.

import { createHash } from "crypto";
import type { AnalyticsItem } from "./types";

// ─── Sensitive URL Parameters to Strip ───────────────────────────
const SENSITIVE_PARAMS = new Set([
  "token",
  "otp",
  "code",
  "verification",
  "secret",
  "key",
  "password",
  "trxId",
  "pp_id",
  "transaction_ref",
  "session",
  "auth",
  "mfa",
  "reset",
]);

// ─── Credential-Like Patterns ────────────────────────────────────
const CREDENTIAL_PATTERNS = [
  /password/i,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/i, // email in search
  /\b\d{11}\b/, // phone number
  /sk[-_]live/i, // API keys
  /Bearer\s+/i,
  /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/, // JWT
];

/**
 * Sanitize a product/variation into an analytics-safe AnalyticsItem.
 * Only whitelisted fields are extracted.
 */
export function sanitizeItem(raw: {
  id?: string;
  productId?: string;
  name?: string;
  productName?: string;
  category?: string;
  variant?: string;
  variationName?: string;
  price?: number;
  priceBDT?: number;
  quantity?: number;
  coupon?: string;
  index?: number;
  listId?: string;
  listName?: string;
}): AnalyticsItem {
  return {
    item_id: String(raw.id || raw.productId || "unknown"),
    item_name: truncate(String(raw.name || raw.productName || "Unknown Product"), 150),
    item_category: raw.category ? truncate(String(raw.category), 100) : undefined,
    item_variant: raw.variant || raw.variationName
      ? truncate(String(raw.variant || raw.variationName), 100)
      : undefined,
    price: Number(raw.price || raw.priceBDT || 0),
    quantity: Math.max(1, Number(raw.quantity || 1)),
    coupon: raw.coupon ? truncate(String(raw.coupon), 50) : undefined,
    index: raw.index != null ? Number(raw.index) : undefined,
    item_list_id: raw.listId ? truncate(String(raw.listId), 100) : undefined,
    item_list_name: raw.listName ? truncate(String(raw.listName), 100) : undefined,
  };
}

/**
 * Sanitize a URL by stripping sensitive query parameters.
 * Prevents OTP, payment tokens, verification codes from leaking into analytics.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url, "https://aihaat.shop");
    const cleanParams = new URLSearchParams();

    parsed.searchParams.forEach((value, key) => {
      const keyLower = key.toLowerCase();
      if (!SENSITIVE_PARAMS.has(keyLower) && !keyLower.includes("token") && !keyLower.includes("secret")) {
        cleanParams.set(key, value);
      }
    });

    const paramStr = cleanParams.toString();
    return `${parsed.pathname}${paramStr ? "?" + paramStr : ""}`;
  } catch {
    // If URL parsing fails, return path-only fallback
    return url.split("?")[0] || "/";
  }
}

/**
 * Sanitize a search query for analytics.
 * Truncates to 100 chars, filters out credential-like patterns.
 */
export function sanitizeSearchTerm(term: string): string {
  if (!term || typeof term !== "string") return "";

  const cleaned = term.trim().slice(0, 100);

  // Check for credential-like patterns — redact entirely
  for (const pattern of CREDENTIAL_PATTERNS) {
    if (pattern.test(cleaned)) {
      return "[redacted]";
    }
  }

  return cleaned;
}

/**
 * SHA-256 hash for Meta CAPI user data fields.
 * Normalizes: lowercase, trim, then SHA-256 hex.
 */
export function hashForCapi(value: string): string {
  if (!value || typeof value !== "string") return "";
  const normalized = value.toLowerCase().trim();
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Normalize a Bangladeshi phone number for Meta CAPI hashing.
 * Strips +88 prefix, ensures 01XXXXXXXXX format, then prepends country code 880.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[\s\-()]/g, "");
  cleaned = cleaned.replace(/^\+?88/, "");
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return `880${cleaned}`;
  }
  return cleaned;
}

/** Truncate a string safely */
function truncate(str: string, maxLen: number): string {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

/**
 * Validate that a payload contains no sensitive fields.
 * Used as a development-time safety check.
 */
export function assertNoSensitiveData(data: Record<string, unknown>, context: string): void {
  if (process.env.NODE_ENV !== "development") return;

  const FORBIDDEN_KEYS = [
    "password", "otp", "totp", "mfa", "secret", "token",
    "credential", "license", "recovery", "apiKey", "api_key",
    "encryption", "walletBalance",
  ];

  const jsonStr = JSON.stringify(data).toLowerCase();
  for (const key of FORBIDDEN_KEYS) {
    if (jsonStr.includes(`"${key}"`)) {
      console.error(`[Analytics SECURITY] Forbidden key "${key}" detected in ${context} payload. This data must NOT be sent to analytics.`);
    }
  }
}
