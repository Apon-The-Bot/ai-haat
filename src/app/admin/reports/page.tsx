"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  FileSpreadsheet,
  ShoppingBag,
  Users,
  CreditCard,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Download,
  AlertTriangle,
  RotateCcw,
  Undo2,
  Tag,
  Radio,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Building2,
  TrendingDown,
  ShieldAlert,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

type ReportTab =
  | "OVERVIEW"
  | "PROFIT"
  | "SUPPLIERS"
  | "SALES"
  | "PRODUCTS"
  | "CUSTOMERS"
  | "PAYMENTS"
  | "COUPONS"
  | "INVENTORY"
  | "AFTERSALES"
  | "ACQUISITION";

export default function AdminReportsPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [range, setRange] = useState<string>("30D");
  const [activeTab, setActiveTab] = useState<ReportTab>("OVERVIEW");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setReport(data.report);
        }
      } else {
        showToast("Failed to load analytics data", "error");
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
      showToast("Error connecting to analytics engine", "error");
    } finally {
      setLoading(false);
    }
  }, [range, showToast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCSV = (type: string) => {
    window.open(`/api/admin/reports/export?type=${type}&range=${range}`, "_blank");
    showToast(`Downloading ${type} report CSV...`, "success");
  };

  const overview = report?.overview;
  const kpis = overview?.kpis;
  const operational = overview?.operational;
  const profitAndMargin = report?.profitAndMargin;
  const supplierPerformance = report?.supplierPerformance;
  const inventoryValuation = report?.inventoryValuation;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      {/* Header & Date Range Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Authoritative Business Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Commercial Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Server-side financial truth derived from verified orders, COGS, inventory batches, and suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
            {[
              { id: "TODAY", label: "Today" },
              { id: "7D", label: "7D" },
              { id: "30D", label: "30D" },
              { id: "90D", label: "90D" },
              { id: "THIS_MONTH", label: "This Month" },
              { id: "ALL", label: "All Time" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  range === t.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchReport()}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FC5C03]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          { id: "OVERVIEW", label: "Overview", icon: TrendingUp },
          { id: "PROFIT", label: "Profit & Margins", icon: DollarSign },
          { id: "SUPPLIERS", label: "Suppliers & Sourcing", icon: Building2 },
          { id: "SALES", label: "Sales & Orders", icon: ShoppingBag },
          { id: "PRODUCTS", label: "Products & Variations", icon: Layers },
          { id: "CUSTOMERS", label: "Customers & Cohorts", icon: Users },
          { id: "PAYMENTS", label: "Payments & Gateways", icon: CreditCard },
          { id: "COUPONS", label: "Coupons", icon: Tag },
          { id: "INVENTORY", label: "Inventory Health", icon: Layers },
          { id: "AFTERSALES", label: "Refunds & Replacements", icon: RotateCcw },
          { id: "ACQUISITION", label: "Marketing / UTM", icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Verified Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Verified Revenue</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">৳</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loading ? "..." : formatPrice(kpis?.verifiedRevenue?.current || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-2">Gross customer payments confirmed</p>
            </div>

            {/* Net Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Net Revenue</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">৳</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loading ? "..." : formatPrice(kpis?.netRevenue?.current || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-2">Verified revenue minus refunds</p>
            </div>

            {/* Total COGS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Delivered COGS</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loading ? "..." : formatPrice(kpis?.cogs?.current || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-2">Cost of resources consumed by deliveries</p>
            </div>

            {/* Gross Profit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Profit</span>
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-xs">
                  {kpis?.grossMarginPct || 0}%
                </span>
              </div>
              <div className={`text-2xl font-black ${(kpis?.grossProfit?.current || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {loading ? "..." : formatPrice(kpis?.grossProfit?.current || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Coverage: {kpis?.costCoveragePct || 100}% known
              </p>
            </div>

            {/* Procurement Spend */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Procurement Spend</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loading ? "..." : formatPrice(kpis?.procurementSpend || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-2">Batch inventory purchases in period</p>
            </div>

            {/* Completed Refunds */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Completed Refunds</span>
                <Undo2 className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600">
                {loading ? "..." : formatPrice(kpis?.refundedValue?.current || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-2">Deducted from gross verified revenue</p>
            </div>

            {/* Paid Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Paid Orders</span>
                <ShoppingBag className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loading ? "..." : kpis?.verifiedOrders?.current || 0}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Total placed: {kpis?.totalOrders?.current || 0} orders
              </p>
            </div>

            {/* Gross AOV */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Gross AOV</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loading ? "..." : formatPrice(kpis?.averageOrderValue?.current || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-2">Average verified order basket size</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIT & MARGINS */}
      {activeTab === "PROFIT" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Realized Gross Profit & Margin Intelligence</h2>
              <p className="text-xs text-slate-500">Calculated strictly from delivered stock acquisition cost, replacements, and refunds</p>
            </div>
            <button
              onClick={() => handleExportCSV("PROFIT")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Profit CSV
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Recognized Revenue</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatPrice(profitAndMargin?.kpis?.totalNetRevenue || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Gross: {formatPrice(profitAndMargin?.kpis?.totalGrossRevenue || 0)}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Recognized COGS</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatPrice(profitAndMargin?.kpis?.totalCogs || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex gap-2">
                <span>Stock: {formatPrice(profitAndMargin?.kpis?.totalOriginalCogs || 0)}</span>
                <span>Repl: {formatPrice(profitAndMargin?.kpis?.totalReplacementCogs || 0)}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Realized Gross Profit</span>
              <div className={`text-2xl font-black mt-1 ${(profitAndMargin?.kpis?.totalGrossProfit || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatPrice(profitAndMargin?.kpis?.totalGrossProfit || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Gross Margin: {profitAndMargin?.kpis?.overallGrossMarginPct || 0}%</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cost Coverage</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {profitAndMargin?.kpis?.overallCostCoveragePct || 100}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {profitAndMargin?.kpis?.isCostComplete ? "100% Exact Profitability" : `${profitAndMargin?.kpis?.totalUnknownUnits} items missing cost`}
              </p>
            </div>
          </div>

          {/* Product Profitability Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-4">Product & Variation</th>
                    <th className="py-3.5 px-4 text-center">Units Sold</th>
                    <th className="py-3.5 px-4">Gross Revenue</th>
                    <th className="py-3.5 px-4">Net Revenue</th>
                    <th className="py-3.5 px-4">Delivered COGS</th>
                    <th className="py-3.5 px-4">Replacement Cost</th>
                    <th className="py-3.5 px-4">Gross Profit</th>
                    <th className="py-3.5 px-4 text-center">Margin %</th>
                    <th className="py-3.5 px-4 text-center">Cost Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {profitAndMargin?.products?.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.productName}</div>
                        <div className="text-xs text-slate-400">{p.variationName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {p.unitsSold}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {formatPrice(p.grossRevenue)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatPrice(p.netRevenue)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono text-xs">
                        {formatPrice(p.originalCogs)}
                      </td>
                      <td className="py-3.5 px-4 text-rose-600 font-mono text-xs">
                        {p.replacementCogs > 0 ? `+${formatPrice(p.replacementCogs)}` : "৳0"}
                      </td>
                      <td className={`py-3.5 px-4 font-bold ${p.grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatPrice(p.grossProfit)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          p.grossMarginPct >= 30 ? "bg-emerald-50 text-emerald-700" : p.grossMarginPct > 0 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {p.grossMarginPct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {p.isCostComplete ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            100% COMPLETE
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            {p.costCoveragePct}% ({p.unknownCostUnits} unknown)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIERS & SOURCING */}
      {activeTab === "SUPPLIERS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Supplier Sourcing & Quality Performance</h2>
              <p className="text-xs text-slate-500">Track total spend, delivered volume, invalid rate, and replacement failure metrics</p>
            </div>
            <button
              onClick={() => handleExportCSV("SUPPLIERS")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Suppliers CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-4">Supplier</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Total Spend</th>
                    <th className="py-3.5 px-4">Purchased Units</th>
                    <th className="py-3.5 px-4">Delivered</th>
                    <th className="py-3.5 px-4">Available Stock</th>
                    <th className="py-3.5 px-4">Invalid Rate</th>
                    <th className="py-3.5 px-4">Replacement Rate</th>
                    <th className="py-3.5 px-4">Avg Unit Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {supplierPerformance?.map((s: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <span className="text-xs text-slate-400 font-mono">{s.code}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {s.contactName && <div>{s.contactName}</div>}
                        {s.contactEmail && <div>{s.contactEmail}</div>}
                        {s.telegram && <div className="text-sky-600">@{s.telegram.replace("@", "")}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatPrice(s.totalSpendBDT || 0)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {s.totalPurchasedUnits}
                      </td>
                      <td className="py-3.5 px-4 text-blue-600 font-bold">
                        {s.deliveredCount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{s.availableCount} units</span>
                        <div className="text-xs text-slate-400">{formatPrice(s.availableValueBDT || 0)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          s.invalidRatePct > 10 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {s.invalidRatePct}%
                        </span>
                        <span className="text-xs text-slate-400 ml-1">({s.invalidCount})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          s.replacementRatePct > 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {s.replacementRatePct}%
                        </span>
                        <span className="text-xs text-slate-400 ml-1">({s.replacedCount})</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-800">
                        {s.avgCostBDT !== null ? formatPrice(s.avgCostBDT) : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SALES */}
      {activeTab === "SALES" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Sales Time-Series History</h2>
            <button
              onClick={() => handleExportCSV("SALES")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Verified Revenue</th>
                    <th className="py-3 px-4">Paid Orders</th>
                    <th className="py-3 px-4">Total Orders Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report?.salesTimeSeries?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.date}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{formatPrice(item.verifiedRevenue)}</td>
                      <td className="py-3 px-4 text-slate-700">{item.verifiedOrders}</td>
                      <td className="py-3 px-4 text-slate-400">{item.totalOrders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCTS */}
      {activeTab === "PRODUCTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Product & Variation Performance</h2>
            <button
              onClick={() => handleExportCSV("PRODUCTS")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Variation</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4">Gross Revenue</th>
                    <th className="py-3 px-4">Refunded</th>
                    <th className="py-3 px-4">Net Revenue</th>
                    <th className="py-3 px-4 text-center">Available Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report?.productPerformance?.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.productName}</td>
                      <td className="py-3 px-4 text-slate-600">{p.variationName}</td>
                      <td className="py-3 px-4 text-center font-bold">{p.unitsSold}</td>
                      <td className="py-3 px-4 text-slate-700">{formatPrice(p.grossRevenue)}</td>
                      <td className="py-3 px-4 text-rose-600 font-semibold">{formatPrice(p.refundedAmount)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{formatPrice(p.netRevenue)}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{p.availableStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMERS */}
      {activeTab === "CUSTOMERS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Customer Cohorts & Spenders</h2>
            <button
              onClick={() => handleExportCSV("CUSTOMERS")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Paid Orders</th>
                    <th className="py-3 px-4">Total Spend</th>
                    <th className="py-3 px-4 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report?.customerCohorts?.topCustomers?.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 text-slate-600">{c.email}</td>
                      <td className="py-3 px-4 text-center font-bold">{c.verifiedOrdersCount}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{formatPrice(c.totalVerifiedSpend)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          c.isRepeatCustomer ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {c.isRepeatCustomer ? "REPEAT" : "NEW"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PAYMENTS */}
      {activeTab === "PAYMENTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Payment Gateway Settlement & Health</h2>
            <button
              onClick={() => handleExportCSV("PAYMENTS")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4 text-center">Attempts</th>
                    <th className="py-3 px-4 text-center">Verified</th>
                    <th className="py-3 px-4">Volume (BDT)</th>
                    <th className="py-3 px-4 text-center">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report?.paymentGateways?.map((g: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900 uppercase">{g.gateway}</td>
                      <td className="py-3 px-4 text-center">{g.totalAttempts}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">{g.verifiedCount}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(g.verifiedVolumeBDT)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          g.successRatePct >= 80 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {g.successRatePct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: COUPONS */}
      {activeTab === "COUPONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Promotions & Discounts</h2>
            <button
              onClick={() => handleExportCSV("COUPONS")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Discount Value</th>
                    <th className="py-3 px-4 text-center">Usage Count</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report?.couponPerformance?.coupons?.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="py-3 px-4 text-slate-600">{c.discountType}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `৳${c.discountValue}`}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{c.usedCount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {c.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: INVENTORY HEALTH & VALUATION */}
      {activeTab === "INVENTORY" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Stock Value</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {formatPrice(inventoryValuation?.totalAvailableValueBDT || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{inventoryValuation?.statusBreakdown?.AVAILABLE?.count || 0} usable units</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Reserved Value</span>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {formatPrice(inventoryValuation?.totalReservedValueBDT || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{inventoryValuation?.statusBreakdown?.RESERVED?.count || 0} checkout units</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Invalid / Written-Off Loss</span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {formatPrice(inventoryValuation?.totalInvalidWriteOffLossBDT || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{inventoryValuation?.statusBreakdown?.INVALID?.count || 0} invalid units</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expired Stock Loss</span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {formatPrice(inventoryValuation?.totalExpiredLossBDT || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{inventoryValuation?.statusBreakdown?.EXPIRED?.count || 0} expired units</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: AFTERSALES */}
      {activeTab === "AFTERSALES" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Refund Requests</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Claims:</span>
                  <span className="font-bold">{report?.afterSales?.refunds?.totalRequests || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Completed Payouts:</span>
                  <span className="font-bold text-rose-600">{formatPrice(report?.afterSales?.refunds?.completedAmountBDT || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Warranty Replacements</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Requests:</span>
                  <span className="font-bold">{report?.afterSales?.replacements?.totalRequests || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: ACQUISITION & UTM */}
      {activeTab === "ACQUISITION" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Campaign & UTM Attribution</h2>
            <div className="text-xs text-slate-500">
              Direct / Unattributed: {report?.acquisition?.directSummary?.ordersCount || 0} orders (
              {formatPrice(report?.acquisition?.directSummary?.revenueBDT || 0)})
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">UTM Source</th>
                    <th className="py-3 px-4">UTM Medium</th>
                    <th className="py-3 px-4">UTM Campaign</th>
                    <th className="py-3 px-4">Verified Orders</th>
                    <th className="py-3 px-4">Verified Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report?.acquisition?.campaigns?.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.source}</td>
                      <td className="py-3 px-4 text-slate-600">{c.medium}</td>
                      <td className="py-3 px-4 text-[#FC5C03] font-mono">{c.campaign}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.verifiedOrdersCount}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{formatPrice(c.verifiedRevenueBDT)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
