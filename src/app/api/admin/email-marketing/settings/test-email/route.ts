import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { sendMarketingEmail } from "@/lib/email-marketing/provider";
import { wrapInMasterEmailLayout } from "@/lib/email-marketing/template-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { testRecipient, customSettings } = body;

    const to = testRecipient?.trim() || auth.user.email;
    if (!to) {
      return NextResponse.json({ success: false, error: "Recipient email is required." }, { status: 400 });
    }

    const testHtml = wrapInMasterEmailLayout({
      contentHtml: `
        <h2 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">
          SMTP & Delivery Configuration Test 🚀
        </h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
          Hello <strong>${auth.user.name || "Admin"}</strong>, this is a test message from AI Haat's Email Marketing system.
        </p>
        <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
          <span style="font-size: 13px; font-weight: 700; color: #065F46;">
            ✓ SMTP handshake and authentication succeeded!
          </span>
        </div>
        <p style="font-size: 12px; color: #94A3B8; margin: 0;">
          Timestamp: ${new Date().toISOString()} • Server: Hostinger / Custom SMTP
        </p>
      `,
      preheader: "AI Haat SMTP Delivery Test Verification",
      siteUrl: "https://aihaat.shop",
    });

    const result = await sendMarketingEmail(
      {
        to,
        subject: "🧪 AI Haat: Email Marketing Configuration Test",
        html: testHtml,
      },
      customSettings
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email successfully dispatched to ${to}! (MessageID: ${result.messageId})`,
        result,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to dispatch test email" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Test Email Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}