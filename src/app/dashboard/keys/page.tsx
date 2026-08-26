"use client";

import React, { useState } from "react";
import { KeyRound, Copy, Check, ShieldCheck, ExternalLink, Download, FileDown, FolderArchive } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DigitalVaultPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const keys = [
    {
      id: "key-1",
      orderId: "AH-89190",
      productName: "CapCut Pro PC & Mobile (VIP Auto Captions)",
      accountType: "VIP APK & PC Setup",
      credentials: "License Key: CAPCUT-VIP-2026-X99Q-AH\nActivation Code: VIP-UNLIMITED-ACCESS\nDevice Limit: 1 PC / Mobile",
      portalUrl: "https://capcut.com",
      downloadUrl: "https://drive.google.com/uc?id=capcut-pro-v5-apk-setup",
      fileName: "CapCut_Pro_v5.4_VIP_Setup.apk (128 MB)",
      instructions: "Download the VIP APK or PC setup file from the attachment box below, install it on your device, and activate using the license key.",
      validUntil: "Dec 31, 2026",
      deliveredAt: "Aug 26, 2026 14:30",
    },
    {
      id: "key-2",
      orderId: "AH-89211",
      productName: "ChatGPT Plus (GPT-4o Access)",
      accountType: "Shared Profile #4",
      credentials: "Email: user12@gptaccess.net\nPassword: SmartGpt2026!\nProfile PIN: 4092",
      portalUrl: "https://chatgpt.com",
      downloadUrl: "https://drive.google.com/uc?id=chatgpt-windows-mac-desktop-app",
      fileName: "ChatGPT_Official_Desktop_App.exe (84 MB)",
      instructions: "Login to ChatGPT using the credentials above. Select Profile #4 and enter PIN 4092. Do not change email or settings.",
      validUntil: "Sep 25, 2026",
      deliveredAt: "Aug 25, 2026 14:15",
    },
    {
      id: "key-3",
      orderId: "AH-89204",
      productName: "Canva Pro (1 Year Activation)",
      accountType: "Personal Email Brand Invite",
      credentials: "https://canva.com/brand/join?token=AH-PRO-2026-CANVA-INVITE-882K",
      portalUrl: "https://canva.com",
      downloadUrl: null,
      fileName: null,
      instructions: "Click the invite link above, log in to your personal Canva account, and click 'Join Team'.",
      validUntil: "Aug 20, 2027",
      deliveredAt: "Aug 20, 2026 11:35",
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isBn ? "সুরক্ষিত ডিজিটাল ভল্ট" : "Secure Digital Vault"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D26]">
            {isBn ? "ডিজিটাল ভল্ট ও লাইসেন্স কি" : "Digital Vault & License Keys"}
          </h1>
          <p className="text-sm text-[#7A8190] mt-0.5">
            {isBn
              ? "আপনার ক্রয়কৃত প্রোডাক্টের ইউজারনেম, পাসওয়ার্ড, লাইসেন্স কি ও APK ডাউনলোড প্যাকেজ।"
              : "Secure credentials, license keys, and direct file download attachments for all purchased products."}
          </p>
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-5">
        {keys.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-7 shadow-xs space-y-5 hover:border-[#FC5C03]/30 transition-all"
          >
            {/* Top Product Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-mono text-[#7A8190] block">Order #{item.orderId}</span>
                <h3 className="text-base sm:text-lg font-black text-[#1A1D26] mt-0.5">{item.productName}</h3>
                <span className="inline-block mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {item.accountType}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-500 block">
                  {isBn ? "মেয়াদ:" : "Valid Until:"} <b>{item.validUntil}</b>
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  {isBn ? "ডেলিভারি:" : "Delivered:"} {item.deliveredAt}
                </span>
              </div>
            </div>

            {/* Credentials Vault Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1D26]">
                <span>{isBn ? "ক্রেডেনশিয়াল / লাইসেন্স কি:" : "Credentials & License Key:"}</span>
                <button
                  onClick={() => handleCopy(item.id, item.credentials)}
                  className="px-3.5 py-1.5 bg-[#FFF2E8] hover:bg-[#FC5C03] text-[#FC5C03] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{isBn ? "কপি হয়েছে!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBn ? "কপি করুন" : "Copy"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-[#0F172A] rounded-xl text-emerald-400 font-mono text-sm whitespace-pre-wrap select-all leading-relaxed border border-slate-800 shadow-inner">
                {item.credentials}
              </div>
            </div>

            {/* PROMINENT ATTACHMENT / APK DOWNLOAD CARD */}
            {item.downloadUrl && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                      {isBn ? "সংযুক্ত ফাইল / APK প্যাকেজ" : "Attached File / APK Package"}
                    </span>
                    <h4 className="text-sm font-bold text-blue-950 mt-0.5">
                      {item.fileName || "Download Setup Package (.apk / .exe)"}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>{isBn ? "ডাউনলোড ফাইল" : "Download File"}</span>
                  </a>

                  <button
                    onClick={() => handleCopy(`dl-${item.id}`, item.downloadUrl!)}
                    className="p-2 bg-white hover:bg-blue-100/50 text-blue-700 border border-blue-200 rounded-xl transition-all cursor-pointer"
                    title="Copy Download Link"
                  >
                    {copiedId === `dl-${item.id}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Usage Instructions */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-800 block">
                {isBn ? "ব্যবহার নির্দেশিকা:" : "Usage Instructions:"}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.instructions}
              </p>
            </div>

            {/* Portal Link */}
            {item.portalUrl && (
              <div className="pt-1 flex justify-end">
                <a
                  href={item.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FC5C03] hover:underline"
                >
                  <span>{isBn ? "সার্ভিস পোর্টালে যান" : "Open Service Portal"}</span>
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
