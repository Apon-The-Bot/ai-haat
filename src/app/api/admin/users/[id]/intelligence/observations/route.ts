import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import {
  recordTechnicalObservation,
  recordDeviceInstance,
  resolveIpIntelligence,
} from "@/lib/user-intelligence/user-intelligence-service";
import { getClientIp } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const currentUser = auth.user;
  const { id: userId } = await params;

  // Only self (the customer) or an administrator may post observation data
  const isSelf = currentUser.id === userId;
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(currentUser.role || "");

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const clientIp = getClientIp(req);

  // If payload contains device instance telemetry
  if (body.deviceInstance) {
    await recordDeviceInstance({
      userId,
      deviceInstanceId: body.deviceInstance.deviceInstanceId || `dev_${Date.now()}`,
      userAgent: req.headers.get("user-agent") || undefined,
      deviceType: body.deviceInstance.deviceType,
      browserName: body.deviceInstance.browserName,
      browserVersion: body.deviceInstance.browserVersion,
      osName: body.deviceInstance.osName,
      osVersion: body.deviceInstance.osVersion,
      screenResolution: body.deviceInstance.screenResolution,
      viewport: body.deviceInstance.viewport,
      devicePixelRatio: body.deviceInstance.devicePixelRatio,
      touchSupport: body.deviceInstance.touchSupport,
      colorDepth: body.deviceInstance.colorDepth,
      cpuCores: body.deviceInstance.cpuCores,
      deviceMemoryGB: body.deviceInstance.deviceMemoryGB,
      ipAddress: clientIp,
    });
  }

  // If payload contains specific observation (e.g. GPS with consent, Web Vitals, Network info)
  if (body.observation) {
    const obs = body.observation;

    // Reject GPS collection if consent is not verified
    if (obs.observationType === "GEO_GPS" && obs.permissionStatus !== "GRANTED") {
      return NextResponse.json(
        { error: "GPS Geolocation collection requires explicit user permission" },
        { status: 400 }
      );
    }

    const recorded = await recordTechnicalObservation({
      userId,
      deviceInstanceId: obs.deviceInstanceId,
      sessionReference: obs.sessionReference,
      observationType: obs.observationType,
      classification: obs.classification || "AUTOMATIC",
      data: obs.data || {},
      source: obs.source || (isSelf ? "CLIENT_BROWSER_TELEMETRY" : "ADMIN_DIAGNOSTICS"),
      confidence: obs.confidence || "HIGH",
      permissionStatus: obs.permissionStatus,
      ipAddress: clientIp,
      retentionDays: obs.retentionDays || 90,
    });

    return NextResponse.json({ success: true, observationId: recorded.id });
  }

  // Automatic IP/Network observation
  const ipMeta = resolveIpIntelligence(clientIp, req.headers);
  const recorded = await recordTechnicalObservation({
    userId,
    observationType: "IP_NETWORK",
    classification: "AUTOMATIC",
    source: "SERVER_HTTP_OBSERVATION",
    confidence: ipMeta.confidence,
    ipAddress: clientIp,
    data: ipMeta,
  });

  return NextResponse.json({ success: true, observationId: recorded.id });
}
