export type VariationStock = {
  productId: string;
  productName: string;
  variationId: string | null;
  variationName: string;
  availableCount: number;
  reservedCount: number;
  deliveredCount: number;
  unavailableCount: number;
  waitingPaidUnits: number;
  lowStockAlert: boolean;
};

export function VariationStockTable({ rows, onSelect }: {
  rows: VariationStock[];
  onSelect: (row: VariationStock) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-bold text-slate-900">ভ্যারিয়েশন অনুযায়ী স্টক</h2>
      <div className="mt-3 max-h-80 overflow-auto">
        <table className="w-full whitespace-nowrap text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 text-slate-600">
            <tr>
              {["প্রোডাক্ট / ভ্যারিয়েশন", "বিক্রিযোগ্য", "সংরক্ষিত", "ডেলিভার্ড", "অব্যবহারযোগ্য", "Paid, delivery pending"].map((heading) => (
                <th key={heading} scope="col" className="px-3 py-2">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {rows.map((row) => (
              <tr key={JSON.stringify([row.productId, row.variationId])}>
                <td className="px-3 py-2">
                  <button type="button" className="font-semibold text-indigo-700 hover:underline" onClick={() => onSelect(row)}>
                    {row.productName} · {row.variationName}
                  </button>
                </td>
                <td className={row.lowStockAlert ? "px-3 py-2 font-bold text-amber-800" : "px-3 py-2"}>{row.availableCount}</td>
                <td className="px-3 py-2">{row.reservedCount}</td>
                <td className="px-3 py-2">{row.deliveredCount}</td>
                <td className="px-3 py-2">{row.unavailableCount}</td>
                <td className="px-3 py-2">{row.waitingPaidUnits} ইউনিট</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-3">কোনো স্টক সারাংশ পাওয়া যায়নি।</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
