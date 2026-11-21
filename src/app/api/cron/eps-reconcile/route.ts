import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { finalizeEpsOrder } from "@/lib/payments/eps/finalize-order";
import { finalizeEpsWallet } from "@/lib/payments/eps/finalize-wallet";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const mode = process.env.EPS_MODE;
  if (mode !== "live" && mode !== "sandbox") {
    return NextResponse.json({ status: "DISABLED" });
  }

  const candidates = await prisma.epsPaymentAttempt.findMany({
    where: {
      mode,
      state: { in: ["INITIALIZING", "PENDING"] },
      purpose: { in: ["ORDER", "WALLET_TOPUP"] },
      updatedAt: { lte: new Date(Date.now() - 120_000) },
    },
    orderBy: { updatedAt: "asc" },
    take: 2,
  });
  const summary = { checked: 0, finalized: 0, errors: 0 };
  for (const attempt of candidates) {
    try {
      const claimed = await prisma.epsPaymentAttempt.updateMany({
        where: {
          merchantTransactionId: attempt.merchantTransactionId,
          state: attempt.state,
          updatedAt: attempt.updatedAt,
        },
        data: { updatedAt: new Date() },
      });
      if (!claimed.count) continue;
      summary.checked++;
      const finalize = attempt.purpose === "ORDER" ? finalizeEpsOrder : finalizeEpsWallet;
      if (await finalize(attempt.merchantTransactionId, attempt.userId)) summary.finalized++;
    } catch {
      summary.errors++;
    }
  }
  return NextResponse.json(summary);
}
