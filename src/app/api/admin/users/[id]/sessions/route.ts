import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revokeAllUserSessions } from "@/lib/user-control/user-control-service";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: userId } = await params;
    const [sessions, mfaSessions, trustedDevices] = await Promise.all([
      prisma.session.findMany({
        where: { userId },
        orderBy: { expires: "desc" },
      }),
      prisma.mfaSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.trustedDevice.findMany({
        where: { userId },
        orderBy: { lastUsedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s.id,
        expires: s.expires.toISOString(),
        isExpired: new Date() > s.expires,
      })),
      mfaSessions: mfaSessions.map((ms) => ({
        id: ms.id,
        mfaLevel: ms.mfaLevel,
        verifiedAt: ms.verifiedAt.toISOString(),
        createdAt: ms.createdAt.toISOString(),
      })),
      trustedDevices: trustedDevices.map((td) => ({
        id: td.id,
        label: td.label || "Browser Device",
        lastUsedAt: td.lastUsedAt.toISOString(),
        expiresAt: td.expiresAt.toISOString(),
        isRevoked: Boolean(td.revokedAt),
        createdAt: td.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("[Admin User Sessions GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load sessions" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Revoke single session
      await prisma.session.deleteMany({ where: { id: sessionId, userId } });
      await logAdminAudit({
        actorId: currentAdmin.id,
        actorEmail: currentAdmin.email,
        action: "USER_SESSION_REVOKED",
        targetType: "USER",
        targetId: userId,
        details: { sessionId },
      });
      return NextResponse.json({ success: true, message: "Session revoked successfully" });
    }

    // Revoke all sessions
    const res = await revokeAllUserSessions(userId, currentAdmin.id, currentAdmin.email);
    return NextResponse.json({
      success: true,
      message: `All ${res.count} active sessions revoked successfully.`,
    });
  } catch (err: any) {
    console.error("[Admin User Sessions DELETE Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to revoke sessions" }, { status: 500 });
  }
}
