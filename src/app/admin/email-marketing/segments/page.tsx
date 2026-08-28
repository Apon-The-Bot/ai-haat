"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sliders,
  RefreshCw,
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Users,
  Layers,
  Sparkles,
  ShoppingBag,
  Clock,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Product } from "@/types";

interface SegmentItem {
  id: string;
  name: string;
  description: string | null;
  conditionsJson: string;
  estimatedCount: number;
  createdAt: string;
}

export default function AdminSegmentsPage() {
  const { showToast } = useToast();

  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Segment Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [conditionType, setConditionType] = useState<
    "PURCHASED" | "NEVER_PURCHASED" | "SPECIFIC_PRODUCTS" | "SPENT_RANGE" | "INACTIVE_DAYS"
  >("PURCHASED");
  const [selectedProductSlugs, setSelectedProductSlugs] = useState<string[]>([]);
  const [minSpent, setMinSpent] = useState("");
  const [maxSpent, setMaxSpent] = useState("");
  const [inactiveDays, setInactiveDays] = useState("30");

  // Live preview estimation
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);

  // Products for picker
  const [products, setProducts] = useState<Product[]>([]);

  // Delete modal
  const [deletingSegmentId, setDeletingSegmentId] = useState<string | null>(null);

  const fetchSegments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email-marketing/segments");
      if (res.ok) {
        const data = await res.json();
        if (data.segments) setSegments(data.segments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegments();
    // Fetch products for segmentation rules
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.products) setProducts(d.products);
      })
      .catch(console.error);
  }, [fetchSegments]);

  // Recalculate live audience count on condition change
  const estimateLiveCount = useCallback(async () => {
    setEstimating(true);
    try {
      const res = await fetch("/api/admin/email-marketing/segments/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionType,
          selectedProductSlugs,
          minSpent: minSpent ? parseFloat(minSpent) : undefined,
          maxSpent: maxSpent ? parseFloat(maxSpent) : undefined,
          inactiveDays: inactiveDays ? parseInt(inactiveDays) : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiveCount(data.count ?? 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEstimating(false);
    }
  }, [conditionType, selectedProductSlugs, minSpent, maxSpent, inactiveDays]);

  useEffect(() => {
    if (showCreateModal) {
      estimateLiveCount();
    }
  }, [showCreateModal, estimateLiveCount]);

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const conditions = {
        type: conditionType,
        productSlugs: selectedProductSlugs,
        minSpent: minSpent ? parseFloat(minSpent) : null,
        maxSpent: maxSpent ? parseFloat(maxSpent) : null,
        inactiveDays: inactiveDays ? parseInt(inactiveDays) : null,
      };

      const res = await fetch("/api/admin/email-marketing/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          conditionsJson: JSON.stringify(conditions),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Dynamic segment created successfully!", "success");
        setShowCreateModal(false);
        setName("");
        setDescription("");
        fetchSegments();
      } else {
        showToast(data.error || "Failed to create segment", "error");
      }
    } catch {
      showToast("Network error creating segment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingSegmentId) return;
    try {
      const res = await fetch(`/api/admin/email-marketing/segments?id=${deletingSegmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSegments((prev) => prev.filter((s) => s.id !== deletingSegmentId));
        showToast("Segment deleted successfully.", "success");
      } else {
        showToast("Failed to delete segment", "error");
      }
    } catch {
      showToast("Error deleting segment", "error");
    } finally {
      setDeletingSegmentId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Audience Segmentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dynamic Audience Segments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Group your customers dynamically based on purchasing history, lifetime value, specific software purchases, or inactivity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Dynamic Segment</span>
          </button>

          <button
            onClick={fetchSegments}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.length > 0 ? (
          segments.map((s) => {
            let parsed = { type: "UNKNOWN" };
            try {
              parsed = JSON.parse(s.conditionsJson);
            } catch {}

            return (
              <div
                key={s.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold uppercase">
                      {parsed.type}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-black font-mono">
                      {s.estimatedCount} eligible contacts
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900">{s.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {s.description || "Dynamic condition resolving matching active subscribers."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDeletingSegmentId(s.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Segment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/admin/email-marketing/campaigns/new?segmentId=${s.id}`}
                    className="px-3.5 py-1.5 bg-[#FFF2E8] hover:bg-[#FC5C03] text-[#FC5C03] hover:text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast to Segment</span>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 py-16 text-center text-slate-400 space-y-2">
            <Sliders className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No dynamic segments defined.</p>
            <p className="text-xs text-slate-400">Create rules to target customers based on purchase behavior.</p>
          </div>
        )}
      </div>

      {/* CREATE DYNAMIC SEGMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FC5C03]" />
                <span>Build Dynamic Customer Segment</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSegment} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Segment Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Big Spenders (> ৳5,000)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Target users eligible for high-tier enterprise tools."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Segmentation Rule Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Segmentation Condition:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "PURCHASED", title: "Paying Customers", desc: "1 or more completed orders." },
                    { id: "NEVER_PURCHASED", title: "Registered Non-Buyers", desc: "Zero lifetime orders." },
                    { id: "SPECIFIC_PRODUCTS", title: "Specific Product Buyers", desc: "Purchased specific tools." },
                    { id: "SPENT_RANGE", title: "Lifetime Spend Range", desc: "Filter by total ৳ spent." },
                    { id: "INACTIVE_DAYS", title: "Inactive Customers", desc: "No purchases in X days." },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setConditionType(r.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        conditionType === r.id
                          ? "border-[#FC5C03] bg-[#FFF2E8] text-slate-900 shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold text-xs block">{r.title}</span>
                      <span className="text-[10.5px] text-slate-500 block mt-0.5">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Sub-Options */}
              {conditionType === "SPECIFIC_PRODUCTS" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Select Target Products:</span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5">
                    {products.map((p) => {
                      const isSelected = selectedProductSlugs.includes(p.slug);
                      return (
                        <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedProductSlugs((prev) =>
                                prev.includes(p.slug) ? prev.filter((s) => s !== p.slug) : [...prev, p.slug]
                              );
                            }}
                            className="rounded border-slate-300 text-[#FC5C03]"
                          />
                          <span>{p.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {conditionType === "SPENT_RANGE" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Spent (৳)</label>
                    <input
                      type="number"
                      value={minSpent}
                      onChange={(e) => setMinSpent(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Spent (৳)</label>
                    <input
                      type="number"
                      value={maxSpent}
                      onChange={(e) => setMaxSpent(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {conditionType === "INACTIVE_DAYS" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inactive for at least (Days):</label>
                  <input
                    type="number"
                    value={inactiveDays}
                    onChange={(e) => setInactiveDays(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              )}

              {/* LIVE AUDIENCE ESTIMATOR BANNER */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Live Audience Match
                  </span>
                  <p className="text-xs text-emerald-700">Non-suppressed eligible contacts matching this rule right now</p>
                </div>
                <div className="text-right font-mono">
                  {estimating ? (
                    <span className="text-xs text-emerald-600 font-bold animate-pulse">Calculating...</span>
                  ) : (
                    <span className="text-xl font-black text-emerald-900">{liveCount ?? 0} Recipients</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Segment..." : "Save Dynamic Segment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deletingSegmentId)}
        onClose={() => setDeletingSegmentId(null)}
        onConfirm={confirmDelete}
        title="Delete Segment"
        message="Are you sure you want to delete this segment rule? Existing campaigns will not be affected."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  );
}