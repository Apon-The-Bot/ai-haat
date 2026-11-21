import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { logAdminAudit } from "@/lib/audit-logger";
import { authenticateEps } from "@/lib/payments/eps/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isSameOriginMutation } from "@/lib/security/csrf";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
  const admin = await requireAdminMfa();
  if (admin instanceof NextResponse) return admin;
  const limit = checkRateLimit(`eps-admin-test:${admin.user.id}`, 3, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterMs, "Try again shortly.");
  let connected = false;
  try {
    await authenticateEps(process.env, fetch, true);
    connected = true;
  } catch {
    // Return only the outcome to the browser.
  }
  await logAdminAudit({
    actorId: admin.user.id,
    action: "EPS_AUTHENTICATION_TEST",
    targetType: "SETTINGS",
    targetId: "EPS",
    details: { connected },
  });
  return NextResponse.json({ connected }, { status: connected ? 200 : 502 });
}
