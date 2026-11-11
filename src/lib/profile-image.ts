const GOOGLE_PROFILE_HOST = /(^|\.)googleusercontent\.com$/i;

/**
 * Only expose profile images from the providers and local upload paths the app
 * already trusts. Relative paths remain supported for admin-managed uploads.
 */
export function sanitizeProfileImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return null;

  if (value.startsWith("/uploads/") || value.startsWith("/images/")) return value;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (GOOGLE_PROFILE_HOST.test(url.hostname) || url.hostname === "aihaat.shop") return url.toString();
  } catch {
    return null;
  }

  return null;
}
