import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { ensureDefaultTemplates } from "@/lib/email-marketing/template-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "ALL";

    // Auto-seed default templates if none exist
    await ensureDefaultTemplates(prisma);

    const where: any = {};
    if (category !== "ALL") {
      where.category = category;
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error("[Templates GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, description, category, subject, contentHtml, thumbnail } = body;

    if (!name?.trim() || !contentHtml?.trim()) {
      return NextResponse.json(
        { success: false, error: "Template name and HTML content are required." },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        category: category || "CUSTOM",
        subject: subject ? subject.trim() : null,
        contentHtml,
        thumbnail: thumbnail || null,
        isDefault: false,
      },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "TEMPLATE_CREATE",
      targetType: "EMAIL_TEMPLATE",
      targetId: template.id,
      details: { name: template.name, category: template.category },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("[Templates POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create template" },
      { status: 500 }
    );
  }
}