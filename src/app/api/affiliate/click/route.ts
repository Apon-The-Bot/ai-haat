import { NextRequest, NextResponse } from "next/server";
import { recordReferralClick } from "@/lib/commerce/affiliates";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, landingPage, utmSource, utmMedium, utmCampaign } = body;

    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json({ error: "referralCode is required" }, { status: 400 });
    }

    const cleanCode = referralCode.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,50}$/.test(cleanCode)) {
      return NextResponse.json({ error: "Invalid referral code format" }, { status: 400 });
    }

    // AUDIT-013: Deduplicate / rate-limit clicks from the same IP to prevent click count inflation
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`ref_click:${clientIp}:${cleanCode}`, 10, 60 * 1000);
    if (!rl.allowed) {
      // Return 200 with deduplicated flag to avoid client script errors while protecting database
      return NextResponse.json({ success: true, deduplicated: true });
    }

    await recordReferralClick({
      referralCode: cleanCode,
      landingPage: typeof landingPage === "string" ? landingPage.slice(0, 500) : undefined,
      utmSource: typeof utmSource === "string" ? utmSource.slice(0, 100) : undefined,
      utmMedium: typeof utmMedium === "string" ? utmMedium.slice(0, 100) : undefined,
      utmCampaign: typeof utmCampaign === "string" ? utmCampaign.slice(0, 100) : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/affiliate/click error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
