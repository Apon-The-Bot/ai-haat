"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Send,
  Megaphone,
  MessageSquare,
  Share2,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Bot,
  Bell,
  Check,
  ExternalLink,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface GatewayMethod {
  slug: string;
  name: string;
  display: string;
  logo: string;
  isActive: boolean;
  mobileNumber: string;
}

interface TelegramConfig {
  botToken: string;
  chatId: string;
  isEnabled: boolean;
  notifyOnOrder: boolean;
  notifyOnWallet: boolean;
}

export default function AdminSettingsPage() {
  const { showToast } = useToast();

  // MFS Gateways state
  const [gateways, setGateways] = useState<GatewayMethod[]>([
    {
      slug: "bkash-personal",
      name: "bKash Personal",
      display: "bKash",
      logo: "https://aihaat.shop/images/payments/bkash.png",
      isActive: true,
      mobileNumber: "01712345678",
    },
    {
      slug: "nagad-personal",
      name: "Nagad Personal",
      display: "Nagad",
      logo: "https://aihaat.shop/images/payments/nagad.png",
      isActive: true,
      mobileNumber: "01712345678",
    },
    {
      slug: "rocket-personal",
      name: "Rocket Personal",
      display: "Rocket",
      logo: "https://aihaat.shop/images/payments/rocket.png",
      isActive: true,
      mobileNumber: "01712345678",
    },
    {
      slug: "upay-personal",
      name: "Upay Personal",
      display: "Upay",
      logo: "https://aihaat.shop/images/payments/upay.png",
      isActive: true,
      mobileNumber: "01712345678",
    },
  ]);
  const [isLoadingGateways, setIsLoadingGateways] = useState(false);
  const [isSavingGateways, setIsSavingGateways] = useState(false);

  // Live Activation Contact Channels (WhatsApp & Messenger)
  const [whatsappNumber, setWhatsappNumber] = useState("01712345678");
  const [messengerUrl, setMessengerUrl] = useState("https://m.me/aihaat.shop");

  // Hostinger Business Email
  const [businessEmail, setBusinessEmail] = useState("delivery@aihaat.shop");

  // Announcement
  const [announcement, setAnnouncement] = useState(
    "Special Launch Offer: Get instant delivery & replacement warranty on all digital subscriptions!"
  );

  // Telegram Bot Settings
  const [telegram, setTelegram] = useState<TelegramConfig>({
    botToken: "",
    chatId: "",
    isEnabled: true,
    notifyOnOrder: true,
    notifyOnWallet: true,
  });
  const [isLoadingTelegram, setIsLoadingTelegram] = useState(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  useEffect(() => {
    const fetchGateways = async () => {
      try {
        setIsLoadingGateways(true);
        const res = await fetch("/api/admin/gateways");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.methods)) {
            setGateways(data.methods);
          }
        }
      } catch (err) {
        console.error("Fetch gateways error:", err);
      } finally {
        setIsLoadingGateways(false);
      }
    };

    const fetchTelegram = async () => {
      try {
        setIsLoadingTelegram(true);
        const res = await fetch("/api/admin/settings/telegram");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setTelegram(data.settings);
          }
        }
      } catch (err) {
        console.error("Fetch telegram settings error:", err);
      } finally {
        setIsLoadingTelegram(false);
      }
    };

    fetchGateways();
    fetchTelegram();
  }, []);

  const handleToggleGateway = (slug: string) => {
    setGateways((prev) =>
      prev.map((g) => (g.slug === slug ? { ...g, isActive: !g.isActive } : g))
    );
  };

  const handleMobileNumberChange = (slug: string, value: string) => {
    setGateways((prev) =>
      prev.map((g) => (g.slug === slug ? { ...g, mobileNumber: value } : g))
    );
  };

  const handleSaveGateways = async () => {
    try {
      setIsSavingGateways(true);
      const res = await fetch("/api/admin/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methods: gateways }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("গেটওয়ে সেটিংস সফলভাবে সেভ করা হয়েছে!", "success");
      } else {
        showToast(data.message || "গেটওয়ে সেভ করতে সমস্যা হয়েছে", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("সার্ভার এরর", "error");
    } finally {
      setIsSavingGateways(false);
    }
  };

  const handleSaveTelegram = async () => {
    try {
      setIsSavingTelegram(true);
      const res = await fetch("/api/admin/settings/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegram),
      });
      const data = await res.json();
      if (data.success) {
        showToast("টেলিগ্রাম বট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!", "success");
      } else {
        showToast(data.error || "টেলিগ্রাম সেটিংস সংরক্ষণ করা যায়নি", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("টেলিগ্রাম সেটিংস সেভ করতে সমস্যা হয়েছে", "error");
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegram.botToken.trim() || !telegram.chatId.trim()) {
      showToast("দয়া করে Bot Token এবং Chat ID উভয় ফিল্ড পূরণ করুন।", "error");
      return;
    }

    try {
      setIsTestingTelegram(true);
      const res = await fetch("/api/admin/settings/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: telegram.botToken,
          chatId: telegram.chatId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ টেলিগ্রাম টেস্ট মেসেজ সফলভাবে পাঠানো হয়েছে! টেলিগ্রাম চেক করুন।", "success");
      } else {
        showToast(`❌ সংযোগ ব্যর্থ: ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast("টেলিগ্রাম টেস্ট করতে ব্যর্থ হয়েছে।", "error");
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveGateways();
    await handleSaveTelegram();
    showToast("সকল সেটিংস সফলভাবে আপডেট করা হয়েছে!", "success");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            টেলিগ্রাম নোটিফিকেশন বট, MFS পেমেন্ট গেটওয়ে, রিসিভিং নাম্বার ও কাস্টমার সাপোর্ট কনফিগারেশন।
          </p>
        </div>

        <button
          onClick={handleSaveAllSettings}
          disabled={isSavingGateways || isSavingTelegram}
          className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSavingGateways || isSavingTelegram ? "Saving..." : "Save All Settings"}</span>
        </button>
      </div>

      <form onSubmit={handleSaveAllSettings} className="space-y-6">
        {/* 1. Telegram Bot Real-time Order Notification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-2xs">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0088cc] flex items-center justify-center shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Telegram Real-time Order Alert Bot
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      telegram.isEnabled
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {telegram.isEnabled ? "ACTIVE & CONNECTED" : "DISABLED"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  নতুন অর্ডার বা ওয়ালেট রিচার্জ হওয়ামাত্রই টেলিগ্রাম গ্রুপ বা প্রাইভেট বটে সম্পূর্ণ অর্ডারের তথ্য চলে যাবে।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={isTestingTelegram || !telegram.botToken}
                className="px-4 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0088cc] disabled:opacity-50 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {isTestingTelegram ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveTelegram}
                disabled={isSavingTelegram}
                className="px-4 py-2 bg-[#1A1D26] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                {isSavingTelegram ? "Saving..." : "Save Bot Settings"}
              </button>
            </div>
          </div>

          {/* Toggle Switches & Config Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Telegram Bot Token (HTTP API) *</span>
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#0088cc] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Get from @BotFather</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="text"
                  value={telegram.botToken}
                  onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                  placeholder="e.g. 7482910382:AAH92vU8_y92kdExampleToken..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-[#0088cc] focus:bg-white focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  টেলিগ্রাম @BotFather এ /newbot কমান্ড দিয়ে আপনার বটের টোকেনটি এখানে পেস্ট করুন।
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Telegram Chat ID / Group ID *</span>
                  <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#0088cc] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Find ID via @userinfobot</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="text"
                  value={telegram.chatId}
                  onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                  placeholder="e.g. 123456789 (User ID) or -1001234567890 (Group/Channel ID)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-[#0088cc] focus:bg-white focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  গ্রুপ বা চ্যানেলে নোটিফিকেশন পেতে চাইলে বটকে গ্রুপে অ্যাড করে গ্রুপের Chat ID দিন।
                </span>
              </div>
            </div>

            {/* Notification triggers & Helper */}
            <div className="space-y-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Notification Preferences
              </h4>

              <div className="space-y-3">
                {/* Main enable switch */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Bot className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Enable Telegram Bot Alerts</p>
                      <p className="text-[10px] text-slate-500">Master switch for Telegram integration</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={telegram.isEnabled}
                    onChange={(e) => setTelegram({ ...telegram, isEnabled: e.target.checked })}
                    className="w-4 h-4 text-[#0088cc] rounded-md focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* New Order Switch */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-[#FC5C03]" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Instant Order Alerts</p>
                      <p className="text-[10px] text-slate-500">নতুন অর্ডার প্লেস হলে সাথে সাথে নোটিফিকেশন যাবে</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={telegram.notifyOnOrder}
                    onChange={(e) => setTelegram({ ...telegram, notifyOnOrder: e.target.checked })}
                    className="w-4 h-4 text-[#FC5C03] rounded-md focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Wallet Switch */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Wallet Top-up Alerts</p>
                      <p className="text-[10px] text-slate-500">গ্রাহক ওয়ালেট রিচার্জ বা পার্চেজ করলে নোটিফিকেশন যাবে</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={telegram.notifyOnWallet}
                    onChange={(e) => setTelegram({ ...telegram, notifyOnWallet: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[#0088cc] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">টেলিগ্রাম বট সেটআপ করার সহজ নিয়ম (১ মিনিটে):</p>
              <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-slate-600">
                <li>টেলিগ্রামে <b>@BotFather</b> লিখে সার্চ দিয়ে <code>/newbot</code> লিখে একটি নাম ও ইউজারনেম দিন।</li>
                <li>BotFather আপনাকে একটি <b>HTTP API Token</b> দেবে, সেটি কপি করে উপরের বক্সে পেস্ট করুন।</li>
                <li>আপনার তৈরি করা বটের চ্যাটে গিয়ে <b>/start</b> চাপুন (অথবা আপনার এডমিন গ্রুপে বটটিকে এডমিন হিসেবে যুক্ত করুন)।</li>
                <li><b>@userinfobot</b> বা <b>@getmyid_bot</b> থেকে আপনার Chat ID নিয়ে এখানে বসিয়ে <b>Test Connection</b> এ চাপ দিন।</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 2. MFS Automated Gateways Control */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-2xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  MFS Payment Gateways (PipraPay Automated)
                </h3>
                <p className="text-xs text-slate-500">
                  যে যে মেথড ON থাকবে শুধু সেগুলোর লোগো ও বক্স পেমেন্ট পেজে শো করবে।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveGateways}
              disabled={isSavingGateways}
              className="px-4 py-1.5 bg-[#1A1D26] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isSavingGateways ? "Updating..." : "Save Gateways"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gateways.map((gw) => (
              <div
                key={gw.slug}
                className={`p-4 rounded-xl border-2 transition-all ${
                  gw.isActive
                    ? "border-emerald-500/40 bg-emerald-50/20 shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 opacity-75"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gw.logo} alt={gw.display} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{gw.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          gw.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {gw.isActive ? "ACTIVE & LIVE" : "DISABLED"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleGateway(gw.slug)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      gw.isActive ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        gw.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receiving Mobile Number ({gw.display})
                  </label>
                  <input
                    type="text"
                    value={gw.mobileNumber}
                    onChange={(e) => handleMobileNumberChange(gw.slug, e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    কাস্টমার পেমেন্ট করার সময় এই নম্বরে Send Money করার নির্দেশনা দেখতে পাবে।
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Live Activation & Support Channels (WhatsApp & Messenger) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-2xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Customer Activation & Support Channels
                </h3>
                <p className="text-xs text-slate-500">
                  Customers will be directed to these channels when ordering WhatsApp/Messenger delivery products.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Number *</span>
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Link generated: wa.me/88{whatsappNumber.replace(/[^0-9]/g, "")}
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Facebook Messenger URL *</span>
              </label>
              <input
                type="text"
                value={messengerUrl}
                onChange={(e) => setMessengerUrl(e.target.value)}
                placeholder="https://m.me/aihaat.shop"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Your Facebook Page Messenger link (m.me/username)
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#FC5C03]" />
                <span>Delivery Email Mailbox</span>
              </label>
              <input
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="delivery@aihaat.shop"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Active Hostinger business mailbox
              </span>
            </div>
          </div>
        </div>

        {/* 4. Global Announcement Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            <span>Store Header Announcement</span>
          </h3>

          <textarea
            rows={2}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
          />
        </div>
      </form>
    </div>
  );
}
