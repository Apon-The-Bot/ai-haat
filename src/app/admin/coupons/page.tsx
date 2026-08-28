"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Check,
  X,
  Copy,
  Search,
  Power,
  Edit2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { Coupon, Product } from "@/types";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  // Modal states (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT_BDT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [appliesTo, setAppliesTo] = useState<"ALL" | "SPECIFIC_PRODUCTS">("ALL");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [minOrderBDT, setMinOrderBDT] = useState("200");
  const [maxDiscountBDT, setMaxDiscountBDT] = useState("");
  const [usageLimit, setUsageLimit] = useState("100");
  const [validUntil, setValidUntil] = useState("2026-12-31");
  const [isSaving, setIsSaving] = useState(false);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCouponsAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        fetch("/api/admin/coupons"),
        fetch("/api/products"),
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.coupons) setCoupons(cData.coupons);
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.products) setDbProducts(pData.products);
      }
    } catch (err) {
      console.error("Failed to load coupons data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCouponsAndProducts();
  }, [fetchCouponsAndProducts]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setAppliesTo("ALL");
    setSelectedProductIds([]);
    setProductSearchQuery("");
    setMinOrderBDT("200");
    setMaxDiscountBDT("");
    setUsageLimit("100");
    setValidUntil("2026-12-31");
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType as any);
    setDiscountValue(String(c.discountValue));
    setAppliesTo(c.appliesTo as any);
    setSelectedProductIds(Array.isArray(c.productIds) ? c.productIds : []);
    setProductSearchQuery("");
    setMinOrderBDT(String(c.minOrderBDT || 0));
    setMaxDiscountBDT(c.maxDiscountBDT ? String(c.maxDiscountBDT) : "");
    setUsageLimit(String(c.usageLimit || 100));
    setValidUntil(c.validUntil ? c.validUntil.split("T")[0] : "2026-12-31");
    setIsModalOpen(true);
  };

  const handleDuplicateCoupon = (c: Coupon) => {
    setEditingCoupon(null);
    setCode(`${c.code}-COPY`);
    setDiscountType(c.discountType as any);
    setDiscountValue(String(c.discountValue));
    setAppliesTo(c.appliesTo as any);
    setSelectedProductIds(Array.isArray(c.productIds) ? c.productIds : []);
    setProductSearchQuery("");
    setMinOrderBDT(String(c.minOrderBDT || 0));
    setMaxDiscountBDT(c.maxDiscountBDT ? String(c.maxDiscountBDT) : "");
    setUsageLimit(String(c.usageLimit || 100));
    setValidUntil(c.validUntil ? c.validUntil.split("T")[0] : "2026-12-31");
    setIsModalOpen(true);
  };

  const filteredDbProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return dbProducts;
    const q = productSearchQuery.trim().toLowerCase();
    return dbProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [dbProducts, productSearchQuery]);

  const handleSelectAllFiltered = () => {
    const filteredSlugs = filteredDbProducts.map((p) => p.slug);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredSlugs])));
  };

  const handleDeselectAllFiltered = () => {
    const filteredSlugs = new Set(filteredDbProducts.map((p) => p.slug));
    setSelectedProductIds((prev) => prev.filter((slug) => !filteredSlugs.has(slug)));
  };

  const toggleProductSelect = (slug: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const handleToggleActive = async (id: string) => {
    const current = coupons.find((c) => c.id === id);
    if (!current) return;
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current.isActive }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
        );
        showToast("Coupon status updated.", "success");
      }
    } catch {
      showToast("Failed to update coupon status", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deletingCouponId) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(deletingCouponId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== deletingCouponId));
        showToast("কুপনটি সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে।", "success");
      }
    } catch {
      showToast("Failed to delete coupon", "error");
    } finally {
      setDeletingCouponId(null);
    }
  };

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      showToast("Please provide coupon code and discount value.", "error");
      return;
    }

    if (appliesTo === "SPECIFIC_PRODUCTS" && selectedProductIds.length === 0) {
      showToast("Please select at least one applicable product.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: editingCoupon ? editingCoupon.id : undefined,
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        appliesTo,
        productIds: appliesTo === "SPECIFIC_PRODUCTS" ? selectedProductIds : [],
        minOrderBDT: Number(minOrderBDT) || 0,
        maxDiscountBDT: maxDiscountBDT ? Number(maxDiscountBDT) : null,
        usageLimit: Number(usageLimit) || 100,
        validUntil: validUntil || "2026-12-31",
      };

      const method = editingCoupon ? "PATCH" : "POST";
      const res = await fetch("/api/admin/coupons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && (data.coupon || data.success)) {
        showToast(
          editingCoupon
            ? `Coupon "${payload.code}" updated successfully!`
            : `Coupon "${payload.code}" created and activated!`,
          "success"
        );
        setIsModalOpen(false);
        fetchCouponsAndProducts();
      } else {
        showToast(data.error || "Failed to save coupon", "error");
      }
    } catch {
      showToast("Server error saving coupon", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span>Promotion Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Coupons & Discounts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure percentage (%) or flat amount (৳) coupons with DB-backed product scopes, caps, and redemption counters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Coupon</span>
          </button>

          <button
            onClick={fetchCouponsAndProducts}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block">Total Campaigns</span>
          <span className="text-2xl font-black text-slate-900 mt-1">{coupons.length}</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block">Active Coupons</span>
          <span className="text-2xl font-black text-emerald-600 mt-1">
            {coupons.filter((c) => c.isActive).length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block">Total Store Redemptions</span>
          <span className="text-2xl font-black text-[#FC5C03] mt-1">
            {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)} uses
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by coupon code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03] shadow-2xs"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-4 px-5">Coupon Code</th>
                <th className="py-4 px-5">Discount Value</th>
                <th className="py-4 px-5">Scope</th>
                <th className="py-4 px-5">Min Order</th>
                <th className="py-4 px-5">Usage</th>
                <th className="py-4 px-5">Valid Until</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Code */}
                    <td className="py-4 px-5 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[#FC5C03] border border-slate-200 font-bold text-xs">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(c.code)}
                          className="text-slate-400 hover:text-black cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCode === c.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-sm text-emerald-600 block">
                        {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT`}
                      </span>
                      {c.maxDiscountBDT && (
                        <span className="text-[10px] text-slate-400 block">
                          Max Cap: ৳{c.maxDiscountBDT}
                        </span>
                      )}
                    </td>

                    {/* Scope */}
                    <td className="py-4 px-5">
                      {c.appliesTo === "ALL" ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold border border-blue-200">
                          All Catalog
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-semibold border border-purple-200">
                          {Array.isArray(c.productIds) ? c.productIds.length : 0} Products
                        </span>
                      )}
                    </td>

                    {/* Min Order */}
                    <td className="py-4 px-5 text-slate-800 font-mono">
                      ৳{c.minOrderBDT || 0}
                    </td>

                    {/* Usage */}
                    <td className="py-4 px-5 text-slate-600 font-mono">
                      <span className="font-bold text-slate-900">{c.usedCount || 0}</span> / {c.usageLimit}
                    </td>

                    {/* Valid Until */}
                    <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                      {c.validUntil}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-5">
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

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDuplicateCoupon(c)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate Coupon"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingCouponId(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Tag className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No coupons found</p>
                      <p className="text-xs text-slate-400">Click &apos;+ Create Coupon&apos; above to add discount coupons.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FC5C03]" />
                <span>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
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
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    {/* Header with Search and Selection Count */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700">
                          প্রোডাক্ট সিলেক্ট করুন:
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2E8] text-[#FC5C03] border border-[#FC5C03]/20">
                          {selectedProductIds.length} টি সিলেক্টেড
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={handleSelectAllFiltered}
                          className="text-[#FC5C03] hover:underline font-bold cursor-pointer"
                        >
                          সবগুলো সিলেক্ট
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAllFiltered}
                          className="text-slate-500 hover:text-slate-700 hover:underline font-medium cursor-pointer"
                        >
                          আনচেক
                        </button>
                      </div>
                    </div>

                    {/* Product Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        placeholder="প্রোডাক্ট বা ক্যাটাগরি সার্চ করুন..."
                        className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FC5C03] focus:outline-hidden shadow-2xs"
                      />
                      {productSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setProductSearchQuery("")}
                          className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Product List Scroll Area */}
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                      {filteredDbProducts.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400">
                          "{productSearchQuery}" নামে কোনো প্রোডাক্ট পাওয়া যায়নি।
                        </div>
                      ) : (
                        filteredDbProducts.map((prod) => {
                          const isChecked = selectedProductIds.includes(prod.slug);
                          return (
                            <label
                              key={prod.id}
                              className={`flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-orange-50/80 text-slate-900 font-semibold"
                                  : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleProductSelect(prod.slug)}
                                  className="rounded border-slate-300 text-[#FC5C03] focus:ring-0 cursor-pointer w-4 h-4 accent-[#FC5C03]"
                                />
                                <span className="truncate">{prod.name}</span>
                              </div>
                              <span className="shrink-0 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                                {prod.category || "General"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
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

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingCoupon ? "Update Coupon" : "Save & Activate"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
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
