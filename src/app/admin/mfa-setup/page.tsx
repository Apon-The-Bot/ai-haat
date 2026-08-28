"use client";

import React, { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ShieldAlert, ShieldCheck, Loader2, Copy, Download, ChevronRight, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminMfaSetupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup state
  const [qrData, setQrData] = useState<{ qrDataUrl: string; manualKey: string } | null>(null);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [savedCodes, setSavedCodes] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      // In admin forced setup, we might skip email OTP if they are already logged in via google, 
      // but assuming the backend `/api/security/totp/setup` action: 'start' supports this or we just call it.
      // Or maybe we still need email OTP? The prompt doesn't specify email OTP for admin setup, 
      // it just says: "Fetch QR from /api/security/totp/setup (action: 'start')"
      const res = await fetch("/api/security/totp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setQrData(data);
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to start setup");
      }
    } catch (e) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(null);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newDigits = [...digits];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) newDigits[i] = pastedData[i];
      }
      setDigits(newDigits);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const verifySetup = async () => {
    const token = digits.join("");
    if (token.length !== 6) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/security/totp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setRecoveryCodes(data.recoveryCodes || []);
        setStep(4);
      } else {
        setError(data.error || "Invalid code");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (e) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    showToast("Copied to clipboard", "success");
  };

  const downloadCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([recoveryCodes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "ai-haat-admin-recovery-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white sm:bg-slate-50 font-sans antialiased">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white sm:rounded-2xl sm:border border-[#E8E8EE] sm:shadow-2xs overflow-hidden">
          
          <div className="p-6 sm:p-8 flex flex-col h-full">
            <div className="flex justify-center mb-8">
              <Logo size="lg" />
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full ${
                    step >= i ? "bg-[#FC5C03]" : "bg-slate-200"
                  }`} 
                />
              ))}
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-600 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="text-center space-y-6 flex-1">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-[#FC5C03]">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-2">Admin Security Setup Required</h1>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    As an admin, you must enable Two-Factor Authentication to access the admin panel. 
                    This ensures the highest level of security for the system.
                  </p>
                </div>
                
                <button
                  onClick={startSetup}
                  disabled={loading}
                  className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {step === 2 && qrData && (
              <div className="text-center space-y-6 flex-1">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Scan QR Code</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Use an authenticator app like Google Authenticator or Authy to scan this code.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrData.qrDataUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1.5">Manual Entry Key</p>
                  <code className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-mono font-bold text-slate-800 break-all">
                    {qrData.manualKey}
                  </code>
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold rounded-xl transition-colors"
                >
                  I've scanned the code
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-6 flex-1">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Verify Code</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Enter the 6-digit code generated by your app.
                  </p>
                </div>

                <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={handleDigitPaste}
                      disabled={loading}
                      className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border-2 border-slate-200 focus:border-[#FC5C03] bg-white outline-none transition-colors"
                    />
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={verifySetup}
                    disabled={loading || digits.join("").length !== 6}
                    className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Continue"}
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-3 py-2 text-slate-500 font-semibold text-sm"
                  >
                    Back to QR Code
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-6 flex-1">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 mb-2">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Save Recovery Codes</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    These codes are the ONLY way to access your account if you lose your device. Save them somewhere safe.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {recoveryCodes.map((code) => (
                    <code key={code} className="text-sm font-mono text-center font-bold text-slate-800">
                      {code}
                    </code>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={copyCodes} className="flex-1 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 text-slate-700">
                    <Copy className="w-4 h-4" /> Copy All
                  </button>
                  <button onClick={downloadCodes} className="flex-1 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 text-slate-700">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>

                <div className="pt-2 space-y-4">
                  <label className="flex items-center justify-center gap-3 cursor-pointer group text-left px-2">
                    <input
                      type="checkbox"
                      checked={savedCodes}
                      onChange={(e) => setSavedCodes(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#FC5C03] focus:ring-[#FC5C03]"
                    />
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      I have saved these codes in a safe place
                    </span>
                  </label>
                  
                  <button
                    onClick={() => router.push("/admin")}
                    disabled={!savedCodes}
                    className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Admin Panel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
