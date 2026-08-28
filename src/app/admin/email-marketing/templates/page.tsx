"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileCode,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  Eye,
  Copy,
  Edit2,
  Trash2,
  Send,
  Sparkles,
} from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/context/ToastContext";

export default function TemplatesListPage() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  const categories = [
    { id: "ALL", label: "All Templates" },
    { id: "FLASH_SALE", label: "Flash Sale" },
    { id: "DISCOUNT_OFFER", label: "Discounts" },
    { id: "PRODUCT_ANNOUNCEMENT", label: "New Release" },
    { id: "WINBACK", label: "Winback" },
    { id: "NEWSLETTER", label: "Newsletters" },
    { id: "RESTOCK_ALERT", label: "Restock" },
    { id: "CUSTOM", label: "Custom" },
  ];

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-marketing/templates");
      if (res.ok) {
        const data = await res.json();
        if (data.templates) setTemplates(data.templates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDuplicate = async (templateId: string) => {
    try {
      const res = await fetch(`/api/admin/email-marketing/templates/${templateId}`, {
        method: "POST", // Clone action handled in route
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Template cloned successfully!", "success");
        fetchTemplates();
      } else {
        showToast(data.error || "Failed to duplicate template", "error");
      }
    } catch {
      showToast("Error cloning template", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deletingTemplateId) return;
    try {
      const res = await fetch(`/api/admin/email-marketing/templates/${deletingTemplateId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplateId));
        showToast("Template deleted successfully.", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete template", "error");
      }
    } catch {
      showToast("Error deleting template", "error");
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === "ALL" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <FileCode className="w-3.5 h-3.5" />
            <span>Email Templates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Responsive Template Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Production-ready responsive email templates with built-in branding, product cards, and 1-click unsubscribe mechanisms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/email-marketing/templates/new"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Custom Template</span>
          </Link>

          <button
            onClick={fetchTemplates}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03] shadow-2xs"
          />
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Mini Preview Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-[#FC5C03] uppercase">
                    AI HAAT TEMPLATE
                  </span>
                  <span className="px-2 py-0.5 bg-white/10 text-white rounded text-[10px] font-bold uppercase">
                    {t.category}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-black text-slate-900 text-base">{t.name}</h3>
                  {t.subject && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      <strong>Subject:</strong> {t.subject}
                    </p>
                  )}

                  {/* HTML Excerpt */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl max-h-24 overflow-hidden text-[11px] text-slate-600 font-mono line-clamp-3">
                    {t.contentHtml.replace(/<[^>]*>?/gm, "").slice(0, 150)}...
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewTemplate(t)}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Live Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(t.id)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Clone / Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/admin/email-marketing/templates/${t.id}`}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Edit Template"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setDeletingTemplateId(t.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/admin/email-marketing/campaigns/new?templateId=${t.id}`}
                  className="px-3.5 py-1.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Use in Campaign</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center text-slate-400 space-y-2">
            <FileCode className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No templates found.</p>
            <p className="text-xs text-slate-400">Click &apos;+ Create Custom Template&apos; to build your first template.</p>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{previewTemplate.name}</h3>
                <span className="text-xs text-slate-500">Category: {previewTemplate.category}</span>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 rounded-2xl">
              <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200 text-xs text-slate-700">
                <div className="bg-[#0F172A] p-4 text-center border-b-2 border-[#FC5C03]">
                  <div className="font-black text-white text-base">AI <span className="text-[#FC5C03]">HAAT</span></div>
                </div>
                <div
                  className="p-5 space-y-3"
                  dangerouslySetInnerHTML={{
                    __html: previewTemplate.contentHtml
                      .replace(/\{\{first_name\}\}/g, "John")
                      .replace(/\{\{customer_name\}\}/g, "John Doe")
                      .replace(/\{\{coupon_code\}\}/g, "SAVE30")
                      .replace(/\{\{site_url\}\}/g, "https://aihaat.shop"),
                  }}
                />
                <div className="bg-slate-900 p-4 text-center text-[10px] text-slate-400">
                  <p className="margin: 0">AI Haat — Bangladesh&apos;s #1 Digital Marketplace</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/admin/email-marketing/campaigns/new?templateId=${previewTemplate.id}`}
                className="px-5 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Create Campaign with this Template</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deletingTemplateId)}
        onClose={() => setDeletingTemplateId(null)}
        onConfirm={confirmDelete}
        title="Delete Email Template"
        message="Are you sure you want to delete this email template?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  );
}