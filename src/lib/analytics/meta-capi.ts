// ─── AI Haat Analytics — Meta Conversions API (CAPI) Client ──────
// Server-side Meta event submission. Token is NEVER exposed to browser.
// Independent failure handling — never blocks order processing.

import { hashForCapi, normalizePhone } from "./sanitize";
import type { MetaCapiEvent, MetaCapiUserData } from "./types";

const META_API_VERSION = "v20.0";
const META_API_BASE = "https://graph.facebook.com";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Send an event to Meta Conversions API.
 * @param eventName - Meta standard event name (e.g., "Purchase", "ViewContent")
 * @param eventId - Stable dedup key (same as browser fbq eventID)
 * @param customData - Event-specific data (value, currency, content_ids, etc.)
 * @param userData - Optional user data for matching (email, phone, external_id)
 * @param eventSourceUrl - URL where the event occurred
 * @returns true if sent successfully, false otherwise
 */
export async function sendCapiEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, unknown>,
  userData?: {
    email?: string;
    phone?: string;
    externalId?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
  },
  eventSourceUrl?: string
): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Meta CAPI] Skipped — META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not configured");
    }
    return false;
  }

  // Build user_data with proper hashing
  const hashedUserData: MetaCapiUserData = {
    client_ip_address: userData?.clientIpAddress || undefined,
    client_user_agent: userData?.clientUserAgent || undefined,
    fbp: userData?.fbp || undefined,
    fbc: userData?.fbc || undefined,
  };

  if (userData?.email) {
    hashedUserData.em = hashForCapi(userData.email);
  }
  if (userData?.phone) {
    const normalized = normalizePhone(userData.phone);
    if (normalized) hashedUserData.ph = hashForCapi(normalized);
  }
  if (userData?.externalId) {
    hashedUserData.external_id = hashForCapi(userData.externalId);
  }

  const event: MetaCapiEvent = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl || "https://aihaat.shop",
    action_source: "website",
    user_data: hashedUserData,
    custom_data: customData,
  };

  const url = `${META_API_BASE}/${META_API_VERSION}/${pixelId}/events`;
  const body = JSON.stringify({
    data: [event],
    access_token: accessToken,
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  });

  // Attempt with retries
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        console.log(`[Meta CAPI] ✅ ${eventName} sent successfully (event_id: ${eventId})`);
        return true;
      }

      const errorBody = await res.text().catch(() => "");
      console.warn(
        `[Meta CAPI] ⚠️ ${eventName} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${res.status} ${errorBody.slice(0, 200)}`
      );
    } catch (err) {
      console.warn(
        `[Meta CAPI] ⚠️ ${eventName} error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
        err instanceof Error ? err.message : err
      );
    }

    // Wait before retry (exponential backoff)
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
    }
  }

  console.error(`[Meta CAPI] ❌ ${eventName} failed after ${MAX_RETRIES + 1} attempts (event_id: ${eventId})`);
  return false;
}

/**
 * Build Meta CAPI Purchase custom_data from order data.
 */
export function buildCapiPurchaseData(order: {
  orderNumber: string;
  totalBDT: number;
  items: Array<{
    productId?: string | null;
    variationId?: string | null;
    productName: string;
    priceBDT: number;
    quantity: number;
  }>;
}): Record<string, unknown> {
  return {
    value: order.totalBDT,
    currency: "BDT",
    content_ids: order.items.map((item) =>
      item.variationId
        ? `${item.productId}:${item.variationId}`
        : String(item.productId || "unknown")
    ),
    contents: order.items.map((item) => ({
      id: item.variationId
        ? `${item.productId}:${item.variationId}`
        : String(item.productId || "unknown"),
      quantity: item.quantity,
      item_price: item.priceBDT,
    })),
    content_type: "product",
    num_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
    order_id: order.orderNumber,
  };
}
