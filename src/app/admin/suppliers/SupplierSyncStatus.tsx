export type SupplierSync = {
  id: string;
  status: string;
  createdAt: string;
  itemsTotal: number;
  itemsAdded: number;
  itemsSkipped: number;
};

const statusClass: Record<string, string> = {
  SUCCESS: "text-emerald-700",
  PARTIAL: "text-amber-800",
  FAILED: "text-rose-700",
};
const timestamp = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Dhaka",
});

export function SupplierSyncStatus({ syncs }: { syncs: SupplierSync[] }) {
  const latest = syncs[0];
  if (!latest) return <p className="mt-1 text-xs text-slate-500">No stock webhook activity recorded</p>;
  return (
    <details className="mt-1 text-xs text-slate-600">
      <summary className="cursor-pointer">
        Stock sync · <span className={statusClass[latest.status]}>{latest.status}</span>
        {" · "}<time dateTime={latest.createdAt}>{timestamp.format(new Date(latest.createdAt))} (Dhaka)</time>
      </summary>
      <ul className="mt-2 space-y-1">
        {syncs.map((sync) => (
          <li key={sync.id}>
            <time dateTime={sync.createdAt}>{timestamp.format(new Date(sync.createdAt))}</time>
            {" · "}<span className={statusClass[sync.status]}>{sync.status}</span>
            {" · "}{sync.itemsAdded}/{sync.itemsTotal} added, {sync.itemsSkipped} skipped
          </li>
        ))}
      </ul>
    </details>
  );
}
