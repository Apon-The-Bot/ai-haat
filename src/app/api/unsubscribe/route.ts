import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();
  const token = searchParams.get("token") || searchParams.get("t");

  let resolvedEmail = email;

  if (!resolvedEmail && token) {
    const recipient = await prisma.emailCampaignRecipient.findUnique({
      where: { trackingToken: token },
      select: { email: true },
    });
    if (recipient) {
      resolvedEmail = recipient.email;
    } else {
      const contact = await prisma.emailContact.findUnique({
        where: { unsubscribeToken: token },
        select: { email: true },
      });
      if (contact) {
        resolvedEmail = contact.email;
      }
    }
  }

  if (!resolvedEmail) {
    return NextResponse.json({ success: false, error: "Invalid unsubscribe link." }, { status: 400 });
  }

  const suppression = await prisma.emailSuppression.findUnique({
    where: { email: resolvedEmail },
  });

  return NextResponse.json({
    success: true,
    email: resolvedEmail,
    isUnsubscribed: Boolean(suppression),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, token } = body;

    let targetEmail: string | null = null;

    if (token && typeof token === "string" && token.trim()) {
      const trimmedToken = token.trim();
      const recipient = await prisma.emailCampaignRecipient.findUnique({
        where: { trackingToken: trimmedToken },
        select: { email: true, id: true, campaignId: true },
      });
      if (recipient) {
        targetEmail = recipient.email;

        // Increment unsubscribe count on campaign
        if (recipient.campaignId) {
          await prisma.emailCampaign.update({
            where: { id: recipient.campaignId },
            data: { unsubscribedCount: { increment: 1 } },
          });
        }
      } else {
        const contact = await prisma.emailContact.findUnique({
          where: { unsubscribeToken: trimmedToken },
          select: { email: true },
        });
        if (contact) {
          targetEmail = contact.email;
        }
      }

      if (!targetEmail) {
        return NextResponse.json({ success: false, error: "Invalid or expired unsubscribe token." }, { status: 400 });
      }
    } else if (email && typeof email === "string" && email.trim()) {
      const auth = await requireAuth();
      if (auth instanceof NextResponse) return auth;
      const { user } = auth;

      const normalizedEmail = email.toLowerCase().trim();
      if (user.email.toLowerCase() !== normalizedEmail) {
        return NextResponse.json({ success: false, error: "Unauthorized: Email does not match session." }, { status: 403 });
      }
      targetEmail = normalizedEmail;
    } else {
      return NextResponse.json({ success: false, error: "Email or unsubscribe token is required." }, { status: 400 });
    }

    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email is required to unsubscribe." }, { status: 400 });
    }

    // 1. Add to suppression list
    await prisma.emailSuppression.upsert({
      where: { email: targetEmail },
      create: {
        email: targetEmail,
        reason: "UNSUBSCRIBED",
        source: "USER_CLICK",
        details: "1-Click Unsubscribe from marketing email",
      },
      update: {
        reason: "UNSUBSCRIBED",
        source: "USER_CLICK",
      },
    });

    // 2. Update EmailContact consent
    await prisma.emailContact.updateMany({
      where: { email: targetEmail },
      data: {
        isSubscribed: false,
        promotionalConsent: false,
        newsletterConsent: false,
      },
    });

    // 3. Record tracking event
    await prisma.emailEventLog.create({
      data: {
        email: targetEmail,
        event: "UNSUBSCRIBED",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: `You have successfully unsubscribed ${targetEmail} from marketing emails. Transactional and account security emails will still be delivered when you make a purchase.`,
      email: targetEmail,
    });
  } catch (error: any) {
    console.error("[Unsubscribe Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process unsubscribe request" },
      { status: 500 }
    );
  }
}