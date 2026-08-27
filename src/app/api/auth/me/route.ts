import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
      return NextResponse.json({ success: false, user: null });
    }

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
  } catch (error: any) {
    console.error("[Auth /api/auth/me Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
