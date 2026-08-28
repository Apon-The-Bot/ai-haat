import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "general_whatsapp",
            "general_messenger",
            "general_email",
            "general_announcement",
            "general_announcement_enabled",
            "general_site_title",
          ],
        },
      },
    });

    const config: Record<string, string> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: {
        whatsapp: config["general_whatsapp"] || "+880 1700-000000",
        messenger: config["general_messenger"] || "https://m.me/aihaat",
        email: config["general_email"] || "support@aihaat.shop",
        announcement: config["general_announcement"] || "🔥 বিশেষ অফার! বিকাশ ও নগদে পেমেন্টে ইনস্ট্যান্ট ডেলিভারি!",
        announcementEnabled: config["general_announcement_enabled"] !== "false",
        siteTitle: config["general_site_title"] || "AI Haat - Bangladesh's #1 Digital Product Store",
      },
    });
  } catch (error: any) {
    console.error("[Admin Settings General GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { whatsapp, messenger, email, announcement, announcementEnabled, siteTitle } = body;

    const entries = [
      { key: "general_whatsapp", value: String(whatsapp || "") },
      { key: "general_messenger", value: String(messenger || "") },
      { key: "general_email", value: String(email || "") },
      { key: "general_announcement", value: String(announcement || "") },
      { key: "general_announcement_enabled", value: String(announcementEnabled ?? true) },
      { key: "general_site_title", value: String(siteTitle || "") },
    ];

    for (const item of entries) {
      await prisma.siteSetting.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value },
        update: { value: item.value },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Site settings updated and persisted successfully.",
    });
  } catch (error: any) {
    console.error("[Admin Settings General POST Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to save settings" }, { status: 500 });
  }
}
