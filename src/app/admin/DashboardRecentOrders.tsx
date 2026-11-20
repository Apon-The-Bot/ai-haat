import Link from "next/link";
import { ArrowRight, ShoppingBag } from "@/components/animated-icons/lucide";

export interface RecentOrdersData {
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalBDT: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryStatus: string;
    itemsSummary: string;
    createdAt: string;
  }>;
}

export function DashboardRecentOrders({
  stats,
  formatPrice,
}: {
  stats: RecentOrdersData | null;
  formatPrice: (amount: number) => string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#FC5C03]" />
          <h3 className="text-base font-black text-slate-900">Recent Customer Purchases</h3>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3 divide-y divide-slate-100">
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          stats.recentOrders.map((o) => (
            <div key={o.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">#{o.orderNumber || o.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      o.deliveryStatus === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : o.deliveryStatus === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {o.deliveryStatus}
                  </span>
                  <span className="text-slate-400">• {new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 mt-1">{o.itemsSummary || "Digital Subscription"}</h4>
                <span className="text-slate-400">Customer: {o.customerName} ({o.customerEmail})</span>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="font-black text-sm text-slate-900">{formatPrice(o.totalBDT)}</span>
                <Link
                  href={`/admin/orders?orderId=${o.orderNumber || o.id}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                >
                  View Order
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 py-8 text-center">No orders found.</p>
        )}
      </div>
    </div>
  );
}
