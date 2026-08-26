"use client";

import React, { useState } from "react";
import { Settings, Save, Send, ShieldCheck, Check, AlertCircle, Phone, Mail, Megaphone } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminSettingsPage() {
  const { showToast } = useToast();

  // Payment Numbers
  const [bkash, setBkash] = useState("01712-345678");
  const [nagad, setNagad] = useState("01823-456789");
  const [rocket, setRocket] = useState("01934-567890-4");

  // Telegram Settings
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  // Store Contacts & Banner
  const [announcement, setAnnouncement] = useState("🚀 সকল এআই সাবস্ক্রিপশনে পাচ্ছেন ইনস্ট্যান্ট ডেলিভারি ও ফুল রিপ্লেসমেন্ট ওয়ারেন্টি!");
  const [supportPhone, setSupportPhone] = useState("+880 1712-345678");
  const [supportEmail, setSupportEmail] = useState("support@aihaat.com");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!", "success");
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    try {
      showToast("টেস্ট নোটিফিকেশন পাঠানো হয়েছে!", "success");
    } catch {
      showToast("টেলিগ্রাম টেস্ট ব্যর্থ হয়েছে।", "error");
    } finally {
      setIsTestingTelegram(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">সাইট সেটিংস ও কনফিগারেশন (Settings) ⚙️</h1>
          <p className="text-xs text-slate-400">পেমেন্ট নাম্বার, টেলিগ্রাম বট নোটিফিকেশন ও সাইটের নোটিশ নিয়ন্ত্রণ করুন</p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>সেটিংস সেভ করুন (Save)</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Section 1: Payment Numbers */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>💳 বিকাশ, নগদ ও রকেট পেমেন্ট নাম্বার</span>
          </h3>
          <p className="text-xs text-slate-400">
            চেকআউট এবং ওয়ালেট রিচার্জ পেজে কাস্টমারদের এই নাম্বারগুলো প্রদর্শিত হবে।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                বিকাশ (bKash Personal) *
              </label>
              <input
                type="text"
                value={bkash}
                onChange={(e) => setBkash(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-[#FC5C03]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                নগদ (Nagad Personal) *
              </label>
              <input
                type="text"
                value={nagad}
                onChange={(e) => setNagad(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-[#FC5C03]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                রকেট (Rocket Personal) *
              </label>
              <input
                type="text"
                value={rocket}
                onChange={(e) => setRocket(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-[#FC5C03]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Telegram Bot Integration */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              <span>টেলিগ্রাম অর্ডার এলার্ট বট (Telegram Order Alerts)</span>
            </h3>
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={isTestingTelegram}
              className="px-3 py-1 bg-sky-950 hover:bg-sky-900 text-sky-400 text-xs font-bold rounded-lg border border-sky-800/40 transition-colors"
            >
              {isTestingTelegram ? "পাঠানো হচ্ছে..." : "টেস্ট এলার্ট পাঠান"}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            নতুন কোনো অর্ডার বা ওয়ালেট রিচার্জ আসলে আপনার টেলিগ্রাম চ্যানেলে স্বয়ংক্রিয় মেসেজ পাঠাতে নিচের তথ্যগুলো দিন।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Telegram Bot Token (From @BotFather)
              </label>
              <input
                type="password"
                placeholder="7182938192:AAH9X_kXxxxxxx..."
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-[#FC5C03]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Telegram Chat ID / Channel ID
              </label>
              <input
                type="text"
                placeholder="যেমন: -1001928374829 বা 5829102"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-[#FC5C03]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Announcement & Contacts */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>টপ নোটিশ ও কন্টাক্ট ইনফো</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                টপ এনাউন্সমেন্ট বার নোটিশ
              </label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  সাপোর্ট ফোন / হোয়াটসঅ্যাপ
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  সাপোর্ট ইমেইল
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
