"use client";

import React, { useState } from "react";
import { Settings, Save, Send, Megaphone, MessageSquare, Share2, Phone, Mail } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminSettingsPage() {
  const { showToast } = useToast();

  // Payment Numbers
  const [bkash, setBkash] = useState("01712-345678");
  const [nagad, setNagad] = useState("01823-456789");
  const [rocket, setRocket] = useState("01934-567890-4");

  // Live Activation Contact Channels (WhatsApp & Messenger)
  const [whatsappNumber, setWhatsappNumber] = useState("01712345678");
  const [messengerUrl, setMessengerUrl] = useState("https://m.me/aihaat.shop");
  const [telegramUsername, setTelegramUsername] = useState("https://t.me/aihaat_support");

  // Hostinger Business Email
  const [businessEmail, setBusinessEmail] = useState("delivery@aihaat.shop");

  // Announcement
  const [announcement, setAnnouncement] = useState("Special Launch Offer: Get instant delivery & replacement warranty on all digital subscriptions!");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Settings & Contact Channels saved successfully!", "success");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure payment numbers, WhatsApp & Messenger activation channels, and store settings.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* 1. Live Activation & Support Channels (WhatsApp & Messenger) */}
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

        {/* 2. Gateway Numbers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FC5C03]" />
            <span>Official Payment Numbers (Manual Send Money)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                bKash Number (Personal)
              </label>
              <input
                type="text"
                value={bkash}
                onChange={(e) => setBkash(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Nagad Number (Personal / Merchant)
              </label>
              <input
                type="text"
                value={nagad}
                onChange={(e) => setNagad(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Rocket Number (Personal)
              </label>
              <input
                type="text"
                value={rocket}
                onChange={(e) => setRocket(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
              />
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
