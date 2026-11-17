import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { requestAdminApproval } from "@/lib/admin-approvals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { type, amountBDT, category, reason, reference, internalNote } = body;

    if (!type || !["CREDIT", "DEBIT"].includes(type)) {
      return NextResponse.json({ error: "Invalid type. Must be 'CREDIT' or 'DEBIT'" }, { status: 400 });
    }

    const numericAmount = typeof amountBDT === "number" || typeof amountBDT === "string" ? Number(amountBDT) : NaN;
    if (!Number.isFinite(numericAmount) || numericAmount < 0.01 || numericAmount > Number.MAX_SAFE_INTEGER / 100) {
      return NextResponse.json({ error: "Amount must be a positive number greater than 0" }, { status: 400 });
    }

    if (typeof reason !== "string" || !reason.trim() || reason.length > 1000 ||
      (reference != null && (typeof reference !== "string" || reference.length > 191)) ||
      (internalNote != null && (typeof internalNote !== "string" || internalNote.length > 2000))) {
      return NextResponse.json({ error: "A mandatory financial audit reason must be provided" }, { status: 400 });
    }

    // High-value adjustments (> 1000 BDT) require recent Step-Up MFA verification
    const roundedAmount = Math.round(numericAmount * 100) / 100;
    if (roundedAmount >= 1000) {
      const stepUp = await requireRecentMfa(5);
      if (stepUp instanceof NextResponse) return stepUp;
    }

    const chosenCategory = category === "BONUS" || category === "REFUND" ||
      category === "PENALTY" || category === "CORRECTION" ? category : "MANUAL_ADJUSTMENT";
    if (!await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })) {
      return NextResponse.json({ error: "Target customer not found." }, { status: 404 });
    }

    const approvalId = await requestAdminApproval(currentAdmin, {
      kind: "WALLET",
      input: { userId, type, amountBDT: roundedAmount, category: chosenCategory,
        reason: reason.trim(), reference, internalNote },
    });

    return NextResponse.json({
      success: true,
      pendingApproval: true,
      approvalId,
    }, { status: 202 });
  } catch (err: any) {
    console.error("[Admin User Wallet Adjustment Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to adjust wallet balance" }, { status: 400 });
  }
}
