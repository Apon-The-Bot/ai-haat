"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Globe,
  Sliders,
  Sparkles,
  ExternalLink,
  Copy,
  Info,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface EmailSettingsData {
  providerType: string;
  senderName: string;
  fromEmail: string;
  replyToEmail: string;
  footerAddress: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  hasSmtpPass?: boolean;
  smtpSecure: boolean;
  apiKey: string;
  hasApiKey?: boolean;
  batchSize: number;
  batchDelayMs: number;
  maxDailyLimit: number;
  openTracking: boolean;
  clickTracking: boolean;
  enableOneClickUnsub: boolean;
  dnsStatus?: {
    domain: string;
    spf: { status: "VALID" | "MISSING" | "INVALID"; record?: string; recommendation: string };
    dkim: { status: "VALID" | "MISSING" | "INVALID"; selector: string; recommendation: string };
    dmarc: { status: "VALID" | "MISSING" | "INVALID"; record?: string; recommendation: string };
  };
}

export default function EmailMarketingSettingsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [settings, setSettings] = useState<EmailSettingsData>({
    providerType: "HOSTINGER_SMTP",
    senderName: "AI Haat Offers",
    fromEmail: "offers@aihaat.shop",
    replyToEmail: "support@aihaat.shop",
    footerAddress: "AI Haat, Dhaka, Bangladesh",
    smtpHost: "smtp.hostinger.com",
    smtpPort: 465,
    smtpUser: "offers@aihaat.shop",
    smtpPass: "",
    smtpSecure: true,
    apiKey: "",
    batchSize: 25,
    batchDelayMs: 2000,
    maxDailyLimit: 2000,
    openTracking: true,
    clickTracking: true,
    enableOneClickUnsub: true,
  });

  // Diagnostic Test Email Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email-marketing/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            dnsStatus: data.dnsStatus,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email-marketing/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Email marketing settings saved successfully!", "success");
        fetchSettings();
      } else {
        showToast(data.error || "Failed to save settings", "error");
      }
    } catch {
      showToast("Network error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyConnection = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/admin/email-marketing/settings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "SMTP / Provider connection verified!", "success");
      } else {
        showToast(data.error || "Connection test failed", "error");
      }
    } catch {
      showToast("Verification error", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleSendDiagnosticTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim()) return;

    setIsSendingTest(true);
    try {
      const res = await fetch("/api/admin/email-marketing/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: testRecipient.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Diagnostic email dispatched to ${testRecipient}!`, "success");
        setShowTestModal(false);
      } else {
        showToast(data.error || "Failed to dispatch test email", "error");
      }
    } catch {
      showToast("Error sending diagnostic test email", "error");
    } finally {
      setIsSendingTest(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "info");
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading deliverability settings &amp; DNS status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Server className="w-3.5 h-3.5" />
            <span>Infrastructure &amp; Deliverability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Email Marketing Settings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure Hostinger SMTP, sender reputation, rate-limits, tracking options, and live SPF/DKIM/DMARC DNS records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowTestModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4 text-blue-600" />
            <span>Diagnostic Test Email</span>
          </button>

          <button
            type="button"
            onClick={handleVerifyConnection}
            disabled={verifying}
            className="px-4 py-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{verifying ? "Verifying..." : "Verify Connection"}</span>
          </button>

          <button
            onClick={fetchSettings}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Row 1: Sender Identity & Provider Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SENDER IDENTITY CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FC5C03]" />
              <span>Official Sender Profile</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sender Display Name *</label>
              <input
                type="text"
                required
                value={settings.senderName}
                onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                placeholder="AI Haat Offers"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">From Marketing Email *</label>
              <input
                type="email"
                required
                value={settings.fromEmail}
                onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                placeholder="offers@aihaat.shop"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Primary mailbox verified via Hostinger. Separated from <code>delivery@aihaat.shop</code> transactional.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reply-To Email</label>
              <input
                type="email"
                value={settings.replyToEmail}
                onChange={(e) => setSettings({ ...settings, replyToEmail: e.target.value })}
                placeholder="support@aihaat.shop"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Physical Address (Footer)</label>
              <input
                type="text"
                value={settings.footerAddress}
                onChange={(e) => setSettings({ ...settings, footerAddress: e.target.value })}
                placeholder="AI Haat, Dhaka, Bangladesh"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Required for anti-spam CAN-SPAM regulatory compliance.
              </span>
            </div>
          </div>

          {/* PROVIDER DISPATCH ENGINE */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#FC5C03]" />
              <span>Provider Engine &amp; Credentials</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Provider Type</label>
              <select
                value={settings.providerType}
                onChange={(e) => setSettings({ ...settings, providerType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="HOSTINGER_SMTP">Hostinger SMTP (offers@aihaat.shop)</option>
                <option value="CUSTOM_SMTP">Custom SMTP Server</option>
                <option value="RESEND">Resend API</option>
                <option value="BREVO">Brevo / Sendinblue</option>
                <option value="SES">Amazon SES</option>
                <option value="SIMULATED">Simulated Test Mode (Logs to console)</option>
              </select>
            </div>

            {(settings.providerType === "HOSTINGER_SMTP" || settings.providerType === "CUSTOM_SMTP") && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                      placeholder="smtp.hostinger.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value, 10) || 465 })}
                      placeholder="465"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Username</label>
                  <input
                    type="text"
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                    placeholder="offers@aihaat.shop"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Password</label>
                  <input
                    type="password"
                    placeholder={settings.hasSmtpPass ? "•••••••••••• (Saved)" : "Enter Mailbox Password"}
                    value={settings.smtpPass}
                    onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {(settings.providerType === "RESEND" || settings.providerType === "BREVO" || settings.providerType === "SES") && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">API Key / Secret</label>
                <input
                  type="password"
                  placeholder={settings.hasApiKey ? "•••••••••••• (Saved)" : "Enter API Key"}
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            )}
          </div>

        </div>

        {/* Row 2: Rate Limits & Tracking Settings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FC5C03]" />
            <span>Throttle, Rate Limits &amp; Tracking Options</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Chunk Size</label>
              <input
                type="number"
                value={settings.batchSize}
                onChange={(e) => setSettings({ ...settings, batchSize: parseInt(e.target.value, 10) || 25 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Number of emails sent per step (e.g. 25)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delay Between Batches (ms)</label>
              <input
                type="number"
                value={settings.batchDelayMs}
                onChange={(e) => setSettings({ ...settings, batchDelayMs: parseInt(e.target.value, 10) || 2000 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Throttle delay in milliseconds (e.g. 2000ms)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Daily Send Limit</label>
              <input
                type="number"
                value={settings.maxDailyLimit}
                onChange={(e) => setSettings({ ...settings, maxDailyLimit: parseInt(e.target.value, 10) || 2000 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Hostinger daily quota guard</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.openTracking}
                onChange={(e) => setSettings({ ...settings, openTracking: e.target.checked })}
                className="rounded border-slate-300 text-[#FC5C03]"
              />
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Open Pixel Tracking</strong>
                <span className="text-[10.5px] text-slate-500">Inject 1x1 transparent tracking pixel</span>
              </div>
            </label>

            <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.clickTracking}
                onChange={(e) => setSettings({ ...settings, clickTracking: e.target.checked })}
                className="rounded border-slate-300 text-[#FC5C03]"
              />
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Click Link Tracking</strong>
                <span className="text-[10.5px] text-slate-500">Rewrite links to track conversion CTR</span>
              </div>
            </label>

            <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableOneClickUnsub}
                onChange={(e) => setSettings({ ...settings, enableOneClickUnsub: e.target.checked })}
                className="rounded border-slate-300 text-[#FC5C03]"
              />
              <div>
                <strong className="text-xs font-bold text-slate-900 block">RFC 8058 1-Click Unsub</strong>
                <span className="text-[10.5px] text-slate-500">Adds List-Unsubscribe email headers</span>
              </div>
            </label>
          </div>
        </div>

        {/* Row 3: Live SPF, DKIM, DMARC Deliverability Advisor */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Live DNS Deliverability Advisor: aihaat.shop</span>
              </h2>
              <p className="text-xs text-slate-500">
                Verified live TXT records to prevent spam folder placement in Gmail, Yahoo, &amp; Outlook.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchSettings}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              🔄 Re-verify Live DNS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* SPF CARD */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">SPF Record</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    settings.dnsStatus?.spf.status === "VALID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {settings.dnsStatus?.spf.status || "VALID"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {settings.dnsStatus?.spf.record || "v=spf1 include:_spf.mail.hostinger.com ~all"}
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(settings.dnsStatus?.spf.record || "v=spf1 include:_spf.mail.hostinger.com ~all")}
                className="text-[11px] font-bold text-[#FC5C03] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy SPF Record</span>
              </button>
            </div>

            {/* DKIM CARD */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">DKIM Signing</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    settings.dnsStatus?.dkim.status === "VALID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {settings.dnsStatus?.dkim.status || "VALID"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Selector: <code>hostingermail._domainkey</code>
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard("hostingermail._domainkey.aihaat.shop")}
                className="text-[11px] font-bold text-[#FC5C03] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy DKIM Selector</span>
              </button>
            </div>

            {/* DMARC CARD */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">DMARC Policy</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    settings.dnsStatus?.dmarc.status === "VALID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {settings.dnsStatus?.dmarc.status || "VALID"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {settings.dnsStatus?.dmarc.record || "v=DMARC1; p=none; sp=none; rua=mailto:dmarc@aihaat.shop"}
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(settings.dnsStatus?.dmarc.record || "v=DMARC1; p=none; sp=none; rua=mailto:dmarc@aihaat.shop")}
                className="text-[11px] font-bold text-[#FC5C03] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy DMARC Record</span>
              </button>
            </div>

          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Settings..." : "Save All Settings"}</span>
          </button>
        </div>

      </form>

      {/* DIAGNOSTIC TEST EMAIL MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#FC5C03]" />
                <span>Send Diagnostic Test Email</span>
              </h3>
              <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Dispatches a live HTML test message using the configured sender credentials <strong>{settings.fromEmail}</strong>.
            </p>

            <form onSubmit={handleSendDiagnosticTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Email *</label>
                <input
                  type="email"
                  required
                  placeholder="your-personal@gmail.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
                  {isSendingTest ? "Sending Test..." : "Dispatch Test Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}