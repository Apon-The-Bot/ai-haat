"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CalendarClock,
  RefreshCw,
  ArrowLeft,
  Plus,
  Send,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Layers,
  Terminal,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

interface ScheduledCampaign {
  id: string;
  name: string;
  subject: string;
  audienceType: string;
  senderName: string;
  fromEmail: string;
  scheduledAt: string;
  status: string;
  createdAt: string;
}

export default function AdminScheduledPage() {
  const { showToast } = useToast();

  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchScheduled = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email-marketing/campaigns?status=SCHEDULED");
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns) setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduled();
  }, [fetchScheduled]);

  const handleBroadcastNow = async () => {
    if (!broadcastingId) return;
    try {
      const res = await fetch(`/api/admin/email-marketing/campaigns/${broadcastingId}/send`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Broadcast started immediately!", "success");
        fetchScheduled();
      } else {
        showToast(data.error || "Failed to trigger broadcast", "error");
      }
    } catch {
      showToast("Error triggering broadcast", "error");
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/email-marketing/campaigns/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== deletingId));
        showToast("Scheduled campaign cancelled & removed.", "success");
      } else {
        showToast("Failed to delete campaign", "error");
      }
    } catch {
      showToast("Error deleting campaign", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Scheduled Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Scheduled Broadcasts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage upcoming scheduled campaigns. Campaigns will automatically dispatch at their target time via background cron worker.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/email-marketing/campaigns/new"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule New Campaign</span>
          </Link>

          <button
            onClick={fetchScheduled}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Cron Info Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#FC5C03] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Background Queue Worker</span>
          </span>
          <h3 className="text-base font-bold text-white">Cron Endpoint: <code>/api/cron/email-queue</code></h3>
          <p className="text-xs text-slate-300">
            Executes every 2-5 minutes on Hostinger or external cron to trigger due campaigns and process queued batches.
          </p>
        </div>

        <button
          onClick={async () => {
            showToast("Triggering queue worker check...", "info");
            try {
              const res = await fetch("/api/admin/email-marketing/queue/process", { method: "POST" });
              const d = await res.json();
              if (res.ok && d.success) {
                showToast(d.message || "Queue processed!", "success");
                fetchScheduled();
              } else {
                showToast(d.error || "Queue check completed", "info");
              }
            } catch {
              showToast("Queue check error", "error");
            }
          }}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          ⚡ Run Queue Check Now
        </button>
      </div>

      {/* Scheduled Campaigns List */}
      <div className="space-y-4">
        {campaigns.length > 0 ? (
          campaigns.map((c) => {
            const schedDate = new Date(c.scheduledAt);
            const isDue = schedDate.getTime() <= Date.now();

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase bg-purple-100 text-purple-800">
                      SCHEDULED
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">
                      Audience: {c.audienceType}
                    </span>
                    {isDue && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold animate-pulse">
                        ⏳ Due for Dispatch
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{c.name}</h3>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span><strong>Subject:</strong> {c.subject}</span>
                    <span><strong>Sender:</strong> {c.senderName} &lt;{c.fromEmail}&gt;</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  {/* Schedule Time Badge */}
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Execution Target</span>
                    <span className="text-xs font-black text-slate-900 font-mono block">
                      📅 {schedDate.toLocaleDateString()} at {schedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBroadcastingId(c.id)}
                      className="px-3.5 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Now</span>
                    </button>

                    <Link
                      href={`/admin/email-marketing/campaigns/${c.id}/edit`}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Edit Schedule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Cancel Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3 shadow-2xs">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-black text-slate-800 text-base">No Scheduled Campaigns</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Plan marketing emails in advance. When creating a campaign, select &apos;Schedule for Later&apos; to queue it up.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/email-marketing/campaigns/new"
                className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl inline-block"
              >
                + Schedule a Campaign
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM BROADCAST MODAL */}
      <ConfirmModal
        isOpen={Boolean(broadcastingId)}
        onClose={() => setBroadcastingId(null)}
        onConfirm={handleBroadcastNow}
        title="Immediate Dispatch Confirmation"
        message="Trigger this scheduled campaign immediately without waiting for the scheduled target time?"
        confirmText="Confirm & Broadcast Now"
        cancelText="Cancel"
        variant="primary"
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Cancel Scheduled Broadcast"
        message="Are you sure you want to cancel and delete this scheduled campaign?"
        confirmText="Delete"
        cancelText="Keep"
        variant="danger"
      />

    </div>
  );
}