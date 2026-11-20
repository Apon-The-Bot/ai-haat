import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminMfa } from "@/lib/auth-guard";
import type { Query } from "./records";

export async function requireFinanceAccess() {
  const auth = await requireAdminMfa();
  if ("user" in auth) return;
  if (auth.status === 401) redirect("/admin");
  const body = await auth.json() as { code?: string };
  if (body.code === "MFA_ENROLLMENT_REQUIRED") redirect("/admin/mfa-setup");
  return <p role="alert">Admin access and MFA verification are required to view financial records.</p>;
}

export function recordUrl(path: string, query: Query, overrides: Query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, ...overrides })) {
    if (typeof value === "string" && value) params.set(key, value);
  }
  return params.size ? `${path}?${params}` : path;
}

const bdt = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" });
export const money = (value: number | null) => value === null ? "Unrecorded" : bdt.format(value);
export const timestamp = (value: Date | null) => value ? value.toISOString().replace("T", " ").slice(0, 19) : "—";
export const orderUrl = (order: string) => recordUrl("/admin/reconciliation", { q: order });
export const walletUrl = (id: string) => recordUrl("/admin/reconciliation", { view: "wallet", q: id });
export const linkStyle = "font-medium text-blue-700 underline underline-offset-2";

export function RecordTable({ headings, rows }: { headings: string[]; rows: ReactNode[][] }) {
  if (!rows.length) return <p className="rounded-xl border bg-white p-5 text-sm">No matching records on this page.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>{headings.map(heading => <th scope="col" key={heading} className="px-4 py-3">{heading}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(([id, ...cells]) => (
            <tr key={String(id)} className="align-top">
              {cells.map((cell, index) => <td key={headings[index]} className="px-4 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ path, query, page, more }: { path: string; query: Query; page: number; more: boolean }) {
  return (
    <nav aria-label="Record pages" className="flex items-center gap-4 text-sm">
      {page > 1 && <Link className={linkStyle} href={recordUrl(path, query, { page: String(page - 1) })}>Previous</Link>}
      <span>Page {page}</span>
      {more && page < 10000 && <Link className={linkStyle} href={recordUrl(path, query, { page: String(page + 1) })}>Next</Link>}
    </nav>
  );
}
