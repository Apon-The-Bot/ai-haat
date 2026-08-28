import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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
      whatsapp: config["general_whatsapp"] || "+880 1700-000000",
      messenger: config["general_messenger"] || "https://m.me/aihaat",
      email: config["general_email"] || "support@aihaat.shop",
      announcement: config["general_announcement"] || "🔥 বিশেষ অফার! বিকাশ ও নগদে পেমেন্টে ইনস্ট্যান্ট ডেলিভারি!",
      announcementEnabled: config["general_announcement_enabled"] !== "false",
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      whatsapp: "+880 1700-000000",
      messenger: "https://m.me/aihaat",
      email: "support@aihaat.shop",
      announcement: "🔥 বিশেষ অফার! বিকাশ ও নগদে পেমেন্টে ইনস্ট্যান্ট ডেলিভারি!",
      announcementEnabled: true,
    });
  }
}
