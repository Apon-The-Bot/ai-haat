import { Prisma, type AnalyticsEvent } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashForCapi, normalizePhone } from "./sanitize";
import { metaClickCookie, metaUserAgent } from "./meta-consent";
import { getMetaSettings, metaActive } from "./meta-settings";
import { sendCapiEvent } from "./meta-capi";
import { buildCapiPurchaseData, META_EVENT_AGE_MS, META_PROVIDER, purchaseEligible } from "./meta-purchase";
import type { MetaCapiUserData } from "./types";

const MAX_ATTEMPTS = 4;
const nowEligible = (now: Date) => ({ OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }] });

async function processEvent(row: AnalyticsEvent) {
  const settings = await getMetaSettings();
  if (!metaActive(settings, "capi", "Purchase") || !settings.tokenCiphertext) return "paused";
  const now = new Date();
  const lease = new Date(now.getTime() + 60_000);
  const claimed = await prisma.analyticsEvent.updateMany({
    where: { id: row.id, attempts: row.attempts, status: "PENDING", ...nowEligible(now) },
    data: { nextAttemptAt: lease },
  });
  if (!claimed.count) return "skipped";
  const finish = (status: string, reason: string, attempted = false, nextAttemptAt: Date | null = null) =>
    prisma.analyticsEvent.updateMany({
      where: { id: row.id, nextAttemptAt: lease, status: "PENDING" },
      data: {
        status, nextAttemptAt, attempts: { increment: attempted ? 1 : 0 },
        sentAt: status === "SENT" ? new Date() : null,
        lastError: status === "SENT" ? null : reason,
      },
    });
  const snapshot = JSON.parse(row.payload);
  if (snapshot.pixelId !== settings.pixelId) {
    await finish("SUPPRESSED", "dataset_changed");
    return "suppressed";
  }
  const order = row.orderId && await prisma.order.findUnique({
    where: { orderNumber: row.orderId }, include: { items: true },
  });
  if (!order || !purchaseEligible(order)) {
    await finish("SUPPRESSED", "consent_or_order_ineligible");
    return "suppressed";
  }
  const consent = order.metaConsentId && await prisma.advertisingConsent.findUnique({ where: { id: order.metaConsentId } });
  if (!consent || consent.expiresAt <= now) {
    await finish("SUPPRESSED", "consent_expired_or_withdrawn");
    return "suppressed";
  }
  const attribution = order.metaAttribution as { fbp?: string; fbc?: string; userAgent?: string } | null;
  const userData: MetaCapiUserData = {};
  const fbp = metaClickCookie(attribution?.fbp);
  const fbc = metaClickCookie(attribution?.fbc);
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (settings.advanced && snapshot.advanced === true) {
    if (order.customerEmail) userData.em = [hashForCapi(order.customerEmail)];
    const phone = normalizePhone(order.customerPhone);
    if (/^\d{8,15}$/.test(phone)) userData.ph = [hashForCapi(phone)];
    if (order.userId) userData.external_id = [hashForCapi(order.userId)];
  }
  if (!Object.keys(userData).length) {
    await finish("SUPPRESSED", "no_permitted_matching_data");
    return "suppressed";
  }
  const userAgent = metaUserAgent(attribution?.userAgent);
  if (userAgent) userData.client_user_agent = userAgent;
  const result = await sendCapiEvent(settings, {
    event_name: "Purchase", event_time: Math.floor(row.createdAt.getTime() / 1000), event_id: row.eventId,
    action_source: "website", event_source_url: "https://aihaat.shop/checkout/success",
    custom_data: buildCapiPurchaseData(order), user_data: userData,
  });
  const retry = result.retryable && row.attempts + 1 < MAX_ATTEMPTS;
  await finish(result.accepted ? "SENT" : retry ? "PENDING" : "FAILED", result.reason, true,
    retry ? new Date(Date.now() + 60_000 * 4 ** row.attempts) : null);
  if (result.accepted) {
    await prisma.order.updateMany({
      where: { id: order.id, analyticsPurchaseSentAt: null }, data: { analyticsPurchaseSentAt: new Date() },
    });
  }
  return result.accepted ? "sent" : retry ? "retry" : "failed";
}

export async function runMetaOutbox() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - META_EVENT_AGE_MS);
  await prisma.analyticsEvent.updateMany({
    where: { provider: META_PROVIDER, status: "PENDING", createdAt: { lt: cutoff } },
    data: { status: "SUPPRESSED", lastError: "expired" },
  });
  const retention = new Date(now.getTime() - 30 * META_EVENT_AGE_MS);
  await prisma.advertisingConsent.deleteMany({ where: { expiresAt: { lte: now } } });
  await prisma.analyticsEvent.deleteMany({ where: { provider: META_PROVIDER, createdAt: { lt: retention } } });
  await prisma.order.updateMany({
    where: { metaConsentId: { not: null }, createdAt: { lt: retention } },
    data: { metaConsentId: null, metaAttribution: Prisma.DbNull },
  });
  const events = await prisma.analyticsEvent.findMany({
    where: { provider: META_PROVIDER, status: "PENDING", attempts: { lt: MAX_ATTEMPTS }, createdAt: { gte: cutoff }, ...nowEligible(now) },
    orderBy: { createdAt: "asc" }, take: 6,
  });
  const counts: Record<string, number> = {};
  for (const event of events) {
    const result = await processEvent(event).catch(() => "processing_error");
    counts[result] = (counts[result] || 0) + 1;
    if (result === "paused") break;
  }
  return counts;
}
