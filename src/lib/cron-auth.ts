import crypto from "crypto";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Timing-safe string comparison preventing side-channel timing attacks
 */
export function safeEqualSecret(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!provided || !expected) return false;
  
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  
  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Validates CRON request authorization via Authorization: Bearer <CRON_SECRET>.
 * Strictly fails closed if CRON_SECRET is not configured or if token is invalid.
 * Query parameter tokens (?token=, ?key=) and session fallbacks are strictly rejected
 * to prevent secret leakage in logs, reverse proxies, and URL histories.
 */
export function isCronAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return false;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return false;
  }

  return safeEqualSecret(token, cronSecret);
}
