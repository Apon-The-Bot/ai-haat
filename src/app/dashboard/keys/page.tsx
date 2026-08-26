"use client";

import React, { useState } from "react";
import { KeyRound, Copy, Check, ShieldCheck, ExternalLink, HelpCircle, AlertCircle } from "lucide-react";

export default function DigitalVaultPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const keys = [
    {
      id: "key-1",
      orderId: "AH-89211",
      productName: "ChatGPT Plus (GPT-4o Access)",
      accountType: "Shared Profile #4",
      credentials: "Email: user12@gptaccess.net\nPassword: SmartGpt2026!\nProfile PIN: 4092",
      portalUrl: "https://chatgpt.com",
      instructions: "চ্যাটজিপিটি লগইন পেজে গিয়ে উপরের ইমেইল ও পাসওয়ার্ড দিন। এরপর প্রোফাইল #4 সিলেক্ট করে PIN 4092 চাপুন। পাসওয়ার্ড বা সেটিংসে কোনো পরিবর্তন করবেন না।",
      validUntil: "2026-09-25",
      deliveredAt: "2026-08-25 14:15",
    },
    {
      id: "key-2",
      orderId: "AH-89204",
      productName: "Canva Pro - 1 Year Activation",
      accountType: "Personal Email Brand Invite",
      credentials: "https://canva.com/brand/join?token=AH-PRO-2026-CANVA-INVITE-882K",
      portalUrl: "https://canva.com",
      instructions: "উপরের ইনভাইট লিংকে ক্লিক করে আপনার নিজের ক্যানভা অ্যাকাউন্টে লগইন করুন এবং 'Join Team' চাপুন। সাথে সাথে আপনার অ্যাকাউন্ট প্রো হয়ে যাবে।",
      validUntil: "2027-08-20",
      deliveredAt: "2026-08-20 11:35",
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-3 h-3" />
            <span>নিরাপদ ডিজিটাল ভল্ট</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-[#1A1D26]">ডিজিটাল ভল্ট (My License Keys)</h1>
          <p className="text-xs text-[#7A8190]">আপনার কেনা সমস্ত অ্যাকাউন্টের ইউজারনেম, পাসওয়ার্ড ও লাইসেন্স কি এখানে সংরক্ষিত আছে।</p>
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {keys.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4 hover:border-emerald-500/40 transition-all"
          >
            {/* Top Product Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono text-[#7A8190] block">Order #{item.orderId}</span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1A1D26]">{item.productName}</h3>
                <span className="inline-block mt-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {item.accountType}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-gray-500 block">মেয়াদ: <b>{item.validUntil}</b> পর্যন্ত</span>
                <span className="text-[10px] text-gray-400">ডেলিভারি: {item.deliveredAt}</span>
              </div>
            </div>

            {/* Credentials Vault Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1D26]">
                <span>ক্রেডেনশিয়াল / লাইসেন্স কি:</span>
                <button
                  onClick={() => handleCopy(item.id, item.credentials)}
                  className="px-3 py-1 bg-[#FFF2E8] hover:bg-[#FC5C03] text-[#FC5C03] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 bg-[#1A1D26] rounded-xl text-emerald-400 font-mono text-xs whitespace-pre-wrap select-all leading-relaxed border border-gray-800">
                {item.credentials}
              </div>
            </div>

            {/* Instructions */}
            {item.instructions && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>ব্যবহারের নিয়মাবলী:</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-amber-800">{item.instructions}</p>
              </div>
            )}

            {/* Direct Login CTA */}
            {item.portalUrl && (
              <div className="pt-1 flex justify-end">
                <a
                  href={item.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FC5C03] hover:underline"
                >
                  <span>লগইন পোর্টালে যান ({item.portalUrl})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
