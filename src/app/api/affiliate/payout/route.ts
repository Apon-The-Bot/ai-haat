import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { requestAffiliatePayout, MIN_PAYOUT_AMOUNT_BDT } from "@/lib/commerce/affiliates";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ success: true, data: [] });
    }

    const payouts = await prisma.affiliatePayoutRequest.findMany({
      where: { affiliateProfileId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: payouts,
      availableBalance: profile.earningsBalanceBDT,
      minPayoutAmount: MIN_PAYOUT_AMOUNT_BDT,
    });
  } catch (error: any) {
    console.error("GET /api/affiliate/payout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "Cross-site request forgery blocked" }, { status: 403 });
  }

  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const ip = getClientIp(req);
    const limiter = checkRateLimit(`payout_${user.id}_${ip}`, 5, 60 * 60 * 1000);
    if (!limiter.allowed) {
      return rateLimitResponse(limiter.retryAfterMs, "Too many payout requests. Please try again later.");
    }

    const body = await req.json();
    const { amountBDT, payoutMethod, payoutPhone, payoutBankDetails } = body;

    const numAmount = Number(amountBDT);
    if (!numAmount || isNaN(numAmount) || numAmount < MIN_PAYOUT_AMOUNT_BDT) {
      return NextResponse.json(
        { error: `Minimum payout amount is ৳${MIN_PAYOUT_AMOUNT_BDT}` },
        { status: 400 }
      );
    }

    if (!payoutMethod) {
      return NextResponse.json(
        { error: "Payout method is required" },
        { status: 400 }
      );
    }

    // Method specific validations
    if (["BKASH", "NAGAD", "ROCKET"].includes(payoutMethod) && !payoutPhone?.trim()) {
      return NextResponse.json(
        { error: `Account phone number is required for ${payoutMethod} payout` },
        { status: 400 }
      );
    }

    if (payoutMethod === "BANK" && !payoutBankDetails?.trim()) {
      return NextResponse.json(
        { error: "Bank account details are required for Bank Transfer payout" },
        { status: 400 }
      );
    }

    const result = await requestAffiliatePayout(user.id, {
      amountBDT: numAmount,
      payoutMethod,
      payoutPhone: payoutPhone?.trim(),
      payoutBankDetails: payoutBankDetails?.trim(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("POST /api/affiliate/payout error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}

