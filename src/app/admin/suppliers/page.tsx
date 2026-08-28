"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Key, 
  Activity, 
  PackageCheck, 
  Plus, 
  Copy, 
  RefreshCw, 
  CheckCircle, 
  Power, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Layers,
  Send,
  Globe,
  Phone,
  Mail,
  User,
  Sliders,
  Trash2
} from "lucide-react";

interface ProductMapping {
  id: string;
  productId: string;
  variationId: string | null;
  supplierSku?: string | null;
  defaultCost?: number | null;
  currency: string;
  leadTime?: string | null;
  isPreferred: boolean;
  product: { id: string; name: string };
  variation?: { id: string; name: string } | null;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  telegram: string | null;
  website: string | null;
  status: string;
  isActive: boolean;
  notes: string | null;
  apiKey: string;
  apiSecret: string;
  createdAt: string;
  lastPurchaseDate?: string;
  productsMappedCount?: number;
  productMappings?: ProductMapping[];
  activeBatchesCount?: number;
  totalBatchesCount?: number;
  totalUnitsPurchased?: number;
  availableUnits?: number;
  deliveredUnits?: number;
  replacedUnits?: number;
  invalidUnits?: number;
  totalProcurementSpendBDT?: number;
  availableInventoryValueBDT?: number;
  avgAcquisitionCostBDT?: number | null;
  invalidRatePct?: number;
  replacementRatePct?: number;
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Products for mapping
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  // New Supplier Form
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    code: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    telegram: "",
    website: "",
    status: "ACTIVE",
    notes: "",
  });

  // New Mapping Form
  const [newMapping, setNewMapping] = useState({
    productId: "",
    variationId: "",
    supplierSku: "",
    defaultCost: "",
    currency: "BDT",
    leadTime: "Instant",
    isPreferred: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/suppliers");
      const data = await res.json();
      if (data.success && Array.isArray(data.suppliers)) {
        setSuppliers(data.suppliers);
      }

      // Fetch products for mapping modal
      const prodRes = await fetch("/api/admin/products");
      const prodData = await prodRes.json();
      if (prodData.success && Array.isArray(prodData.products)) {
        setAvailableProducts(prodData.products);
      }
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isActive: !currentStatus, status: !currentStatus ? "ACTIVE" : "INACTIVE" } : s));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.code) return;

    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewSupplier({
          name: "",
          code: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          telegram: "",
          website: "",
          status: "ACTIVE",
          notes: "",
        });
        fetchData();
      } else {
        alert(data.error || "Failed to create supplier");
      }
    } catch (err) {
      console.error("Failed to add supplier:", err);
    }
  };

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !newMapping.productId) return;

    try {
      const res = await fetch("/api/admin/suppliers/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          productId: newMapping.productId,
          variationId: newMapping.variationId || null,
          supplierSku: newMapping.supplierSku || null,
          defaultCost: newMapping.defaultCost ? Number(newMapping.defaultCost) : null,
          currency: newMapping.currency,
          leadTime: newMapping.leadTime,
          isPreferred: newMapping.isPreferred,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMapping({
          productId: "",
          variationId: "",
          supplierSku: "",
          defaultCost: "",
          currency: "BDT",
          leadTime: "Instant",
          isPreferred: false,
        });
        fetchData();
      } else {
        alert(data.error || "Failed to save mapping");
      }
    } catch (err) {
      console.error("Failed to save mapping:", err);
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm("Are you sure you want to remove this product-supplier mapping?")) return;
    try {
      const res = await fetch("/api/admin/suppliers/mappings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mappingId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to delete mapping:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // KPIs
  const totalSuppliersCount = suppliers.length;
  const activeSuppliersCount = suppliers.filter(s => s.isActive).length;
  const totalProcurementSpend = suppliers.reduce((acc, s) => acc + (s.totalProcurementSpendBDT || 0), 0);
  const totalAvailableStockValuation = suppliers.reduce((acc, s) => acc + (s.availableInventoryValueBDT || 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier & Sourcing Management</h1>
              <p className="text-sm text-gray-500">Track vendors, procurement spend, quality failure rates & product linkages</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchData}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Suppliers</p>
            <p className="text-xl font-bold text-gray-900">{activeSuppliersCount} / {totalSuppliersCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Procurement Spend</p>
            <p className="text-xl font-bold text-gray-900">৳{totalProcurementSpend.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Stock Valuation</p>
            <p className="text-xl font-bold text-gray-900">৳{totalAvailableStockValuation.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sourced Units</p>
            <p className="text-xl font-bold text-gray-900">
              {suppliers.reduce((acc, s) => acc + (s.totalUnitsPurchased || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900 text-base">Registered Suppliers & Performance Indicators</h2>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {suppliers.length} Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 text-xs uppercase font-semibold text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Mapped Products</th>
                <th className="px-6 py-4">Procurement Spend</th>
                <th className="px-6 py-4">Available Stock</th>
                <th className="px-6 py-4">Avg Unit Cost</th>
                <th className="px-6 py-4">Invalid Rate</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {s.code.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          {s.name}
                        </div>
                        <span className="text-xs text-gray-400 font-mono">Code: {s.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5 text-xs text-gray-500">
                      {s.contactName && <div className="font-medium text-gray-700">{s.contactName}</div>}
                      {s.contactEmail && <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {s.contactEmail}</div>}
                      {s.contactPhone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {s.contactPhone}</div>}
                      {s.telegram && <div className="flex items-center gap-1"><Send className="w-3 h-3 text-sky-500" /> @{s.telegram.replace("@", "")}</div>}
                      {s.website && <div className="flex items-center gap-1"><Globe className="w-3 h-3 text-gray-400" /> {s.website}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedSupplier(s);
                        setIsMappingModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      {s.productsMappedCount || 0} Products
                    </button>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ৳{(s.totalProcurementSpendBDT || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{s.availableUnits || 0} units</span>
                    <div className="text-xs text-gray-400">৳{(s.availableInventoryValueBDT || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-700">
                    {s.avgAcquisitionCostBDT !== null && s.avgAcquisitionCostBDT !== undefined
                      ? `৳${s.avgAcquisitionCostBDT}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${
                        (s.invalidRatePct || 0) > 10 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
                      } px-2 py-0.5 rounded`}>
                        {s.invalidRatePct || 0}%
                      </span>
                      <span className="text-xs text-gray-400">({s.invalidUnits || 0} invalid)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.isActive 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedSupplier(s);
                          setIsApiModalOpen(true);
                        }}
                        className="p-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg transition-colors border border-gray-200"
                        title="View API Keys"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(s.id, s.isActive)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          s.isActive 
                            ? "bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border-gray-200" 
                            : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        }`}
                        title={s.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">
                    No suppliers registered yet. Click &quot;Add Supplier&quot; to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD SUPPLIER MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Add New Supplier</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateSupplier} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Supplier Name *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Digital Wholesale Hub"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Unique Code *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. SUP-01"
                    value={newSupplier.code}
                    onChange={(e) => setNewSupplier({ ...newSupplier, code: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex Rahman"
                    value={newSupplier.contactName}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Email</label>
                  <input 
                    type="email" 
                    placeholder="supplier@vendor.com"
                    value={newSupplier.contactEmail}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+8801..."
                    value={newSupplier.contactPhone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Telegram Handle</label>
                  <input 
                    type="text" 
                    placeholder="@vendor_direct"
                    value={newSupplier.telegram}
                    onChange={(e) => setNewSupplier({ ...newSupplier, telegram: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Website / Portal</label>
                <input 
                  type="url" 
                  placeholder="https://vendorportal.com"
                  value={newSupplier.website}
                  onChange={(e) => setNewSupplier({ ...newSupplier, website: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Operational Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Payment terms, delivery SLA, replenishment notes..."
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save & Generate Keys
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PRODUCT-SUPPLIER MAPPINGS MODAL --- */}
      {isMappingModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Product Sourcing Mappings: {selectedSupplier.name}</h3>
              </div>
              <button onClick={() => setIsMappingModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 space-y-6 text-sm">
              {/* Existing Mappings */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Current Sourced Products</h4>
                <div className="space-y-2">
                  {(selectedSupplier.productMappings || []).map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">{m.product.name}</div>
                        <div className="text-xs text-gray-500">
                          {m.variation ? `Variation: ${m.variation.name}` : "All Variations"} | Cost: {m.defaultCost !== null && m.defaultCost !== undefined ? `${m.currency} ${m.defaultCost}` : "No default cost"} | {m.leadTime || "Instant"}
                          {m.isPreferred && <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">PREFERRED</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMapping(m.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove Mapping"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!selectedSupplier.productMappings || selectedSupplier.productMappings.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No products mapped yet for this supplier.</p>
                  )}
                </div>
              </div>

              {/* Add Mapping Form */}
              <form onSubmit={handleCreateMapping} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-900 uppercase">Map New Product to this Supplier</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Product *</label>
                    <select
                      required
                      value={newMapping.productId}
                      onChange={(e) => setNewMapping({ ...newMapping, productId: e.target.value, variationId: "" })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    >
                      <option value="">Select Product...</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Variation (Optional)</label>
                    <select
                      value={newMapping.variationId}
                      onChange={(e) => setNewMapping({ ...newMapping, variationId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      disabled={!newMapping.productId}
                    >
                      <option value="">All Variations / Standard</option>
                      {availableProducts
                        .find((p) => p.id === newMapping.productId)
                        ?.variations?.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.name} (৳{v.priceBDT})</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Default Unit Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 250"
                      value={newMapping.defaultCost}
                      onChange={(e) => setNewMapping({ ...newMapping, defaultCost: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Currency</label>
                    <select
                      value={newMapping.currency}
                      onChange={(e) => setNewMapping({ ...newMapping, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                    >
                      <option value="BDT">BDT (৳)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Time</label>
                    <input
                      type="text"
                      placeholder="Instant / 1 hr"
                      value={newMapping.leadTime}
                      onChange={(e) => setNewMapping({ ...newMapping, leadTime: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPreferred"
                    checked={newMapping.isPreferred}
                    onChange={(e) => setNewMapping({ ...newMapping, isPreferred: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="isPreferred" className="text-xs font-semibold text-gray-700">
                    Mark as Preferred Supplier for this product
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Save Product Mapping
                  </button>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsMappingModalOpen(false)}
                className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- API CREDENTIALS MODAL --- */}
      {isApiModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">API Credentials: {selectedSupplier.name}</h3>
              </div>
              <button onClick={() => setIsApiModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Webhook Ingestion URL</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value="https://aihaat.shop/api/inventory/supplier-webhook"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-700"
                  />
                  <button 
                    onClick={() => copyToClipboard("https://aihaat.shop/api/inventory/supplier-webhook")}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 flex items-center gap-1 font-semibold text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">X-Supplier-Key</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={selectedSupplier.apiKey}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-700"
                  />
                  <button 
                    onClick={() => copyToClipboard(selectedSupplier.apiKey)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 flex items-center gap-1 font-semibold text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">X-Supplier-Secret</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={selectedSupplier.apiSecret}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-700"
                  />
                  <button 
                    onClick={() => copyToClipboard(selectedSupplier.apiSecret)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 flex items-center gap-1 font-semibold text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">cURL Ingestion Example</label>
                <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
{`curl -X POST https://aihaat.shop/api/inventory/supplier-webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Supplier-Key: ${selectedSupplier.apiKey}" \\
  -H "X-Supplier-Secret: ${selectedSupplier.apiSecret}" \\
  -d '{
    "productId": "PRODUCT_ID",
    "variationId": "VARIATION_ID",
    "type": "ACCOUNT_CREDENTIAL",
    "unitCostBDT": 300,
    "lines": [
      "user1@netflix.com:Pass123",
      "user2@netflix.com:Pass456"
    ]
  }'`}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsApiModalOpen(false)}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Copy Toast */}
      {copied && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold z-50 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
