"use client";

import { useState } from "react";

export function EpsTestButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function testConnection() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/eps-payments/test", { method: "POST" });
      const result = await response.json();
      setMessage(response.ok && result.connected === true ? "EPS authentication succeeded." : "EPS authentication could not be confirmed.");
    } catch {
      setMessage("EPS authentication could not be confirmed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button type="button" onClick={testConnection} disabled={busy} className="rounded border px-3 py-1 disabled:opacity-60">
        {busy ? "Testing…" : "Test EPS authentication"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
