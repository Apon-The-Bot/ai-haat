"use client";

import { useEffect, useState } from "react";

const fields = [
  ["name", "নাম", "name"],
  ["phone", "মোবাইল নম্বর", "tel"],
  ["address", "ঠিকানা", "street-address"],
  ["city", "শহর", "address-level2"],
  ["state", "বিভাগ", "address-level1"],
  ["postcode", "পোস্টকোড", "postal-code"],
] as const;

export function EpsBillingFields() {
  const [required, setRequired] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/payment/gateway", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (!controller.signal.aborted) setRequired(data.epsBillingRequired === true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (required === false) return null;

  return (
    <details open={required === true ? true : undefined} className="rounded-lg border p-3">
      <summary className="cursor-pointer">EPS বিলিং তথ্য</summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {fields.map(([name, label, autoComplete]) => (
          <label key={name} className="grid gap-1 text-sm">
            {label}
            <input name={`eps-${name}`} autoComplete={autoComplete} maxLength={200} required={required === true}
              pattern={name === "phone" ? "(?:[+]?(?:88))?01[0-9]{9}" : name === "postcode" ? "[0-9]{4}" : undefined}
              className="rounded-md border bg-transparent px-3 py-2" />
          </label>
        ))}
      </div>
    </details>
  );
}

export function readEpsBilling(form: HTMLFormElement) {
  const values = new FormData(form);
  return Object.fromEntries(fields.map(([name]) => [name, values.get(`eps-${name}`)]));
}

