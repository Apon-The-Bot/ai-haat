import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prisma client pointing to PipraPay database
const pipraPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://u298980084_pakna_user:Rk%23PaknaPay%402026%21Db@srv1497.hstgr.io:3306/u298980084_paknapay",
    },
  },
});

export async function GET() {
  try {
    const gateways: any[] = await pipraPrisma.$queryRawUnsafe(`
      SELECT g.gateway_id, g.slug, g.name, g.display, g.logo, g.status, g.brand_id, p.value as mobile_number
      FROM pp_gateways g
      LEFT JOIN pp_gateways_parameter p 
        ON g.gateway_id = p.gateway_id 
        AND p.option_name = 'mobile_number'
      WHERE g.tab = 'mfs'
      GROUP BY g.slug, g.gateway_id
    `);

    // Standardize gateway items
    const methods = [
      {
        slug: "bkash-personal",
        name: "bKash Personal",
        display: "bKash",
        logo: "https://aihaat.shop/images/payments/bkash.png",
        isActive: gateways.some((g) => g.slug.includes("bkash") && g.status === "active"),
        mobileNumber: gateways.find((g) => g.slug.includes("bkash"))?.mobile_number || "01712345678",
      },
      {
        slug: "nagad-personal",
        name: "Nagad Personal",
        display: "Nagad",
        logo: "https://aihaat.shop/images/payments/nagad.png",
        isActive: gateways.some((g) => g.slug.includes("nagad") && g.status === "active"),
        mobileNumber: gateways.find((g) => g.slug.includes("nagad"))?.mobile_number || "01712345678",
      },
      {
        slug: "rocket-personal",
        name: "Rocket Personal",
        display: "Rocket",
        logo: "https://aihaat.shop/images/payments/rocket.png",
        isActive: gateways.some((g) => g.slug.includes("rocket") && g.status === "active"),
        mobileNumber: gateways.find((g) => g.slug.includes("rocket"))?.mobile_number || "01712345678",
      },
      {
        slug: "upay-personal",
        name: "Upay Personal",
        display: "Upay",
        logo: "https://aihaat.shop/images/payments/upay.png",
        isActive: gateways.some((g) => g.slug.includes("upay") && g.status === "active"),
        mobileNumber: gateways.find((g) => g.slug.includes("upay"))?.mobile_number || "01712345678",
      },
    ];

    return NextResponse.json({ success: true, methods });
  } catch (error: any) {
    console.error("[Gateways GET Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { methods } = body;

    if (!Array.isArray(methods)) {
      return NextResponse.json({ success: false, message: "Invalid methods array" }, { status: 400 });
    }

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    for (const m of methods) {
      const status = m.isActive ? "active" : "inactive";
      const mobile = m.mobileNumber || "01712345678";

      // Update status in pp_gateways
      await pipraPrisma.$queryRawUnsafe(`
        UPDATE pp_gateways
        SET status = '${status}', updated_date = '${now}'
        WHERE slug LIKE '%${m.slug.split("-")[0]}%'
      `);

      // Update mobile_number in pp_gateways_parameter
      await pipraPrisma.$queryRawUnsafe(`
        UPDATE pp_gateways_parameter p
        INNER JOIN pp_gateways g ON p.gateway_id = g.gateway_id
        SET p.value = '${mobile}', p.updated_date = '${now}'
        WHERE g.slug LIKE '%${m.slug.split("-")[0]}%' AND p.option_name = 'mobile_number'
      `);
    }

    return NextResponse.json({ success: true, message: "Gateways updated successfully" });
  } catch (error: any) {
    console.error("[Gateways POST Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
