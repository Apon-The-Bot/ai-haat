import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { epsBillingRequired: process.env.EPS_PAYMENT_ENABLED === "true" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
