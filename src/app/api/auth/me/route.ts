import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMfaSessionFromCookieStore } from "@/lib/mfa/session";
import { getLocalUserByEmail, upsertLocalUser } from "@/lib/wallet-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const cleanEmail = email.trim().toLowerCase();

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
            name: session?.user?.name || email.split("@")[0],
            image: session?.user?.image || null,
            role: "USER",
            walletBalanceBDT: 0,
          },
          include: {
            security: true,
          },
        });
      } else {
        const updateData: any = {};
        if (session?.user?.image && dbUser.image !== session.user.image) {
          updateData.image = session.user.image;
        }
        if (session?.user?.name && !dbUser.name) {
          updateData.name = session.user.name;
        }
        if (Object.keys(updateData).length > 0) {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: updateData,
            include: { security: true },
          });
        }
      }

      totpEnabled = dbUser.security?.totpEnabled ?? false;
      const mfaSession = await getMfaSessionFromCookieStore(dbUser.id);
      mfaVerified = !!(mfaSession && mfaSession.userId === dbUser.id && mfaSession.verifiedAt);
    } catch (dbErr) {
      console.warn("[Prisma /api/auth/me] Account lookup failed");
    }

    const effectiveRole = dbUser?.role || "USER";
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
    console.error("[Auth /api/auth/me] Request failed");
    return NextResponse.json({ success: false, error: "Unable to load account" }, { status: 500 });
  }
}
