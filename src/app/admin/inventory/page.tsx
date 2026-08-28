"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PackageCheck,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Lock,
  Eye,
  Key,
  ShieldAlert,
  Send,
  X,
  Copy,
  Check,
  Filter,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface StockSummary {
  productId: string;
  productName: string;
  variationId: string | null;
  variationName: string;
  availableCount: number;
  reservedCount: number;
  deliveredCount: number;
  invalidCount: number;
  totalCount: number;
  lowStockAlert: boolean;
}

interface StockItem {
  id: string;
  productId: string;
  productName: string;
  variationName: string;
  type: string;
  status: string;
  batchRef?: string;
  costPriceBDT?: number;
  assignedOrder: string | null;
  customerEmail: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

interface ReplacementItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName: string;
  variationName: string;
  reason: string;
  description: string;
  status: string;
  adminNotes?: string;
  isWarrantyValid: boolean;
  warrantyExpiresAt: string;
  deliveredAt: string;
  createdAt: string;
}

export default function AdminInventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="w-6 h-6 animate-spin text-[#FC5C03]" />
        </div>
      }
    >
      <AdminInventoryContent />
    </Suspense>
  );
}

function AdminInventoryContent() {
  const searchParams = useSearchParams();
  const productParam = searchParams?.get("product") || searchParams?.get("productId");

  const [activeTab, setActiveTab] = useState<"stocks" | "replacements">("stocks");
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [replacements, setReplacements] = useState<ReplacementItem[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState(productParam || "ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [revealedCredential, setRevealedCredential] = useState<{ id: string; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Add Single Form State
  const [selectedProduct, setSelectedProduct] = useState(productParam || "");
  const [selectedVariation, setSelectedVariation] = useState("");
  const [stockType, setStockType] = useState("LICENSE_KEY");
  const [payloadText, setPayloadText] = useState("");
  const [batchRef, setBatchRef] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Bulk Import Form State
  const [bulkLines, setBulkLines] = useState("");
  const [bulkResult, setBulkResult] = useState<any>(null);

  useEffect(() => {
    if (productParam) {
      setProductFilter(productParam);
      setSelectedProduct(productParam);
    }
  }, [productParam]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/inventory", window.location.origin);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (productFilter !== "ALL") url.searchParams.set("productId", productFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSummary(Array.isArray(data.summary) ? data.summary : []);
          setStocks(Array.isArray(data.recentStocks) ? data.recentStocks : []);
        }
      }

      // Also fetch replacements
      const repRes = await fetch("/api/admin/replacements");
      if (repRes.ok) {
        const repData = await repRes.json();
        if (repData.success) {
          setReplacements(Array.isArray(repData.requests) ? repData.requests : []);
        }
      }

      // Fetch products list for dropdowns
      const prodRes = await fetch("/api/products?limit=100&status=ALL");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const list = Array.isArray(prodData)
          ? prodData
          : Array.isArray(prodData?.products)
          ? prodData.products
          : [];
        setProductsList(list);
      }
    } catch (error) {
      console.error("Failed to load inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter, productFilter]);

  const handleRevealStock = async (stockId: string) => {
    try {
      const res = await fetch("/api/admin/inventory/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRevealedCredential({ id: stockId, text: data.credentials });
      } else {
        alert(data.error || "Failed to decrypt credentials");
      }
    } catch (err) {
      alert("Network error revealing credentials");
    }
  };

  const handleAddSingleStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !payloadText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          variationId: selectedVariation || null,
          type: stockType,
          payload: payloadText.trim(),
          batchRef: batchRef || null,
          costPriceBDT: costPrice ? Number(costPrice) : undefined,
          notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setPayloadText("");
        fetchInventory();
      } else {
        alert(data.error || "Failed to add stock");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !bulkLines.trim()) return;

    const lines = bulkLines.split("\n").filter((l) => l.trim().length > 0);

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          variationId: selectedVariation || null,
          type: stockType,
          lines,
          batchRef: batchRef || null,
          costPriceBDT: costPrice ? Number(costPrice) : undefined,
          notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBulkResult(data.details);
        setBulkLines("");
        fetchInventory();
      } else {
        alert(data.error || "Failed to import stock");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewReplacement = async (requestId: string, action: "APPROVE" | "REJECT") => {
    const note = prompt(
      action === "APPROVE"
        ? "অনুমোদনের নোট লিখুন (ঐচ্ছিক):"
        : "প্রত্যাখ্যানের কারণ লিখুন (কাস্টমারকে ইমেইলে জানানো হবে):"
    );
    if (note === null) return;

    try {
      const res = await fetch("/api/admin/replacements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          adminNotes: note,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        fetchInventory();
      } else {
        alert(data.error || "Failed to review replacement");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredStocks = stocks.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.productName.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.assignedOrder && s.assignedOrder.toLowerCase().includes(q)) ||
      (s.customerEmail && s.customerEmail.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Digital Commerce Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            ডিজিটাল স্টক ও রিপ্লেসমেন্ট ম্যানেজমেন্ট
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            লাইসেন্স কি, একাউন্ট ক্রেডেনশিয়াল পুল, অটোমেটেড ডেলিভারি ও কাস্টমার রিপ্লেসমেন্ট ওয়ারেন্টি।
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন স্টক যুক্ত করুন</span>
          </button>

          <button
            onClick={() => {
              setBulkResult(null);
              setShowBulkModal(true);
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>বাল্ক ইমপোর্ট (Bulk)</span>
          </button>

          <button
            onClick={fetchInventory}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("stocks")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "stocks"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>ডিজিটাল স্টক পুল ({stocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("replacements")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "replacements"
              ? "bg-[#FC5C03] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>রিপ্লেসমেন্ট কিউ ({replacements.filter((r) => r.status === "REQUESTED").length} Pending)</span>
        </button>

        <Link
          href="/admin/inventory/batches"
          className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer bg-white text-slate-600 hover:bg-slate-100"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ব্যাচ ও কস্ট (Batches)</span>
        </Link>

        <Link
          href="/admin/suppliers"
          className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer bg-white text-slate-600 hover:bg-slate-100"
        >
          <PackageCheck className="w-4 h-4" />
          <span>সাপ্লায়ার্স (Suppliers)</span>
        </Link>
      </div>

      {activeTab === "stocks" ? (
        <>
          {/* Stock KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Array.isArray(summary) ? summary : []).slice(0, 4).map((s, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border shadow-xs transition-all ${
                  s.lowStockAlert
                    ? "bg-amber-50/70 border-amber-300"
                    : "bg-white border-slate-200/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {s.variationName}
                  </span>
                  {s.lowStockAlert && (
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-md animate-pulse">
                      Low Stock
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">{s.productName}</h3>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">{s.availableCount}</span>
                    <span className="text-xs text-slate-500 font-medium ml-1">Available</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">
                    {s.deliveredCount} Delivered
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Order / ID / Product সার্চ করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FC5C03]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">সকল স্ট্যাটাস (All)</option>
                <option value="AVAILABLE">AVAILABLE (মজুদ আছে)</option>
                <option value="RESERVED">RESERVED (রিজার্ভড)</option>
                <option value="DELIVERED">DELIVERED (ডেলিভারিকৃত)</option>
                <option value="INVALID">INVALID (অবৈধ)</option>
                <option value="REPLACED">REPLACED (রিপ্লেসড)</option>
              </select>

              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none max-w-xs"
              >
                <option value="ALL">সকল প্রোডাক্ট (All Products)</option>
                {(Array.isArray(productsList) ? productsList : []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              মোট ফলাফল: <b>{filteredStocks.length}</b> টি স্টক আইটেম
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Stock ID</th>
                    <th className="py-3.5 px-4">প্রোডাক্ট ও ভ্যারিয়েশন</th>
                    <th className="py-3.5 px-4">টাইপ</th>
                    <th className="py-3.5 px-4">স্ট্যাটাস</th>
                    <th className="py-3.5 px-4">অ্যাসাইনড অর্ডার</th>
                    <th className="py-3.5 px-4">যুক্ত করার তারিখ</th>
                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {s.id.slice(0, 10)}...
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{s.productName}</div>
                          <div className="text-[11px] text-slate-400">{s.variationName}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">
                          {s.type}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              s.status === "AVAILABLE"
                                ? "bg-emerald-100 text-emerald-800"
                                : s.status === "DELIVERED"
                                ? "bg-blue-100 text-blue-800"
                                : s.status === "RESERVED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {s.assignedOrder ? (
                            <div>
                              <span className="font-mono font-bold text-slate-900">
                                #{s.assignedOrder}
                              </span>
                              <div className="text-[10px] text-slate-400">{s.customerEmail}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{s.createdAt}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleRevealStock(s.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#FFF2E8] hover:text-[#FC5C03] text-slate-700 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Reveal Decrypted Key"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ভিউ কি</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        কোন স্টক আইটেম পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Replacements Queue */
        <div className="space-y-4">
          {replacements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {replacements.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:border-[#FC5C03]/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Order #{r.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === "REQUESTED"
                              ? "bg-amber-100 text-amber-900"
                              : r.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-red-100 text-red-900"
                          }`}
                        >
                          {r.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            r.isWarrantyValid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {r.isWarrantyValid ? "Warranty Valid" : "Warranty Expired"}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {r.productName} ({r.variationName})
                      </h3>
                    </div>

                    <div className="text-left sm:text-right text-xs text-slate-500">
                      <div>
                        ক্রেতা: <b>{r.customerName}</b> ({r.customerEmail})
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        রিকোয়েস্ট তারিখ: {r.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-200/60">
                    <div className="text-xs font-bold text-slate-800">
                      সমস্যার কারণ: <span className="text-[#FC5C03]">{r.reason}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      "{r.description}"
                    </p>
                  </div>

                  {r.status === "REQUESTED" && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleReviewReplacement(r.id, "REJECT")}
                        className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        প্রত্যাখ্যান করুন (Reject)
                      </button>

                      <button
                        onClick={() => handleReviewReplacement(r.id, "APPROVE")}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>অনুমোদন ও নতুন স্টক ডিসপ্যাচ (Approve & Dispatch)</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">কোন পেন্ডিং রিপ্লেসমেন্ট রিকোয়েস্ট নেই</h3>
              <p className="text-xs">কাস্টমার ভল্ট থেকে ওয়ারেন্টি রিকোয়েস্ট দিলে তা এখানে প্রদর্শিত হবে।</p>
            </div>
          )}
        </div>
      )}

      {/* Add Single Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-900">একক ডিজিটাল স্টক যুক্ত করুন</h3>

            <form onSubmit={handleAddSingleStock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">প্রোডাক্ট নির্বাচন করুন:</label>
                <select
                  required
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    const prod = productsList.find((p) => p.id === e.target.value);
                    if (prod?.variations?.length) {
                      setSelectedVariation(prod.variations[0].id);
                    } else {
                      setSelectedVariation("");
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="">-- প্রোডাক্ট নির্বাচন করুন --</option>
                  {(Array.isArray(productsList) ? productsList : []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">ভ্যারিয়েশন (Package):</label>
                  <select
                    value={selectedVariation}
                    onChange={(e) => setSelectedVariation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="">Standard (No Variation)</option>
                    {(Array.isArray(productsList) ? productsList : [])
                      .find((p) => p.id === selectedProduct)
                      ?.variations?.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (৳{v.priceBDT})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">স্টক টাইপ:</label>
                <select
                  value={stockType}
                  onChange={(e) => setStockType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="LICENSE_KEY">License Key (XXXX-XXXX-XXXX)</option>
                  <option value="ACCOUNT_CREDENTIAL">Account Login (Email:Password)</option>
                  <option value="DOWNLOAD_LINK">APK / File Download Link</option>
                  <option value="TEXT_INSTRUCTIONS">Text Instructions / Invitation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  ক্রেডেনশিয়াল পে-লোড (AES-256 এনক্রিপ্ট হবে):
                </label>
                <textarea
                  rows={4}
                  required
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  placeholder="License Key অথবা Email:Password:PIN প্রবেশ করান..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-[#FC5C03]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ব্যাচ / সাপ্লায়ার রেফারেন্স:</label>
                  <input
                    type="text"
                    value={batchRef}
                    onChange={(e) => setBatchRef(e.target.value)}
                    placeholder="e.g. BATCH-AUG-2026"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ক্রয়মূল্য (Cost ৳):</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : "এনক্রিপ্ট করে সেভ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-900">বাল্ক স্টক ইমপোর্ট (Deduplication Enabled)</h3>

            {bulkResult ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-slate-900">ইমপোর্ট ফলাফল রিপোর্ট:</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold">
                    <span className="text-lg block">{bulkResult.importedCount}</span>
                    ইমপোর্ট সম্পন্ন
                  </div>
                  <div className="p-3 bg-amber-100 text-amber-900 rounded-xl font-bold">
                    <span className="text-lg block">{bulkResult.duplicateCount}</span>
                    ডুপ্লিকেট স্কিপড
                  </div>
                  <div className="p-3 bg-red-100 text-red-900 rounded-xl font-bold">
                    <span className="text-lg block">{bulkResult.invalidCount}</span>
                    অবৈধ সারি
                  </div>
                </div>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl mt-3"
                >
                  সম্পন্ন
                </button>
              </div>
            ) : (
              <form onSubmit={handleBulkImport} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">প্রোডাক্ট নির্বাচন করুন:</label>
                  <select
                    required
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      const prod = productsList.find((p) => p.id === e.target.value);
                      if (prod?.variations?.length) {
                        setSelectedVariation(prod.variations[0].id);
                      } else {
                        setSelectedVariation("");
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="">-- সিলেক্ট করুন --</option>
                    {(Array.isArray(productsList) ? productsList : []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      প্রতি লাইনে একটি কি বা একাউন্ট পেস্ট করুন:
                    </label>
                    <label className="text-[11px] font-bold text-[#FC5C03] hover:underline cursor-pointer flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>.txt / .csv ফাইল আপলোড</span>
                      <input
                        type="file"
                        accept=".txt,.csv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              if (content) setBulkLines(content);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={bulkLines}
                    onChange={(e) => setBulkLines(e.target.value)}
                    placeholder="XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY&#10;user@mail.com:Pass123"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-[#FC5C03]"
                  />
                  <div className="text-[11px] text-slate-400">
                    মোট সারি: {bulkLines.split("\n").filter((l) => l.trim().length > 0).length} টি আইটেম
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "বাল্ক যাচাই ও ইমপোর্ট করুন"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Revealed Credential Modal */}
      {revealedCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 relative">
            <button
              onClick={() => setRevealedCredential(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Decrypted Server Secret (Audit Logged)</span>
            </div>

            <h3 className="text-base font-black text-slate-900">ডিজিটাল ক্রেডেনশিয়াল / কি</h3>

            <div className="p-4 bg-[#0F172A] rounded-2xl text-emerald-400 font-mono text-sm whitespace-pre-wrap select-all leading-relaxed border border-slate-800 shadow-inner">
              {revealedCredential.text}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(revealedCredential.text);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? "কপি হয়েছে!" : "ক্লিপবোর্ডে কপি করুন"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
