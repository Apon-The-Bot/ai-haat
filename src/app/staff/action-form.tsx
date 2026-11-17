"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export function StaffActionForm({ action, label, children }: {
  action: (data: FormData) => Promise<{ message: string; success?: boolean }>;
  label: string;
  children?: ReactNode;
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setMessage("");
    try {
      const result = await action(data);
      setMessage(result.message);
      if (result.success) form.reset();
    } catch {
      setMessage("Could not confirm the outcome. Refresh before retrying.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form method="post" onSubmit={submit} className="space-y-2">
      {children}
      <button disabled={pending} className="rounded border px-3 py-1 disabled:opacity-50">
        {pending ? "Working…" : label}
      </button>
      <p role="status" className="text-sm">{message}</p>
    </form>
  );
}
