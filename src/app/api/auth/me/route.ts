import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMfaSessionFromCookieStore } from "@/lib/mfa/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const cleanEmail = email.trim().toLowerCase();

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { email: email.trim() },
        ],
      },
      include: {
        security: true,
      }
    });

    if (!dbUser) {
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
      const isAdmin = adminEmails.includes(cleanEmail);

      dbUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: email.split("@")[0],
          role: isAdmin ? "ADMIN" : "USER",
          walletBalanceBDT: 0,
        },
        include: {
          security: true,
        }
      });
    }

    const totpEnabled = dbUser.security?.totpEnabled ?? false;
    const mfaRequired = dbUser.role === 'ADMIN' || totpEnabled;
    const mfaSession = await getMfaSessionFromCookieStore(dbUser.id);
    const mfaVerified = !!(mfaSession && mfaSession.userId === dbUser.id && mfaSession.verifiedAt);

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatar: dbUser.image,
        phone: dbUser.phone || "",
        role: dbUser.role,
        walletBalanceBDT: dbUser.walletBalanceBDT || 0,
      },
      totpEnabled,
      mfaRequired,
      mfaVerified
    });
  } catch (error: any) {
    console.error("[Auth /api/auth/me Fatal Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
