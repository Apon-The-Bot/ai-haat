// ─── AI Haat Analytics — UTM Attribution Capture & Persistence ───
// First-touch + last-touch attribution via cookies.
// Captures UTM params, fbclid, gclid, referrer on page load.
"use client";

import type { AttributionData } from "./types";

const FIRST_TOUCH_KEY = "aihaat_first_touch";
const LAST_TOUCH_KEY = "aihaat_last_touch";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
const MAX_FIELD_LEN = 200;
const MAX_URL_LEN = 500;

// UTM and ad platform parameters to capture
const ATTRIBUTION_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

interface AttributionTouch {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  gclid?: string;
  landingPage?: string;
  referrer?: string;
  timestamp?: number;
}

/**
 * Capture attribution from current URL and referrer.
 * Call this once on initial page load (in AnalyticsProvider).
 *
 * First-Touch: Set once, never overwritten.
 * Last-Touch: Updated on each visit that has non-empty marketing params.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);
    const touch: AttributionTouch = {};
    let hasMarketingParams = false;

    // Extract UTM and ad params
    if (params.get("utm_source")) {
      touch.utmSource = truncate(params.get("utm_source")!, MAX_FIELD_LEN);
      hasMarketingParams = true;
    }
    if (params.get("utm_medium")) {
      touch.utmMedium = truncate(params.get("utm_medium")!, MAX_FIELD_LEN);
      hasMarketingParams = true;
    }
    if (params.get("utm_campaign")) {
      touch.utmCampaign = truncate(params.get("utm_campaign")!, MAX_FIELD_LEN);
      hasMarketingParams = true;
    }
    if (params.get("utm_content")) {
      touch.utmContent = truncate(params.get("utm_content")!, MAX_FIELD_LEN);
      hasMarketingParams = true;
    }
    if (params.get("utm_term")) {
      touch.utmTerm = truncate(params.get("utm_term")!, MAX_FIELD_LEN);
      hasMarketingParams = true;
    }
    if (params.get("fbclid")) {
      touch.fbclid = truncate(params.get("fbclid")!, MAX_FIELD_LEN);
      hasMarketingParams = true;
    }
    if (params.get("gclid")) {
      touch.gclid = truncate(params.get("gclid")!, MAX_FIELD_LEN);
      hasMarketingParams = true;
    }

    // Capture landing page and referrer
    touch.landingPage = truncate(window.location.pathname, MAX_URL_LEN);
    touch.referrer = document.referrer
      ? truncate(document.referrer, MAX_URL_LEN)
      : undefined;
    touch.timestamp = Date.now();

    // Check for external referrer as marketing signal
    if (!hasMarketingParams && document.referrer) {
      try {
        const refHost = new URL(document.referrer).hostname;
        if (refHost && !refHost.includes("aihaat.shop") && !refHost.includes("localhost")) {
          hasMarketingParams = true; // External referrer counts as marketing touch
        }
      } catch { /* ignore invalid referrer */ }
    }

    // First Touch — set once, never overwrite
    if (!getCookie(FIRST_TOUCH_KEY) && hasMarketingParams) {
      setCookie(FIRST_TOUCH_KEY, JSON.stringify(touch), COOKIE_MAX_AGE);
    }

    // Last Touch — update only when there are marketing params (do not overwrite with direct/empty)
    if (hasMarketingParams) {
      setCookie(LAST_TOUCH_KEY, JSON.stringify(touch), COOKIE_MAX_AGE);
    }

    // Store fbc cookie from fbclid if present
    if (touch.fbclid) {
      const fbc = deriveFbc(touch.fbclid);
      if (fbc) {
        setCookie("_fbc", fbc, COOKIE_MAX_AGE);
      }
    }
  } catch (e) {
    // Attribution capture should never break the site
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics Attribution] Capture error:", e);
    }
  }
}

/**
 * Get current attribution data for order creation.
 * Returns merged first-touch and last-touch data.
 * Order API should receive the last-touch values for attribution.
 */
export function getAttribution(): AttributionData {
  if (typeof window === "undefined") return {};

  try {
    const lastTouchStr = getCookie(LAST_TOUCH_KEY);
    const firstTouchStr = getCookie(FIRST_TOUCH_KEY);

    const lastTouch: AttributionTouch = lastTouchStr ? JSON.parse(lastTouchStr) : {};
    const firstTouch: AttributionTouch = firstTouchStr ? JSON.parse(firstTouchStr) : {};

    // Use last-touch for attribution (more recent campaign), fallback to first-touch
    const source = lastTouch.utmSource || firstTouch.utmSource;

    return {
      utmSource: lastTouch.utmSource || firstTouch.utmSource,
      utmMedium: lastTouch.utmMedium || firstTouch.utmMedium,
      utmCampaign: lastTouch.utmCampaign || firstTouch.utmCampaign,
      utmContent: lastTouch.utmContent || firstTouch.utmContent,
      utmTerm: lastTouch.utmTerm || firstTouch.utmTerm,
      landingPage: firstTouch.landingPage || lastTouch.landingPage,
      referrer: firstTouch.referrer || lastTouch.referrer,
    };
  } catch {
    return {};
  }
}

/**
 * Get Meta _fbp cookie value if available.
 */
export function getFbp(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return getCookie("_fbp") || undefined;
}

/**
 * Get Meta _fbc cookie value if available.
 */
export function getFbc(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return getCookie("_fbc") || undefined;
}

/**
 * Derive Meta fbc parameter from fbclid.
 * Format: fb.1.{timestamp}.{fbclid}
 */
export function deriveFbc(fbclid: string): string | null {
  if (!fbclid || typeof fbclid !== "string") return null;
  return `fb.1.${Date.now()}.${fbclid}`;
}

// ─── Cookie Helpers ──────────────────────────────────────────────

function setCookie(name: string, value: string, maxAge: number): void {
  // Bound cookie size to prevent bloat
  const bounded = value.length > 500 ? value.slice(0, 500) : value;
  document.cookie = `${name}=${encodeURIComponent(bounded)};path=/;max-age=${maxAge};SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}
