import { prisma } from "@/lib/prisma";
import { resolveAudience } from "./segmentation";
import { renderDynamicVariables, wrapInMasterEmailLayout } from "./template-engine";
import { getEmailMarketingSettings, sendMarketingEmail } from "./provider";
import { SendBatchResult } from "./types";

/**
 * Prepares and enqueues all eligible audience recipients for a campaign.
 */
export async function queueCampaignRecipients(campaignId: string): Promise<{ totalQueued: number }> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // 1. Resolve eligible audience
  const audience = await resolveAudience({
    audienceType: campaign.audienceType,
    audienceFilter: campaign.audienceFilter,
    segmentId: campaign.segmentId,
  });

  if (audience.recipients.length === 0) {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: "SENT",
        totalRecipients: 0,
        completedAt: new Date(),
      },
    });
    return { totalQueued: 0 };
  }

  // 2. Clear any stale QUEUED recipients if restarting
  await prisma.emailCampaignRecipient.deleteMany({
    where: { campaignId, status: "QUEUED" },
  });

  // 3. Batch insert recipient records
  const batchSize = 100;
  for (let i = 0; i < audience.recipients.length; i += batchSize) {
    const chunk = audience.recipients.slice(i, i + batchSize);
    await prisma.emailCampaignRecipient.createMany({
      data: chunk.map((r) => ({
        campaignId,
        email: r.email,
        name: r.name || null,
        userId: r.userId || null,
        status: "QUEUED",
        metadata: JSON.stringify(r),
      })),
      skipDuplicates: true,
    });
  }

  // 4. Update campaign status
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: "SENDING",
      totalRecipients: audience.recipients.length,
      startedAt: new Date(),
    },
  });

  return { totalQueued: audience.recipients.length };
}

/**
 * Rewrites http/https href links in HTML to point to click tracking endpoint.
 */
