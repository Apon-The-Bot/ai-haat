import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("[Template GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch template" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, description, category, subject, contentHtml, thumbnail, duplicate } = body;

    const existing = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    // Handle duplication
    if (duplicate) {
      const cloned = await prisma.emailTemplate.create({
        data: {
          name: `${existing.name} (Copy)`,
          description: existing.description,
          category: existing.category,
          subject: existing.subject,
          contentHtml: existing.contentHtml,
          thumbnail: existing.thumbnail,
          isDefault: false,
        },
      });

      await logAdminAudit({
        actorId: auth.user.id,
        actorEmail: auth.user.email,
        action: "TEMPLATE_DUPLICATE",
        targetType: "EMAIL_TEMPLATE",
        targetId: cloned.id,
        details: { originalId: existing.id, newName: cloned.name },
      });

      return NextResponse.json({ success: true, template: cloned });
    }

    const updated = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description?.trim() : undefined,
        category: category !== undefined ? category : undefined,
        subject: subject !== undefined ? subject?.trim() : undefined,
        contentHtml: contentHtml !== undefined ? contentHtml : undefined,
        thumbnail: thumbnail !== undefined ? thumbnail : undefined,
      },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "TEMPLATE_UPDATE",
      targetType: "EMAIL_TEMPLATE",
      targetId: updated.id,
      details: { name: updated.name },
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (error: any) {
    console.error("[Template PATCH Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const existing = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    await prisma.emailTemplate.delete({
      where: { id: params.id },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "TEMPLATE_DELETE",
      targetType: "EMAIL_TEMPLATE",
      targetId: params.id,
      details: { name: existing.name },
    });

    return NextResponse.json({ success: true, message: "Template deleted successfully." });
  } catch (error: any) {
    console.error("[Template DELETE Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}