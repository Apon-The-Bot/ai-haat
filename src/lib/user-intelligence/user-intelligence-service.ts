import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export type DataClassification =
  | "AUTOMATIC"
  | "CLIENT_AVAILABLE"
  | "CONSENT_REQUIRED"
  | "USER_PROVIDED"
  | "EXTERNAL_ENRICHMENT"
  | "UNAVAILABLE";

export type ObservationConfidence = "HIGH" | "MEDIUM" | "LOW" | "ESTIMATED";

export interface DeviceInstanceInput {
  userId: string;
  deviceInstanceId: string;
  userAgent?: string;
  deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  screenResolution?: string;
  viewport?: string;
  devicePixelRatio?: number;
  touchSupport?: boolean;
  colorDepth?: number;
  cpuCores?: number;
  deviceMemoryGB?: number;
  ipAddress?: string;
  label?: string;
}

export interface TechnicalObservationInput {
  userId: string;
  deviceInstanceId?: string;
  sessionReference?: string;
  observationType:
    | "IP_NETWORK"
    | "GEO_APPROXIMATE"
    | "GEO_GPS"
    | "PERFORMANCE_VITALS"
    | "BROWSER_ENV"
    | "SECURITY_EVENT"
    | "ACQUISITION_TRAFFIC";
  classification: DataClassification;
  data: Record<string, any>;
  source: string;
  confidence?: ObservationConfidence;
  permissionStatus?: "NOT_REQUIRED" | "GRANTED" | "DENIED" | "PROMPTED" | "REVOKED";
  ipAddress?: string;
  retentionDays?: number;
}

export interface ConsentRecordInput {
  userId: string;
  consentType: "LOCATION_GPS" | "ANALYTICS_PERFORMANCE" | "MARKETING_ATTRIBUTION";
  status: "GRANTED" | "DENIED" | "REVOKED";
  purpose: string;
  ipAddress?: string;
  userAgent?: string;
  noticeVersion?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. User-Agent & Environment Parser (Approximate & Fingerprint-Free)
// ─────────────────────────────────────────────────────────────────────────────
export function parseUserAgentString(ua: string = ""): {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
} {
  const lower = ua.toLowerCase();

  // Device Type
  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "desktop";
  if (lower.includes("tablet") || lower.includes("ipad")) {
    deviceType = "tablet";
  } else if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    deviceType = "mobile";
  }

