import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalUserByEmail, upsertLocalUser } from "@/lib/wallet-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");

    let email = emailParam;
    if (!email) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        email = session.user.email;
      }
    }

    if (!email) {
      return NextResponse.json({ success: false, user: null });
    }

    const cleanEmail = email.trim().toLowerCase();

    let lastDbError = null;
    // 1. Try Prisma MySQL Database
    try {
      let dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            { email: email.trim() },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          role: true,
          walletBalanceBDT: true,
          createdAt: true,
        },
      });

      if (!dbUser) {
        const isAdmin =
          cleanEmail === "mdamanullahsheikhapon@gmail.com" ||
          cleanEmail === "admin@aihaat.com";

        dbUser = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: email.split("@")[0],
            role: isAdmin ? "ADMIN" : "USER",
            walletBalanceBDT: 0,
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            role: true,
            walletBalanceBDT: true,
            createdAt: true,
          },
        });
      }

      if (dbUser) {
        // Also keep local fallback synced
        upsertLocalUser({
          id: dbUser.id,
          name: dbUser.name || "",
          email: dbUser.email,
          phone: dbUser.phone || "",
          avatar: dbUser.image || undefined,
          role: dbUser.role as any,
          walletBalanceBDT: dbUser.walletBalanceBDT || 0,
        });

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
        });
      }
    } catch (dbErr: any) {
      lastDbError = dbErr?.message || String(dbErr);
      console.warn("[Prisma /api/auth/me fallback to JSON]:", dbErr);
    }

    // 2. Seamless Fallback to Local JSON Storage if DB is unreachable
    let localUser = getLocalUserByEmail(cleanEmail);
    if (!localUser) {
      localUser = upsertLocalUser({
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        avatar: localUser.avatar,
        phone: localUser.phone || "",
        role: localUser.role,
        walletBalanceBDT: localUser.walletBalanceBDT || 0,
      },
      _dbError: lastDbError,
    });
  } catch (error: any) {
    console.error("[Auth /api/auth/me Fatal Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
