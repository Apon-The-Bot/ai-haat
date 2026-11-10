import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_CONSENT_COOKIE, META_CONSENT_AGE, META_CONSENT_COOKIE, consentId } from "@/lib/analytics/meta-consent";
import { getPublicMetaSettings } from "@/lib/analytics/meta-settings";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "private, no-store" };

export async function GET(req: NextRequest) {
  const ads = req.cookies.get(META_CONSENT_COOKIE)?.value;
  const analytics = req.cookies.get(ANALYTICS_CONSENT_COOKIE)?.value;
  const id = consentId(ads);
  const [settings, consent] = await Promise.all([
    getPublicMetaSettings(),
    id ? prisma.advertisingConsent.findUnique({ where: { id } }).catch(() => null) : null,
  ]);
  const granted = !!consent && consent.expiresAt > new Date();
  return NextResponse.json({
    ...settings,
    ads: granted,
    analytics: analytics === "yes",
    decided: ads === "no" || granted,
  }, { headers: noStore });
}

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!checkRateLimit(`meta-consent:${getClientIp(req)}`, 20, 60_000).allowed) {
    return NextResponse.json({ error: "Too many preference changes" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (typeof body?.ads !== "boolean" || typeof body.analytics !== "boolean") {
    return NextResponse.json({ error: "Invalid cookie preferences" }, { status: 400 });
  }
  const current = consentId(req.cookies.get(META_CONSENT_COOKIE)?.value);
  let grantedId: string | undefined;
  try {
    if (body.ads) {
      const existing = current ? await prisma.advertisingConsent.findUnique({ where: { id: current } }) : null;
      grantedId = existing && existing.expiresAt > new Date() ? existing.id : randomBytes(32).toString("hex");
      if (grantedId !== existing?.id) {
        await prisma.advertisingConsent.create({ data: { id: grantedId, expiresAt: new Date(Date.now() + META_CONSENT_AGE * 1000) } });
      }
    } else if (current) {
      await prisma.$transaction([
        prisma.advertisingConsent.deleteMany({ where: { id: current } }),
        prisma.order.updateMany({
          where: { metaConsentId: current },
          data: { metaConsentId: null, metaAttribution: Prisma.DbNull },
        }),
      ]);
    }
  } catch {
    return NextResponse.json({ error: "Could not update preferences. Please retry." }, { status: 503 });
  }
  const response = NextResponse.json({ success: true }, { headers: noStore });
  const cookie = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: META_CONSENT_AGE };
  response.cookies.set(META_CONSENT_COOKIE, grantedId || "no", cookie);
  response.cookies.set(ANALYTICS_CONSENT_COOKIE, body.analytics ? "yes" : "no", cookie);
  if (!body.ads) {
    response.cookies.delete("_fbp");
    response.cookies.delete("_fbc");
  }
  if (!body.ads || !body.analytics) {
    response.cookies.delete("aihaat_first_touch");
    response.cookies.delete("aihaat_last_touch");
  }
  return response;
}
