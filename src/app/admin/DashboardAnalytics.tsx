import Link from "next/link";
import { KeyRound, Plus, Tag, TrendingUp } from "@/components/animated-icons/lucide";

type AnalyticsStats = {
  revenue: number;
  gatewayDistribution: Record<string, number>;
  dailyTrend: Array<{ date: string; revenue: number; orders: number }>;
};

export function DashboardAnalytics({
  stats,
  formatPrice,
}: {
  stats: AnalyticsStats | null;
  formatPrice: (amount: number) => string;
}) {
  const maxDailyRevenue = Math.max(...(stats?.dailyTrend.map((day) => day.revenue) ?? []), 1000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* Left: 7-Day Revenue & Velocity Chart (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Revenue & Sales Velocity Trend</h3>
            <p className="text-xs text-slate-500">Daily verified volume over the selected window</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg font-mono">
            7 Days Velocity
          </span>
        </div>

        {/* Bar / Trend Chart */}
        <div className="pt-4">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-slate-100 pb-3">
            {stats?.dailyTrend && stats.dailyTrend.map((day, idx) => {
              const heightPercent = Math.max(8, Math.round((day.revenue / maxDailyRevenue) * 100));
              return (
                <div key={idx} className="flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    ৳{day.revenue} ({day.orders} orders)
                  </div>

                  <div className="w-full max-w-[36px] bg-slate-100 rounded-xl overflow-hidden h-36 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-[#FC5C03] to-[#FF8540] rounded-xl transition-all group-hover:brightness-110"
                    />
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-500 font-mono text-center truncate max-w-full">
                    {day.date.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Payment Gateway Distribution & Quick Actions (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Payment Gateways Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-black text-slate-900">Gateway Distribution</h3>

          <div className="space-y-3">
            {stats?.gatewayDistribution && Object.keys(stats.gatewayDistribution).length > 0 ? (
              Object.entries(stats.gatewayDistribution).map(([gw, vol]) => {
                const percent = stats.revenue > 0 ? Math.round((vol / stats.revenue) * 100) : 0;
                return (
                  <div key={gw} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800 uppercase">{gw}</span>
                      <span className="font-mono text-slate-500">{formatPrice(vol)} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-[#FC5C03] rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No payment transactions in this period.</p>
            )}
          </div>
        </div>

        {/* Quick Operational Shortcuts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/admin/products/new"
              className="p-3 bg-slate-50 hover:bg-[#FFF2E8] hover:text-[#FC5C03] rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-[#FC5C03]" />
              <span>Add Product</span>
            </Link>

            <Link
              href="/admin/inventory"
              className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Stock</span>
            </Link>

            <Link
              href="/admin/coupons"
              className="p-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
            >
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span>New Coupon</span>
            </Link>

            <Link
              href="/admin/reports"
              className="p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Sales Reports</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
