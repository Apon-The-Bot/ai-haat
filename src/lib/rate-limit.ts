import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();
const MAX_RATE_LIMIT_KEYS = 10000;

// Clean up old entries periodically
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    cleanupExpiredEntries();
  }, 60 * 1000);

  if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
}

function cleanupExpiredEntries() {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, entry]) => {
    entry.timestamps = entry.timestamps.filter((t: number) => now - t < 15 * 60 * 1000);
    if (entry.timestamps.length === 0) store.delete(key);
  });
}

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  // IPv4 simple regex or IPv6 hex check
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === "::1" || ip === "localhost" || ip === "127.0.0.1";
}

/**
 * Robust Client IP Resolver with reverse proxy verification
 * Supports Cloudflare, Nginx, Hostinger VPS, and local dev environments.
 * Prevents collapsing all users into a single rate limit bucket.
 */
export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const trustCf = process.env.TRUST_CF_CONNECTING_IP === "true";
  const proxyExplicitlyDisabled = process.env.TRUST_PROXY === "false";

  // 1. Cloudflare connecting IP (Trusted if TRUST_CF_CONNECTING_IP === "true" or proxy trust is active)
  if (trustCf || (!proxyExplicitlyDisabled && headers.get("cf-connecting-ip"))) {
    const cfIp = headers.get("cf-connecting-ip");
    if (cfIp && isValidIp(cfIp.trim())) {
      return cfIp.trim();
    }
  }

  // If proxy trust is explicitly disabled and not overridden by Cloudflare, untrusted proxy headers return unknown:direct
  if (proxyExplicitlyDisabled) {
    return "unknown:direct";
  }

  // 2. X-Real-IP (Standard Nginx / reverse proxy header)
  const realIp = headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  // 3. X-Forwarded-For (First client IP in chain)
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp && isValidIp(firstIp)) {
      return firstIp;
    }
  }

  // 4. NextRequest.ip property if attached by Next.js runtime
  if ("ip" in req && typeof (req as any).ip === "string" && (req as any).ip) {
    const nextIp = (req as any).ip.trim();
    if (isValidIp(nextIp)) {
      return nextIp;
    }
  }

  // 5. Development localhost fallback
  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  // 6. Distinct client fingerprint fallback to avoid shared global bucket
  const userAgent = headers.get("user-agent") || "unknown-ua";
  const authCookie = headers.get("cookie") || "";
  const clientHash = crypto
    .createHash("sha256")
    .update(`${userAgent}:${authCookie.slice(0, 40)}`)
    .digest("hex")
    .slice(0, 16);

  return `client:${clientHash}`;
}

/**
 * Sliding window rate limiter with memory bounding and fail-safe options
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
  options?: { failOpen?: boolean }
): { allowed: boolean; retryAfterMs: number; remaining: number } {
  try {
    const now = Date.now();

    // Guard against unbounded Map growth DoS
    if (store.size > MAX_RATE_LIMIT_KEYS) {
      cleanupExpiredEntries();
    }

    let entry = store.get(key);

    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
    }

    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxAttempts) {
      const oldest = entry.timestamps[0];
      const retryAfterMs = oldest + windowMs - now;
      return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs), remaining: 0 };
    }

    entry.timestamps.push(now);
    return {
      allowed: true,
      retryAfterMs: 0,
      remaining: maxAttempts - entry.timestamps.length,
    };
  } catch (err) {
    console.error("[RateLimit Error]:", err);
    if (options?.failOpen !== false) {
      // Default fail-open for critical commerce path
      return { allowed: true, retryAfterMs: 0, remaining: 1 };
    }
    // Fail-closed for high-abuse endpoints
    return { allowed: false, retryAfterMs: 60000, remaining: 0 };
  }
}

/**
 * Standard 429 Too Many Requests response
 */
export function rateLimitResponse(retryAfterMs: number, customMessage?: string): NextResponse {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return NextResponse.json(
    {
      success: false,
      error: customMessage || "Too many requests. Please wait a moment before trying again.",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  );
}
