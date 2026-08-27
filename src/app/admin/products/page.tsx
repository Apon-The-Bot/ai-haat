"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Star,
  Trophy,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { Product } from "@/types";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          setProductList(data.products);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = productList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    
    if (categoryFilter === "FEATURED") return matchSearch && p.isFeatured;
    if (categoryFilter === "BEST") return matchSearch && (p.isBestProduct || p.isBestSelling);
    if (categoryFilter === "STOCK_OUT") return matchSearch && p.inStock === false;
    return matchSearch;
  });

  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. In-place Stock Toggle
  const toggleStock = async (id: string, currentStock: boolean) => {
    const newStock = !currentStock;
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: newStock } : p))
    );
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, inStock: newStock }),
      });
      showToast(newStock ? "প্রোডাক্ট স্টকে যুক্ত হয়েছে (In Stock)" : "প্রোডাক্ট স্টক আউট করা হয়েছে (Stock Out)", "success");
    } catch (e) {
      console.error("Stock toggle error:", e);
      showToast("স্টক আপডেট করতে সমস্যা হয়েছে।", "error");
    }
  };

  // 2. In-place Featured Toggle (Home Screen Top 6)
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    const newFeatured = !currentFeatured;
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: newFeatured } : p))
    );
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFeatured: newFeatured }),
      });
      showToast(
        newFeatured
          ? "হোমস্ক্রিন ফিচার্ড প্রোডাক্টে যুক্ত হয়েছে ⭐"
          : "ফিচার্ড লিস্ট থেকে সরানো হয়েছে",
        "success"
      );
    } catch (e) {
      console.error("Featured toggle error:", e);
      showToast("ফিচার্ড স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।", "error");
    }
  };

  // 3. In-place Best Product Toggle (Home Screen Best Product Section)
  const toggleBestProduct = async (id: string, currentBest: boolean) => {
    const newBest = !currentBest;
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBestProduct: newBest, isBestSelling: newBest } : p))
    );
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isBestProduct: newBest,
          isBestSelling: newBest,
          badge: newBest ? "Best Product" : null,
        }),
      });
      showToast(
        newBest
          ? "সেরা প্রোডাক্ট (Best Product) সেকশনে যুক্ত হয়েছে 🏆"
          : "সেরা প্রোডাক্ট লিস্ট থেকে সরানো হয়েছে",
        "success"
      );
    } catch (e) {
      console.error("Best product toggle error:", e);
      showToast("বেস্ট প্রোডাক্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deletingProductId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/products?id=${deletingProductId}`, { method: "DELETE" });
      setProductList((prev) => prev.filter((p) => p.id !== deletingProductId));
      showToast("প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে।", "success");
    } catch (err) {
      showToast("প্রোডাক্ট মুছতে সমস্যা হয়েছে।", "error");
    } finally {
      setIsDeleting(false);
      setDeletingProductId(null);
    }
  };

  const featuredCount = productList.filter((p) => p.isFeatured).length;
  const bestCount = productList.filter((p) => p.isBestProduct || p.isBestSelling).length;
  const stockOutCount = productList.filter((p) => p.inStock === false).length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Products Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            ম্যানেজ করুন স্টক স্ট্যাটাস, হোমস্ক্রিন ফিচার্ড প্রোডাক্ট এবং বেস্ট সেলিং আইটেম।
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Product</span>
        </Link>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            categoryFilter === "ALL"
              ? "bg-[#1A1D26] text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          সব প্রোডাক্ট ({productList.length})
        </button>
        <button
          onClick={() => setCategoryFilter("FEATURED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            categoryFilter === "FEATURED"
              ? "bg-[#FC5C03] text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>হোম ফিচার্ড ({featuredCount}/6)</span>
        </button>
        <button
          onClick={() => setCategoryFilter("BEST")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            categoryFilter === "BEST"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>বেস্ট প্রোডাক্ট ({bestCount})</span>
        </button>
        <button
          onClick={() => setCategoryFilter("STOCK_OUT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            categoryFilter === "STOCK_OUT"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>স্টক আউট ({stockOutCount})</span>
        </button>
      </div>

      {/* Clean Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#FC5C03] transition-all"
          />
        </div>

        <div className="text-sm font-semibold text-slate-500 self-end sm:self-center">
          Showing: <strong className="text-slate-900">{filtered.length}</strong> items
        </div>
      </div>

      {/* Clean Spacious Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 w-16">Image</th>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5 text-center">Featured & Best</th>
                <th className="py-4 px-5 text-center">Stock Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Image */}
                  <td className="py-4 px-5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 shrink-0">
                      <SafeImage
                        src={prod.image}
                        alt={prod.name}
                        aspectRatio="1/1"
                        objectFit="contain"
                        sizes="48px"
                      />
                    </div>
                  </td>

                  {/* Product Name & Category */}
                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="font-bold text-base text-slate-900 hover:text-[#FC5C03] transition-colors inline-flex items-center gap-1"
                        >
                          <span>{prod.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        </Link>
                        {prod.variations && prod.variations.length > 1 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
                            {prod.variations.length} variants
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block font-normal">{prod.category}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-base text-slate-900 block">
                        ৳{prod.minPriceBDT}
                      </span>
                      {prod.maxPriceBDT > prod.minPriceBDT && (
                        <span className="text-xs text-slate-400 block">
                          Up to ৳{prod.maxPriceBDT}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Featured & Best Toggles */}
                  <td className="py-4 px-5 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                      {/* Featured Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleFeatured(prod.id, Boolean(prod.isFeatured))}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          prod.isFeatured
                            ? "bg-[#FFF2E8] text-[#FC5C03] border border-[#FFE4D6] shadow-2xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                        }`}
                        title={prod.isFeatured ? "হোমস্ক্রিন ফিচার্ড অন (Home Featured ON)" : "হোমস্ক্রিন ফিচার্ডে যোগ করুন"}
                      >
                        <Star className={`w-3.5 h-3.5 ${prod.isFeatured ? "fill-[#FC5C03]" : ""}`} />
                        <span className="text-[10px] hidden sm:inline">Featured</span>
                      </button>

                      {/* Best Product Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleBestProduct(prod.id, Boolean(prod.isBestProduct || prod.isBestSelling))}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          prod.isBestProduct || prod.isBestSelling
                            ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                        }`}
                        title={prod.isBestProduct ? "সেরা প্রোডাক্ট সেকশন অন" : "সেরা প্রোডাক্ট সেকশনে যোগ করুন"}
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span className="text-[10px] hidden sm:inline">Best</span>
                      </button>
                    </div>
                  </td>

                  {/* Stock Status Toggle */}
                  <td className="py-4 px-5 text-center">
                    <button
                      type="button"
                      onClick={() => toggleStock(prod.id, prod.inStock !== false)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        prod.inStock !== false
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      }`}
                    >
                      {prod.inStock !== false ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Stock Out</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/edit/${prod.id}`}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setDeletingProductId(prod.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deletingProductId)}
        onClose={() => setDeletingProductId(null)}
        onConfirm={confirmDelete}
        title="প্রোডাক্ট মুছে ফেলা নিশ্চিতকরণ"
        message="আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি মুছে ফেলতে চান? প্রোডাক্টটি ডিলিট করলে আর ফিরিয়ে আনা সম্ভব হবে না।"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        variant="danger"
        isLoading={isDeleting}
      />

    </div>
  );
}
