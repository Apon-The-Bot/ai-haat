import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { getMaskedEmailMarketingSettings } from "@/lib/email-marketing/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await getMaskedEmailMarketingSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("[Email Settings GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const {
      senderName,
      fromEmail,
      replyToEmail,
      providerType,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure,
      apiKey,
      batchSize,
      rateLimitDelayMs,
      maxRetries,
      testMode,
      trackingEnabled,
      openTracking,
      clickTracking,
      defaultTimezone,
    } = body;

    const updates: Array<{ key: string; value: string }> = [];

    if (senderName !== undefined) updates.push({ key: "email_marketing_sender_name", value: String(senderName).trim() });
    if (fromEmail !== undefined) updates.push({ key: "email_marketing_from_email", value: String(fromEmail).trim() });
    if (replyToEmail !== undefined) updates.push({ key: "email_marketing_reply_to", value: String(replyToEmail).trim() });
    if (providerType !== undefined) updates.push({ key: "email_marketing_provider_type", value: String(providerType) });
    if (smtpHost !== undefined) updates.push({ key: "email_marketing_smtp_host", value: String(smtpHost).trim() });
    if (smtpPort !== undefined) updates.push({ key: "email_marketing_smtp_port", value: String(smtpPort) });
    if (smtpUser !== undefined) updates.push({ key: "email_marketing_smtp_user", value: String(smtpUser).trim() });
    if (smtpPass && smtpPass.trim()) updates.push({ key: "email_marketing_smtp_pass", value: String(smtpPass).trim() });
    if (smtpSecure !== undefined) updates.push({ key: "email_marketing_smtp_secure", value: String(Boolean(smtpSecure)) });
    if (apiKey && apiKey.trim()) updates.push({ key: "email_marketing_api_key", value: String(apiKey).trim() });
    if (batchSize !== undefined) updates.push({ key: "email_marketing_batch_size", value: String(batchSize) });
    if (rateLimitDelayMs !== undefined) updates.push({ key: "email_marketing_rate_delay", value: String(rateLimitDelayMs) });
    if (maxRetries !== undefined) updates.push({ key: "email_marketing_max_retries", value: String(maxRetries) });
    if (testMode !== undefined) updates.push({ key: "email_marketing_test_mode", value: String(Boolean(testMode)) });
    if (trackingEnabled !== undefined) updates.push({ key: "email_marketing_tracking_enabled", value: String(Boolean(trackingEnabled)) });
    if (openTracking !== undefined) updates.push({ key: "email_marketing_open_tracking", value: String(Boolean(openTracking)) });
    if (clickTracking !== undefined) updates.push({ key: "email_marketing_click_tracking", value: String(Boolean(clickTracking)) });
    if (defaultTimezone !== undefined) updates.push({ key: "email_marketing_timezone", value: String(defaultTimezone) });

    for (const u of updates) {
      await prisma.siteSetting.upsert({
        where: { key: u.key },
        update: { value: u.value },
        create: { key: u.key, value: u.value },
      });
    }

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "SETTINGS_UPDATE",
      targetType: "EMAIL_MARKETING_SETTINGS",
      details: { updatedKeys: updates.map((u) => u.key) },
    });

    const refreshed = await getMaskedEmailMarketingSettings();
    return NextResponse.json({ success: true, settings: refreshed, message: "Settings saved successfully." });
  } catch (error: any) {
    console.error("[Email Settings POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update email marketing settings" },
      { status: 500 }
    );
  }
}