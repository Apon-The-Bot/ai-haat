import { prisma } from "@/lib/prisma";
import { encryptCredential, decryptTotpSecret } from "@/lib/mfa/crypto";

export const META_SETTINGS_KEY = "integration_meta_v1";
import { graphVersions, META_EVENTS, type MetaEventName } from "./meta-events";
export { graphVersions } from "./meta-events";
export const defaultMetaSettings = {
  pixelId: "", graphVersion: "v26.0", enabled: false, paused: false,
  browser: true, capi: false, standard: true, advanced: false, diagnostics: true, testMode: false,
  events: Object.fromEntries(META_EVENTS.map((name) => [name, true])) as Record<MetaEventName, boolean>,
  tokenCiphertext: "", testCode: "", connection: "pending", testedAt: null as string | null,
};
export type MetaSettings = typeof defaultMetaSettings;

export async function getMetaSettings(): Promise<MetaSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: META_SETTINGS_KEY }, select: { value: true } });
  return row ? { ...defaultMetaSettings, ...JSON.parse(row.value) } : defaultMetaSettings;
}

export function metaActive(settings: MetaSettings, channel: "browser" | "capi", event?: MetaEventName) {
  return settings.enabled && !settings.paused && !settings.testMode && settings[channel] &&
    /^\d{5,25}$/.test(settings.pixelId) &&
    (!event || (settings.events[event] && (settings.standard || event === "RemoveFromCart")));
}

export function publicMetaSettings(settings: MetaSettings) {
  return {
    pixelId: metaActive(settings, "browser") ? settings.pixelId : "",
    events: Object.fromEntries(META_EVENTS.map((event) => [event, !!metaActive(settings, "browser", event)])),
    available: metaActive(settings, "browser") || metaActive(settings, "capi"),
  };
}

let publicCache: { until: number; value: Promise<ReturnType<typeof publicMetaSettings>> } | undefined;

export function getPublicMetaSettings() {
  if (publicCache && publicCache.until > Date.now()) return publicCache.value;
  const value = getMetaSettings().then(publicMetaSettings).catch(() => publicMetaSettings(defaultMetaSettings));
  publicCache = { value, until: Date.now() + 10_000 };
  return value;
}

export function invalidatePublicMetaSettings() {
  publicCache = undefined;
}

export function adminMetaSettings(settings: MetaSettings) {
  const { tokenCiphertext, testCode, ...safe } = settings;
  return { ...safe, hasToken: Boolean(tokenCiphertext), hasTestCode: Boolean(testCode) };
}

export function readMetaToken(settings: MetaSettings) {
  if (!settings.tokenCiphertext) return "";
  return decryptTotpSecret(settings.tokenCiphertext);
}

export function updateMetaSettings(input: Record<string, unknown>, previous: MetaSettings): MetaSettings {
  const next = { ...previous };
  if (typeof input.pixelId !== "string" || !/^(?:\d{5,25})?$/.test(input.pixelId)) throw new Error("Invalid Pixel/Dataset ID.");
  if (!graphVersions.some((version) => version === input.graphVersion)) throw new Error("Unsupported Graph API version.");
  next.pixelId = input.pixelId;
  next.graphVersion = input.graphVersion as string;
  for (const key of ["enabled", "paused", "browser", "capi", "standard", "advanced", "diagnostics", "testMode"] as const) {
    if (typeof input[key] !== "boolean") throw new Error("Invalid tracking control.");
    next[key] = input[key];
  }
  const events = input.events as Partial<Record<MetaEventName, boolean>> | undefined;
  next.events = { ...previous.events };
  for (const event of META_EVENTS) {
    if (typeof events?.[event] !== "boolean") throw new Error("Invalid event control.");
    next.events[event] = events[event];
  }
  const replacement = input.token;
  if (replacement !== undefined && (typeof replacement !== "string" || !/^[A-Za-z0-9._|~-]{20,2048}$/.test(replacement))) {
    throw new Error("Invalid access token format.");
  }
  if (input.removeToken === true || next.pixelId !== previous.pixelId) next.tokenCiphertext = "";
  if (typeof replacement === "string") next.tokenCiphertext = encryptCredential(replacement);
  if (input.testCode !== undefined) {
    if (typeof input.testCode !== "string" || !/^[A-Za-z0-9_-]{0,64}$/.test(input.testCode)) throw new Error("Invalid test event code.");
    next.testCode = input.testCode;
  }
  if (next.enabled && !next.pixelId) throw new Error("Set a Pixel/Dataset ID before enabling tracking.");
  if (next.enabled && next.capi && !next.tokenCiphertext) throw new Error("Set an access token before enabling CAPI.");
  if (next.testMode && !next.testCode) throw new Error("Set a test event code before enabling test mode.");
  if (next.pixelId !== previous.pixelId || next.graphVersion !== previous.graphVersion || next.tokenCiphertext !== previous.tokenCiphertext) {
    next.connection = "pending";
    next.testedAt = null;
  }
  return next;
}
