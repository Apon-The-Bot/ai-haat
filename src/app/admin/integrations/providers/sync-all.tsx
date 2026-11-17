"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncAll({ ids, sync }: {
  ids: string[];
  sync: (id: string) => Promise<"ok" | "failed" | "mfa">;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setRunning(true);
    let failed = 0;
    try {
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        setMessage(`Syncing ${index + 1} of ${ids.length} providers…`);
        const result = await sync(id).catch(() => "failed");
        if (result === "mfa") {
          setMessage("Verify admin two-factor authentication before syncing.");
          return;
        }
        if (result === "failed") failed++;
      }
      setMessage(`${ids.length - failed} of ${ids.length} catalogs synced. ${failed} failed or were already running.`);
      router.refresh();
    } finally {
      setRunning(false);
    }
  }

  return <div className="flex flex-wrap items-center gap-2">
    <button type="button" disabled={running} onClick={run} className="rounded border bg-white px-4 py-2 disabled:opacity-50">
      Sync all providers
    </button>
    <p role="status" className="text-sm">{message}</p>
  </div>;
}
