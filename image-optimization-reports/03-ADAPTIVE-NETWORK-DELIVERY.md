# 03 — ADAPTIVE NETWORK DELIVERY SYSTEM REPORT

## 1. Network Awareness Philosophy

In emerging digital economies such as Bangladesh, user network connectivity spans from fiber-optic home broadband (50+ Mbps) to congested rural cellular towers (2G/3G speeds with high packet latency and frequent jitter). Delivering heavy desktop assets to mobile users with low bandwidth degrades user experience, increases bounce rates, and costs customers mobile data expenses.

The AI Haat Adaptive Image Delivery System implements client-side network detection combined with server-generated multi-tier assets to serve the optimal file size automatically.

---

## 2. Client-Side Detection (`useNetworkQuality`)

Implemented in `src/hooks/useNetworkQuality.ts`:

### 2.1 Interface & Fallbacks
The hook safely queries the W3C Network Information API via `navigator.connection` (with vendor fallbacks `mozConnection` and `webkitConnection`). If the browser does not support the API (e.g. Safari desktop), or during Server-Side Rendering (SSR), the system falls back to `"balanced"`.

### 2.2 Heuristic Resolution Matrix
```ts
export function resolveNetworkProfile(conn?: NetworkConnectionInfo | null): ImageQualityProfile {
  if (!conn) return "balanced"; // SSR & Safari default

  // 1. Explicit Data-Saver preference (Chrome / Android)
  if (conn.saveData) {
    return "low";
  }

  // 2. Slow cellular networks
  if (conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") {
    return "low";
  }
  if (typeof conn.downlink === "number" && conn.downlink > 0 && conn.downlink < 1.0) {
    return "low";
  }
  if (typeof conn.rtt === "number" && conn.rtt > 1000) {
    return "low";
  }

  // 3. Fast modern broadband / 4G
  if (conn.effectiveType === "4g") {
    if (typeof conn.downlink === "number") {
      return conn.downlink >= 2.5 ? "high" : "balanced";
    }
    return "high";
  }

  // 4. Default standard 3G / unknown
  return "balanced";
}
```

### 2.3 Debouncing & Anti-Thrashing
Cellular network signals fluctuate rapidly during transit (e.g. traveling in a vehicle). To prevent UI thrashing and excessive network re-fetching:
- Network `change` event listeners are filtered through a **500ms debounce**.
- Downgrades from `high` to `balanced`/`low` are applied conservatively.
- Once an image of a higher tier is loaded and cached by the browser, it is kept active rather than degraded unless explicit `saveData` is turned on.

---

## 3. Seamless Source Swap (Zero CLS & Zero Flicker)

When dynamic network conditions trigger a quality profile change:

1. **Preloading Off-Screen:**
   The `AdaptiveImage` component creates an off-screen `new Image()` object in memory and assigns the new target URL.
2. **Atomic Swap:**
   Only when the off-screen image fires its `onload` event does React swap the `src`/`srcSet` on the DOM node.
3. **Flicker Elimination:**
   Because the replacement image is already decoded in browser cache memory, the swap occurs in a single frame without showing blank frames, white flashes, or reloading spinners.
4. **Layout Stability (CLS = 0):**
   The outer container preserves the explicit aspect ratio (from manifest metadata or CSS aspect ratio) so zero layout shifting occurs.
