import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const reason = searchParams.get("reason") || "ALL";

    const where: any = {};
    if (reason !== "ALL") {
      where.reason = reason;
    }
    if (search.trim()) {
      where.email = { contains: search.trim() };
    }

    const suppressions = await prisma.emailSuppression.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, suppressions });
  } catch (error: any) {
    console.error("[Suppressions GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch suppressions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { email, reason, details } = body;

    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email is required." }, { status: 400 });
    }

    const suppression = await prisma.emailSuppression.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        reason: reason || "MANUAL",
        source: "ADMIN_MANUAL",
        details: details || "Added manually by administrator",
      },
      update: {
        reason: reason || "MANUAL",
        details: details || "Updated by administrator",
      },
    });

    // Also update EmailContact if exists
    await prisma.emailContact.updateMany({
      where: { email: cleanEmail },
      data: { isSubscribed: false, promotionalConsent: false },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "SUPPRESSION_CREATE",
      targetType: "EMAIL_SUPPRESSION",
      targetId: suppression.id,
      details: { email: cleanEmail, reason: suppression.reason },
    });

    return NextResponse.json({ success: true, suppression });
  } catch (error: any) {
    console.error("[Suppressions POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to add suppression" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email parameter is required." }, { status: 400 });
    }

    await prisma.emailSuppression.deleteMany({
      where: { email },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "SUPPRESSION_DELETE",
      targetType: "EMAIL_SUPPRESSION",
      details: { email },
    });

    return NextResponse.json({ success: true, message: `Removed ${email} from suppression list.` });
  } catch (error: any) {
    console.error("[Suppressions DELETE Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete suppression" },
      { status: 500 }
    );
  }
}