function rewriteLinksForTracking(html: string, trackingToken: string, siteUrl: string): string {
  return html.replace(/href=(["'])(https?:\/\/[^"'\s>]+)\1/gi, (match, quote, url) => {
    // Avoid re-wrapping unsubscribe or tracking endpoints
    if (url.includes("/unsubscribe") || url.includes("/api/track/")) {
      return match;
    }
    const trackingUrl = `${siteUrl}/api/track/click?t=${encodeURIComponent(trackingToken)}&url=${encodeURIComponent(url)}`;
    return `href="${trackingUrl}"`;
  });
}

/**
 * Processes a single batch of queued emails for an active campaign.
 */
export async function processActiveCampaignBatch(
  campaignId?: string,
  batchLimit = 30
): Promise<SendBatchResult> {
  const settings = await getEmailMarketingSettings();
  const siteUrl = process.env.NEXTAUTH_URL || "https://aihaat.shop";

  // 1. Find active campaign
  let activeCampaign = null;
  if (campaignId) {
    activeCampaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    });
  } else {
    activeCampaign = await prisma.emailCampaign.findFirst({
      where: {
        status: { in: ["SENDING", "PROCESSING"] },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  if (!activeCampaign) {
    return { sent: 0, failed: 0, suppressed: 0, errors: [] };
  }

  // 2. Fetch next batch of QUEUED recipients
  const recipients = await prisma.emailCampaignRecipient.findMany({
    where: {
      campaignId: activeCampaign.id,
      status: "QUEUED",
    },
    take: batchLimit,
    orderBy: { queuedAt: "asc" },
  });

  if (recipients.length === 0) {
    // Check if all recipients for this campaign have completed
    const remainingCount = await prisma.emailCampaignRecipient.count({
      where: {
        campaignId: activeCampaign.id,
        status: "QUEUED",
      },
    });

    if (remainingCount === 0) {
      const failedCount = await prisma.emailCampaignRecipient.count({
        where: {
          campaignId: activeCampaign.id,
          status: "FAILED",
        },
      });

      await prisma.emailCampaign.update({
        where: { id: activeCampaign.id },
        data: {
          status: failedCount > 0 ? "PARTIALLY_FAILED" : "SENT",
          completedAt: new Date(),
        },
      });
    }

    return { sent: 0, failed: 0, suppressed: 0, errors: [] };
  }

  // 3. Mark batch as PROCESSING
  const recipientIds = recipients.map((r) => r.id);
  await prisma.emailCampaignRecipient.updateMany({
    where: { id: { in: recipientIds } },
    data: { status: "PROCESSING" },
  });

  let sent = 0;
  let failed = 0;
  let suppressed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  // 4. Dispatch each recipient in batch
  for (const r of recipients) {
    try {
      // Re-verify against suppression table just before final send
      const isSuppressed = await prisma.emailSuppression.findUnique({
        where: { email: r.email.toLowerCase().trim() },
      });

      if (isSuppressed) {
        await prisma.emailCampaignRecipient.update({
          where: { id: r.id },
          data: {
            status: "SUPPRESSED",
            errorMessage: `Suppressed reason: ${isSuppressed.reason || "Manual"}`,
          },
        });
        suppressed++;
        continue;
      }

      // Parse customer metadata
      let meta: Record<string, any> = {};
      if (r.metadata) {
        try {
          meta = JSON.parse(r.metadata);
        } catch {}
      }

      const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodeURIComponent(r.trackingToken)}&email=${encodeURIComponent(r.email)}`;
      const trackingPixelUrl = settings.openTracking
        ? `${siteUrl}/api/track/open?t=${encodeURIComponent(r.trackingToken)}`
        : undefined;

      // Render dynamic variables
      let renderedBody = renderDynamicVariables(activeCampaign.contentHtml, {
        customerName: r.name || meta.name || "Valued Customer",
        firstName: r.name ? r.name.split(" ")[0] : meta.name ? meta.name.split(" ")[0] : "Valued Customer",
        email: r.email,
        siteName: "AI Haat",
        siteUrl,
        customerDashboardUrl: `${siteUrl}/dashboard`,
        orderCount: meta.orderCount || 0,
        totalSpent: meta.totalSpent || 0,
        lastOrderDate: meta.lastOrderDate,
        unsubscribeUrl,
      });

      // Rewrite click links if enabled
      if (settings.clickTracking) {
        renderedBody = rewriteLinksForTracking(renderedBody, r.trackingToken, siteUrl);
      }

      const fullHtml = wrapInMasterEmailLayout({
        contentHtml: renderedBody,
        preheader: activeCampaign.preheader || undefined,
        unsubscribeUrl,
        siteUrl,
        trackingPixelUrl,
      });

      const renderedSubject = renderDynamicVariables(activeCampaign.subject, {
        customerName: r.name || "Valued Customer",
        firstName: r.name ? r.name.split(" ")[0] : "Valued Customer",
        email: r.email,
      });

      const result = await sendMarketingEmail(
        {
          to: r.email,
          subject: renderedSubject,
          html: fullHtml,
          from: activeCampaign.fromEmail,
          senderName: activeCampaign.senderName,
          replyTo: activeCampaign.replyToEmail || undefined,
          unsubscribeUrl,
        },
        settings
      );

      if (result.success) {
        await prisma.emailCampaignRecipient.update({
          where: { id: r.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            deliveredAt: result.simulated ? new Date() : undefined,
            messageId: result.messageId,
            errorMessage: null,
          },
        });

        // Record event log
        await prisma.emailEventLog.create({
          data: {
            campaignId: activeCampaign.id,
            recipientId: r.id,
            email: r.email,
            event: "SENT",
            data: JSON.stringify({ messageId: result.messageId, simulated: result.simulated }),
          },
        });

        // Update contact last emailed timestamp
        await prisma.emailContact.updateMany({
          where: { email: r.email },
          data: { lastEmailedAt: new Date() },
        });

        sent++;
      } else {
        await prisma.emailCampaignRecipient.update({
          where: { id: r.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            errorMessage: result.error || "Dispatch failed",
          },
        });

        await prisma.emailEventLog.create({
          data: {
            campaignId: activeCampaign.id,
            recipientId: r.id,
            email: r.email,
            event: "FAILED",
            data: JSON.stringify({ error: result.error }),
          },
        });

        failed++;
        errors.push({ email: r.email, error: result.error || "Failed" });
      }

      // Respect rate limit delay
      if (settings.rateLimitDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, settings.rateLimitDelayMs));
      }
    } catch (err: any) {
      console.error(`[Queue Item Error] for ${r.email}:`, err);
      await prisma.emailCampaignRecipient.update({
        where: { id: r.id },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          errorMessage: err?.message || "Internal error during dispatch",
        },
      });
      failed++;
      errors.push({ email: r.email, error: err?.message || "Exception" });
    }
  }

  // 5. Increment counts on campaign
  await prisma.emailCampaign.update({
    where: { id: activeCampaign.id },
    data: {
      sentCount: { increment: sent },
      failedCount: { increment: failed },
    },
  });

  return { sent, failed, suppressed, errors };
}

/**
 * Checks for scheduled campaigns that are ready to run and queues them.
 */
export async function processScheduledCampaigns(): Promise<number> {
  const now = new Date();
  const readyCampaigns = await prisma.emailCampaign.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
  });

  let triggered = 0;
  for (const c of readyCampaigns) {
    try {
      await queueCampaignRecipients(c.id);
      triggered++;
    } catch (err) {
      console.error(`[Scheduled Campaign Trigger Error] for ${c.id}:`, err);
    }
  }

  return triggered;
}