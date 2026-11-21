import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { logAdminAudit } from "@/lib/audit-logger";
import { finalizeEpsOrder } from "@/lib/payments/eps/finalize-order";
import { finalizeEpsWallet } from "@/lib/payments/eps/finalize-wallet";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isSameOriginMutation } from "@/lib/security/csrf";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
  const admin = await requireAdminMfa();
  if (admin instanceof NextResponse) return admin;
  const recent = await requireRecentMfa();
  if (recent instanceof NextResponse) return recent;
  const limit = checkRateLimit(`eps-admin-reconcile:${admin.user.id}`, 10, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterMs, "Try again shortly.");

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^\d{10,40}$/.test(id)) {
    return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
  }

  try {
    const attempt = await prisma.epsPaymentAttempt.findUnique({ where: { merchantTransactionId: id } });
    if (!attempt) return NextResponse.json({ error: "Payment attempt not found." }, { status: 404 });
    if (attempt.state === "FINALIZED") return NextResponse.json({ status: "FINALIZED" });
    if (attempt.state === "REVIEW_REQUIRED") {
      return NextResponse.json({ status: "REVIEW_REQUIRED" }, { status: 409 });
    }
    if (attempt.purpose !== "ORDER" && attempt.purpose !== "WALLET_TOPUP") {
      return NextResponse.json({ error: "Unsupported payment purpose." }, { status: 409 });
    }
    const finalize = attempt.purpose === "ORDER" ? finalizeEpsOrder : finalizeEpsWallet;
    await logAdminAudit({
      actorId: admin.user.id,
      actorEmail: admin.user.email,
      action: "EPS_PAYMENT_RECONCILE",
      targetType: "EPS_PAYMENT_ATTEMPT",
      targetId: id,
    });
    const finalized = await finalize(id, attempt.userId);
    if (finalized) return NextResponse.json({ status: "FINALIZED" });
    const current = await prisma.epsPaymentAttempt.findUnique({
      where: { merchantTransactionId: id },
      select: { state: true },
    });
    if (current?.state === "REVIEW_REQUIRED") {
      return NextResponse.json({ status: "REVIEW_REQUIRED" }, { status: 409 });
    }
    return NextResponse.json({ status: current?.state === "FINALIZED" ? "FINALIZED" : "PENDING" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" &&
        /(?:provider|settlement)TransactionId/.test(String(error.meta?.target ?? ""))) {
      return NextResponse.json({ status: "REFERENCE_CONFLICT" }, { status: 409 });
    }
    return NextResponse.json({ error: "EPS reconciliation could not be completed." }, { status: 503 });
  }
}
