import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runMetaOutbox } from "@/lib/analytics/meta-delivery";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  const actual = Buffer.from(req.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ results: await runMetaOutbox() });
  } catch {
    return NextResponse.json({ error: "Queue processing unavailable" }, { status: 503 });
  }
}
