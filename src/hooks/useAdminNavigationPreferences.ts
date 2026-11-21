"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminNavigation, type AdminNavigationGroup } from "@/components/admin/admin-navigation";

export type SidebarMode = "AUTO" | "EXPANDED" | "COMPACT";
type Preferences = {
  version: 1;
  sidebarMode: SidebarMode;
  groupOrder: string[];
  hiddenItems: string[];
  favorites: string[];
  expandedGroups: Record<string, boolean>;
};

const STORAGE_KEY = "aihaat:admin-navigation:v1";

const defaults = (): Preferences => ({
  version: 1,
  sidebarMode: "AUTO",
  groupOrder: adminNavigation.map((group) => group.group),
  hiddenItems: [],
  favorites: [],
  expandedGroups: Object.fromEntries(adminNavigation.map((group) => [group.group, true])),
});

function reconcile(value: unknown): Preferences {
  const fallback = defaults();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<Preferences>;
  const validGroups = new Set(adminNavigation.map((group) => group.group));
  const validItems = new Set(adminNavigation.flatMap((group) => group.items.map((item) => item.href)));
  const groupOrder = Array.from(new Set((Array.isArray(candidate.groupOrder) ? candidate.groupOrder : []).filter((group): group is string => validGroups.has(group))));
  for (const group of fallback.groupOrder) if (!groupOrder.includes(group)) groupOrder.push(group);
  return {
    version: 1,
    sidebarMode: candidate.sidebarMode === "EXPANDED" || candidate.sidebarMode === "COMPACT" ? candidate.sidebarMode : "AUTO",
    groupOrder,
    hiddenItems: Array.from(new Set((Array.isArray(candidate.hiddenItems) ? candidate.hiddenItems : []).filter((item): item is string => validItems.has(item)))),
    favorites: Array.from(new Set((Array.isArray(candidate.favorites) ? candidate.favorites : []).filter((item): item is string => validItems.has(item)))),
    expandedGroups: Object.fromEntries(fallback.groupOrder.map((group) => [group, candidate.expandedGroups?.[group] !== false])),
  };
}

export function useAdminNavigationPreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => defaults());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPreferences(reconcile(JSON.parse(raw)));
    } catch {
      // Invalid or unavailable storage safely falls back to defaults.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences, ready]);

  const update = useCallback((change: Partial<Preferences>) => setPreferences((current) => reconcile({ ...current, ...change })), []);
  const toggleGroup = useCallback((group: string) => setPreferences((current) => ({ ...current, expandedGroups: { ...current.expandedGroups, [group]: !current.expandedGroups[group] } })), []);
  const toggleFavorite = useCallback((href: string) => setPreferences((current) => ({ ...current, favorites: current.favorites.includes(href) ? current.favorites.filter((item) => item !== href) : [...current.favorites, href] })), []);
  const reset = useCallback(() => setPreferences(defaults()), []);

  const groups = useMemo<AdminNavigationGroup[]>(() => preferences.groupOrder.map((groupName) => adminNavigation.find((group) => group.group === groupName)).filter((group): group is AdminNavigationGroup => Boolean(group)), [preferences.groupOrder]);
  return { preferences, groups, update, toggleGroup, toggleFavorite, reset, ready };
}
