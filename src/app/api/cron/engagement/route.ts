import { NextRequest, NextResponse } from "next/server";
import { processAbandonedCartStage } from "@/lib/commerce/abandoned-cart";
import { processPostDeliveryReviewRequests } from "@/lib/commerce/reviews-retention";
import { runInventoryExpiryCheck } from "@/lib/commerce/inventory";
import { isCronAuthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

async function handleEngagementCron(req: NextRequest) {
  const authorized = isCronAuthorized(req);
  if (!authorized) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing Bearer CRON_SECRET" },
      { status: 401 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aihaat.shop";
  const now = new Date();

  try {
    // 1. Process Abandoned Carts - Stage 1 (1 hour) & Stage 2 (24 hours)
    const cartStage1 = await processAbandonedCartStage(1, baseUrl, now);
    const cartStage2 = await processAbandonedCartStage(2, baseUrl, now);

    // 2. Process Post-Delivery Review Collection (24 hours after delivery)
    const reviewRequests = await processPostDeliveryReviewRequests(baseUrl, now);

    // 3. Process Customer Subscription & Warranty Expiry Notices (3-day & 1-day)
    const expiryReport = await runInventoryExpiryCheck();

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      tasks: {
        abandonedCarts: {
          stage1: {
            processed: cartStage1.processed,
            sent: cartStage1.sent,
            skippedSuppressed: cartStage1.skippedSuppressed,
            skippedConverted: cartStage1.skippedConverted,
            errors: cartStage1.errors,
          },
          stage2: {
            processed: cartStage2.processed,
            sent: cartStage2.sent,
            skippedSuppressed: cartStage2.skippedSuppressed,
            skippedConverted: cartStage2.skippedConverted,
            errors: cartStage2.errors,
          },
        },
        reviewRequests: {
          processed: reviewRequests.processed,
          sent: reviewRequests.sent,
          skippedSuppressed: reviewRequests.skippedSuppressed,
          skippedAlreadyReviewed: reviewRequests.skippedAlreadyReviewed,
          skippedAlreadySent: reviewRequests.skippedAlreadySent,
          errors: reviewRequests.errors,
        },
        expiryReminders: {
          customerExpiringCount: expiryReport.customerExpiringCount,
          customerNotifiedCount: expiryReport.customerNotifiedCount,
          notified3DayCount: expiryReport.notified3DayCount,
          notified1DayCount: expiryReport.notified1DayCount,
          expiredStockCount: expiryReport.expiredCount,
          expiringSoonStockCount: expiryReport.expiringSoonCount,
        },
      },
    });
  } catch (error: any) {
    console.error("[Engagement Cron Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during engagement cron processing",
      },
      { status: 500 }
    );
  }
}

export const GET = handleEngagementCron;
export const POST = handleEngagementCron;
