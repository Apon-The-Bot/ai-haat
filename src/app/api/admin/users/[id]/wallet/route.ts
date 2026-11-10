import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { adjustUserWalletBalance } from "@/lib/user-control/user-control-service";

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

    const numericAmount = parseFloat(amountBDT);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number greater than 0" }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "A mandatory financial audit reason must be provided" }, { status: 400 });
    }

    // High-value adjustments (> 1000 BDT) require recent Step-Up MFA verification
    if (numericAmount >= 1000) {
      const stepUp = await requireRecentMfa(5);
      if (stepUp instanceof NextResponse) return stepUp;
    }

    const validCategories = ["BONUS", "MANUAL_ADJUSTMENT", "REFUND", "PENALTY", "CORRECTION"];
    const chosenCategory = validCategories.includes(category) ? category : "MANUAL_ADJUSTMENT";

    const result = await adjustUserWalletBalance({
      userId,
      type,
      amountBDT: numericAmount,
      category: chosenCategory,
      reason: reason.trim(),
      reference,
      internalNote,
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
    });

    return NextResponse.json({
      success: true,
      message: `Wallet ${type === "CREDIT" ? "credited" : "debited"} successfully.`,
      result,
    });
  } catch (err: any) {
    console.error("[Admin User Wallet Adjustment Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to adjust wallet balance" }, { status: 400 });
  }
}
