"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Check,
  X,
  Copy,
  Search,
  Power,
} from "lucide-react";
import { Coupon } from "@/types";
import { COUPONS } from "@/data/coupons";
import { PRODUCTS } from "@/data/products";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [search, setSearch] = useState("");
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT_BDT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [appliesTo, setAppliesTo] = useState<"ALL" | "SPECIFIC_PRODUCTS">("ALL");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [minOrderBDT, setMinOrderBDT] = useState("200");
  const [maxDiscountBDT, setMaxDiscountBDT] = useState("");
  const [usageLimit, setUsageLimit] = useState("100");
  const [validUntil, setValidUntil] = useState("2026-12-31");

  const toggleProductSelect = (slug: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const handleToggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    showToast("Coupon status updated.", "success");
  };

  const confirmDelete = () => {
    if (!deletingCouponId) return;
    setCoupons((prev) => prev.filter((c) => c.id !== deletingCouponId));
    showToast("কুপনটি সফলভাবে মুছে ফেলা হয়েছে।", "success");
    setDeletingCouponId(null);
  };

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      showToast("Please provide coupon code and discount value.", "error");
      return;
    }

    if (appliesTo === "SPECIFIC_PRODUCTS" && selectedProductIds.length === 0) {
      showToast("Please select at least one applicable product.", "error");
      return;
    }

    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      appliesTo,
      productIds: appliesTo === "SPECIFIC_PRODUCTS" ? selectedProductIds : [],
      minOrderBDT: Number(minOrderBDT) || 0,
      maxDiscountBDT: maxDiscountBDT ? Number(maxDiscountBDT) : undefined,
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      validUntil: validUntil || "2026-12-31",
      isActive: true,
    };

    setCoupons([newCoupon, ...coupons]);
    setIsAddModalOpen(false);
    showToast(`Coupon "${newCoupon.code}" created and activated!`, "success");

    // Reset Form
    setCode("");
    setDiscountValue("");
    setSelectedProductIds([]);
    setMaxDiscountBDT("");
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Coupons & Promotions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create percentage (%) or flat amount (৳) discounts with product-level scoping and usage limits.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* 3 Metric Cards (White Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Total Coupons</span>
          <span className="text-2xl font-black text-slate-900 mt-1">{coupons.length}</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Active Campaigns</span>
          <span className="text-2xl font-black text-emerald-600 mt-1">
            {coupons.filter((c) => c.isActive).length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Total Redemptions</span>
          <span className="text-2xl font-black text-[#FC5C03] mt-1">
            {coupons.reduce((sum, c) => sum + c.usedCount, 0)} uses
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by coupon code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03] shadow-2xs"
        />
      </div>

      {/* Coupons Table (White Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Scope</th>
                <th className="py-3.5 px-4">Min Order</th>
                <th className="py-3.5 px-4">Usage</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Code */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[#FC5C03] border border-slate-200 font-bold">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(c.code)}
                        className="text-slate-400 hover:text-black cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-600">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT`}
                    </span>
                    {c.maxDiscountBDT && (
                      <span className="text-[10px] text-slate-400 block">
                        Max ৳{c.maxDiscountBDT}
                      </span>
                    )}
                  </td>

                  {/* Scope */}
                  <td className="py-3.5 px-4">
                    {c.appliesTo === "ALL" ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold border border-blue-200">
                        All Products
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-semibold border border-purple-200">
                        {c.productIds.length} Selected Products
                      </span>
                    )}
                  </td>

                  {/* Min Order */}
                  <td className="py-3.5 px-4 text-slate-800 font-mono">
                    ৳{c.minOrderBDT}
                  </td>

                  {/* Usage */}
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {c.usedCount} / {c.usageLimit}
                  </td>

                  {/* Valid Until */}
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {c.validUntil}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer ${
                        c.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{c.isActive ? "Active" : "Paused"}</span>
                    </button>
                  </td>

                  {/* Delete Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setDeletingCouponId(c.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal (White Theme) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FC5C03]" />
                <span>Create New Coupon</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MEGAOFF2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase font-mono font-bold focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT_BDT">Flat Amount (৳ BDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {discountType === "PERCENTAGE" ? "Discount (%) *" : "Discount Amount (৳) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "PERCENTAGE" ? "10" : "50"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:border-[#FC5C03] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Applicable Products Scope
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setAppliesTo("ALL")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      appliesTo === "ALL"
                        ? "border-[#FC5C03] bg-[#FFF2E8] text-[#FC5C03]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Store Products
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppliesTo("SPECIFIC_PRODUCTS")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      appliesTo === "SPECIFIC_PRODUCTS"
                        ? "border-[#FC5C03] bg-[#FFF2E8] text-[#FC5C03]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Specific Products
                  </button>
                </div>

                {appliesTo === "SPECIFIC_PRODUCTS" && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto space-y-1.5">
                    <span className="text-[11px] text-slate-500 block mb-1 font-semibold">
                      Select Eligible Products:
                    </span>
                    {PRODUCTS.map((prod) => {
                      const isChecked = selectedProductIds.includes(prod.slug);
                      return (
                        <label
                          key={prod.id}
                          className="flex items-center gap-2 text-xs text-slate-700 hover:text-black cursor-pointer py-1 px-2 rounded hover:bg-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductSelect(prod.slug)}
                            className="rounded border-slate-300 text-[#FC5C03] focus:ring-0"
                          />
                          <span>{prod.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum Order Value (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderBDT}
                    onChange={(e) => setMinOrderBDT(e.target.value)}
                    placeholder="200"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Discount Cap (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscountBDT}
                    onChange={(e) => setMaxDiscountBDT(e.target.value)}
                    placeholder="Optional (e.g. 200)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save & Activate Coupon
              </button>

            </form>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingCouponId)}
        onClose={() => setDeletingCouponId(null)}
        onConfirm={confirmDelete}
        title="কুপন মুছে ফেলা নিশ্চিতকরণ"
        message="আপনি কি নিশ্চিতভাবে এই ডিসকাউন্ট কুপনটি মুছে ফেলতে চান?"
        confirmText="মুছে ফেলুন"
        cancelText="বাতিল"
        variant="danger"
      />

    </div>
  );
}
