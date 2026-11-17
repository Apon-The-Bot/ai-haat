import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { requestAdminApproval } from "@/lib/admin-approvals";

/**
 * POST: Create a new user account administratively
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const body = await req.json();
    const { name, email, phone, role = "USER", initialWalletBDT = 0, tags } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "A user with this email address already exists" }, { status: 409 });
    }

    // Role Promotion Step-up Check
    if (role === "ADMIN") {
      const stepUp = await requireRecentMfa(10);
      if (stepUp instanceof NextResponse) return stepUp;
    }

    const initialCredit = typeof initialWalletBDT === "number" || typeof initialWalletBDT === "string"
      ? Number(initialWalletBDT) : NaN;
    if (!Number.isFinite(initialCredit) || initialCredit < 0 || initialCredit > Number.MAX_SAFE_INTEGER / 100 ||
      (initialCredit > 0 && initialCredit < 0.01)) {
      return NextResponse.json({ error: "Invalid initial wallet balance." }, { status: 400 });
    }
    const roundedCredit = Math.round(initialCredit * 100) / 100;
    if (roundedCredit >= 1000) {
      const stepUp = await requireRecentMfa(5);
      if (stepUp instanceof NextResponse) return stepUp;
    }

    const { newUser, approvalId } = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: name ? name.trim() : null,
          email: cleanEmail,
          phone: phone ? phone.trim() : null,
          role: role || "USER",
          walletBalanceBDT: 0,
        },
      });

      const approvalId = roundedCredit > 0 ? await requestAdminApproval(currentAdmin, {
        kind: "WALLET",
        input: { userId: created.id, type: "CREDIT", amountBDT: roundedCredit, category: "BONUS",
          reason: "Initial wallet credit requested during account creation",
          ledger: { type: "INITIAL_CREDIT", method: "ADMIN_INITIAL_CREDIT" } },
      }, tx) : undefined;

      // Assign initial tags if provided
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tag of tags) {
          if (typeof tag === "string" && tag.trim()) {
            await tx.userTag.create({
              data: {
                userId: created.id,
                tag: tag.trim().toUpperCase(),
                assignedById: currentAdmin.id,
              },
            });
          }
        }
      }

      // Log admin audit
      await tx.adminAuditLog.create({
        data: {
          actorId: currentAdmin.id,
          actorEmail: currentAdmin.email,
          action: "USER_CREATED",
          targetType: "USER",
          targetId: created.id,
          details: JSON.stringify({
            email: created.email,
            name: created.name,
            role: created.role,
            initialWalletBDT,
          }),
        },
      });

      // Log user activity
      await tx.userActivityLog.create({
        data: {
          userId: created.id,
          eventType: "ACCOUNT_CREATED_BY_ADMIN",
          category: "ADMIN",
          description: `Account created by administrator (${currentAdmin.email}).`,
        },
      });

      return { newUser: created, approvalId };
    }, { isolationLevel: "Serializable" });

    return NextResponse.json({
      success: true,
      message: "Customer account created successfully",
      pendingApproval: !!approvalId,
      approvalId,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        walletBalanceBDT: newUser.walletBalanceBDT,
      },
    });
  } catch (err: any) {
    console.error("[Admin Users POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}
