export const META_CONSENT_COOKIE = "aihaat_ads";
export const ANALYTICS_CONSENT_COOKIE = "aihaat_analytics";
export const META_CONSENT_AGE = 90 * 24 * 60 * 60;

export function consentId(value?: string) {
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

export function metaClickCookie(value?: string) {
  return value && /^fb\.\d{1,2}\.\d{10,15}\.[A-Za-z0-9_-]{1,256}$/.test(value) ? value : undefined;
}

export function metaUserAgent(value?: string | null) {
  return value && /^[\x20-\x7e]{1,512}$/.test(value) ? value : undefined;
}
