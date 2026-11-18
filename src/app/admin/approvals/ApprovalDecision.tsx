"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { approvedStockExport } from "@/lib/admin-stock-export";

type StockRow = Awaited<ReturnType<typeof approvedStockExport>>[number];

function downloadStock(rows: StockRow[]) {
  const columns = [
    ["id", "Stock ID"], ["productName", "Product Name"], ["variationName", "Variation"],
    ["type", "Type"], ["status", "Status"], ["batchRef", "Batch Ref"],
    ["costPriceBDT", "Cost Price (BDT)"], ["credentialOrPayload", "Credential / Key"],
    ["assignedOrder", "Assigned Order"], ["customerEmail", "Customer Email"],
    ["deliveredAt", "Delivered At"], ["createdAt", "Created At"],
  ] as const satisfies readonly (readonly [keyof StockRow, string])[];
  const csvCell = (value: string | number) => {
    const text = String(value);
    const safe = /^[\t\r\n]|^\s*[=+\-@]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const csv = [columns.map(([, title]) => title).join(","),
    ...rows.map((row) => columns.map(([key]) => csvCell(row[key])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "digital-vault-export.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ApprovalDecision({ id, downloadsStock }: { id: string; downloadsStock: boolean }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision: "approve" | "reject") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Unable to save decision.");
      setFinished(true);
      if (downloadsStock && decision === "approve") downloadStock(data.items);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save decision.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        Decision reason
        <input className="mt-1 block w-full rounded-lg border p-2" value={reason} maxLength={500}
          onChange={(event) => setReason(event.target.value)} disabled={busy || finished} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          disabled={busy || finished || !reason.trim()} onClick={() => void decide("approve")}>
          {downloadsStock ? "Approve and download CSV" : "Approve"}
        </button>
        <button type="button" className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
          disabled={busy || finished || !reason.trim()} onClick={() => void decide("reject")}>Reject</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {finished && !error && <p role="status" className="text-sm text-green-700">Decision saved.</p>}
    </div>
  );
}
