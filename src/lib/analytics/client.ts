// ─── AI Haat Analytics — Central Client Analytics Service ─────────
// All components call these methods instead of raw gtag()/fbq().
// Fails silently if providers are not loaded. Debug logging in development.
"use client";

import type {
  AnalyticsItem,
  PurchaseEventData,
  SearchEventData,
} from "./types";
import { sanitizeUrl, sanitizeSearchTerm, assertNoSensitiveData } from "./sanitize";

// ─── Type Declarations for Global Analytics ──────────────────────
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// ─── Provider Checks ─────────────────────────────────────────────

function isGa4Ready(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

function isMetaReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Safe gtag call — never throws */
function safeGtag(...args: unknown[]): void {
  try {
    if (isGa4Ready()) window.gtag!(...args);
  } catch (e) {
    if (isDev()) console.warn("[Analytics GA4]", e);
  }
}

/** Safe fbq call — never throws */
function safeFbq(...args: unknown[]): void {
  try {
    if (isMetaReady()) window.fbq!(...args);
  } catch (e) {
    if (isDev()) console.warn("[Analytics Meta]", e);
  }
}

/** Debug log in development */
function debugLog(event: string, data?: unknown): void {
  if (isDev()) {
    console.log(`[Analytics] 📊 ${event}`, data || "");
  }
}

// ─── Page View ───────────────────────────────────────────────────

/**
 * Track page view for SPA navigation.
 * Called by PageViewTracker on route changes.
 */
export function trackPageView(url: string, title?: string): void {
  const cleanUrl = sanitizeUrl(url);
  debugLog("page_view", { url: cleanUrl, title });

  safeGtag("event", "page_view", {
    page_path: cleanUrl,
    page_title: title || document.title,
  });

  // Meta Pixel tracks PageView automatically on init, but for SPA we re-trigger
  safeFbq("track", "PageView");
}

// ─── E-Commerce: Product View ────────────────────────────────────

export function trackViewItem(item: AnalyticsItem, value: number): void {
  debugLog("view_item", { item, value });

  safeGtag("event", "view_item", {
    currency: "BDT",
    value,
    items: [item],
  });

  safeFbq("track", "ViewContent", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_category: item.item_category,
    content_type: "product",
    value,
    currency: "BDT",
  });
}

// ─── E-Commerce: Product List ────────────────────────────────────

export function trackViewItemList(
  listId: string,
  listName: string,
  items: AnalyticsItem[]
): void {
  if (items.length === 0) return;
  debugLog("view_item_list", { listId, listName, itemCount: items.length });

  safeGtag("event", "view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items: items.slice(0, 20), // Cap at 20 to avoid payload bloat
  });
}

// ─── E-Commerce: Select Item ─────────────────────────────────────

export function trackSelectItem(
  listId: string,
  listName: string,
  item: AnalyticsItem
): void {
  debugLog("select_item", { listId, item });

  safeGtag("event", "select_item", {
    item_list_id: listId,
    item_list_name: listName,
    items: [item],
  });
}

// ─── E-Commerce: Add to Cart ─────────────────────────────────────

export function trackAddToCart(item: AnalyticsItem, value: number): void {
  debugLog("add_to_cart", { item, value });

  safeGtag("event", "add_to_cart", {
    currency: "BDT",
    value,
    items: [item],
  });

  safeFbq("track", "AddToCart", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    value,
    currency: "BDT",
  });
}

// ─── E-Commerce: Remove from Cart ────────────────────────────────

export function trackRemoveFromCart(item: AnalyticsItem, value: number): void {
  debugLog("remove_from_cart", { item, value });

  safeGtag("event", "remove_from_cart", {
    currency: "BDT",
    value,
    items: [item],
  });
}

// ─── E-Commerce: View Cart ───────────────────────────────────────

export function trackViewCart(items: AnalyticsItem[], value: number): void {
  if (items.length === 0) return;
  debugLog("view_cart", { itemCount: items.length, value });

  safeGtag("event", "view_cart", {
    currency: "BDT",
    value,
    items,
  });
}

// ─── E-Commerce: Begin Checkout ──────────────────────────────────

export function trackBeginCheckout(
  items: AnalyticsItem[],
  value: number,
  coupon?: string
): void {
  debugLog("begin_checkout", { itemCount: items.length, value, coupon });

  safeGtag("event", "begin_checkout", {
    currency: "BDT",
    value,
    items,
    coupon: coupon || undefined,
  });

  safeFbq("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.item_id),
    contents: items.map((i) => ({
      id: i.item_id,
      quantity: i.quantity,
    })),
    content_type: "product",
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency: "BDT",
  });
}

// ─── E-Commerce: Add Payment Info ────────────────────────────────

export function trackAddPaymentInfo(
  paymentType: string,
  items: AnalyticsItem[],
  value: number
): void {
  debugLog("add_payment_info", { paymentType, value });

  safeGtag("event", "add_payment_info", {
    currency: "BDT",
    value,
    payment_type: paymentType,
    items,
  });

  safeFbq("track", "AddPaymentInfo", {
    content_category: paymentType,
    value,
    currency: "BDT",
  });
}

// ─── E-Commerce: Purchase (Client-Side) ──────────────────────────

/**
 * Fire client-side Purchase event with server-verified data.
 * Called by PurchaseTracker ONLY after verifying paymentStatus === "VERIFIED".
 * Uses stable event_id for Meta browser/CAPI deduplication.
 */
export function trackPurchase(data: PurchaseEventData): void {
  if (isDev()) {
    assertNoSensitiveData(data as unknown as Record<string, unknown>, "Purchase");
  }
  debugLog("purchase", {
    transaction_id: data.transaction_id,
    value: data.value,
    items: data.items.length,
    event_id: data.event_id,
  });

  safeGtag("event", "purchase", {
    transaction_id: data.transaction_id,
    value: data.value,
    currency: data.currency,
    items: data.items,
    coupon: data.coupon || undefined,
    shipping: data.shipping,
    tax: data.tax,
  });

  safeFbq("track", "Purchase", {
    content_ids: data.items.map((i) => i.item_id),
    contents: data.items.map((i) => ({
      id: i.item_id,
      quantity: i.quantity,
      item_price: i.price,
    })),
    content_type: "product",
    value: data.value,
    currency: data.currency,
    num_items: data.items.reduce((sum, i) => sum + i.quantity, 0),
  }, { eventID: data.event_id });
}

// ─── Search ──────────────────────────────────────────────────────

export function trackSearch(term: string): void {
  const sanitized = sanitizeSearchTerm(term);
  if (!sanitized || sanitized === "[redacted]") return;
  debugLog("search", { search_term: sanitized });

  safeGtag("event", "search", {
    search_term: sanitized,
  });

  safeFbq("track", "Search", {
    search_string: sanitized,
  });
}

// ─── Custom Events ───────────────────────────────────────────────

/**
 * Fire a custom analytics event (GA4 only).
 * Used for business-specific events like wallet_topup, product_request, etc.
 */
export function trackCustomEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  debugLog(eventName, params);
  safeGtag("event", eventName, params || {});
}
