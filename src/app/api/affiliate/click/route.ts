import { NextRequest, NextResponse } from "next/server";
import { recordReferralClick } from "@/lib/commerce/affiliates";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, landingPage, utmSource, utmMedium, utmCampaign } = body;

    if (!referralCode) {
      return NextResponse.json({ error: "referralCode is required" }, { status: 400 });
    }

    await recordReferralClick({
      referralCode,
      landingPage,
      utmSource,
      utmMedium,
      utmCampaign,
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
