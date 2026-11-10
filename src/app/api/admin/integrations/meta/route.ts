import { randomUUID, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { prisma } from "@/lib/prisma";
import { adminMetaSettings, getMetaSettings, invalidatePublicMetaSettings, META_SETTINGS_KEY, updateMetaSettings } from "@/lib/analytics/meta-settings";
import { sendCapiEvent } from "@/lib/analytics/meta-capi";
import { META_PROVIDER } from "@/lib/analytics/meta-purchase";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "private, no-store" };

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  try {
    const settings = await getMetaSettings();
    const events = settings.diagnostics ? await prisma.analyticsEvent.findMany({
      where: { provider: META_PROVIDER }, orderBy: { createdAt: "desc" }, take: 30,
      select: { id: true, eventName: true, status: true, attempts: true, lastError: true, createdAt: true, sentAt: true },
    }) : [];
    return NextResponse.json({ settings: adminMetaSettings(settings), events }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Meta settings unavailable" }, { status: 503, headers: noStore });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!checkRateLimit(`admin-meta:${auth.user.id}`, 12, 60_000).allowed) {
    return NextResponse.json({ error: "Too many configuration requests" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body || !["save", "test"].includes(body.action)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    const previous = await getMetaSettings();
    const next = { ...previous };
    let testReason: string | undefined;
    if (body.action === "test") {
      if (!previous.testMode || !previous.testCode || !previous.tokenCiphertext || !previous.pixelId) {
        return NextResponse.json({ error: "Save a dataset, token and test code, then enable test mode." }, { status: 400 });
      }
      const id = randomUUID();
      const result = await sendCapiEvent(previous, {
        event_name: "MetaConnectionTest", event_id: id, event_time: Math.floor(Date.now() / 1000),
        action_source: "system_generated",
        user_data: { external_id: [createHash("sha256").update(id).digest("hex")] },
      }, previous.testCode);
      next.connection = result.accepted ? "accepted" : "failed";
      next.testedAt = new Date().toISOString();
      testReason = result.reason;
    } else {
      try {
        Object.assign(next, updateMetaSettings(body.settings || {}, previous));
      } catch (error) {
        const message = error instanceof Error && !/encrypt|key|cipher/i.test(error.message)
          ? error.message : "Could not encrypt credentials. Check the server encryption key.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }
    const value = JSON.stringify(next);
    await prisma.$transaction(async (tx) => {
      if (body.action === "test") {
        const changed = await tx.siteSetting.updateMany({
          where: { key: META_SETTINGS_KEY, value: JSON.stringify(previous) }, data: { value },
        });
        if (!changed.count) throw new Error("Configuration changed during test");
      } else {
        await tx.siteSetting.upsert({
          where: { key: META_SETTINGS_KEY }, create: { key: META_SETTINGS_KEY, value }, update: { value },
        });
      }
      await tx.adminAuditLog.create({
        data: {
          actorId: auth.user.id, actorEmail: auth.user.email,
          action: body.action === "test" ? "META_CONNECTION_TEST" : "META_CONFIGURATION_UPDATE",
          targetType: "SETTINGS", targetId: META_SETTINGS_KEY,
          details: JSON.stringify({
            previousPixelId: previous.pixelId, pixelId: next.pixelId, enabled: next.enabled,
            paused: next.paused, tokenChanged: previous.tokenCiphertext !== next.tokenCiphertext, testReason,
          }),
        },
      });
    });
    invalidatePublicMetaSettings();
    return NextResponse.json({ settings: adminMetaSettings(next), testReason }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Meta configuration could not be updated" }, { status: 503, headers: noStore });
  }
}
