"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { staffRoles } from "@/lib/staff-roles";

export function StaffAccessForm({ requestId, expired }: { requestId?: string; expired?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestId
          ? { ...fields, type: "decision", id: requestId }
          : { ...fields, type: "request" }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Unable to save.");
        return;
      }
      form.reset();
      setMessage(requestId ? "Decision recorded." : "Request submitted for review.");
      router.refresh();
    } catch {
      setMessage("Unable to save. Refresh to check the latest state.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <fieldset disabled={busy} className="flex flex-wrap items-end gap-3">
        {!requestId && (
          <label className="grid gap-1">Account email
            <input name="email" type="email" required maxLength={254} className="rounded border bg-transparent p-2" />
          </label>
        )}
        {requestId ? (
          <label className="grid gap-1">Decision
            <select name="decision" className="rounded border bg-background p-2" defaultValue="reject">
              <option value="reject">Reject</option>
              <option value="approve" disabled={expired}>Approve</option>
            </select>
          </label>
        ) : (
          <>
          <label className="grid gap-1">Change
            <select name="change" className="rounded border bg-background p-2">
              <option value="grant">Grant access</option>
              <option value="revoke">Revoke access</option>
            </select>
          </label>
          <label className="grid gap-1">Role
            <select name="role" className="rounded border bg-background p-2">
              {staffRoles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </label>
          </>
        )}
        <label className="grid gap-1">Reason
          <input name="reason" required minLength={10} maxLength={500} className="rounded border bg-transparent p-2" />
        </label>
        <button className="rounded bg-primary px-4 py-2 text-primary-foreground" type="submit">
          {busy ? "Saving…" : requestId ? "Record decision" : "Request change"}
        </button>
      </fieldset>
      <p role="status" className="text-sm">{message}</p>
    </form>
  );
}
