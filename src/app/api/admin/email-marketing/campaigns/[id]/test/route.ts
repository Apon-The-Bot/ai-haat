import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { renderDynamicVariables, wrapInMasterEmailLayout } from "@/lib/email-marketing/template-engine";
import { sendMarketingEmail } from "@/lib/email-marketing/provider";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const testEmail = body.testEmail?.trim() || auth.user.email;

    if (!testEmail) {
      return NextResponse.json({ success: false, error: "Recipient email is required" }, { status: 400 });
    }

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const siteUrl = process.env.NEXTAUTH_URL || "https://aihaat.shop";
    const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(testEmail)}`;

    // Render with sample variables
    const renderedBody = renderDynamicVariables(campaign.contentHtml, {
      customerName: "Admin Test User",
      firstName: "Admin",
      email: testEmail,
      siteName: "AI Haat",
      siteUrl,
      customerDashboardUrl: `${siteUrl}/dashboard`,
      orderCount: 3,
      totalSpent: 4500,
      lastOrderDate: new Date().toISOString().split("T")[0],
      unsubscribeUrl,
      couponCode: "SAVE20",
    });

    const fullHtml = wrapInMasterEmailLayout({
      contentHtml: renderedBody,
      preheader: campaign.preheader || undefined,
      unsubscribeUrl,
      siteUrl,
    });

    const subject = `[TEST] ${renderDynamicVariables(campaign.subject, {
      customerName: "Admin",
      firstName: "Admin",
      email: testEmail,
    })}`;

    const sendResult = await sendMarketingEmail({
      to: testEmail,
      subject,
      html: fullHtml,
      from: campaign.fromEmail,
      senderName: campaign.senderName,
      replyTo: campaign.replyToEmail || undefined,
      unsubscribeUrl,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: sendResult.error || "Failed to dispatch test email" },
        { status: 500 }
      );
    }

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "CAMPAIGN_TEST_SEND",
      targetType: "EMAIL_CAMPAIGN",
      targetId: campaign.id,
      details: {
        to: testEmail,
        campaignName: campaign.name,
        simulated: sendResult.simulated,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${testEmail}${sendResult.simulated ? " (Simulated Mode)" : ""}.`,
      messageId: sendResult.messageId,
      simulated: sendResult.simulated,
    });
  } catch (error: any) {
    console.error("[Campaign Test Send Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}