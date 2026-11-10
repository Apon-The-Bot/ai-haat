"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/analytics/attribution";
import { setBrowserMetaConfig, suspendBrowserMeta, trackMeta, type BrowserMetaConfig } from "@/lib/analytics/meta-browser";

const AnalyticsContext = createContext({ isEnabled: false, metaReady: false });
export const useAnalytics = () => useContext(AnalyticsContext);
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

function disableGa(disabled: boolean) {
  if (GA_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = disabled;
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const excluded = pathname?.startsWith("/admin");
  const [config, setConfig] = useState<BrowserMetaConfig>();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [ads, setAds] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const sequence = useRef(0);
  const invalidateRefresh = useCallback(() => { ++sequence.current; }, []);

  const refresh = useCallback(async () => {
    const id = ++sequence.current;
    try {
      const response = await fetch("/api/analytics/meta", { cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error("Configuration unavailable");
      const next = await response.json() as BrowserMetaConfig;
      if (id !== sequence.current) return;
      setBrowserMetaConfig(next);
      disableGa(!next.analytics);
      setConfig(next);
      if (next.ads || next.analytics) captureAttribution(next.ads);
      trackMeta("PageView");
    } catch {
      if (id === sequence.current) {
        suspendBrowserMeta();
        disableGa(true);
      }
    }
  }, []);

  useEffect(() => {
    if (excluded) {
      invalidateRefresh();
      suspendBrowserMeta();
      disableGa(true);
      return;
    }
    void refresh();
    const refreshVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    const timer = window.setInterval(refreshVisible, 30_000);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      invalidateRefresh();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [excluded, invalidateRefresh, refresh]);

  async function save(allowAds: boolean, allowAnalytics: boolean) {
    setBusy(true);
    setError(false);
    if (!allowAds || !allowAnalytics) suspendBrowserMeta();
    if (!allowAnalytics) disableGa(true);
    invalidateRefresh();
    try {
      const response = await fetch("/api/analytics/meta", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ads: allowAds, analytics: allowAnalytics }),
      });
      if (!response.ok) throw new Error("Could not save");
      setEditing(false);
      await refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  const gaEnabled = !excluded && config?.analytics === true && /^G-[A-Z0-9]+$/.test(GA_ID);
  const showOptions = !excluded && config && (editing || (!config.decided && (config.available || GA_ID)));
  return (
    <AnalyticsContext.Provider value={{ isEnabled: !!(gaEnabled || (!excluded && config?.ads && config.pixelId)), metaReady: !excluded && !!config?.ads && !!config.pixelId }}>
      {gaEnabled && <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){window.dataLayer.push(arguments);};
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {send_page_view: false, cookie_flags: 'SameSite=Lax;Secure'});
        `}</Script>
      </>}
      {children}
      {showOptions && (
        <section aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-lg">
          <h2 className="font-bold">Cookie preferences</h2>
          <p>Essential cookies keep shopping and sign-in working. Choose whether to allow analytics and advertising.</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex gap-2"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics</label>
            <label className="flex gap-2"><input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} /> Advertising</label>
          </div>
          {error && <p role="alert" className="text-red-700">Could not save preferences. Please retry.</p>}
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} className="rounded-lg border px-3 py-2" onClick={() => void save(false, false)}>Reject optional</button>
            <button disabled={busy} className="rounded-lg bg-orange-600 px-3 py-2 text-white" onClick={() => void save(ads, analytics)}>Save preferences</button>
            {editing && <button type="button" className="px-3 py-2 underline" onClick={() => setEditing(false)}>Close</button>}
          </div>
        </section>
      )}
      {!excluded && config && !showOptions && (config.available || config.decided || GA_ID) &&
        <button className="block px-4 py-2 text-xs text-slate-600 underline" onClick={() => {
          setAds(config.ads); setAnalytics(config.analytics); setEditing(true);
        }}>Cookie preferences</button>}
    </AnalyticsContext.Provider>
  );
}
