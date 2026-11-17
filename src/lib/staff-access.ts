import { NextResponse } from "next/server";
import { requireAdminMfa, requireMfaVerified } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getUserEffectiveStatus } from "@/lib/user-control/user-control-service";
import { hasStaffGrant, staffGrantKey, staffRoles, type StaffRole } from "@/lib/staff-roles";

export const staffAuditTarget = "STAFF_ACCESS";
export const staffRequestPrefix = "staff_access_request:";

export async function requireTeamAdmin() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const actor = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { role: true },
  });
  return actor?.role === "ADMIN"
    ? auth
    : NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function requireStaffAccess(role?: StaffRole) {
  const auth = await requireMfaVerified();
  if (auth instanceof NextResponse) return auth;
  if (auth.mfaSession.mfaLevel !== "MFA_VERIFIED") {
    return NextResponse.json({ error: "Verified MFA is required" }, { status: 403 });
  }
  const scopes = role ? [role] : staffRoles;
  const [actor, grants, status] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.user.id }, select: { role: true } }),
    prisma.siteSetting.findMany({ where: { key: { in: scopes.map((scope) => staffGrantKey(auth.user.id, scope)) } } }),
    getUserEffectiveStatus(auth.user.id),
  ]);
  if (status.status !== "BANNED" && status.status !== "SUSPENDED") {
    const roles = actor?.role === "ADMIN" && auth.user.role === "ADMIN"
      ? scopes
      : actor?.role === "USER"
        ? scopes.filter((scope) => grants.some((grant) =>
          grant.key === staffGrantKey(auth.user.id, scope) && hasStaffGrant(grant.value, scope)))
        : [];
    if (roles.length) return { ...auth, roles };
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export const requireStaffAuditor = () => requireStaffAccess("AUDITOR");
