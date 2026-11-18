"use client";

import { useEffect, useState } from "react";

export type OrderFilters = { deliveryStatus: string; paymentStatus: string; paymentMethod: string };
type Preset = OrderFilters & { name: string };

export function SavedOrderFilters({ accountId, filters, onApply }: {
  accountId: string;
  filters: OrderFilters;
  onApply: (filters: OrderFilters) => void;
}) {
  const key = `ai-haat:admin-order-filters:v1:${accountId}`;
  const [presets, setPresets] = useState<Preset[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(data)) {
        setPresets(data.filter((item): item is Preset => item && ["name", "deliveryStatus", "paymentStatus", "paymentMethod"]
          .every((field) => typeof item[field] === "string")).slice(0, 20));
      }
    } catch {
      setMessage("Saved filters could not be loaded.");
    }
  }, [key]);

  function persist(updated: Preset[], confirmation: string) {
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      setPresets(updated);
      setMessage(confirmation);
      return true;
    } catch {
      setMessage("Saved filters could not be updated.");
      return false;
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800">
      <label className="flex items-center gap-2">
        Saved order filters
        <select className="rounded border border-slate-200 p-2" value={selected} onChange={(event) => {
          const value = event.target.value;
          setSelected(value);
          const preset = presets.find((item) => item.name === value);
          if (preset) onApply(preset);
        }}>
          <option value="">Select a filter</option>
          {presets.map((preset) => <option key={preset.name}>{preset.name}</option>)}
        </select>
      </label>
      <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        if (presets.some((entry) => entry.name === trimmed)) {
          setMessage("Choose a different filter name.");
          return;
        }
        if (presets.length >= 20) {
          setMessage("Remove a saved filter before adding another.");
          return;
        }
        if (persist([...presets, { ...filters, name: trimmed }], "Filter saved on this browser.")) {
          setSelected(trimmed);
          setName("");
        }
      }}>
        <input aria-label="Filter name" placeholder="Filter name" className="rounded border border-slate-200 p-2" value={name} maxLength={50} onChange={(event) => setName(event.target.value)} />
        <button className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50" disabled={!name.trim()}>Save current statuses</button>
      </form>
      <button type="button" className="px-2 py-2 underline disabled:opacity-50" disabled={!selected} onClick={() => {
        if (persist(presets.filter((entry) => entry.name !== selected), "Filter removed.")) setSelected("");
      }}>Remove saved filter</button>
      {message && <span role="status">{message}</span>}
    </div>
  );
}
