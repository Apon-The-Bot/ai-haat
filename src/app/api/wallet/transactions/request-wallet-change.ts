import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { requestAdminApproval } from "@/lib/admin-approvals";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const body = await req.json();
    const { action, userId, amountBDT, method, senderNumber, trxId, userEmail, note, adjustmentType } = body;
    const adjustment = action === "MANUAL_ADJUSTMENT";
    const amount = typeof amountBDT === "number" || typeof amountBDT === "string" ? Number(amountBDT) : NaN;
    const roundedAmount = Math.round((adjustment ? Math.abs(amount) : amount) * 100) / 100;
    const reason = typeof note === "string" ? note.trim() : "";
    if (!Number.isFinite(roundedAmount) || roundedAmount < 0.01 || Math.abs(amount) > Number.MAX_SAFE_INTEGER / 100 ||
      (adjustment && (!reason || !["CREDIT", "DEBIT"].includes(adjustmentType))) || reason.length > 1000 ||
      [method, senderNumber, trxId].some((value) => value != null && (typeof value !== "string" || value.length > 191))) {
      return NextResponse.json({ error: "Invalid wallet adjustment details." }, { status: 400 });
    }

    if (roundedAmount >= 1000) {
      const stepUp = await requireRecentMfa(5);
      if (stepUp instanceof NextResponse) return stepUp;
    }

    const where = adjustment
      ? typeof userId === "string" && userId ? { id: userId } : null
      : typeof userEmail === "string" && userEmail.trim() ? { email: userEmail.trim().toLowerCase() } : null;
    const target = where && await prisma.user.findUnique({ where, select: { id: true } });
    if (!target) return NextResponse.json({ error: "Target customer not found." }, { status: 404 });

    const approvalId = await requestAdminApproval(currentAdmin, {
      kind: "WALLET",
      input: {
        userId: target.id,
        type: adjustment && adjustmentType === "DEBIT" ? "DEBIT" : "CREDIT",
        amountBDT: roundedAmount,
        category: "MANUAL_ADJUSTMENT",
        reason: reason || "Manual Admin Deposit",
        reference: trxId || undefined,
        ledger: adjustment
          ? { type: "LEGACY_ADJUSTMENT", method: "ADMIN_MANUAL" }
          : { type: "DEPOSIT", method: method || "manual", senderNumber },
      },
    });
    return NextResponse.json({ success: true, pendingApproval: true, approvalId }, { status: 202 });
  } catch (error: any) {
    console.error("[Wallet Transactions POST Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to record transaction" }, { status: 500 });
  }
}
