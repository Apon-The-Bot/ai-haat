import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "ALL"; // ALL, SUBSCRIBED, UNSUBSCRIBED, SUPPRESSED
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    // Fetch all users
    const userWhere: any = {};
    if (search.trim()) {
      userWhere.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, totalUsers, suppressions] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          emailContact: true,
          orders: {
            where: { paymentStatus: "VERIFIED" },
            select: { totalBDT: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where: userWhere }),
      prisma.emailSuppression.findMany({ select: { email: true, reason: true } }),
    ]);

    const suppressionMap = new Map(suppressions.map((s) => [s.email.toLowerCase().trim(), s.reason]));

    const contacts = users.map((u) => {
      const emailLower = u.email.toLowerCase().trim();
      const isSuppressed = suppressionMap.has(emailLower);
      const suppressionReason = suppressionMap.get(emailLower) || null;
      const orderCount = u.orders.length;
      const totalSpent = u.orders.reduce((sum, o) => sum + o.totalBDT, 0);
      const lastOrder = u.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      const contactRecord = u.emailContact;
      const isSubscribed = contactRecord ? contactRecord.isSubscribed : !isSuppressed;
      const promotionalConsent = contactRecord ? contactRecord.promotionalConsent : !isSuppressed;

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        isSubscribed,
        promotionalConsent,
        isSuppressed,
        suppressionReason,
        orderCount,
        totalSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt.toISOString().split("T")[0] : null,
        createdAt: u.createdAt,
      };
    });

    // Filter in-memory if specific status filter requested
    let filteredContacts = contacts;
    if (filter === "SUBSCRIBED") {
      filteredContacts = contacts.filter((c) => c.isSubscribed && !c.isSuppressed);
    } else if (filter === "UNSUBSCRIBED" || filter === "SUPPRESSED") {
      filteredContacts = contacts.filter((c) => !c.isSubscribed || c.isSuppressed);
    }

    return NextResponse.json({
      success: true,
      contacts: filteredContacts,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error: any) {
    console.error("[Contacts GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { email, name, phone, promotionalConsent, tags } = body;

    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email is required." }, { status: 400 });
    }

    const contact = await prisma.emailContact.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        name: name ? name.trim() : null,
        phone: phone ? phone.trim() : null,
        isSubscribed: true,
        promotionalConsent: promotionalConsent !== false,
        source: "MANUAL",
        tags: Array.isArray(tags) ? JSON.stringify(tags) : "[]",
      },
      update: {
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        isSubscribed: true,
        promotionalConsent: promotionalConsent !== false,
      },
    });

    // If previously in suppressions, remove from suppression on explicit manual opt-in
    await prisma.emailSuppression.deleteMany({
      where: { email: cleanEmail },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "CONTACT_CREATE",
      targetType: "EMAIL_CONTACT",
      targetId: contact.id,
      details: { email: contact.email, source: "MANUAL" },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    console.error("[Contacts POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to add contact" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { email, isSubscribed, promotionalConsent } = body;

    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const contact = await prisma.emailContact.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        isSubscribed: Boolean(isSubscribed),
        promotionalConsent: Boolean(promotionalConsent),
        source: "ADMIN_TOGGLE",
      },
      update: {
        isSubscribed: isSubscribed !== undefined ? Boolean(isSubscribed) : undefined,
        promotionalConsent: promotionalConsent !== undefined ? Boolean(promotionalConsent) : undefined,
      },
    });

    if (!isSubscribed) {
      await prisma.emailSuppression.upsert({
        where: { email: cleanEmail },
        create: {
          email: cleanEmail,
          reason: "UNSUBSCRIBED",
          source: "ADMIN_MANUAL",
          details: "Opted out by Administrator",
        },
        update: {},
      });
    } else {
      await prisma.emailSuppression.deleteMany({
        where: { email: cleanEmail },
      });
    }

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "CONTACT_STATUS_UPDATE",
      targetType: "EMAIL_CONTACT",
      targetId: contact.id,
      details: { email: cleanEmail, isSubscribed, promotionalConsent },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    console.error("[Contacts PATCH Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update contact status" },
      { status: 500 }
    );
  }
}