import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidatedDestination } from "@/lib/security/safe-redirect";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("t");
  const targetUrl = searchParams.get("url");

  const safeDestination = getValidatedDestination(targetUrl, req.url);

  try {
    if (token) {
      const recipient = await prisma.emailCampaignRecipient.findUnique({
        where: { trackingToken: token },
        select: { id: true, campaignId: true, email: true, clickedAt: true },
      });

      if (recipient) {
        const isFirstClick = !recipient.clickedAt;

        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: {
            clickedAt: recipient.clickedAt || new Date(),
            openedAt: recipient.clickedAt ? undefined : new Date(), // If clicked, implies opened
          },
        });

        if (isFirstClick && recipient.campaignId) {
          await prisma.emailCampaign.update({
            where: { id: recipient.campaignId },
            data: { clickedCount: { increment: 1 } },
          });
        }

        // Record tracking log
        await prisma.emailEventLog.create({
          data: {
            campaignId: recipient.campaignId,
            recipientId: recipient.id,
            email: recipient.email,
            event: "CLICKED",
            url: safeDestination,
            ipAddress: req.headers.get("x-forwarded-for") || undefined,
            userAgent: req.headers.get("user-agent") || undefined,
          },
        });
      }
    }
  } catch (err) {
    console.error("[Track Click Error]:", err);
  }

  // Redirect to original destination
  return NextResponse.redirect(safeDestination, 302);
}