import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { sanitizeCsvValue } from "@/lib/analytics/business-intelligence";
import { Role } from "@prisma/client";
import {
  setUserStatus,
  setFeatureRestriction,
  setUserTags,
  AccountStatus,
} from "@/lib/user-control/user-control-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const body = await req.json();
    const { action, userIds, role, status, reason, featureKey, tag, tags } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "userIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    const targetIds = Array.from(new Set(userIds.filter((id) => typeof id === "string" && id.trim().length > 0)));
    if (targetIds.length === 0) {
      return NextResponse.json({ success: false, error: "No valid user IDs provided" }, { status: 400 });
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

      if (role === "ADMIN") {
        const stepUp = await requireRecentMfa(10);
        if (stepUp instanceof NextResponse) return stepUp;
      }

      const existingUsers = await prisma.user.findMany({
        where: { id: { in: targetIds } },
        select: { id: true, email: true, role: true },
      });

      const usersToUpdate = existingUsers.filter((u) => u.role !== role);
      if (usersToUpdate.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: usersToUpdate.map((u) => u.id) } },
          data: { role: role as Role },
        });

        for (const u of usersToUpdate) {
          await logAdminAudit({
            actorId: currentAdmin.id,
            actorEmail: currentAdmin.email,
            action: role === "ADMIN" ? "ROLE_PROMOTED" : "ROLE_DEMOTED",
            targetType: "USER",
            targetId: u.id,
            details: { previousRole: u.role, newRole: role, bulk: true },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${usersToUpdate.length} user(s) to ${role}.`,
        affectedCount: usersToUpdate.length,
      });
    }

    // 2. BULK SET STATUS (SUSPEND, BAN, RESTORE)
    if (action === "SET_STATUS") {
      const validStatuses: AccountStatus[] = ["ACTIVE", "SUSPENDED", "BANNED", "RESTRICTED"];
      if (!status || !validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }

      if (status === "BANNED") {
        const stepUp = await requireRecentMfa(10);
        if (stepUp instanceof NextResponse) return stepUp;
      }

      let successCount = 0;
      for (const id of targetIds) {
        try {
          await setUserStatus({
            userId: id,
            status,
            reason: reason || "Bulk administrative status change",
            adminId: currentAdmin.id,
            adminEmail: currentAdmin.email,
          });
          successCount++;
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: `Successfully set status to ${status} for ${successCount} user(s).`,
        affectedCount: successCount,
      });
    }

    // 3. BULK APPLY FEATURE RESTRICTION
    if (action === "APPLY_RESTRICTION") {
      if (!featureKey) {
        return NextResponse.json({ success: false, error: "featureKey is required" }, { status: 400 });
      }

      let count = 0;
      for (const id of targetIds) {
        try {
          await setFeatureRestriction({
            userId: id,
            featureKey,
            isRestricted: true,
            reason: reason || "Bulk administrative restriction",
            adminId: currentAdmin.id,
            adminEmail: currentAdmin.email,
          });
          count++;
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: `Successfully restricted ${featureKey} for ${count} user(s).`,
        affectedCount: count,
      });
    }

    // 4. BULK REMOVE FEATURE RESTRICTION
    if (action === "REMOVE_RESTRICTION") {
      if (!featureKey) {
        return NextResponse.json({ success: false, error: "featureKey is required" }, { status: 400 });
      }

      await prisma.userRestriction.updateMany({
        where: { userId: { in: targetIds }, featureKey },
        data: { isRestricted: false },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully removed restriction on ${featureKey} for selected user(s).`,
      });
    }

    // 5. BULK ASSIGN TAGS
    if (action === "ASSIGN_TAG") {
      const tagToAssign = tag || (Array.isArray(tags) ? tags[0] : null);
      if (!tagToAssign || typeof tagToAssign !== "string") {
        return NextResponse.json({ success: false, error: "tag string is required" }, { status: 400 });
      }

      const cleanTag = tagToAssign.trim().toUpperCase();
      let added = 0;
      for (const id of targetIds) {
        try {
          await prisma.userTag.upsert({
            where: { userId_tag: { userId: id, tag: cleanTag } },
            create: { userId: id, tag: cleanTag, assignedById: currentAdmin.id },
            update: {},
          });
          added++;
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: `Successfully assigned tag '${cleanTag}' to ${added} user(s).`,
        affectedCount: added,
      });
    }

    // 6. EXPORT CSV ACTION
    if (action === "EXPORT_CSV") {
      const users = await prisma.user.findMany({
        where: { id: { in: targetIds } },
        include: {
          orders: { select: { id: true, totalBDT: true, paymentStatus: true } },
          statusRecords: { where: { isActive: true }, take: 1 },
          restrictions: { where: { isRestricted: true }, select: { featureKey: true } },
          userTags: { select: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const headers = [
        "User ID",
        "Name",
        "Email",
        "Phone",
        "Role",
        "Status",
        "Wallet Balance (BDT)",
        "Lifetime Spend (BDT)",
        "Total Orders",
        "Tags",
        "Restrictions Count",
        "Join Date",
      ];

      const rows = users.map((u) => {
        const verifiedSpend = u.orders
          .filter((o) => o.paymentStatus === "VERIFIED")
          .reduce((sum, o) => sum + (o.totalBDT || 0), 0);

        return [
          sanitizeCsvValue(u.id),
          sanitizeCsvValue(u.name || "Customer"),
          sanitizeCsvValue(u.email),
          sanitizeCsvValue(u.phone || "N/A"),
          sanitizeCsvValue(u.role),
          sanitizeCsvValue(u.statusRecords[0]?.status || "ACTIVE"),
          u.walletBalanceBDT || 0,
          verifiedSpend,
          u.orders.length,
          sanitizeCsvValue(u.userTags.map((t) => t.tag).join("; ")),
          u.restrictions.length,
          sanitizeCsvValue(u.createdAt.toISOString().split("T")[0]),
        ];
      });

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
      {
        success: false,
        error: "Invalid action. Supported: 'UPDATE_ROLE', 'SET_STATUS', 'APPLY_RESTRICTION', 'REMOVE_RESTRICTION', 'ASSIGN_TAG', 'EXPORT_CSV'",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Admin Users Bulk Action Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to execute bulk action" }, { status: 500 });
  }
}