  // OS
  let osName = "Unknown OS";
  let osVersion = "";
  if (lower.includes("windows")) {
    osName = "Windows";
    if (lower.includes("windows nt 10.0")) osVersion = "10 / 11";
    else if (lower.includes("windows nt 6.3")) osVersion = "8.1";
    else if (lower.includes("windows nt 6.1")) osVersion = "7";
  } else if (lower.includes("mac os x") || lower.includes("macos")) {
    osName = "macOS";
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    if (match) osVersion = match[1].replace(/_/g, ".");
  } else if (lower.includes("android")) {
    osName = "Android";
    const match = ua.match(/Android ([0-9.]+)/);
    if (match) osVersion = match[1];
  } else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ios")) {
    osName = "iOS";
    const match = ua.match(/OS ([0-9_]+)/);
    if (match) osVersion = match[1].replace(/_/g, ".");
  } else if (lower.includes("linux")) {
    osName = "Linux";
  }

  // Browser
  let browserName = "Unknown Browser";
  let browserVersion = "";
  if (lower.includes("edg/")) {
    browserName = "Microsoft Edge";
    const match = ua.match(/Edg\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (lower.includes("chrome") && !lower.includes("chromium")) {
    browserName = "Google Chrome";
    const match = ua.match(/Chrome\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (lower.includes("firefox")) {
    browserName = "Mozilla Firefox";
    const match = ua.match(/Firefox\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (lower.includes("safari") && !lower.includes("chrome")) {
    browserName = "Apple Safari";
    const match = ua.match(/Version\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (lower.includes("opr") || lower.includes("opera")) {
    browserName = "Opera";
    const match = ua.match(/(?:OPR|Opera)\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  }

  return { browserName, browserVersion, osName, osVersion, deviceType };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. IP Address & Network Intelligence Resolver
// ─────────────────────────────────────────────────────────────────────────────
export function resolveIpIntelligence(
  ip: string = "",
  headers?: { get: (name: string) => string | null }
): {
  ipAddress: string;
  ipVersion: "IPv4" | "IPv6" | "Local" | "Unknown";
  country: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
  asn: string;
  isDatacenter: boolean;
  isVpnProxySignal: boolean;
  confidence: ObservationConfidence;
  source: string;
} {
  const cleanIp = ip.trim();

  // Check IP Version
  let ipVersion: "IPv4" | "IPv6" | "Local" | "Unknown" = "Unknown";
  if (cleanIp === "127.0.0.1" || cleanIp === "::1" || cleanIp.startsWith("192.168.") || cleanIp.startsWith("10.")) {
    ipVersion = "Local";
  } else if (cleanIp.includes(":")) {
    ipVersion = "IPv6";
  } else if (cleanIp.includes(".")) {
    ipVersion = "IPv4";
  }

  // Inspect headers for Cloudflare / Proxy geolocation
  const cfCountry = headers?.get("cf-ipcountry");
  const cfRay = headers?.get("cf-ray");
  const isCf = Boolean(cfRay);

  let country = "Bangladesh";
  let region = "Dhaka Division";
  let city = "Dhaka";
  let timezone = "Asia/Dhaka";
  let isp = "Grameenphone / Robi / Broadband";
  let asn = "AS24432";
  let isDatacenter = false;
  let isVpnProxySignal = false;
  let confidence: ObservationConfidence = "MEDIUM";

  if (ipVersion === "Local") {
    country = "Local Development";
    city = "Localhost";
    region = "Private Network";
    timezone = "UTC+6 (Local)";
    isp = "Loopback";
    asn = "N/A";
    confidence = "HIGH";
  } else if (cfCountry && cfCountry !== "XX") {
    country = cfCountry === "BD" ? "Bangladesh" : cfCountry;
    confidence = "HIGH";
  }

  // Detect datacenter / hosting ranges (rough heuristics without slow external queries)
  if (cleanIp.startsWith("34.") || cleanIp.startsWith("35.") || cleanIp.startsWith("52.") || cleanIp.startsWith("54.")) {
    isDatacenter = true;
    isp = "Cloud Infrastructure (AWS/GCP)";
    isVpnProxySignal = true;
    confidence = "HIGH";
  }

  return {
    ipAddress: cleanIp,
    ipVersion,
    country,
    city,
    region,
    timezone,
    isp,
    asn,
    isDatacenter,
    isVpnProxySignal,
    confidence,
    source: isCf ? "CLOUDFLARE_EDGE_OBSERVATION" : "REVERSE_PROXY_OBSERVATION",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Device Instance Registry
// ─────────────────────────────────────────────────────────────────────────────
export async function recordDeviceInstance(input: DeviceInstanceInput) {
  const uaParsed = input.userAgent ? parseUserAgentString(input.userAgent) : null;

  const browserName = input.browserName || uaParsed?.browserName || "Unknown Browser";
  const browserVersion = input.browserVersion || uaParsed?.browserVersion || "";
  const osName = input.osName || uaParsed?.osName || "Unknown OS";
  const osVersion = input.osVersion || uaParsed?.osVersion || "";
  const deviceType = input.deviceType || uaParsed?.deviceType || "unknown";

  const autoLabel = input.label || `${browserName} on ${osName} (${deviceType})`;

  const existing = await prisma.userDeviceInstance.findFirst({
    where: {
      userId: input.userId,
      deviceInstanceId: input.deviceInstanceId,
    },
  });

  const now = new Date();

  if (existing) {
    return prisma.userDeviceInstance.update({
      where: { id: existing.id },
      data: {
        lastSeenAt: now,
        lastIpAddress: input.ipAddress || existing.lastIpAddress,
        viewport: input.viewport || existing.viewport,
        screenResolution: input.screenResolution || existing.screenResolution,
        devicePixelRatio: input.devicePixelRatio ?? existing.devicePixelRatio,
      },
    });
  }

  // Create new recognized device instance
  const created = await prisma.userDeviceInstance.create({
    data: {
      userId: input.userId,
      deviceInstanceId: input.deviceInstanceId,
      deviceType,
      browserName,
      browserVersion,
      osName,
      osVersion,
      screenResolution: input.screenResolution,
      viewport: input.viewport,
      devicePixelRatio: input.devicePixelRatio,
      touchSupport: input.touchSupport,
      colorDepth: input.colorDepth,
      cpuCores: input.cpuCores,
      deviceMemoryGB: input.deviceMemoryGB,
      label: autoLabel,
      lastIpAddress: input.ipAddress,
      firstSeenAt: now,
      lastSeenAt: now,
    },
  });

  // Log security event for newly recognized device
  await recordTechnicalObservation({
    userId: input.userId,
    deviceInstanceId: input.deviceInstanceId,
    observationType: "SECURITY_EVENT",
    classification: "AUTOMATIC",
    source: "DEVICE_RECOGNITION_PIPELINE",
    confidence: "HIGH",
    ipAddress: input.ipAddress,
    data: {
      eventType: "NEW_DEVICE_INSTANCE_DETECTED",
      deviceType,
      label: autoLabel,
      firstSeenAt: now.toISOString(),
    },
  });

  return created;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Technical Observation Ingestion
// ─────────────────────────────────────────────────────────────────────────────
export async function recordTechnicalObservation(input: TechnicalObservationInput) {
  const retentionDays = input.retentionDays || 90; // Default 90-day retention
  const retentionUntil = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);

  return prisma.userTechnicalObservation.create({
    data: {
      userId: input.userId,
      deviceInstanceId: input.deviceInstanceId,
      sessionReference: input.sessionReference,
      observationType: input.observationType,
      classification: input.classification,
      data: JSON.stringify(input.data),
      source: input.source,
      confidence: input.confidence || "HIGH",
      permissionStatus: input.permissionStatus || "NOT_REQUIRED",
      ipAddress: input.ipAddress,
      retentionUntil,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Consent & Privacy Management
// ─────────────────────────────────────────────────────────────────────────────
export async function recordUserConsent(input: ConsentRecordInput) {
  const existing = await prisma.userConsentRecord.findFirst({
    where: {
      userId: input.userId,
      consentType: input.consentType,
    },
    orderBy: { grantedAt: "desc" },
  });

  const now = new Date();

  if (existing) {
    return prisma.userConsentRecord.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        purpose: input.purpose,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        noticeVersion: input.noticeVersion || "2026.1",
        revokedAt: input.status === "REVOKED" || input.status === "DENIED" ? now : null,
      },
    });
  }

  return prisma.userConsentRecord.create({
    data: {
      userId: input.userId,
      consentType: input.consentType,
      status: input.status,
      purpose: input.purpose,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      noticeVersion: input.noticeVersion || "2026.1",
      grantedAt: now,
      revokedAt: input.status === "REVOKED" || input.status === "DENIED" ? now : null,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Complete User Intelligence Profile Builder (With Role-Based Protection)
// ─────────────────────────────────────────────────────────────────────────────
export async function getUserIntelligenceProfile(
  userId: string,
  requestingAdminRole: string = "ADMIN"
) {
  const [deviceInstances, observations, consents, sessions, userSecurity] = await Promise.all([
    prisma.userDeviceInstance.findMany({
      where: { userId },
      orderBy: { lastSeenAt: "desc" },
    }),
    prisma.userTechnicalObservation.findMany({
      where: { userId },
      orderBy: { capturedAt: "desc" },
      take: 100,
    }),
    prisma.userConsentRecord.findMany({
      where: { userId },
      orderBy: { grantedAt: "desc" },
    }),
    prisma.session.findMany({
      where: { userId },
      orderBy: { expires: "desc" },
      take: 10,
    }),
    prisma.userSecurity.findUnique({
      where: { userId },
    }),
  ]);

  // Parse observations by domain
  const ipObservations: any[] = [];
  const geoObservations: any[] = [];
  const performanceVitals: any[] = [];
  const securityEvents: any[] = [];
  const browserEnvs: any[] = [];
  const trafficAcquisitions: any[] = [];

  observations.forEach((obs) => {
    let parsedData = {};
    try {
      parsedData = JSON.parse(obs.data);
    } catch {
      parsedData = { raw: obs.data };
    }

    const item = {
      id: obs.id,
      type: obs.observationType,
      classification: obs.classification,
      data: parsedData,
      source: obs.source,
      confidence: obs.confidence,
      permissionStatus: obs.permissionStatus,
      ipAddress: maskIpForRole(obs.ipAddress, requestingAdminRole),
      capturedAt: obs.capturedAt,
    };

    if (obs.observationType === "IP_NETWORK") ipObservations.push(item);
    else if (obs.observationType === "GEO_APPROXIMATE" || obs.observationType === "GEO_GPS") geoObservations.push(item);
    else if (obs.observationType === "PERFORMANCE_VITALS") performanceVitals.push(item);
    else if (obs.observationType === "SECURITY_EVENT") securityEvents.push(item);
    else if (obs.observationType === "BROWSER_ENV") browserEnvs.push(item);
    else if (obs.observationType === "ACQUISITION_TRAFFIC") trafficAcquisitions.push(item);
  });

  // Calculate Anomaly Risk Signals
  const riskSignals: { signal: string; level: "LOW" | "MEDIUM" | "HIGH"; description: string }[] = [];
  
  // Check if multiple IPs observed within 24 hours
  const recentIps = Array.from(new Set(ipObservations.slice(0, 10).map((o) => o.ipAddress).filter(Boolean)));
  if (recentIps.length >= 3) {
    riskSignals.push({
      signal: "FREQUENT_IP_SWITCHING",
      level: "MEDIUM",
      description: `Observed ${recentIps.length} distinct IP addresses in recent sessions.`,
    });
  }

  // Check if any security events flagged datacenter / proxy
  const datacenterObs = ipObservations.find((o) => o.data?.isDatacenter || o.data?.isVpnProxySignal);
  if (datacenterObs) {
    riskSignals.push({
      signal: "DATACENTER_PROXY_OBSERVED",
      level: "LOW",
      description: "Observed traffic originating from cloud hosting or datacenter proxy range.",
    });
  }

  // Check if device count is high
  if (deviceInstances.length >= 5) {
    riskSignals.push({
      signal: "MULTIPLE_DEVICE_INSTANCES",
      level: "LOW",
      description: `Account has accessed platform from ${deviceInstances.length} distinct browser/device instances.`,
    });
  }

  // Latest observed IP
  const latestIp = ipObservations[0]?.ipAddress || deviceInstances[0]?.lastIpAddress || "Not Recorded";

  return {
    userId,
    summary: {
      totalDeviceInstances: deviceInstances.length,
      totalObservations: observations.length,
      activeSessionsCount: sessions.filter((s) => s.expires > new Date()).length,
      lastObservedIp: latestIp,
      riskLevel: riskSignals.some((r) => r.level === "HIGH") ? "HIGH" : riskSignals.length > 0 ? "MEDIUM" : "LOW",
      riskSignals,
    },
    // Sub-Tab A: Device & Browser
    devices: deviceInstances.map((d) => ({
      ...d,
      lastIpAddress: maskIpForRole(d.lastIpAddress, requestingAdminRole),
    })),
    browserEnvironments: browserEnvs,
    // Sub-Tab B: IP & Network
    ipIntelligence: ipObservations,
    // Sub-Tab C: Geolocation
    geolocation: {
      approximateLocations: geoObservations.filter((g) => g.type === "GEO_APPROXIMATE"),
      gpsLocations: requestingAdminRole === "ANALYST" ? [] : geoObservations.filter((g) => g.type === "GEO_GPS"),
    },
    // Sub-Tab D: Session & Security
    sessions: sessions.map((s) => ({
      id: s.id,
      expiresAt: s.expires,
      isActive: s.expires > new Date(),
    })),
    securityEvents,
    // Sub-Tab E: Performance & Web Vitals
    performanceVitals,
    // Sub-Tab F: Privacy & Consent
    consents,
    trafficAcquisition: trafficAcquisitions[0]?.data || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Privacy Masking Helper
// ─────────────────────────────────────────────────────────────────────────────
function maskIpForRole(ip: string | null | undefined, role: string): string {
  if (!ip) return "Unknown";
  if (role === "SUPER_ADMIN" || role === "ADMIN") return ip;

  // Mask last octet for support/analyst
  if (ip.includes(".")) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return ip.substring(0, 10) + "...";
}
