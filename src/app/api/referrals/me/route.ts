import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { getUserReferralData, claimReferralMilestone } from "@/lib/commerce/referrals";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const data = await getUserReferralData(auth.user.id);
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    console.error("[Referral GET Error]:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to load referral data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limiter = checkRateLimit(`milestone_claim:${ip}`, 5, 60 * 1000);
  if (!limiter.allowed) {
    return rateLimitResponse(limiter.retryAfterMs, "অনেকবার চেষ্টা করা হয়েছে। ১ মিনিট পর আবার চেষ্টা করুন।");
  }

  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { milestoneId } = body;

    if (!milestoneId) {
      return NextResponse.json({ success: false, error: "Milestone ID is required" }, { status: 400 });
    }

    const result = await claimReferralMilestone(auth.user.id, milestoneId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[Referral Claim POST Error]:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to claim milestone" }, { status: 500 });
  }
}
