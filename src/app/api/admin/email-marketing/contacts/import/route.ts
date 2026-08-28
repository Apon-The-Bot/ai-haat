import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { contacts, tags } = body; // contacts: Array<{ email: string; name?: string; phone?: string; tags?: string[] }>

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a non-empty array of contacts to import." },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const c of contacts) {
      const cleanEmail = c.email?.trim().toLowerCase();
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        skippedCount++;
        continue;
      }

      const assignedTags = Array.isArray(c.tags)
        ? c.tags
        : Array.isArray(tags)
        ? tags
        : [];

      await prisma.emailContact.upsert({
        where: { email: cleanEmail },
        update: {
          name: c.name?.trim() || undefined,
          phone: c.phone?.trim() || undefined,
          tags: assignedTags.length > 0 ? JSON.stringify(assignedTags) : undefined,
          isSubscribed: true,
          promotionalConsent: true,
        },
        create: {
          email: cleanEmail,
          name: c.name?.trim() || null,
          phone: c.phone?.trim() || null,
          tags: assignedTags.length > 0 ? JSON.stringify(assignedTags) : "[]",
          source: "ADMIN_IMPORT",
          isSubscribed: true,
          promotionalConsent: true,
        },
      });

      importedCount++;
    }

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "CONTACTS_IMPORT",
      targetType: "EMAIL_CONTACTS",
      details: { importedCount, skippedCount },
    });

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      message: `Successfully processed ${importedCount} contact(s). ${skippedCount} invalid entries skipped.`,
    });
  } catch (error: any) {
    console.error("[Contacts Import Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to import contacts" },
      { status: 500 }
    );
  }
}