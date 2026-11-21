"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReconcileButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function reconcile() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/eps-payments/reconcile?id=${encodeURIComponent(id)}`, {
        method: "POST",
      });
      const result = await response.json();
      if (result.status === "REFERENCE_CONFLICT") {
        setMessage("EPS returned a reference already linked to another attempt. Review both payments.");
      } else if (result.status === "REVIEW_REQUIRED") {
        setMessage("EPS confirmed the payment. The order requires manual review.");
        router.refresh();
      } else if (!response.ok) {
        setMessage(result.code === "STEP_UP_REQUIRED" ? "Verify MFA again before retrying." : "Reconciliation failed.");
      } else if (result.status === "FINALIZED") {
        setMessage("Payment finalized.");
        router.refresh();
      } else {
        setMessage("Payment is still unconfirmed.");
      }
    } catch {
      setMessage("Reconciliation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" disabled={busy} onClick={reconcile} className="rounded border px-3 py-1 disabled:opacity-60">
        {busy ? "Checking…" : "Check EPS"}
      </button>
      {message && <p role="status" className="mt-1">{message}</p>}
    </>
  );
}
