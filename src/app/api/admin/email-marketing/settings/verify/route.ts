import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { verifyMarketingConnection } from "@/lib/email-marketing/provider";
import { verifyDomainDns } from "@/lib/email-marketing/dns-verifier";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const [smtpResult, dnsResult] = await Promise.all([
      verifyMarketingConnection(),
      verifyDomainDns("aihaat.shop"),
    ]);

    return NextResponse.json({
      success: true,
      smtp: smtpResult,
      dns: dnsResult,
    });
  } catch (error: any) {
    console.error("[Email Verify Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to verify email configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const smtpResult = await verifyMarketingConnection();
    if (!smtpResult.ok) {
      return NextResponse.json({ success: false, error: smtpResult.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: smtpResult.message || "SMTP / Provider connection verified successfully!",
    });
  } catch (error: any) {
    console.error("[Email Verify POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to verify email connection" },
      { status: 500 }
    );
  }
}