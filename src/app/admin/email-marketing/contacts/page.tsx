"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  RefreshCw,
  ArrowLeft,
  Plus,
  Upload,
  UserCheck,
  UserX,
  ShieldAlert,
  ShieldBan,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

interface ContactItem {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  isSubscribed: boolean;
  isSuppressed: boolean;
  status: string;
  source: string;
  orderCount: number;
  totalSpent: number;
  subscribedAt: string | null;
  createdAt: string;
}

export default function AdminContactsPage() {
  const { showToast } = useToast();

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Summary counts
  const [stats, setStats] = useState({
    total: 0,
    subscribed: 0,
    unsubscribed: 0,
    suppressed: 0,
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", name: "", phone: "", isSubscribed: true });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // CSV Import State
  const [csvText, setCsvText] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filterStatus !== "ALL") params.set("status", filterStatus);

      const res = await fetch(`/api/admin/email-marketing/contacts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.contacts) {
          setContacts(data.contacts);
          if (data.stats) {
            setStats(data.stats);
          } else {
            const total = data.contacts.length;
            const subscribed = data.contacts.filter((c: ContactItem) => c.isSubscribed && !c.isSuppressed).length;
            const suppressed = data.contacts.filter((c: ContactItem) => c.isSuppressed).length;
            setStats({
              total,
              subscribed,
              unsubscribed: total - subscribed - suppressed,
              suppressed,
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email.trim()) return;
    setIsSubmittingAdd(true);
    try {
      const res = await fetch("/api/admin/email-marketing/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Contact added successfully!", "success");
        setShowAddModal(false);
        setAddForm({ email: "", name: "", phone: "", isSubscribed: true });
        fetchContacts();
      } else {
        showToast(data.error || "Failed to add contact", "error");
      }
    } catch {
      showToast("Network error adding contact", "error");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentConfirmed) {
      showToast("Please confirm that these contacts gave opt-in marketing consent.", "error");
      return;
    }
    if (!csvText.trim()) {
      showToast("Please paste CSV data or email list.", "error");
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch("/api/admin/email-marketing/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData: csvText,
          consentConfirmed: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Contacts imported successfully!", "success");
        setShowImportModal(false);
        setCsvText("");
        setConsentConfirmed(false);
        fetchContacts();
      } else {
        showToast(data.error || "Import failed", "error");
      }
    } catch {
      showToast("Error processing CSV import", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleToggleSubscribe = async (contactId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/email-marketing/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          isSubscribed: !currentStatus,
        }),
      });
      if (res.ok) {
        showToast(`Contact ${!currentStatus ? "subscribed" : "unsubscribed"}.`, "success");
        fetchContacts();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch {
      showToast("Error updating contact", "error");
    }
  };

  const handleSuppressContact = async (email: string) => {
    if (!confirm(`Are you sure you want to permanently suppress ${email} from all marketing emails?`)) return;
    try {
      const res = await fetch("/api/admin/email-marketing/suppressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reason: "ADMIN_BLOCK",
        }),
      });
      if (res.ok) {
        showToast(`Added ${email} to suppression list.`, "success");
        fetchContacts();
      } else {
        showToast("Failed to add to suppression list", "error");
      }
    } catch {
      showToast("Error suppressing contact", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Audience Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Audience &amp; Contacts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage customer marketing consent, subscribers, suppression overrides, and customer lifetime metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>📥 Import CSV List</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Contact</span>
          </button>

          <button
            onClick={fetchContacts}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 block">Total Discovered Contacts</span>
          <span className="text-2xl font-black text-slate-900 font-mono block mt-1">{stats.total}</span>
          <span className="text-[11px] text-slate-400 font-medium">Registered users + imported</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 block">Active Marketing Subscribers</span>
          <span className="text-2xl font-black text-emerald-600 font-mono block mt-1">{stats.subscribed}</span>
          <span className="text-[11px] text-emerald-600 font-bold">Eligible for broadcasts</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 block">Opted-Out / Unsubscribed</span>
          <span className="text-2xl font-black text-amber-600 font-mono block mt-1">{stats.unsubscribed}</span>
          <span className="text-[11px] text-slate-400 font-medium">Respecting preference</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 block">Suppressed / Bounced</span>
          <span className="text-2xl font-black text-red-600 font-mono block mt-1">{stats.suppressed}</span>
          <span className="text-[11px] text-red-600 font-medium">Hard blocked by rule</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "All Contacts" },
            { id: "SUBSCRIBED", label: "Active Subscribed" },
            { id: "UNSUBSCRIBED", label: "Unsubscribed" },
            { id: "SUPPRESSED", label: "Suppressed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Marketing Status</th>
                <th className="py-3.5 px-5">Source</th>
                <th className="py-3.5 px-5">Orders &amp; Lifetime Spend</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <strong className="text-slate-900 block font-bold text-xs">{c.name || "AI Haat Customer"}</strong>
                      <span className="text-slate-400 font-mono text-[11px] block">{c.email}</span>
                      {c.phone && <span className="text-[10px] text-slate-400 font-mono">{c.phone}</span>}
                    </td>

                    <td className="py-3.5 px-5">
                      {c.isSuppressed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          <ShieldBan className="w-3 h-3" />
                          <span>Suppressed</span>
                        </span>
                      ) : c.isSubscribed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <UserCheck className="w-3 h-3" />
                          <span>Subscribed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <UserX className="w-3 h-3" />
                          <span>Unsubscribed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="text-[11px] text-slate-600 uppercase font-bold bg-slate-100 px-2 py-0.5 rounded">
                        {c.source || "REGISTERED_USER"}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono">
                      <span className="text-slate-900 font-bold block">{c.orderCount || 0} Orders</span>
                      <span className="text-emerald-600 font-bold text-[11px]">৳{c.totalSpent || 0}</span>
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-1">
                      {!c.isSuppressed && (
                        <button
                          type="button"
                          onClick={() => handleToggleSubscribe(c.id, c.isSubscribed)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            c.isSubscribed
                              ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                        >
                          {c.isSubscribed ? "Opt-Out" : "Opt-In"}
                        </button>
                      )}

                      {!c.isSuppressed && (
                        <button
                          type="button"
                          onClick={() => handleSuppressContact(c.email)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Add to Suppression List"
                        >
                          <ShieldBan className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No contacts found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FC5C03]" />
                <span>Add Marketing Contact</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="+8801700000000"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                <input
                  type="checkbox"
                  id="optin-consent"
                  checked={addForm.isSubscribed}
                  onChange={(e) => setAddForm({ ...addForm, isSubscribed: e.target.checked })}
                  className="rounded border-slate-300 text-[#FC5C03]"
                />
                <label htmlFor="optin-consent" className="text-xs text-slate-700 font-bold cursor-pointer">
                  Contact has opted-in to receive promotional emails
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? "Adding..." : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Import Audience CSV / Email List</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Paste CSV Data or List of Emails:
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Format: <code>email, name, phone</code> or simply one email per line.
                </p>
                <textarea
                  rows={8}
                  required
                  placeholder={`user1@gmail.com, Rahim Islam, +8801700000001\nuser2@yahoo.com, Sadia Khan, +8801800000002\nuser3@hotmail.com`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Consent Guard */}
              <div className="p-4 bg-[#FFF2E8] border border-[#FC5C03]/20 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="csv-consent"
                  required
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#FC5C03]"
                />
                <label htmlFor="csv-consent" className="text-xs text-slate-800 leading-relaxed cursor-pointer font-medium">
                  <strong>Compliance Declaration:</strong> I confirm that all imported contacts have provided explicit permission/opt-in consent to receive promotional emails from AI Haat in compliance with CAN-SPAM / anti-spam guidelines.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !consentConfirmed}
                  className="px-5 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isImporting ? "Importing Contacts..." : "Start Batch Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}