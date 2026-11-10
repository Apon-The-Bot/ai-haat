import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addAdminNote } from "@/lib/user-control/user-control-service";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: userId } = await params;
    const notes = await prisma.userAdminNote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      notes: notes.map((n) => ({
        id: n.id,
        note: n.note,
        category: n.category,
        adminEmail: n.adminEmail,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("[Admin User Notes GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { note, category = "GENERAL" } = body;

    if (!note || !note.trim()) {
      return NextResponse.json({ error: "Note content cannot be empty" }, { status: 400 });
    }

    const created = await addAdminNote({
      userId,
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      note: note.trim(),
      category: category.trim().toUpperCase(),
    });

    await logAdminAudit({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: "USER_ADMIN_NOTE_ADDED",
      targetType: "USER",
      targetId: userId,
      details: { noteId: created.id, category: created.category },
    });

    return NextResponse.json({
      success: true,
      message: "Internal administrative note saved.",
      note: {
        id: created.id,
        note: created.note,
        category: created.category,
        adminEmail: created.adminEmail,
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[Admin User Notes POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to save note" }, { status: 500 });
  }
}
