import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { automatedAlertHeaders, getAutomatedAlerts } from "@/lib/admin/automated-alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json(await getAutomatedAlerts(), { headers: automatedAlertHeaders });
  } catch (error) {
    console.error("Failed to load automated admin alerts", error);
    return NextResponse.json({ error: "Could not load automated alerts" }, { status: 500, headers: automatedAlertHeaders });
  }
}
