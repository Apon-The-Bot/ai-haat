import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { retrySingleNotificationEvent } from "@/lib/notifications";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const eventType = searchParams.get("eventType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (eventType && eventType !== "ALL") where.eventType = eventType;

    const [events, totalCount] = await Promise.all([
      prisma.notificationEvent.findMany({
        where,
        include: {
          deliveries: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notificationEvent.count({ where }),
    ]);

    // Mask safe data and return
    const formatted = events.map((ev) => {
      let safePayload = {};
      try {
        safePayload = JSON.parse(ev.payload || "{}");
      } catch {
        safePayload = {};
      }

      return {
        id: ev.id,
        eventType: ev.eventType,
        entityType: ev.entityType,
        entityId: ev.entityId,
        recipientEmail: ev.recipientEmail,
        recipientPhone: ev.recipientPhone,
        channels: ev.channels ? ev.channels.split(",") : [],
        status: ev.status,
        attempts: ev.attempts,
        maxAttempts: ev.maxAttempts,
        nextAttemptAt: ev.nextAttemptAt ? ev.nextAttemptAt.toISOString() : null,
        processedAt: ev.processedAt ? ev.processedAt.toISOString() : null,
        lastError: ev.lastError,
        errorCategory: ev.errorCategory,
        priority: ev.priority,
        payload: safePayload,
        deliveries: ev.deliveries.map((d) => ({
          id: d.id,
          channel: d.channel,
          recipient: d.recipient,
          status: d.status,
          providerMessageId: d.providerMessageId,
          error: d.error,
          sentAt: d.sentAt ? d.sentAt.toISOString() : null,
        })),
        createdAt: ev.createdAt.toISOString(),
      };
    });

    const [pendingCount, failedCount, sentCount] = await Promise.all([
      prisma.notificationEvent.count({ where: { status: "PENDING" } }),
      prisma.notificationEvent.count({ where: { status: "FAILED" } }),
      prisma.notificationEvent.count({ where: { status: "SENT" } }),
    ]);

    return NextResponse.json({
      success: true,
      events: formatted,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
      kpi: {
        total: totalCount,
        sent: sentCount,
        pending: pendingCount,
        failed: failedCount,
      },
    });
  } catch (error: any) {
    console.error("[Admin Notifications GET Error]:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ success: false, error: "Event ID is required." }, { status: 400 });
    }

    const result = await retrySingleNotificationEvent(eventId, user.email);

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "NOTIFICATION_MANUAL_RETRY",
      targetType: "SYSTEM",
      targetId: eventId,
      details: { result },
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[Admin Notifications POST Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
