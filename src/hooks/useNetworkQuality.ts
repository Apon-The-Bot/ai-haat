"use client";

import { useState, useEffect, useRef } from "react";
import { ImageQualityProfile } from "@/lib/media/optimizer";

export interface NetworkConnectionInfo {
  readonly effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  readonly downlink?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
}

interface NetworkInformation extends EventTarget, NetworkConnectionInfo {
  onchange?: EventListener;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Conservative heuristic resolver for network connection profile
 */
export function resolveNetworkProfile(conn?: NetworkConnectionInfo | null): ImageQualityProfile {
  if (!conn) {
    return "balanced"; // Default fallback for SSR and unsupported browsers
  }

  // 1. Explicit user data-saver preference takes highest precedence
  if (conn.saveData) {
    return "low";
  }

  // 2. Slow connections
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

  // 4. Default / 3G / Intermediate
  return "balanced";
}

/**
 * Reusable hook to monitor client network quality with debouncing and SSR safety.
 */
export function useNetworkQuality(): {
  profile: ImageQualityProfile;
  isSupported: boolean;
  effectiveType?: string;
  saveData?: boolean;
} {
  // Always initialize with 'balanced' to guarantee identical SSR and initial client hydration
  const [profile, setProfile] = useState<ImageQualityProfile>("balanced");
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [effectiveType, setEffectiveType] = useState<string | undefined>(undefined);
  const [saveData, setSaveData] = useState<boolean | undefined>(undefined);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (!connection) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const updateProfile = () => {
      const resolved = resolveNetworkProfile(connection);
      setProfile(resolved);
      setEffectiveType(connection.effectiveType);
      setSaveData(connection.saveData);
    };

    // Immediate initial client evaluation after hydration
    updateProfile();

    // Debounced listener for dynamic network changes
    const handleChange = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updateProfile();
      }, 500);
    };

    if (typeof connection.addEventListener === "function") {
      connection.addEventListener("change", handleChange);
    } else {
      connection.onchange = handleChange;
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (typeof connection.removeEventListener === "function") {
        connection.removeEventListener("change", handleChange);
      } else {
        connection.onchange = undefined;
      }
    };
  }, []);

  return { profile, isSupported, effectiveType, saveData };
}
