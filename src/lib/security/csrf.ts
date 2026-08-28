import { NextRequest } from "next/server";

/**
 * Validates whether an incoming mutation request originates from a trusted same-origin source
 * Defends cookie-authenticated browser mutations against Cross-Site Request Forgery (CSRF)
 */
export function isSameOriginMutation(req: Request | NextRequest): boolean {
  const method = req.method.toUpperCase();
  // Safe read-only methods are exempt
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const cookie = req.headers.get("cookie");

  // Determine configured trusted origins
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://aihaat.shop";
  const trustedOrigins = new Set<string>([
    "https://aihaat.shop",
    "http://aihaat.shop",
    "https://www.aihaat.shop",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ]);

  try {
    const parsedSite = new URL(siteUrl).origin;
    trustedOrigins.add(parsedSite);
  } catch {}

  // 1. Primary check: Origin Header
  if (origin) {
    try {
      const parsedOrigin = new URL(origin).origin;
      return trustedOrigins.has(parsedOrigin);
    } catch {
      return false; // Malformed origin header -> block
    }
  }

  // 2. Fallback check: Referer Header (if Origin was omitted by older browsers)
  if (referer) {
    try {
      const parsedRefererOrigin = new URL(referer).origin;
      return trustedOrigins.has(parsedRefererOrigin);
    } catch {
      return false; // Malformed referer header -> block
    }
  }

  // 3. Explicit Sec-Fetch-Site check
  const secFetchSite = req.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return false;
  }

  // 4. Strict Browser Fail-Closed Invariant:
  // If the mutation carries browser cookies but lacks both Origin and Referer, fail closed
  if (cookie && cookie.includes("next-auth")) {
    return false;
  }

  // Allow non-cookie programmatic API calls (e.g. unit tests / curl)
  return true;
}
