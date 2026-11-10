import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { getUserIntelligenceProfile } from "@/lib/user-intelligence/user-intelligence-service";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const currentAdmin = auth.user;
  const role = currentAdmin.role || "ADMIN";

  const { id: userId } = await params;

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Assemble full intelligence profile with role-based redactions
  const intelligence = await getUserIntelligenceProfile(userId, role);

  // Log administrative audit for accessing customer technical intelligence
  await logAdminAudit({
    actorId: currentAdmin.id,
    actorEmail: currentAdmin.email || "admin@aihaat.shop",
    action: "VIEW_USER_INTELLIGENCE",
    targetType: "USER",
    targetId: userId,
    details: {
      viewedSections: ["DEVICES", "IP_NETWORK", "GEOLOCATION", "SESSIONS", "PERFORMANCE", "PRIVACY"],
      role,
    },
  }).catch(() => {}); // Non-blocking

  return NextResponse.json({
    success: true,
    user: targetUser,
    intelligence,
  });
}
