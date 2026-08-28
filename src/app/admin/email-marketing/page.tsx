"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  Eye,
  MousePointer,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CalendarClock,
  ShieldCheck,
  Radio,
  FileCode,
  Sliders,
  AlertTriangle,
  Inbox,
  Clock,
  Plus,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface EmailMarketingStats {
  totalContacts: number;
  marketingSubscribers: number;
  unsubscribedCount: number;
  suppressedCount: number;
  totalCampaigns: number;
  scheduledCampaigns: number;
  draftCampaigns: number;
  sentCampaigns: number;
  totalEmailsSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  dailyTrend: Array<{ date: string; sent: number; opened: number; clicked: number }>;
  recentCampaigns: Array<{
    id: string;
    name: string;
    subject: string;
    status: string;
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    scheduledAt: string | null;
    createdAt: string;
  }>;
}

export default function EmailMarketingDashboardPage() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState<"TODAY" | "7D" | "30D" | "ALL">("7D");
  const [stats, setStats] = useState<EmailMarketingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/admin/email-marketing/stats?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load email marketing stats:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Periodic 30s live refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const maxSentInTrend = stats?.dailyTrend
    ? Math.max(...stats.dailyTrend.map((d) => d.sent), 10)
    : 10;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Haat Broadcast Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Email Marketing & Broadcasts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage promotional broadcasts from <span className="font-mono font-bold text-slate-700">offers@aihaat.shop</span>, track deliverability, and segment customer audiences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { id: "TODAY", label: "Today" },
              { id: "7D", label: "7 Days" },
              { id: "30D", label: "30 Days" },
              { id: "ALL", label: "All Time" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === t.id
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/email-marketing/campaigns/new"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Campaign</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* KPI 1: Active Subscribers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Marketing Audience</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FC5C03] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.marketingSubscribers || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block truncate">
            {stats?.totalContacts || 0} total ({stats?.suppressedCount || 0} suppressed)
          </span>
        </div>

        {/* KPI 2: Total Emails Sent */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Dispatched</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.totalEmailsSent || 0}
          </span>
          <span className="text-[11px] text-blue-600 font-semibold block">
            {stats?.totalCampaigns || 0} total campaigns
          </span>
        </div>

        {/* KPI 3: Delivery Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Delivery Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600 block">
            {stats?.deliveryRate || 100}%
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block">
            {stats?.totalDelivered || 0} delivered
          </span>
        </div>

        {/* KPI 4: Open Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Open Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-purple-600 block">
            {stats?.openRate || 0}%
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block">
            {stats?.totalOpened || 0} unique opens
          </span>
        </div>

        {/* KPI 5: Click-Through Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Click Rate</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MousePointer className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.clickRate || 0}%
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block">
            {stats?.totalClicked || 0} link clicks
          </span>
        </div>

        {/* KPI 6: Scheduled & In-Flight */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Scheduled / Drafts</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.scheduledCampaigns || 0}
          </span>
          <Link href="/admin/email-marketing/scheduled" className="text-[11px] text-[#FC5C03] font-bold hover:underline block">
            {stats?.draftCampaigns || 0} drafts in queue →
          </Link>
        </div>

      </div>

      {/* Main Charts & Highlights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Broadcast Velocity Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Broadcast Sending Velocity</h3>
              <p className="text-xs text-slate-500">Daily email delivery and customer engagement volume</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FC5C03]" /> Sent
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Opened
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Clicked
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-slate-100 pb-3">
              {stats?.dailyTrend && stats.dailyTrend.map((day, idx) => {
                const heightPercent = Math.max(8, Math.round((day.sent / maxSentInTrend) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      Sent: {day.sent} | Opened: {day.opened} | Clicks: {day.clicked}
                    </div>

                    <div className="w-full max-w-[36px] bg-slate-100 rounded-xl overflow-hidden h-36 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-[#FC5C03] to-[#FF8540] rounded-xl transition-all group-hover:brightness-110"
                      />
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500 font-mono text-center truncate max-w-full">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Quick Nav & Sender Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Official Sender Badge */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-6 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FC5C03] bg-[#FC5C03]/10 border border-[#FC5C03]/30 px-2 py-0.5 rounded-md">
                Verified Marketing Sender
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Official Broadcast Sender:</span>
              <span className="text-base font-black text-white font-mono block mt-0.5">
                offers@aihaat.shop
              </span>
              <span className="text-xs text-slate-300 block mt-1">
                Display Name: <strong>AI Haat Offers</strong>
              </span>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Isolated from Transactional Mail</span>
              <Link
                href="/admin/email-marketing/settings"
                className="text-[#FC5C03] font-bold hover:underline"
              >
                Settings →
              </Link>
            </div>
          </div>

          {/* Quick Hub Shortcuts */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/email-marketing/campaigns/new"
                className="p-3 bg-slate-50 hover:bg-[#FFF2E8] hover:text-[#FC5C03] rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-[#FC5C03]" />
                <span>New Campaign</span>
              </Link>

              <Link
                href="/admin/email-marketing/templates"
                className="p-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5 text-purple-600" />
                <span>Templates</span>
              </Link>

              <Link
                href="/admin/email-marketing/contacts"
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Audience</span>
              </Link>

              <Link
                href="/admin/email-marketing/logs"
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <Inbox className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email Logs</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Recent Campaigns Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FC5C03]" />
            <h3 className="text-base font-black text-slate-900">Recent Broadcast Campaigns</h3>
          </div>
          <Link
            href="/admin/email-marketing/campaigns"
            className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          {stats?.recentCampaigns && stats.recentCampaigns.length > 0 ? (
            stats.recentCampaigns.map((c) => {
              const openRateCalc = c.sentCount > 0 ? Math.round((c.openedCount / c.sentCount) * 100) : 0;
              const clickRateCalc = c.openedCount > 0 ? Math.round((c.clickedCount / c.openedCount) * 100) : 0;
              return (
                <div key={c.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === "SENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "SENDING"
                            ? "bg-blue-100 text-blue-800 animate-pulse"
                            : c.status === "SCHEDULED"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-slate-400">• {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5 truncate max-w-lg">
                      Subject: {c.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block font-mono">
                        {c.sentCount} sent
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {openRateCalc}% opens • {clickRateCalc}% clicks
                      </span>
                    </div>
                    <Link
                      href={`/admin/email-marketing/campaigns/${c.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                    >
                      Analytics →
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Mail className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">No email campaigns created yet.</p>
              <p className="text-xs text-slate-400">Click &apos;+ Create Campaign&apos; to send your first broadcast!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}