import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isUserAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMfaSessionFromCookieStore } from "@/lib/mfa/session";
import { getLocalUserByEmail, upsertLocalUser } from "@/lib/wallet-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let email: string | null = null;

    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      email = session.user.email;
    }

    if (!email) {
      const url = new URL(req.url);
      email = url.searchParams.get("email");
    }

    if (!email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = isUserAdmin(cleanEmail);

    let dbUser = null;
    let totpEnabled = false;
    let mfaVerified = false;

    try {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            { email: email.trim() },
          ],
        },
        include: {
          security: true,
        },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: email.split("@")[0],
            role: isAdmin ? "ADMIN" : "USER",
            walletBalanceBDT: 0,
          },
          include: {
            security: true,
          },
        });
      } else if (isAdmin && dbUser.role !== "ADMIN") {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: "ADMIN" },
          include: { security: true },
        });
      }

      totpEnabled = dbUser.security?.totpEnabled ?? false;
      const mfaSession = await getMfaSessionFromCookieStore(dbUser.id);
      mfaVerified = !!(mfaSession && mfaSession.userId === dbUser.id && mfaSession.verifiedAt);
    } catch (dbErr) {
      console.warn("[Prisma /api/auth/me fallback to local]:", dbErr);
    }

    const effectiveRole = isAdmin ? "ADMIN" : (dbUser?.role || "USER");
    const walletBalance = dbUser?.walletBalanceBDT ?? (getLocalUserByEmail(cleanEmail)?.walletBalanceBDT || 0);

    // Keep local cache synced
    upsertLocalUser({
      id: dbUser?.id || `user-${cleanEmail}`,
      name: dbUser?.name || cleanEmail.split("@")[0],
      email: cleanEmail,
      role: effectiveRole as any,
      walletBalanceBDT: walletBalance,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser?.id || `user-${cleanEmail}`,
        name: dbUser?.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        avatar: dbUser?.image,
        phone: dbUser?.phone || "",
        role: effectiveRole,
        walletBalanceBDT: walletBalance,
      },
      totpEnabled,
      mfaRequired: totpEnabled,
      mfaVerified: totpEnabled ? mfaVerified : true,
    });
  } catch (error: any) {
    console.error("[Auth /api/auth/me Fatal Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
