"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Send, Megaphone, MessageSquare, Share2, Phone, Mail, CheckCircle2, XCircle, Zap, ShieldCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface GatewayMethod {
  slug: string;
  name: string;
  display: string;
  logo: string;
  isActive: boolean;
  mobileNumber: string;
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
  const [announcement, setAnnouncement] = useState("Special Launch Offer: Get instant delivery & replacement warranty on all digital subscriptions!");

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
    fetchGateways();
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveGateways();
    showToast("সকল সেটিংস সফলভাবে আপডেট করা হয়েছে!", "success");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            MFS পেমেন্ট গেটওয়ে কনফিগারেশন, রিসিভিং নাম্বার ও কাস্টমার সাপোর্ট সেটিংস।
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSavingGateways}
          className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSavingGateways ? "Saving..." : "Save All Settings"}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* 1. MFS Automated Gateways Control */}
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        gw.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}>
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

        {/* 2. Live Activation & Support Channels (WhatsApp & Messenger) */}
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

        {/* 3. Global Announcement Bar */}
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
