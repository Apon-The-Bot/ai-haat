import { prisma } from "@/lib/prisma";
import { dispatchNotificationEvent } from "./service";
import { NOTIFICATION_EVENTS } from "./types";

export interface RetryProcessSummary {
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{ eventId: string; error: string }>;
}

/**
 * Background worker for executing bounded retries on pending/retryable notification jobs.
 * Protected against race conditions via atomic status leases.
 */
export async function processPendingNotificationRetries(limit = 20): Promise<RetryProcessSummary> {
  const summary: RetryProcessSummary = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  const now = new Date();
  const stuckLeaseTimeout = new Date(now.getTime() - 5 * 60 * 1000); // 5 mins stuck lease

  try {
    // 1. Find claimable events: RETRY_WAIT / PENDING with nextAttemptAt <= now OR stuck PROCESSING
    const claimableEvents = await prisma.notificationEvent.findMany({
      where: {
        OR: [
          {
            status: { in: ["PENDING", "RETRY_WAIT"] },
            nextAttemptAt: { lte: now },
          },
          {
            status: "PROCESSING",
            updatedAt: { lte: stuckLeaseTimeout },
          },
        ],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: limit,
    });

    if (claimableEvents.length === 0) {
      return summary;
    }

    // 2. Process each claimable event
    for (const event of claimableEvents) {
      summary.processed++;

      try {
        // Atomic claim
        const updated = await prisma.notificationEvent.updateMany({
          where: {
            id: event.id,
            status: event.status, // Guard against concurrent worker claims
          },
          data: {
            status: "PROCESSING",
            updatedAt: new Date(),
          },
        });

        if (updated.count === 0) {
          // Claimed by another concurrent worker instance
          continue;
        }

        // Parse payload
        let payload: any = {};
        try {
          payload = JSON.parse(event.payload || "{}");
        } catch {
          payload = {};
        }

        const targetChannels: any = event.channels ? event.channels.split(",") : ["IN_APP", "EMAIL"];

        // Re-dispatch using the master notification service
        const dispatchResult = await dispatchNotificationEvent({
          eventType: event.eventType as any,
          entityType: event.entityType as any,
          entityId: event.entityId || undefined,
          userId: event.userId || undefined,
          recipientEmail: event.recipientEmail || undefined,
          recipientPhone: event.recipientPhone || undefined,
          dedupeKey: event.dedupeKey || `retry_${event.id}_${Date.now()}`,
          payload,
          channels: targetChannels,
          priority: event.priority as any,
        });

        if (dispatchResult.success) {
          summary.succeeded++;
        } else {
          summary.failed++;
          summary.errors.push({ eventId: event.id, error: dispatchResult.error || "Unknown retry failure" });
        }
      } catch (err: any) {
        summary.failed++;
        summary.errors.push({ eventId: event.id, error: err?.message || "Worker execution error" });
      }
    }

    return summary;
  } catch (error: any) {
    console.error("[Notification Retry Worker Error]:", error);
    return summary;
  }
}

/**
 * Admin manual retry for a specific failed notification event
 */
export async function retrySingleNotificationEvent(eventId: string, actorEmail?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const event = await prisma.notificationEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { success: false, error: "Notification event not found." };
    }

    let payload: any = {};
    try {
      payload = JSON.parse(event.payload || "{}");
    } catch {
      payload = {};
    }

    const targetChannels: any = event.channels ? event.channels.split(",") : ["IN_APP", "EMAIL"];

    const result = await dispatchNotificationEvent({
      eventType: event.eventType as any,
      entityType: event.entityType as any,
      entityId: event.entityId || undefined,
      userId: event.userId || undefined,
      recipientEmail: event.recipientEmail || undefined,
      recipientPhone: event.recipientPhone || undefined,
      dedupeKey: `admin_manual_retry_${event.id}_${Date.now()}`,
      payload,
      channels: targetChannels,
      priority: "HIGH",
    });

    return {
      success: result.success,
      message: result.success ? "Notification re-dispatched successfully." : "Retry failed",
      error: result.error,
    };
  } catch (error: any) {
    console.error("[Manual Retry Error]:", error);
    return { success: false, error: error?.message || "Failed to retry notification" };
  }
}
