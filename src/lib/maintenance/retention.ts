import { prisma } from "@/lib/prisma";

export interface DataRetentionResult {
  expiredSessionsDeleted: number;
  expiredOtpDeleted: number;
  expiredRateLimitBucketsDeleted: number;
  oldAuditLogsDeleted: number;
  executedAt: string;
}

/**
 * AI Haat — Database Log & State Retention Cleanup Utility
 * Purges expired sessions, ephemeral challenges, rate limit buckets,
 * and archives/cleans audit logs older than the retention window (default: 90 days).
 */
export async function runDataRetentionCleanup(retentionDays = 90): Promise<DataRetentionResult> {
  const now = new Date();
  const retentionThreshold = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  let expiredSessionsDeleted = 0;
  let expiredOtpDeleted = 0;
  let expiredRateLimitBucketsDeleted = 0;
  let oldAuditLogsDeleted = 0;

  try {
    // 1. Delete expired NextAuth Sessions
    const sessions = await prisma.session.deleteMany({
      where: {
        expires: { lt: now },
      },
    });
    expiredSessionsDeleted = sessions.count;
  } catch (err) {
    console.warn("[Retention Cleanup] Session cleanup error:", err);
  }

  try {
    // 2. Delete expired OTP Challenges
    const otps = await prisma.otpChallenge.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
    expiredOtpDeleted = otps.count;
  } catch (err) {
    console.warn("[Retention Cleanup] OTP cleanup error:", err);
  }

  try {
    // 3. Delete expired RateLimitBuckets
    const buckets = await prisma.rateLimitBucket.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
    expiredRateLimitBucketsDeleted = buckets.count;
  } catch (err) {
    console.warn("[Retention Cleanup] Rate limit cleanup error:", err);
  }

  try {
    // 4. Clean Security Audit Logs older than retention window
    const logs = await prisma.securityAuditLog.deleteMany({
      where: {
        createdAt: { lt: retentionThreshold },
      },
    });
    oldAuditLogsDeleted = logs.count;
  } catch (err) {
    console.warn("[Retention Cleanup] Audit log cleanup error:", err);
  }

  return {
    expiredSessionsDeleted,
    expiredOtpDeleted,
    expiredRateLimitBucketsDeleted,
    oldAuditLogsDeleted,
    executedAt: now.toISOString(),
  };
}
