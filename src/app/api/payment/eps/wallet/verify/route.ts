import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { finalizeEpsWallet } from "@/lib/payments/eps/finalize-wallet";
import { finalizeEpsOrder } from "@/lib/payments/eps/finalize-order";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isSameOriginMutation } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
  }

  const limit = checkRateLimit(`eps-payment-verify:${auth.user.id}`, 6, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterMs, "Try again shortly.");

  const id = new URL(request.url).searchParams.get("merchantTransactionId");
  if (!id || !/^\d{10,40}$/.test(id)) {
    return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
  }

  try {
    const attempt = await prisma.epsPaymentAttempt.findFirst({
      where: { merchantTransactionId: id, userId: auth.user.id, purpose: { in: ["WALLET_TOPUP", "ORDER"] } },
      select: { state: true, purpose: true },
    });
    if (!attempt) return NextResponse.json({ error: "Payment attempt not found." }, { status: 404 });
    const finalize = attempt.purpose === "ORDER" ? finalizeEpsOrder : finalizeEpsWallet;
    if (attempt.state === "FINALIZED" || await finalize(id, auth.user.id)) {
      return NextResponse.json({ status: "FINALIZED", purpose: attempt.purpose });
    }
    const current = await prisma.epsPaymentAttempt.findFirst({
      where: { merchantTransactionId: id, userId: auth.user.id },
      select: { state: true },
    });
    if (current?.state === "REVIEW_REQUIRED") {
      return NextResponse.json({ status: "REVIEW_REQUIRED", purpose: attempt.purpose }, { status: 409 });
    }
    return NextResponse.json({ status: "PENDING", purpose: attempt.purpose }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Payment verification is temporarily unavailable." }, { status: 503 });
  }
}
