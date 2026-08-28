"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Key, Shield, AlertTriangle, Loader2, Copy, Download, RefreshCw, LogOut } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type SecurityStatus = {
  totpEnabled: boolean;
  remainingRecoveryCodes: number;
  activeSessions: any[];
};

export default function SecurityPage() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup state
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<"otp_request" | "otp_verify" | "qr_scan" | "recovery_codes">("otp_request");
  const [emailOtp, setEmailOtp] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [qrData, setQrData] = useState<{ qrCodeUrl: string; secret: string } | null>(null);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/security/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleStartSetup = () => {
    setSetupStep("otp_request");
    setSetupModalOpen(true);
    requestEmailOtp();
  };

  const requestEmailOtp = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/security/email-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "MFA_SETUP" }),
      });
      if (res.ok) {
        showToast("Verification code sent to your email", "success");
        setSetupStep("otp_verify");
      } else {
        showToast("Failed to send verification code", "error");
        setSetupModalOpen(false);
      }
    } catch (e) {
      showToast("An error occurred", "error");
      setSetupModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyEmailOtpAndStartTotp = async () => {
    if (!emailOtp) return showToast("Enter OTP", "error");
    setIsProcessing(true);
    try {
      // In a real implementation we would pass the OTP to verify, 
      // but assuming `/api/security/totp/setup` action: 'start' might do this or we just call it.
      const res = await fetch("/api/security/totp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", otp: emailOtp }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setQrData(data);
        setSetupStep("qr_scan");
      } else {
        showToast("Verification failed", "error");
      }
    } catch (e) {
      showToast("An error occurred", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyTotpAndFinish = async () => {
    if (!totpCode || totpCode.length !== 6) return showToast("Enter 6-digit code", "error");
    setIsProcessing(true);
    try {
      const res = await fetch("/api/security/totp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token: totpCode }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewRecoveryCodes(data.recoveryCodes || []);
        setSetupStep("recovery_codes");
        fetchStatus();
      } else {
        showToast("Invalid TOTP code", "error");
      }
    } catch (e) {
      showToast("An error occurred", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
    try {
      const res = await fetch("/api/security/totp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      if (res.ok) {
        showToast("2FA Disabled", "success");
        fetchStatus();
      } else {
        showToast("Failed to disable 2FA", "error");
      }
    } catch (e) {
      showToast("An error occurred", "error");
    }
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(newRecoveryCodes.join("\n"));
    showToast("Codes copied to clipboard", "success");
  };

  const downloadCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([newRecoveryCodes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "ai-haat-recovery-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FC5C03]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1D26]">Security Settings</h1>
          <p className="text-sm text-[#4B5563] mt-1">Manage your account security and two-factor authentication.</p>
        </div>
        <ShieldCheck className="w-10 h-10 text-[#FC5C03]" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Two-Factor Auth Section */}
        <div className="bg-white rounded-2xl border border-[#E8E8EE] p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Shield className="w-5 h-5 text-[#FC5C03]" />
            <h2 className="text-lg font-bold text-[#1A1D26]">Two-Factor Authentication (2FA)</h2>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
              status?.totpEnabled ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
            }`}>
              {status?.totpEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="text-sm text-[#4B5563]">
            Protect your account with an additional layer of security. When enabled, you'll need to enter a 6-digit code from your authenticator app when signing in.
          </div>

          <div className="flex gap-3 pt-2">
            {!status?.totpEnabled ? (
              <button
                onClick={handleStartSetup}
                className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl transition-colors"
              >
                Enable 2FA
              </button>
            ) : (
              <>
                <button
                  onClick={handleStartSetup}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1A1D26] text-sm font-bold rounded-xl transition-colors"
                >
                  Reconfigure
                </button>
                <button
                  onClick={handleDisable}
                  className="px-5 py-2.5 border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors"
                >
                  Disable 2FA
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recovery Codes Section */}
        {status?.totpEnabled && (
          <div className="bg-white rounded-2xl border border-[#E8E8EE] p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <Key className="w-5 h-5 text-[#FC5C03]" />
              <h2 className="text-lg font-bold text-[#1A1D26]">Recovery Codes</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">
                  Recovery codes can be used to access your account if you lose access to your authenticator app.
                </p>
                <div className="mt-2 text-sm font-semibold">
                  Remaining codes: <span className="text-[#FC5C03]">{status.remainingRecoveryCodes}</span>
                </div>
              </div>
              <button 
                onClick={handleStartSetup}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1A1D26] text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate Codes
              </button>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-xl flex items-start gap-2 text-amber-800 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Regenerating codes will invalidate your existing recovery codes. You will need to complete email verification to generate new ones.</span>
            </div>
          </div>
        )}

      </div>

      {/* Setup Modal */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black mb-4">Set up 2FA</h2>
            
            {setupStep === "otp_request" || setupStep === "otp_verify" ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  To continue, please verify your identity. We've sent a code to your email.
                </p>
                <input
                  type="text"
                  placeholder="Enter Email OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
                <button
                  onClick={verifyEmailOtpAndStartTotp}
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#FC5C03] text-white font-bold rounded-xl flex items-center justify-center"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                </button>
                <button
                  onClick={() => setSetupModalOpen(false)}
                  className="w-full py-2 text-gray-500 font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : setupStep === "qr_scan" && qrData ? (
              <div className="space-y-5 flex flex-col items-center text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  Scan this QR code with your authenticator app (like Google Authenticator or Authy).
                </p>
                
                <div className="bg-white p-3 sm:p-4 border-2 border-gray-100 rounded-2xl max-w-[200px] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrData.qrCodeUrl} alt="QR Code" className="w-full h-auto aspect-square object-contain mx-auto" />
                </div>
                
                <div className="w-full">
                  <p className="text-xs text-gray-500 mb-1">Or enter this secret manually:</p>
                  <code className="block p-2 bg-gray-100 rounded-lg text-xs sm:text-sm font-mono break-all select-all">
                    {qrData.secret}
                  </code>
                </div>

                <div className="w-full space-y-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-center text-xl tracking-[0.5em] focus:border-[#FC5C03] outline-none"
                  />
                  <button
                    onClick={verifyTotpAndFinish}
                    disabled={isProcessing || totpCode.length !== 6}
                    className="w-full py-3 bg-[#FC5C03] text-white font-bold rounded-xl flex items-center justify-center disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                  </button>
                </div>
              </div>
            ) : setupStep === "recovery_codes" ? (
              <div className="space-y-5">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-semibold text-xs sm:text-sm flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>2FA has been successfully enabled!</span>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600">
                  Save these recovery codes in a safe place. You can use them to access your account if you lose your phone.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                  {newRecoveryCodes.map((code) => (
                    <code key={code} className="text-xs sm:text-sm font-mono text-center font-bold text-gray-800 break-all select-all py-1">
                      {code}
                    </code>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={copyCodes} className="flex-1 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button onClick={downloadCodes} className="flex-1 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>

                <button
                  onClick={() => setSetupModalOpen(false)}
                  className="w-full py-3 bg-[#FC5C03] text-white font-bold rounded-xl"
                >
                  I've saved my codes
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}
