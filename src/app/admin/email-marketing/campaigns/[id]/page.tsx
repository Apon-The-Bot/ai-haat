"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Radio,
  ArrowLeft,
  RefreshCw,
  Send,
  CheckCircle2,
  Eye,
  MousePointer,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  ShieldBan,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

interface CampaignDetail {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  senderName: string;
  fromEmail: string;
  replyToEmail: string | null;
  contentHtml: string;
  audienceType: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  failedCount: number;
  unsubscribedCount: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  recipients: Array<{
    id: string;
    email: string;
    name: string | null;
    status: string;
    sentAt: string | null;
    deliveredAt: string | null;
    openedAt: string | null;
    clickedAt: string | null;
    errorMessage: string | null;
  }>;
}

export default function CampaignAnalyticsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const campaignId = (params?.id as string) || "";

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientFilter, setRecipientFilter] = useState("ALL");
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Modals
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchCampaign = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.campaign) setCampaign(data.campaign);
      } else {
        showToast("Campaign not found", "error");
      }
    } catch {
      showToast("Error fetching campaign details", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [campaignId, showToast]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  // Live refresh while SENDING
  useEffect(() => {
    if (campaign?.status === "SENDING") {
      const interval = setInterval(() => {
        fetchCampaign(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, fetchCampaign]);

  const handleSendBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      const res = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}/send`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Broadcast started!", "success");
        fetchCampaign();
      } else {
        showToast(data.error || "Failed to trigger broadcast", "error");
      }
    } catch {
      showToast("Broadcast dispatch error", "error");
    } finally {
      setIsBroadcasting(false);
      setShowSendModal(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;
    setIsSendingTest(true);
    try {
      const res = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: testEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Test email sent!", "success");
        setShowTestModal(false);
      } else {
        showToast(data.error || "Failed to send test email", "error");
      }
    } catch {
      showToast("Error sending test email", "error");
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Campaign deleted.", "success");
        router.push("/admin/email-marketing/campaigns");
      } else {
        showToast("Failed to delete campaign", "error");
      }
    } catch {
      showToast("Error deleting campaign", "error");
    }
  };

  if (loading && !campaign) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading campaign report...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm font-bold text-slate-700">Campaign not found.</p>
        <Link
          href="/admin/email-marketing/campaigns"
          className="px-4 py-2 bg-[#FC5C03] text-white text-xs font-bold rounded-xl"
        >
          ← Return to Campaigns
        </Link>
      </div>
    );
  }

  const deliveryRate = campaign.sentCount > 0
    ? Math.min(100, Math.round(((campaign.sentCount - campaign.failedCount) / campaign.sentCount) * 100))
    : 100;
  const openRate = campaign.sentCount > 0 ? Math.round((campaign.openedCount / campaign.sentCount) * 100) : 0;
  const clickRate = campaign.openedCount > 0 ? Math.round((campaign.clickedCount / campaign.openedCount) * 100) : 0;

  const filteredRecipients = campaign.recipients?.filter((r) => {
    const matchesSearch =
      r.email.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(recipientSearch.toLowerCase()));
    const matchesFilter = recipientFilter === "ALL" || r.status === recipientFilter;
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/email-marketing/campaigns"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {campaign.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${
                  campaign.status === "SENT"
                    ? "bg-emerald-100 text-emerald-800"
                    : campaign.status === "SENDING"
                    ? "bg-blue-100 text-blue-800 animate-pulse"
                    : campaign.status === "SCHEDULED"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {campaign.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Subject: <strong>{campaign.subject}</strong> • Sender: {campaign.senderName} &lt;{campaign.fromEmail}&gt;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchCampaign()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowTestModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test</span>
          </button>

          {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
            <>
              <Link
                href={`/admin/email-marketing/campaigns/${campaign.id}/edit`}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>

              <button
                onClick={() => setShowSendModal(true)}
                className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Now</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Real-Time KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Queue / Sent */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">Total Dispatched</span>
          <span className="text-2xl font-black text-slate-900 block font-mono">
            {campaign.sentCount}
            {campaign.totalRecipients > 0 && (
              <span className="text-sm text-slate-400 font-normal"> / {campaign.totalRecipients}</span>
            )}
          </span>
          <span className="text-[11px] text-blue-600 font-bold block">
            Audience: {campaign.audienceType}
          </span>
        </div>

        {/* Metric 2: Delivered */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">Delivery Rate</span>
          <span className="text-2xl font-black text-emerald-600 block font-mono">
            {deliveryRate}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            {campaign.deliveredCount || campaign.sentCount} delivered
          </span>
        </div>

        {/* Metric 3: Opens */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">Open Rate</span>
          <span className="text-2xl font-black text-purple-600 block font-mono">
            {openRate}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            {campaign.openedCount} unique opens
          </span>
        </div>

        {/* Metric 4: Clicks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">Click Rate (CTR)</span>
          <span className="text-2xl font-black text-amber-600 block font-mono">
            {clickRate}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            {campaign.clickedCount} link clicks
          </span>
        </div>

        {/* Metric 5: Unsubscribes / Bounces */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">Unsubscribes / Fails</span>
          <span className="text-2xl font-black text-red-600 block font-mono">
            {campaign.unsubscribedCount || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            {campaign.failedCount} dispatch failures
          </span>
        </div>

      </div>

      {/* Engagement Funnel Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Broadcast Delivery &amp; Conversion Funnel
        </h3>
        <div className="w-full bg-slate-100 rounded-2xl h-6 flex overflow-hidden p-1 gap-1">
          <div
            style={{ width: `${Math.max(10, deliveryRate)}%` }}
            className="bg-emerald-500 h-full rounded-xl transition-all"
            title={`Delivered: ${deliveryRate}%`}
          />
          <div
            style={{ width: `${Math.max(5, openRate)}%` }}
            className="bg-purple-500 h-full rounded-xl transition-all"
            title={`Opened: ${openRate}%`}
          />
          <div
            style={{ width: `${Math.max(3, clickRate)}%` }}
            className="bg-amber-500 h-full rounded-xl transition-all"
            title={`Clicked: ${clickRate}%`}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Delivered ({campaign.deliveredCount || campaign.sentCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Opened ({campaign.openedCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Clicked ({campaign.clickedCount})
          </span>
        </div>
      </div>

      {/* HTML Content Toggle / Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <button
          onClick={() => setShowHtmlPreview(!showHtmlPreview)}
          className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FC5C03]" />
            <span>Email Broadcast HTML Content &amp; Design Preview</span>
          </span>
          {showHtmlPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHtmlPreview && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-2xl mx-auto shadow-xs text-xs">
              <div
                dangerouslySetInnerHTML={{
                  __html: campaign.contentHtml || "<p>No content</p>",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recipient Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Recipient Dispatch Logs</h3>
            <p className="text-xs text-slate-500">Live delivery and engagement events for each targeted recipient</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="CLICKED">Clicked</option>
              <option value="OPENED">Opened</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="QUEUED">Queued</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search email..."
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">Sent At</th>
                <th className="py-3 px-4">Opened At</th>
                <th className="py-3 px-4">Clicked At</th>
                <th className="py-3 px-4">Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecipients.length > 0 ? (
                filteredRecipients.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block font-mono">{r.email}</span>
                      {r.name && <span className="text-[10.5px] text-slate-400 block">{r.name}</span>}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === "CLICKED"
                            ? "bg-amber-100 text-amber-800 font-black"
                            : r.status === "OPENED"
                            ? "bg-purple-100 text-purple-800"
                            : r.status === "DELIVERED" || r.status === "SENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {r.sentAt ? new Date(r.sentAt).toLocaleTimeString() : "—"}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {r.openedAt ? (
                        <span className="text-purple-600 font-bold">
                          👁️ {new Date(r.openedAt).toLocaleTimeString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {r.clickedAt ? (
                        <span className="text-emerald-600 font-bold">
                          🖱️ {new Date(r.clickedAt).toLocaleTimeString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {r.errorMessage ? (
                        <span className="text-red-500 font-mono block truncate max-w-xs" title={r.errorMessage}>
                          ⚠️ {r.errorMessage}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold">OK</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No recipient log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM BROADCAST MODAL */}
      <ConfirmModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onConfirm={handleSendBroadcast}
        title="Immediate Broadcast Dispatch"
        message={`Are you ready to broadcast "${campaign.name}" to all resolved recipients now?`}
        confirmText={isBroadcasting ? "Broadcasting..." : "Confirm & Send"}
        cancelText="Cancel"
        variant="primary"
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Campaign Confirmation"
        message="Permanently delete this campaign and all its tracking records?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* TEST EMAIL MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FC5C03]" />
              <span>Send Diagnostic Test Email</span>
            </h3>
            <p className="text-xs text-slate-500">
              Send a test broadcast of <strong>{campaign.name}</strong> to any inbox.
            </p>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@aihaat.shop"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSendingTest ? "Sending..." : "Send Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}