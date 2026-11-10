"use client";

import type { MetaEventName } from "./meta-events";

export type BrowserMetaConfig = {
  pixelId: string;
  events: Record<MetaEventName, boolean>;
  ads: boolean;
  analytics: boolean;
  available: boolean;
  decided: boolean;
};
type PixelQueue = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

let config: BrowserMetaConfig | undefined;
let suspended = false;
let lastPageView = "";
let currentNavigation = "";
let scriptState: "idle" | "loading" | "loaded" = "idle";
const initialized = new Set<string>();
const pending: Array<{ name: MetaEventName; data?: object; eventId?: string; pixelId?: string; url: string }> = [];

export function isMetaBrowserUrl(url: URL) {
  if (url.hash) return false;
  if (!/^\/(?:$|(?:shop|cart|compare|checkout|gift-cards|product-request|login|contact)\/?$|checkout\/success$|product\/[a-z0-9-]+\/?$)/i.test(url.pathname)) return false;
  return Array.from(url.searchParams).every(([key, value]) => {
    if (url.pathname === "/checkout/success") {
      return (key === "orderId" && /^[A-Za-z0-9_-]{1,64}$/.test(value)) ||
        (key === "status" && /^(completed|success|failed|pending)$/.test(value));
    }
    if (url.pathname === "/checkout" || url.pathname === "/login") return false;
    if (key === "fbclid") return /^[A-Za-z0-9_-]{8,256}$/.test(value);
    return /^utm_(source|medium|campaign|content)$/.test(key) &&
      /^[A-Za-z0-9_-]{1,80}$/.test(value) && !/\d{8}/.test(value);
  });
}

function maySendFromDocument() {
  if (!document.referrer) return true;
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin !== window.location.origin || isMetaBrowserUrl(referrer);
  } catch {
    return false;
  }
}

function pixel() {
  const target = window as typeof window & { _fbq?: PixelQueue };
  if (!target.fbq) {
    const queue: PixelQueue = Object.assign((...args: unknown[]) => {
      if (queue.callMethod) queue.callMethod(...args);
      else queue.queue.push(args);
    }, { queue: [] as unknown[][], loaded: true, version: "2.0" });
    queue.push = queue;
    target.fbq = queue;
    target._fbq = queue;
  }
  if (scriptState === "idle") {
    scriptState = "loading";
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.referrerPolicy = "no-referrer";
    script.onload = () => { scriptState = "loaded"; };
    script.onerror = () => {
      scriptState = "idle";
      initialized.clear();
      (target.fbq as PixelQueue | undefined)?.queue?.splice(0);
      script.remove();
    };
    document.head.append(script);
  }
  return target.fbq;
}

export function setBrowserMetaConfig(next: BrowserMetaConfig) {
  const previous = config;
  config = next;
  suspended = false;
  if ((!next.ads || !next.pixelId || previous?.pixelId !== next.pixelId) && window.fbq) {
    (window.fbq as PixelQueue).queue?.splice(0);
    if (scriptState !== "loaded") initialized.clear();
    window.fbq("consent", "revoke");
  }
  if (previous?.pixelId !== next.pixelId || previous?.ads !== next.ads) lastPageView = "";
  for (const event of pending.splice(0)) {
    if (event.url === window.location.href) trackMeta(event.name, event.data, event.eventId, event.pixelId);
  }
}

export function suspendBrowserMeta() {
  suspended = true;
  lastPageView = "";
  pending.length = 0;
  (window.fbq as PixelQueue | undefined)?.queue?.splice(0);
  if (scriptState !== "loaded") initialized.clear();
  window.fbq?.("consent", "revoke");
}

export function hasAnalyticsConsent() {
  return !suspended && config?.analytics === true;
}

export function canTrackMeta(name: MetaEventName) {
  return !suspended && !!config?.ads && !!config.pixelId && config.events[name];
}

export function observeMetaNavigation() {
  const current = window.location.href;
  if (currentNavigation === current) return;
  currentNavigation = current;
  lastPageView = "";
}

export function trackMeta(name: MetaEventName, data?: object, eventId?: string, expectedPixelId?: string): boolean {
  if (typeof window === "undefined" || suspended) return false;
  observeMetaNavigation();
  const url = new URL(window.location.href);
  const registrationLanding = name === "CompleteRegistration" && url.pathname === "/dashboard" && !url.search && !url.hash;
  if ((!isMetaBrowserUrl(url) && !registrationLanding) || !maySendFromDocument()) return false;
  if (!config) {
    if (pending.length < 20 && name !== "Purchase") pending.push({ name, data, eventId, pixelId: expectedPixelId, url: url.href });
    return false;
  }
  if (!config.ads || !config.pixelId || !config.events[name] || (expectedPixelId && config.pixelId !== expectedPixelId)) return false;
  if (name === "PageView" && lastPageView === url.href) return false;
  try {
    const fbq = pixel();
    if (!initialized.has(config.pixelId)) {
      fbq("set", "autoConfig", false, config.pixelId);
      fbq("init", config.pixelId);
      initialized.add(config.pixelId);
    }
    fbq("consent", "grant");
    fbq(name === "RemoveFromCart" ? "trackSingleCustom" : "trackSingle", config.pixelId, name, data || {}, eventId ? { eventID: eventId } : {});
    if (name === "PageView") lastPageView = url.href;
    return true;
  } catch {
    return false;
  }
}
