import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { setUserStatus, AccountStatus } from "@/lib/user-control/user-control-service";

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
    const { status, reason, internalNote, durationHours } = body;

    const validStatuses: AccountStatus[] = [
      "ACTIVE",
      "SUSPENDED",
      "BANNED",
      "RESTRICTED",
      "PENDING_VERIFICATION",
      "DEACTIVATED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "A mandatory reason must be provided for status modification." }, { status: 400 });
    }

    // Step-Up check for permanent ban
    if (status === "BANNED") {
      const stepUp = await requireRecentMfa(10);
      if (stepUp instanceof NextResponse) return stepUp;
    }

    const result = await setUserStatus({
      userId,
      status,
      reason: reason.trim(),
      internalNote: internalNote ? internalNote.trim() : undefined,
      durationHours: durationHours ? parseInt(durationHours, 10) : undefined,
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
    });

    return NextResponse.json({
      success: true,
      message: `Customer account status updated to ${status}.`,
      status: result.status,
    });
  } catch (err: any) {
    console.error("[Admin User Status POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update account status" }, { status: 500 });
  }
}
