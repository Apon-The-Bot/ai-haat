export function safeAuthReturn(target: string | null | undefined, fallback = "/"): string {
  if (!target?.startsWith("/") || target.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(target)) {
    return fallback;
  }
  const base = "https://internal.invalid";
  const url = new URL(target, base);
  if (url.origin !== base || url.pathname.startsWith("//")) return fallback;
  if (/^\/(?:login(?:\/|$)|api(?:\/|$))/.test(url.pathname)) return fallback;
  return url.pathname + url.search + url.hash;
}
