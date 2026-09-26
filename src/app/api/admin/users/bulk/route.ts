import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { sanitizeCsvValue } from "@/lib/analytics/business-intelligence";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const body = await req.json();
    const { action, userIds, role } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "userIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Deduplicate IDs
    const targetIds = Array.from(new Set(userIds.filter((id) => typeof id === "string" && id.trim().length > 0)));
    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid user IDs provided" },
        { status: 400 }
      );
    }

    // 1. UPDATE ROLE ACTION
    if (action === "UPDATE_ROLE") {
      const validRoles: Role[] = ["USER", "ADMIN", "RESELLER"];
      if (!role || !validRoles.includes(role as Role)) {
        return NextResponse.json(
          { success: false, error: `Invalid role specified. Must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }

      // Security check: Promoting users to ADMIN requires recent MFA verification (Step-Up)
      if (role === "ADMIN") {
        const stepUp = await requireRecentMfa(10);
        if (stepUp instanceof NextResponse) return stepUp;
      }

      // If demoting (not ADMIN), check if current admin is in list and would leave no active admins
      if (role !== "ADMIN" && targetIds.includes(currentAdmin.id)) {
        const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
        if (totalAdmins <= 1) {
          return NextResponse.json(
            { success: false, error: "Cannot demote yourself as the only active Administrator." },
            { status: 400 }
          );
        }
      }

      // Fetch target users to log accurate audits
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: targetIds } },
        select: { id: true, email: true, role: true },
      });

      if (existingUsers.length === 0) {
        return NextResponse.json(
          { success: false, error: "No matching users found to update" },
          { status: 404 }
        );
      }

      // Filter to users whose roles actually change
      const usersToUpdate = existingUsers.filter((u) => u.role !== role);

      if (usersToUpdate.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: usersToUpdate.map((u) => u.id) } },
          data: { role: role as Role },
        });

        // Audit log each role modification
        for (const u of usersToUpdate) {
          await logAdminAudit({
            actorId: currentAdmin.id,
            actorEmail: currentAdmin.email,
            action: role === "ADMIN" ? "ROLE_PROMOTED" : "ROLE_DEMOTED",
            targetType: "USER",
            targetId: u.id,
            details: {
              targetEmail: u.email,
              previousRole: u.role,
              newRole: role,
              bulk: true,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${usersToUpdate.length} user(s) to ${role}.`,
        affectedCount: usersToUpdate.length,
      });
    }

    // 2. EXPORT CSV ACTION
    if (action === "EXPORT_CSV") {
      const users = await prisma.user.findMany({
        where: { id: { in: targetIds } },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          walletBalanceBDT: true,
          role: true,
          createdAt: true,
          orders: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const headers = ["Name", "Email", "Phone", "Wallet Balance (BDT)", "Total Orders", "Role", "Join Date"];
      const rows = users.map((u) => [
        sanitizeCsvValue(u.name || "Customer"),
        sanitizeCsvValue(u.email),
        sanitizeCsvValue(u.phone || "N/A"),
        u.walletBalanceBDT || 0,
        u.orders.length,
        sanitizeCsvValue(u.role),
        sanitizeCsvValue(u.createdAt.toISOString().split("T")[0]),
      ]);

      const csvData = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const filename = `AI_Haat_Customers_${new Date().toISOString().split("T")[0]}.csv`;

      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported actions: 'UPDATE_ROLE', 'EXPORT_CSV'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Admin Users Bulk Action Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute bulk action" },
      { status: 500 }
    );
  }
}
