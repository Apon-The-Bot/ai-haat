import { NextResponse } from "next/server";
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