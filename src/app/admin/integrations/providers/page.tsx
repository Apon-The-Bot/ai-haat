import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, requireAdminMfa } from "@/lib/auth-guard";
import { pendingProviders, providers, type Provider } from "@/lib/provider-catalog";
import { readCatalog, syncCatalog } from "@/lib/provider-catalog-store";
import { SyncAll } from "./sync-all";

export const dynamic = "force-dynamic";
const pageSize = 50;

async function syncOne(id: string): Promise<"ok" | "failed" | "mfa"> {
  "use server";
  if (typeof id !== "string" || !Object.hasOwn(providers, id)) return "failed";
  const admin = await requireAdminMfa();
  if (!("user" in admin)) return "mfa";
  try {
    return await syncCatalog(id as Provider, admin.user.id) ? "ok" : "failed";
  } catch {
    return "failed";
  }
}

export default async function ProviderProducts({ searchParams }: {
  searchParams: Promise<{ provider?: string; q?: string; page?: string; syncError?: string }>;
}) {
  const auth = await requireAdmin();
  if (!("user" in auth)) redirect("/admin");
  const query = await searchParams;
  const selected = typeof query.provider === "string" && Object.hasOwn(providers, query.provider)
    ? query.provider as Provider : null;
  const term = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const requestedPage = Number(query.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const result = selected ? await readCatalog(selected)
    .then(snapshot => ({ ...snapshot, error: null }))
    .catch(() => ({ rows: [], history: [], fetchedAt: undefined, error: "Catalog storage is unavailable." })) : null;
  const matches = result?.rows.filter(row =>
    [row.id, row.name].some(value => value.toLowerCase().includes(term.toLowerCase())),
  ) ?? [];
  const maxPage = Math.max(1, Math.ceil(matches.length / pageSize));
  const currentPage = Math.min(page, maxPage);
  const pageHref = (next: number) => "?" + new URLSearchParams({ provider: selected ?? "", q: term, page: String(next) });

  async function sync(form: FormData) {
    "use server";
    const id = form.get("provider");
    if (typeof id !== "string" || !Object.hasOwn(providers, id)) redirect("/admin/integrations/providers");
    const href = "/admin/integrations/providers?" + new URLSearchParams({ provider: id });
    const admin = await requireAdminMfa();
    if (!("user" in admin)) redirect(href + "&syncError=mfa");
    let failed = false;
    try {
      await syncCatalog(id as Provider, admin.user.id);
    } catch {
      failed = true;
    }
    redirect(failed ? href + "&syncError=storage" : href);
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Provider Products</h1>
      <p className="text-sm text-slate-600">Saved provider costs. USD prices are converted at ৳130 per USD.</p>
      <form className="flex flex-wrap gap-2">
        <select aria-label="Provider" name="provider" defaultValue={selected ?? ""} className="rounded border bg-white p-2">
          <option value="">Select provider</option>
          {Object.entries(providers).map(([id, name]) => <option key={id} value={id}>@{name}</option>)}
        </select>
        <input aria-label="Search products" name="q" placeholder="Product name or ID" defaultValue={term} className="rounded border p-2" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">View products</button>
      </form>
      <SyncAll ids={Object.keys(providers)} sync={syncOne} />
      {selected && <form action={sync}>
        <input type="hidden" name="provider" value={selected} />
        <button className="rounded border bg-white px-4 py-2">Sync provider</button>
      </form>}
      {query.syncError === "mfa" && <p role="alert">Verify admin two-factor authentication before syncing.</p>}
      {query.syncError === "storage" && <p role="alert">Catalog storage is unavailable.</p>}
      {result?.error && <p role="alert" className="text-red-700">{result.error}</p>}
      {result && !result.error && <>
        <p className="text-sm text-slate-600">{result.fetchedAt
          ? <>{matches.length} matching products · {result.rows.length} saved · Last successful fetch {result.fetchedAt.toISOString()}</>
          : "No successful sync yet."}</p>
        {result.history.length > 0 && <details className="rounded border bg-white p-3 text-sm">
          <summary>Recent sync history</summary>
          <ul className="mt-2 space-y-2">
            {result.history.map(run => <li key={run.id}>
              {run.startedAt.toISOString()} · {run.status}
              {run.productCount !== null && <> · {run.productCount} products</>}
              {run.error && <> · {run.error}</>}
            </li>)}
          </ul>
        </details>}
        {matches.length > 0 && <div className="overflow-x-auto rounded border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>{["Product", "ID", "Original price", "BDT price", "Availability"].map(label =>
                <th key={label} className="whitespace-nowrap p-3">{label}</th>,
              )}</tr>
            </thead>
            <tbody>
              {matches.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row, index) => (
                <tr key={row.id + ":" + index} className="border-t align-top">
                  <td className="min-w-56 p-3">
                    {row.description ? <details><summary>{row.name}</summary><p className="mt-2 whitespace-pre-wrap">{row.description}</p></details> : row.name}
                  </td>
                  <td className="p-3">{row.id}</td>
                  <td className="whitespace-nowrap p-3">
                    {row.original === null ? "Unavailable" : row.original + " " + (row.currency ?? "(unknown currency)")}
                    {row.tiers.map(tier => <div key={tier.label}>{tier.label}: {tier.original}</div>)}
                  </td>
                  <td className="p-3">{row.bdt === null ? "Conversion unavailable" : "৳" + row.bdt}</td>
                  <td className="p-3">{row.availability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
        {maxPage > 1 && <nav aria-label="Product pages" className="flex gap-4 text-sm">
          {currentPage > 1 && <Link prefetch={false} href={pageHref(currentPage - 1)}>Previous</Link>}
          <span>Page {currentPage} of {maxPage}</span>
          {currentPage < maxPage && <Link prefetch={false} href={pageHref(currentPage + 1)}>Next</Link>}
        </nav>}
      </>}
      <details className="rounded border bg-white p-3 text-sm">
        <summary>{Object.keys(pendingProviders).length} providers pending verification</summary>
        <ul className="mt-2 space-y-2">
          {Object.entries(pendingProviders).map(([name, reason]) => (
            <li key={name}><strong>@{name}</strong> · {reason}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
