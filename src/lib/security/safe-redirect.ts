/**
 * Safe redirect validator preventing open redirects, host spoofing, and protocol smuggling.
 */
export function getValidatedDestination(targetUrl: string | null | undefined, requestUrl?: string): string {
  const defaultFallback = "https://aihaat.shop";
  if (!targetUrl || typeof targetUrl !== "string") {
    return defaultFallback;
  }

  const trimmed = targetUrl.trim();
  if (!trimmed) return defaultFallback;

  // Handle safe relative internal paths (e.g. "/shop", "/product/chatgpt-plus")
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    const configuredSite =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      defaultFallback;
    try {
      const baseObj = new URL(configuredSite);
      return new URL(trimmed, baseObj.origin).toString();
    } catch {
      return `${defaultFallback}${trimmed}`;
    }
  }

  try {
    const parsed = new URL(trimmed);

    // Only allow http: and https: protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return defaultFallback;
    }

    // Prohibit embedded credentials (e.g. https://aihaat.shop@evil.com)
    if (parsed.username || parsed.password) {
      return defaultFallback;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Allowed trusted hostnames
    const allowedHostnames = new Set([
      "aihaat.shop",
      "www.aihaat.shop",
    ]);

    // Include configured environment hosts if valid
    const envHosts = [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXTAUTH_URL,
    ].filter(Boolean);

    for (const hostStr of envHosts) {
      try {
        const u = new URL(hostStr!);
        allowedHostnames.add(u.hostname.toLowerCase());
      } catch {}
    }

    // Allow localhost during development and testing
    if (process.env.NODE_ENV !== "production") {
      allowedHostnames.add("localhost");
      allowedHostnames.add("127.0.0.1");
    }

    if (allowedHostnames.has(hostname)) {
      return parsed.toString();
    }
  } catch {
    // Malformed URL parsing failure
  }

  return defaultFallback;
}
