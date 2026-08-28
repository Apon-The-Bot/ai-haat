import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1x1 transparent GIF buffer
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("t");

    if (token) {
      const recipient = await prisma.emailCampaignRecipient.findUnique({
        where: { trackingToken: token },
        select: { id: true, campaignId: true, email: true, openedAt: true },
      });

      if (recipient) {
        const isFirstOpen = !recipient.openedAt;

        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: {
            openedAt: recipient.openedAt || new Date(),
            deliveredAt: new Date(),
          },
        });

        if (isFirstOpen && recipient.campaignId) {
          await prisma.emailCampaign.update({
            where: { id: recipient.campaignId },
            data: { openedCount: { increment: 1 } },
          });
        }

        // Record tracking event
        await prisma.emailEventLog.create({
          data: {
            campaignId: recipient.campaignId,
            recipientId: recipient.id,
            email: recipient.email,
            event: "OPENED",
            ipAddress: req.headers.get("x-forwarded-for") || undefined,
            userAgent: req.headers.get("user-agent") || undefined,
          },
        });
      }
    }
  } catch (err) {
    console.error("[Track Open Error]:", err);
  }

  // Always return the transparent 1x1 GIF
  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}