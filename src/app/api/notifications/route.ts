import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    const formatted = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      link: n.link || "/dashboard",
      date: n.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: n.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      notifications: formatted,
      unreadCount,
    });
  } catch (error: any) {
    console.error("[Notifications GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { id, all } = body;

    const now = new Date();

    if (all) {
      const result = await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true, readAt: now },
      });
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
        updatedCount: result.count,
      });
    }

    if (id) {
      // IDOR Protected: User can only update their own notification
      const result = await prisma.notification.updateMany({
        where: { id, userId: user.id },
        data: { isRead: true, readAt: now },
      });

      if (result.count === 0) {
        return NextResponse.json({ success: false, error: "Notification not found or unauthorized." }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ error: "Missing id or all parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("[Notifications PATCH Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
