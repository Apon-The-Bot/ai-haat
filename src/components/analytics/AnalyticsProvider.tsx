"use client";

// ─── AI Haat Analytics — Provider & Script Loader ────────────────
// Initializes GA4 and Meta Pixel exactly once. Handles attribution capture.
// Missing env vars → no scripts loaded, no errors.
// Excludes /admin routes from analytics initialization.

import React, { createContext, useContext, useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/analytics/attribution";

interface AnalyticsContextValue {
  isEnabled: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({ isEnabled: false });

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initRef = useRef(false);

  // Skip analytics entirely on admin routes
  const isAdmin = pathname?.startsWith("/admin");
  const isEnabled = !isAdmin && (!!GA_ID || !!PIXEL_ID);

  // Capture UTM attribution on first load
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    captureAttribution();
  }, []);

  return (
    <AnalyticsContext.Provider value={{ isEnabled }}>
      {/* GA4 Script — only if measurement ID configured */}
      {GA_ID && !isAdmin && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                send_page_view: false,
                cookie_flags: 'SameSite=Lax;Secure'
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel Script — only if pixel ID configured */}
      {PIXEL_ID && !isAdmin && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
          `}
        </Script>
      )}

      {children}
    </AnalyticsContext.Provider>
  );
}
