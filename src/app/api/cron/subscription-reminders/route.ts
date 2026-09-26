import { NextResponse } from "next/server";
import { processSubscriptionExpiryReminders } from "@/lib/commerce/subscription-reminders";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development or if not strictly secured by secret, allow or verify
      const url = new URL(req.url);
      const keyParam = url.searchParams.get("key");
      if (keyParam !== cronSecret && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const result = await processSubscriptionExpiryReminders();
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
