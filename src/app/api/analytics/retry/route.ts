// ─── AI Haat — Analytics Event Retry CRON Endpoint ──────────────
// Retries failed Meta CAPI events from the AnalyticsEvent outbox.
// Protected by CRON_SECRET. Triggered via Hostinger cron job.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCapiEvent } from "@/lib/analytics/meta-capi";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Verify CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }

    const authHeader = req.headers.get("authorization");
    const bodySecret = await req.text().catch(() => "");
    let providedSecret = "";

    if (authHeader?.startsWith("Bearer ")) {
      providedSecret = authHeader.slice(7);
    } else {
      try {
        const parsed = JSON.parse(bodySecret);
        providedSecret = parsed.secret || "";
      } catch {
        providedSecret = bodySecret.trim();
      }
    }

    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch pending/failed events with < 3 attempts
    const events = await prisma.analyticsEvent.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { status: "FAILED", attempts: { lt: 3 } },
        ],
      },
      take: 20,
      orderBy: { createdAt: "asc" },
    });

    if (events.length === 0) {
      return NextResponse.json({ message: "No events to retry", retried: 0 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const event of events) {
      try {
        const payload = JSON.parse(event.payload);
        const success = await sendCapiEvent(
          event.eventName,
          event.eventId,
          payload.customData,
          payload.userData,
          undefined
        );

        await prisma.analyticsEvent.update({
          where: { id: event.id },
          data: {
            status: success ? "SENT" : "FAILED",
            attempts: { increment: 1 },
            sentAt: success ? new Date() : undefined,
            lastError: success ? null : "Retry failed",
          },
        });

        if (success) {
          successCount++;
          // Update order analyticsPurchaseSentAt if not set
          if (event.orderId) {
            await prisma.order.updateMany({
              where: {
                orderNumber: event.orderId,
                analyticsPurchaseSentAt: null,
              },
              data: { analyticsPurchaseSentAt: new Date() },
            }).catch(() => {});
          }
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
        await prisma.analyticsEvent.update({
          where: { id: event.id },
          data: {
            attempts: { increment: 1 },
            status: "FAILED",
            lastError: err instanceof Error ? err.message : "Unknown error",
          },
        }).catch(() => {});
      }
    }

    console.log(`[Analytics Retry] Processed ${events.length} events: ${successCount} sent, ${failCount} failed`);

    return NextResponse.json({
      message: "Retry complete",
      total: events.length,
      sent: successCount,
      failed: failCount,
    });
  } catch (err) {
    console.error("[Analytics Retry Error]:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
