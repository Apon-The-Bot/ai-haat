import { requireAdmin, requireAdminMfa, requireRecentMfa } from '@/lib/auth-guard';
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

let pipraPrisma: PrismaClient | null = null;
if (process.env.PIPRAPAY_DATABASE_URL) {
  pipraPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.PIPRAPAY_DATABASE_URL,
      },
    },
  });
}

const DEFAULT_METHODS = [
  {
    slug: "bkash-personal",
    name: "bKash Personal",
    display: "bKash",
    logo: "/images/payments/bkash.svg",
    isActive: true,
    mobileNumber: "01712345678",
  },
  {
    slug: "nagad-personal",
    name: "Nagad Personal",
    display: "Nagad",
    logo: "/images/payments/nagad.svg",
    isActive: true,
    mobileNumber: "01712345678",
  },
  {
    slug: "rocket-personal",
    name: "Rocket Personal",
    display: "Rocket",
    logo: "/images/payments/rocket.svg",
    isActive: true,
    mobileNumber: "01712345678",
  },
  {
    slug: "upay-personal",
    name: "Upay Personal",
    display: "Upay",
    logo: "/images/payments/upay.svg",
    isActive: false,
    mobileNumber: "01712345678",
  },
];

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  // 1. If PipraPay DB is configured, query live gateways
  if (pipraPrisma) {
    try {
      const gateways: any[] = await pipraPrisma.$queryRaw(
        Prisma.sql`
        SELECT g.gateway_id, g.slug, g.name, g.display, g.logo, g.status, g.brand_id, p.value as mobile_number
        FROM pp_gateways g
        LEFT JOIN pp_gateways_parameter p 
          ON g.gateway_id = p.gateway_id 
          AND p.option_name = 'mobile_number'
        WHERE g.tab = 'mfs'
        GROUP BY g.slug, g.gateway_id
      `
      );

      const methods = DEFAULT_METHODS.map((dm) => {
        const found = gateways.find((g) => g.slug.includes(dm.slug.split("-")[0]));
        return {
          ...dm,
          isActive: found ? found.status === "active" : dm.isActive,
          mobileNumber: found?.mobile_number || dm.mobileNumber,
        };
      });

      return NextResponse.json({ success: true, methods, source: "piprapay_db" });
    } catch (err) {
      console.warn("[PipraPay DB Query failed, falling back to SiteSetting]:", err);
    }
  }

  // 2. Fallback to siteSetting table
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "PAYMENT_GATEWAYS" },
    });

    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      return NextResponse.json({ success: true, methods: parsed, source: "site_settings" });
    }
  } catch (err) {
    console.warn("[SiteSetting Gateways fallback error]:", err);
  }

  // 3. Fallback to defaults
  return NextResponse.json({ success: true, methods: DEFAULT_METHODS, source: "defaults" });
}

export async function POST(req: NextRequest) {
  const adminAuth = await requireAdmin();
  if (adminAuth instanceof NextResponse) return adminAuth;
  const mfaAuth = await requireRecentMfa(10);
  if (mfaAuth instanceof NextResponse) return mfaAuth;
  const { user } = adminAuth;

  try {
    const body = await req.json();
    const { methods } = body;

    if (!Array.isArray(methods)) {
      return NextResponse.json({ success: false, message: "Invalid methods array" }, { status: 400 });
    }

    // 1. Try update PipraPay DB if configured
    if (pipraPrisma) {
      try {
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        for (const m of methods) {
          const status = m.isActive ? "active" : "inactive";
          const mobile = m.mobileNumber || "01712345678";
          const slugPattern = `%${m.slug.split("-")[0]}%`;

          await pipraPrisma.$queryRaw(Prisma.sql`
            UPDATE pp_gateways
            SET status = ${status}, updated_date = ${now}
            WHERE slug LIKE ${slugPattern}
          `);

          await pipraPrisma.$queryRaw(Prisma.sql`
            UPDATE pp_gateways_parameter p
            INNER JOIN pp_gateways g ON p.gateway_id = g.gateway_id
            SET p.value = ${mobile}, p.updated_date = ${now}
            WHERE g.slug LIKE ${slugPattern} AND p.option_name = 'mobile_number'
          `);
        }
      } catch (pipraErr) {
        console.warn("[PipraPay direct DB update failed, continuing with SiteSetting]:", pipraErr);
      }
    }

    // 2. Persist in Prisma SiteSetting table
    await prisma.siteSetting.upsert({
      where: { key: "PAYMENT_GATEWAYS" },
      create: {
        key: "PAYMENT_GATEWAYS",
        value: JSON.stringify(methods),
      },
      update: {
        value: JSON.stringify(methods),
      },
    });

    // 3. Log admin audit
    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "SETTINGS_GATEWAYS_UPDATE",
      targetType: "SETTINGS",
      targetId: "PAYMENT_GATEWAYS",
      details: {
        updatedMethods: methods.map((m: any) => ({
          slug: m.slug,
          isActive: m.isActive,
          mobileNumber: m.mobileNumber,
        })),
      },
    });

    return NextResponse.json({ success: true, message: "Gateways updated and persisted successfully." });
  } catch (error: any) {
    console.error("[Gateways POST Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
