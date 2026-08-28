"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  RefreshCw,
  Search,
  PackageCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Download,
  AlertCircle,
  ArrowLeft,
  Plus,
  Edit2,
  DollarSign,
  Layers,
  ShieldAlert
} from "lucide-react";

interface BatchItem {
  id: string;
  batchRef: string;
  productId: string;
  productName: string;
  variationId?: string | null;
  variationName: string;
  supplierId?: string | null;
  supplierName: string;
  supplierCode?: string | null;
  availableCount: number;
  deliveredCount: number;
  invalidCount: number;
  expiredCount: number;
  totalCount: number;
  quantityPurchased: number;
  currency: string;
  exchangeRateToBDT: number;
  unitCost?: number | null;
  totalCost?: number | null;
  unitCostBDT?: number | null;
  totalCostBDT?: number | null;
  unitPriceBDT: number;
  margin?: number | null;
  marginPct?: number | null;
  expiryDate: string | null;
  purchaseDate: string;
  createdAt: string;
  status: string;
  notes?: string | null;
}

interface KPI {
  totalBatches: number;
  totalIngestedValue: number;
  availableStockValue: number;
  deliveredStockValue: number;
  expiringSoonCount: number;
}

export default function BatchExplorerPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [kpi, setKpi] = useState<KPI>({
    totalBatches: 0,
    totalIngestedValue: 0,
    availableStockValue: 0,
    deliveredStockValue: 0,
    expiringSoonCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");

  // Suppliers and products for creation dropdowns
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);

  // Create Batch Form
  const [newBatch, setNewBatch] = useState({
    supplierId: "",
    productId: "",
    variationId: "",
    batchRef: "",
    currency: "BDT",
    exchangeRateToBDT: "120",
    unitCost: "",
    quantity: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    linesText: "",
    notes: "",
  });

  // Edit Cost Form
  const [editCost, setEditCost] = useState({
    unitCost: "",
    currency: "BDT",
    exchangeRateToBDT: "120",
    unitCostBDT: "",
    adminReason: "",
    updateUnsoldStockOnly: true,
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/inventory/batches", window.location.origin);
      if (supplierFilter !== "ALL") url.searchParams.set("supplierId", supplierFilter);
      if (productFilter !== "ALL") url.searchParams.set("productId", productFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBatches(data.batches || []);
          setKpi(data.kpi || {
            totalBatches: data.batches?.length || 0,
            totalIngestedValue: 0,
            availableStockValue: 0,
            deliveredStockValue: 0,
            expiringSoonCount: 0
          });
        }
      }

      // Fetch suppliers and products
      const supRes = await fetch("/api/admin/suppliers");
      const supData = await supRes.json();
      if (supData.success && Array.isArray(supData.suppliers)) setSuppliers(supData.suppliers);

      const prodRes = await fetch("/api/admin/products");
      const prodData = await prodRes.json();
      if (prodData.success && Array.isArray(prodData.products)) setProducts(prodData.products);
    } catch (error) {
      console.error("Failed to load batches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [supplierFilter, productFilter]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.supplierId || !newBatch.productId) return;

    const lines = newBatch.linesText
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/inventory/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: newBatch.supplierId,
          productId: newBatch.productId,
          variationId: newBatch.variationId || null,
          batchRef: newBatch.batchRef || undefined,
          currency: newBatch.currency,
          exchangeRateToBDT: newBatch.currency === "USD" ? Number(newBatch.exchangeRateToBDT) : 1.0,
          unitCost: newBatch.unitCost ? Number(newBatch.unitCost) : null,
          quantity: newBatch.quantity ? Number(newBatch.quantity) : lines.length,
          purchaseDate: newBatch.purchaseDate,
          lines: lines.length > 0 ? lines : undefined,
          notes: newBatch.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setNewBatch({
          supplierId: "",
          productId: "",
          variationId: "",
          batchRef: "",
          currency: "BDT",
          exchangeRateToBDT: "120",
          unitCost: "",
          quantity: "",
          purchaseDate: new Date().toISOString().split("T")[0],
          linesText: "",
          notes: "",
        });
        fetchBatches();
      } else {
        alert(data.error || "Failed to create batch");
      }
    } catch (err) {
      console.error("Create batch error:", err);
    }
  };

  const handleEditCostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    try {
      const res = await fetch("/api/admin/inventory/batches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBatch.id,
          unitCost: editCost.unitCost ? Number(editCost.unitCost) : null,
          currency: editCost.currency,
          exchangeRateToBDT: editCost.currency === "USD" ? Number(editCost.exchangeRateToBDT) : 1.0,
          unitCostBDT: editCost.unitCostBDT ? Number(editCost.unitCostBDT) : null,
          adminReason: editCost.adminReason,
          updateUnsoldStockOnly: editCost.updateUnsoldStockOnly,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setSelectedBatch(null);
        fetchBatches();
      } else {
        alert(data.error || "Failed to update cost");
      }
    } catch (err) {
      console.error("Edit cost error:", err);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.batchRef.toLowerCase().includes(q) ||
      b.productName.toLowerCase().includes(q) ||
      b.supplierName.toLowerCase().includes(q) ||
      (b.supplierCode && b.supplierCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/inventory" 
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Batch Procurement</h1>
              <p className="text-sm text-gray-500">Track acquisition batches, currencies, exchange rate snapshots & unit costs</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/api/admin/reports/export?type=PROCUREMENT"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <button 
            onClick={fetchBatches}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            New Batch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Batches</p>
            <p className="text-xl font-bold text-gray-900">{kpi.totalBatches}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Procurement Value</p>
            <p className="text-xl font-bold text-gray-900">৳{kpi.totalIngestedValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Stock Value</p>
            <p className="text-xl font-bold text-gray-900">৳{kpi.availableStockValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivered Stock Cost</p>
            <p className="text-xl font-bold text-gray-900">৳{kpi.deliveredStockValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by batch ref, product or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
          >
            <option value="ALL">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
          >
            <option value="ALL">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Batch Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 text-xs uppercase font-semibold text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Batch Ref</th>
                <th className="px-6 py-4">Product & Variation</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Unit Cost</th>
                <th className="px-6 py-4">Total Cost</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Purchase Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {b.batchRef}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{b.productName}</div>
                    <span className="text-xs text-gray-400">{b.variationName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{b.supplierName}</div>
                    {b.supplierCode && <span className="text-xs text-gray-400 font-mono">{b.supplierCode}</span>}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {b.quantityPurchased || b.totalCount} units
                  </td>
                  <td className="px-6 py-4">
                    {b.unitCostBDT !== null && b.unitCostBDT !== undefined ? (
                      <div>
                        <span className="font-bold text-gray-900 font-mono">৳{b.unitCostBDT}</span>
                        {b.currency !== "BDT" && b.unitCost !== null && (
                          <div className="text-[11px] text-gray-400 font-mono">
                            {b.currency} {b.unitCost} @ ৳{b.exchangeRateToBDT}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        COST UNKNOWN
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                    {b.totalCostBDT !== null && b.totalCostBDT !== undefined ? `৳${b.totalCostBDT.toLocaleString()}` : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">{b.availableCount} avail</span>
                      <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">{b.deliveredCount} deliv</span>
                      {b.invalidCount > 0 && (
                        <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">{b.invalidCount} inv</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {b.purchaseDate ? b.purchaseDate.split("T")[0] : b.createdAt.split("T")[0]}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedBatch(b);
                        setEditCost({
                          unitCost: b.unitCost !== null && b.unitCost !== undefined ? String(b.unitCost) : "",
                          currency: b.currency || "BDT",
                          exchangeRateToBDT: String(b.exchangeRateToBDT || 120),
                          unitCostBDT: b.unitCostBDT !== null && b.unitCostBDT !== undefined ? String(b.unitCostBDT) : "",
                          adminReason: "",
                          updateUnsoldStockOnly: true,
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-lg transition-colors"
                      title="Edit Cost"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">
                    No batches match the filters. Click &quot;New Batch&quot; to ingest inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE BATCH MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Procure New Inventory Batch</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Supplier *</label>
                  <select
                    required
                    value={newBatch.supplierId}
                    onChange={(e) => setNewBatch({ ...newBatch, supplierId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Batch Reference</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newBatch.batchRef}
                    onChange={(e) => setNewBatch({ ...newBatch, batchRef: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Product *</label>
                  <select
                    required
                    value={newBatch.productId}
                    onChange={(e) => setNewBatch({ ...newBatch, productId: e.target.value, variationId: "" })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="">Select Product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Variation</label>
                  <select
                    value={newBatch.variationId}
                    onChange={(e) => setNewBatch({ ...newBatch, variationId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    disabled={!newBatch.productId}
                  >
                    <option value="">Standard / Default</option>
                    {products
                      .find((p) => p.id === newBatch.productId)
                      ?.variations?.map((v: any) => (
                        <option key={v.id} value={v.id}>{v.name} (৳{v.priceBDT})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Currency</label>
                  <select
                    value={newBatch.currency}
                    onChange={(e) => setNewBatch({ ...newBatch, currency: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Unit Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 250 or 2.50"
                    value={newBatch.unitCost}
                    onChange={(e) => setNewBatch({ ...newBatch, unitCost: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  />
                </div>
                {newBatch.currency !== "BDT" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">FX Rate to BDT</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 122.50"
                      value={newBatch.exchangeRateToBDT}
                      onChange={(e) => setNewBatch({ ...newBatch, exchangeRateToBDT: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={newBatch.purchaseDate}
                    onChange={(e) => setNewBatch({ ...newBatch, purchaseDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Credentials Payload (One line per key or account)
                </label>
                <textarea
                  rows={4}
                  placeholder={`user1@mail.com:Pass123\nuser2@mail.com:Pass456`}
                  value={newBatch.linesText}
                  onChange={(e) => setNewBatch({ ...newBatch, linesText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Lines pasted: {newBatch.linesText.split("\n").filter(l => l.trim()).length} items. Duplicates will be automatically skipped.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save & Ingest Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT COST MODAL (AUDITED) --- */}
      {isEditModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-900">Cost Correction: {selectedBatch.batchRef}</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleEditCostSubmit} className="p-6 space-y-4 text-sm">
              {selectedBatch.deliveredCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Notice: {selectedBatch.deliveredCount} units have already been delivered.
                  </div>
                  <p>
                    Changing acquisition cost for a consumed batch updates historical COGS reports. You must provide a formal audit reason below.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">New Unit Cost (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 280"
                    value={editCost.unitCostBDT}
                    onChange={(e) => setEditCost({ ...editCost, unitCostBDT: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Currency</label>
                  <select
                    value={editCost.currency}
                    onChange={(e) => setEditCost({ ...editCost, currency: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Audit Justification Reason *
                </label>
                <textarea
                  required={selectedBatch.deliveredCount > 0}
                  rows={3}
                  placeholder="e.g. Supplier applied retroactive discount / Wrong initial currency entered..."
                  value={editCost.adminReason}
                  onChange={(e) => setEditCost({ ...editCost, adminReason: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  Apply Audited Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
