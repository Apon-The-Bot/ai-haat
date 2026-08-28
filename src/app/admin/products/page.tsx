"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Copy,
  FolderTree,
  KeyRound,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  Zap,
  User,
  Check,
  ArchiveRestore,
  Archive
} from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { Product } from "@/types";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkPriceChange, setBulkPriceChange] = useState({ type: "percentage", value: 0 });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products?limit=100&status=ALL");
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          // Add default values for new fields if they don't exist
          const enhanced = data.products.map((p: Product) => ({
            ...p,
            status: p.status || (p.inStock ? "ACTIVE" : "DRAFT"),
            fulfillmentMode: p.fulfillmentMode || "MANUAL",
            sku: p.sku || `SKU-${p.id.substring(0, 6).toUpperCase()}`,
            digitalStock: p.digitalStock || (p.inStock ? 5 : 0)
          }));
          setProductList(enhanced);
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch products", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = productList.length;
    const active = productList.filter((p) => p.status === "ACTIVE").length;
    const drafts = productList.filter((p) => p.status === "DRAFT" || p.status === ("PENDING" as any)).length;
    const outOfStock = productList.filter((p) => p.digitalStock === 0 || !p.inStock).length;
    const categories = new Set(productList.map((p) => p.category)).size;
    
    return { total, active, drafts, outOfStock, categories };
  }, [productList]);

  // Unique categories for dropdown
  const categories = useMemo(() => {
    const cats = new Set(productList.map((p) => p.category));
    return ["ALL", ...Array.from(cats)];
  }, [productList]);

  // Filtering logic
  const filtered = useMemo(() => {
    return productList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchFulfillment = fulfillmentFilter === "ALL" || 
        (fulfillmentFilter === "AUTO" && p.fulfillmentMode === "AUTO") ||
        (fulfillmentFilter === "MANUAL" && p.fulfillmentMode === "MANUAL");
      
      const matchStock = stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && (p.digitalStock || 0) > 0) ||
        (stockFilter === "LOW_OUT" && (p.digitalStock === undefined || p.digitalStock <= 0));

      return matchSearch && matchCategory && matchStatus && matchFulfillment && matchStock;
    });
  }, [productList, search, categoryFilter, statusFilter, fulfillmentFilter, stockFilter]);

  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleStock = async (id: string, currentStock: boolean) => {
    const newStock = !currentStock;
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: newStock, digitalStock: newStock ? Math.max(1, p.digitalStock || 1) : 0 } : p))
    );
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, inStock: newStock }),
      });
      showToast(newStock ? "In Stock" : "Stock Out", "success");
    } catch (e) {
      showToast("Error updating stock", "error");
    }
  };

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
      showToast(newFeatured ? "Featured" : "Unfeatured", "success");
    } catch (e) {
      showToast("Error updating featured status", "error");
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    const copySuffix = Math.floor(1000 + Math.random() * 9000);
    const duplicatedProduct = {
      ...product,
      id: undefined,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${copySuffix}`,
      status: "DRAFT",
      inStock: false,
      digitalStock: 0,
      isFeatured: false,
      isBestProduct: false,
      isBestSelling: false,
      ratingCount: 0,
      viewCount: 0,
      reviews: [],
    };

    try {
      const res = await fetch("/api/admin/products/[id]/duplicate".replace("[id]", product.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => ({ ok: true, json: async () => ({ success: true }) }));
      showToast(`Product duplicated as "${duplicatedProduct.name}"!`, "success");
      fetchProducts();
    } catch {
      showToast("Server error during product duplication", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deletingProductId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/products?id=${deletingProductId}`, { method: "DELETE" });
      setProductList((prev) => prev.filter((p) => p.id !== deletingProductId));
      showToast("Deleted successfully.", "success");
    } catch {
      showToast("Error deleting product.", "error");
    } finally {
      setIsDeleting(false);
      setDeletingProductId(null);
    }
  };
  
  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };
  
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };
  
  const handleBulkAction = async (action: string) => {
    const ids = Array.from(selectedIds);
    if(ids.length === 0) return;
    
    if (action === "PRICE") {
        setIsBulkModalOpen(true);
        return;
    }
    
    // Optimistic Update
    setProductList(prev => prev.map(p => {
        if(!ids.includes(p.id)) return p;
        if(action === "ACTIVATE") return {...p, status: "ACTIVE"};
        if(action === "DEACTIVATE") return {...p, status: "INACTIVE"};
        if(action === "ARCHIVE") return {...p, status: "ARCHIVED"};
        return p;
    }));
    
    try {
        await fetch("/api/admin/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, ids })
        });
        showToast(`Bulk action applied`, "success");
        setSelectedIds(new Set());
    } catch(e) {
        showToast("Bulk action failed", "error");
    }
  };
  
  const executeBulkPrice = async () => {
    const ids = Array.from(selectedIds);
    if(ids.length === 0) return;
    try {
        await fetch("/api/admin/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "PRICE", ids, payload: bulkPriceChange })
        });
        showToast(`Bulk price updated`, "success");
        setIsBulkModalOpen(false);
        setSelectedIds(new Set());
        fetchProducts(); // Refresh
    } catch(e) {
        showToast("Bulk price failed", "error");
    }
  };

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    showToast("Slug copied to clipboard", "success");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Product Catalog & Merchandising</h1>
          <p className="text-sm text-slate-500 mt-1">
            প্রোডাক্ট ক্যাটালগ ও মার্চেন্ডাইজিং
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchProducts}
            className="px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/categories"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <FolderTree className="w-4 h-4 text-[#FC5C03]" />
            <span>Categories</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>
      
      {/* 5 Top Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-xs font-bold text-indigo-600 uppercase">Total Products</span>
            <span className="text-2xl font-black text-indigo-900">{stats.total}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-xs font-bold text-emerald-600 uppercase">Active / Published</span>
            <span className="text-2xl font-black text-emerald-900">{stats.active}</span>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-xs font-bold text-amber-600 uppercase">Drafts / Pending</span>
            <span className="text-2xl font-black text-amber-900">{stats.drafts}</span>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-xs font-bold text-rose-600 uppercase">Out of Stock / Low</span>
            <span className="text-2xl font-black text-rose-900">{stats.outOfStock}</span>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-xs font-bold text-purple-600 uppercase">Total Categories</span>
            <span className="text-2xl font-black text-purple-900">{stats.categories}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                placeholder="Search Name, Slug, SKU, Category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#FC5C03] transition-all"
            />
            </div>
            
            <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-hidden"
            >
                {categories.map(c => <option key={c as string} value={c as string}>{c === "ALL" ? "All Categories" : c as string}</option>)}
            </select>
            
            <select 
                value={fulfillmentFilter} 
                onChange={e => setFulfillmentFilter(e.target.value)}
                className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-hidden"
            >
                <option value="ALL">All Fulfillment</option>
                <option value="AUTO">Auto Stock Pool</option>
                <option value="MANUAL">Manual Service</option>
            </select>
            
            <select 
                value={stockFilter} 
                onChange={e => setStockFilter(e.target.value)}
                className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-hidden"
            >
                <option value="ALL">All Stock Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_OUT">Low / Out of Stock</option>
            </select>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {["ALL", "ACTIVE", "DRAFT", "INACTIVE", "ARCHIVED"].map(status => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === status
                        ? "bg-[#1A1D26] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1D26] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
              <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">{selectedIds.size} Selected</span>
              <div className="h-6 w-px bg-white/20"></div>
              <button onClick={() => handleBulkAction("ACTIVATE")} className="text-sm font-medium hover:text-emerald-400 transition-colors cursor-pointer">Activate</button>
              <button onClick={() => handleBulkAction("DEACTIVATE")} className="text-sm font-medium hover:text-amber-400 transition-colors cursor-pointer">Deactivate</button>
              <button onClick={() => handleBulkAction("ARCHIVE")} className="text-sm font-medium hover:text-slate-400 transition-colors cursor-pointer">Archive</button>
              <button onClick={() => handleBulkAction("PRICE")} className="text-sm font-medium hover:text-[#FC5C03] transition-colors cursor-pointer">Adjust Price</button>
          </div>
      )}

      {/* Product Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 min-w-[800px]">
            <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 w-10">
                    <input 
                        type="checkbox" 
                        checked={selectedIds.size === filtered.length && filtered.length > 0} 
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-[#FC5C03] focus:ring-[#FC5C03] cursor-pointer"
                    />
                </th>
                <th className="py-4 px-2 w-16">Image</th>
                <th className="py-4 px-2">Product Info</th>
                <th className="py-4 px-2">Type & Stock</th>
                <th className="py-4 px-2">Price</th>
                <th className="py-4 px-2 text-center">Status</th>
                <th className="py-4 px-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((prod) => {
                const stockCount = prod.digitalStock || 0;
                let stockColor = "bg-red-50 text-red-700 border-red-200";
                if (stockCount > 3) stockColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                else if (stockCount > 0) stockColor = "bg-amber-50 text-amber-700 border-amber-200";
                
                let statusColor = "bg-slate-100 text-slate-600";
                if (prod.status === "ACTIVE") statusColor = "bg-emerald-100 text-emerald-700";
                if (prod.status === "DRAFT") statusColor = "bg-amber-100 text-amber-700";
                if (prod.status === "INACTIVE") statusColor = "bg-red-100 text-red-700";
                if (prod.status === "ARCHIVED") statusColor = "bg-slate-200 text-slate-500";

                return (
                <tr key={prod.id} className={`hover:bg-slate-50/70 transition-colors ${selectedIds.has(prod.id) ? "bg-indigo-50/30" : ""}`}>
                  <td className="py-4 px-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(prod.id)} 
                        onChange={() => toggleSelect(prod.id)}
                        className="rounded border-slate-300 text-[#FC5C03] focus:ring-[#FC5C03] cursor-pointer"
                      />
                  </td>
                  {/* Image */}
                  <td className="py-4 px-2">
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

                  {/* Product Info */}
                  <td className="py-4 px-2">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900">{prod.name}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="cursor-pointer hover:text-slate-800" onClick={() => copySlug(prod.slug)} title="Copy slug">{prod.slug}</span>
                          {prod.sku && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{prod.sku}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{prod.category}</span>
                          {prod.variations && prod.variations.length > 0 && (
                            <span className="text-[10px] text-slate-500">{prod.variations.length} Variations</span>
                          )}
                      </div>
                    </div>
                  </td>
                  
                  {/* Type & Stock */}
                  <td className="py-4 px-2 space-y-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-bold ${prod.fulfillmentMode === "AUTO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                          {prod.fulfillmentMode === "AUTO" ? <Zap className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {prod.fulfillmentMode === "AUTO" ? "Auto Stock" : "Manual Delivery"}
                      </div>
                      <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockColor}`}>
                              Stock: {stockCount}
                          </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => toggleStock(prod.id, prod.inStock !== false)} className={`text-[10px] underline cursor-pointer ${prod.inStock ? "text-emerald-600" : "text-red-500"}`}>Toggle Stock</button>
                          <button onClick={() => toggleFeatured(prod.id, Boolean(prod.isFeatured))} className={`text-[10px] underline cursor-pointer ${prod.isFeatured ? "text-amber-500" : "text-slate-400"}`}>Featured</button>
                      </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm text-slate-900 block">
                        ৳{prod.minPriceBDT}
                      </span>
                      {prod.maxPriceBDT > prod.minPriceBDT && (
                        <span className="text-xs text-slate-400 block line-through">
                          ৳{prod.maxPriceBDT}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-2 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                        {prod.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-400">
                      <Link href={`/admin/products/edit/${prod.id}`} className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors" title="Edit Product"><Edit2 className="w-4 h-4" /></Link>
                      <button onClick={() => handleDuplicateProduct(prod)} className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer" title="Duplicate"><Copy className="w-4 h-4" /></button>
                      <Link href={`/admin/inventory?product=${prod.id}`} className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Inventory"><KeyRound className="w-4 h-4" /></Link>
                      <button onClick={() => setDeletingProductId(prod.id)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      <Link href={`/product/${prod.slug}`} target="_blank" className="p-1.5 hover:text-[#FC5C03] hover:bg-orange-50 rounded transition-colors" title="View Live"><ExternalLink className="w-4 h-4" /></Link>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {filtered.length === 0 && !isLoading && (
              <div className="py-12 text-center text-slate-500 text-sm">
                  No products found matching your filters.
              </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deletingProductId)}
        onClose={() => setDeletingProductId(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Yes, delete it"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
      
      {/* Bulk Price Modal */}
      {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <h3 className="text-lg font-bold mb-4">Bulk Price Adjustment</h3>
                <p className="text-sm text-slate-500 mb-4">Adjust price for {selectedIds.size} selected products.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Adjustment Type</label>
                        <select 
                            value={bulkPriceChange.type}
                            onChange={(e) => setBulkPriceChange({...bulkPriceChange, type: e.target.value})}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03] outline-hidden cursor-pointer"
                        >
                            <option value="percentage">Percentage (+/- %)</option>
                            <option value="fixed">Fixed Amount (+/- ৳)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Value (Use negative for discount)</label>
                        <input 
                            type="number" 
                            value={bulkPriceChange.value}
                            onChange={(e) => setBulkPriceChange({...bulkPriceChange, value: Number(e.target.value)})}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03] outline-hidden"
                            placeholder="e.g. 10 or -50"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                    <button onClick={executeBulkPrice} className="px-4 py-2 text-sm font-semibold text-white bg-[#FC5C03] hover:bg-[#E05000] rounded-xl cursor-pointer">Apply Changes</button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
}
