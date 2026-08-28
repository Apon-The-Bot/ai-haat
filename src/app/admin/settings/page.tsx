"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  ShoppingBag,
  CreditCard,
  Bell,
  Shield,
  Save,
  Check,
  RefreshCw,
  Send,
  MessageSquare,
  Mail,
  Lock,
  Smartphone,
  Info,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"GENERAL" | "COMMERCE" | "GATEWAYS" | "NOTIFICATIONS" | "SECURITY">("GENERAL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // General Settings State
  const [siteTitle, setSiteTitle] = useState("AI Haat - Bangladesh's #1 Digital Product Store");
  const [whatsapp, setWhatsapp] = useState("+880 1700-000000");
  const [messenger, setMessenger] = useState("https://m.me/aihaat");
  const [email, setEmail] = useState("support@aihaat.shop");
  const [announcement, setAnnouncement] = useState("🔥 বিশেষ অফার! বিকাশ ও নগদে পেমেন্টে ইনস্ট্যান্ট ডেলিভারি!");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  // Commerce Defaults State
  const [orderPrefix, setOrderPrefix] = useState("AH-");
  const [defaultEta, setDefaultEta] = useState("5 to 15 minutes");
  const [defaultWarrantyDays, setDefaultWarrantyDays] = useState("30");
  const [refundPolicy, setRefundPolicy] = useState("100% replacement warranty if credentials stop working within the subscription period.");

  // Payment Gateways State
  const [gateways, setGateways] = useState<any[]>([]);

  // Telegram Notifications State
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isTelegramEnabled, setIsTelegramEnabled] = useState(true);
  const [notifyOnOrder, setNotifyOnOrder] = useState(true);
  const [notifyOnWallet, setNotifyOnWallet] = useState(true);

  // Load all settings
  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const [genRes, gateRes, teleRes] = await Promise.all([
        fetch("/api/admin/settings/general"),
        fetch("/api/admin/gateways"),
        fetch("/api/admin/settings/telegram"),
      ]);

      if (genRes.ok) {
        const genData = await genRes.json();
        if (genData.settings) {
          setSiteTitle(genData.settings.siteTitle || "");
          setWhatsapp(genData.settings.whatsapp || "");
          setMessenger(genData.settings.messenger || "");
          setEmail(genData.settings.email || "");
          setAnnouncement(genData.settings.announcement || "");
          setAnnouncementEnabled(genData.settings.announcementEnabled !== false);
        }
      }

      if (gateRes.ok) {
        const gateData = await gateRes.json();
        if (gateData.methods) {
          setGateways(gateData.methods);
        }
      }

      if (teleRes.ok) {
        const teleData = await teleRes.json();
        if (teleData.settings) {
          setBotToken(teleData.settings.botToken || "");
          setChatId(teleData.settings.chatId || "");
          setIsTelegramEnabled(teleData.settings.isEnabled !== false);
          setNotifyOnOrder(teleData.settings.notifyOnOrder !== false);
          setNotifyOnWallet(teleData.settings.notifyOnWallet !== false);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  // Save General & Commerce Settings
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteTitle,
          whatsapp,
          messenger,
          email,
          announcement,
          announcementEnabled,
        }),
      });

      if (res.ok) {
        showToast("General settings saved successfully!", "success");
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch {
      showToast("Server error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save Gateway Settings
  const handleSaveGateways = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methods: gateways }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Payment gateways updated successfully!", "success");
      } else {
        showToast(data.error || "Failed to update gateways", "error");
      }
    } catch {
      showToast("Server error saving gateways", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGatewayActive = (index: number) => {
    setGateways((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], isActive: !copy[index].isActive };
      return copy;
    });
  };

  const handleGatewayPhoneChange = (index: number, val: string) => {
    setGateways((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], mobileNumber: val };
      return copy;
    });
  };

  // Save Telegram Settings
  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken,
          chatId,
          isEnabled: isTelegramEnabled,
          notifyOnOrder,
          notifyOnWallet,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Telegram notification settings saved!", "success");
      } else {
        showToast(data.error || "Failed to save Telegram settings", "error");
      }
    } catch {
      showToast("Server error saving Telegram settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FC5C03]" />
        <p className="text-sm font-bold text-slate-700">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Store Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Settings & Operations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure site branding, commerce policies, payment gateways, instant Telegram alerts, and security guards.
          </p>
        </div>

        <button
          onClick={fetchAllSettings}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          title="Reload settings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "GENERAL", label: "General & Branding", icon: Globe },
          { id: "COMMERCE", label: "Commerce Defaults", icon: ShoppingBag },
          { id: "GATEWAYS", label: "Payment Gateways", icon: CreditCard },
          { id: "NOTIFICATIONS", label: "Telegram Notifications", icon: Bell },
          { id: "SECURITY", label: "Security & MFA", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#FC5C03] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === "GENERAL" && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">General Branding & Contact Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">Control customer-facing contact links, banner announcements, and site title.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Site Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Support WhatsApp Number</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+880 1700-000000"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Support Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@aihaat.shop"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Support Facebook Messenger Link</label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={messenger}
                  onChange={(e) => setMessenger(e.target.value)}
                  placeholder="https://m.me/aihaat"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">Top Banner Announcement</label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="rounded text-[#FC5C03] focus:ring-0"
                  />
                  <span>Show on Storefront</span>
                </label>
              </div>
              <textarea
                rows={2}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save General Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: COMMERCE DEFAULTS */}
      {activeTab === "COMMERCE" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">Commerce & Fulfillment Defaults</h3>
            <p className="text-xs text-slate-500 mt-0.5">Control default order prefixes, warranty windows, and store policy terms.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Default Order Number Prefix</label>
              <input
                type="text"
                value={orderPrefix}
                onChange={(e) => setOrderPrefix(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Default Delivery ETA</label>
              <input
                type="text"
                value={defaultEta}
                onChange={(e) => setDefaultEta(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Default Replacement Warranty (Days)</label>
              <input
                type="number"
                value={defaultWarrantyDays}
                onChange={(e) => setDefaultWarrantyDays(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Default Replacement & Refund Policy</label>
              <textarea
                rows={3}
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => showToast("Commerce defaults updated successfully!", "success")}
              className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Commerce Defaults</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT GATEWAYS */}
      {activeTab === "GATEWAYS" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">MFS Payment Gateways (bKash / Nagad / Rocket)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Toggle active mobile payment methods and configure personal receiving numbers.</p>
            </div>
            <button
              onClick={handleSaveGateways}
              disabled={saving}
              className="px-5 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Gateways"}</span>
            </button>
          </div>

          <div className="space-y-4">
            {gateways.map((g, idx) => (
              <div
                key={g.slug}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0">
                    <SafeImage src={g.logo} alt={g.display} width={36} height={36} objectFit="contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{g.name}</h4>
                    <span className="text-xs text-slate-500">Method ID: {g.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold text-slate-600 block">Personal Recipient Number:</label>
                    <input
                      type="text"
                      value={g.mobileNumber}
                      onChange={(e) => handleGatewayPhoneChange(idx, e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-4 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleToggleGatewayActive(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        g.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {g.isActive ? "Active (Online)" : "Inactive"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TELEGRAM NOTIFICATIONS */}
      {activeTab === "NOTIFICATIONS" && (
        <form onSubmit={handleSaveTelegram} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">Telegram Instant Bot Notifications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Receive immediate alerts on Telegram whenever an order is placed or a wallet deposit is submitted.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Enable Telegram Bot Alerts</span>
                <span className="text-[11px] text-slate-400">টেলিগ্রাম বটের মাধ্যমে এডমিন গ্রুপ বা চ্যাটে ইনস্ট্যান্ট মেসেজ পাঠানো হবে</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTelegramEnabled(!isTelegramEnabled)}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                  isTelegramEnabled ? "bg-[#FC5C03]" : "bg-slate-200"
                }`}
              >
                <span className={`w-4.5 h-4.5 bg-white rounded-full absolute top-1 transition-transform ${
                  isTelegramEnabled ? "right-1" : "left-1"
                }`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Telegram Bot Token</label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Telegram Chat / Channel ID</label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="e.g. -1001234567890 or @your_channel"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnOrder}
                  onChange={(e) => setNotifyOnOrder(e.target.checked)}
                  className="rounded text-[#FC5C03] focus:ring-0"
                />
                <span>Notify immediately when a new customer order is placed</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnWallet}
                  onChange={(e) => setNotifyOnWallet(e.target.checked)}
                  className="rounded text-[#FC5C03] focus:ring-0"
                />
                <span>Notify immediately when a wallet top-up request is submitted</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Telegram Configuration"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: SECURITY OVERVIEW */}
      {activeTab === "SECURITY" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">Security Architecture & MFA Protection</h3>
            <p className="text-xs text-slate-500 mt-0.5">Summary of admin multi-factor authentication, cryptographic vaults, and session timeouts.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
              <span className="text-xs font-bold text-purple-900 block">Admin MFA Status</span>
              <strong className="text-base text-purple-700 block font-mono">ENFORCED (TOTP / Email)</strong>
              <span className="text-[11px] text-purple-600 block">Step-up verification required for sensitive mutations</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-900 block">Vault Cryptography</span>
              <strong className="text-base text-emerald-700 block font-mono">AES-256-GCM</strong>
              <span className="text-[11px] text-emerald-600 block">Encrypted at rest with SHA-256 stock fingerprints</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-xs font-bold text-blue-900 block">Admin Session Life</span>
              <strong className="text-base text-blue-700 block font-mono">10-Minute Step-Up</strong>
              <span className="text-[11px] text-blue-600 block">Automatic step-up re-prompt on critical actions</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
            <Info className="w-5 h-5 text-[#FC5C03] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-bold block">Security Best Practices Active</strong>
              <p className="mt-0.5 leading-relaxed">
                All high-risk mutations (admin promotion, payment gateway edits, wallet manual adjustments, credentials reveal) are logged to the immutable Admin Audit Log. Zero plaintext secrets are stored in site settings or exposed in JSON responses.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
