"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Plus, Send, Radio, Eye, RefreshCw, ArrowLeft } from "lucide-react";

export default function AdminCampaignsListPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-marketing/campaigns");
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns) setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/email-marketing"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Email Broadcast Campaigns</h1>
            <p className="text-xs text-slate-500">View and manage marketing email broadcasts.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCampaigns}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/email-marketing/campaigns/new"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Campaign</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading campaigns...</div>
        ) : campaigns.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {campaigns.map((c) => (
              <div key={c.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-slate-900 font-bold">{c.name}</strong>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">Subject: {c.subject}</p>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Audience: {c.audienceType} • {c.sentCount || 0} sent • {c.openedCount || 0} opens
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/email-marketing/campaigns/${c.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Mail className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No campaigns found</p>
          </div>
        )}
      </div>
    </div>
  );
}