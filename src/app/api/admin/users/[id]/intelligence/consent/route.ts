import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { recordUserConsent } from "@/lib/user-intelligence/user-intelligence-service";
import { getClientIp } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const currentUser = auth.user;
  const { id: userId } = await params;

  // Only self or an admin can record or revoke consent
  const isSelf = currentUser.id === userId;
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(currentUser.role || "");

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (!body.consentType || !body.status || !body.purpose) {
    return NextResponse.json(
      { error: "Missing required fields: consentType, status, purpose" },
      { status: 400 }
    );
  }

  const clientIp = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || undefined;

  const record = await recordUserConsent({
    userId,
    consentType: body.consentType,
    status: body.status,
    purpose: body.purpose,
    ipAddress: clientIp,
    userAgent,
    noticeVersion: body.noticeVersion || "2026.1",
  });

  return NextResponse.json({
    success: true,
    consent: record,
  });
}
