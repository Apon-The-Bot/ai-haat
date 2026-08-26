"use client";

import React, { useState } from "react";
import { X, Lock, Phone, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    register,
  } = useAuth();

  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "login") {
      if (phoneOrEmail.trim()) {
        login(phoneOrEmail.trim());
      }
    } else {
      if (name.trim() && phone.trim()) {
        register(name.trim(), email.trim() || `${phone}@aihaat.com`, phone.trim());
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E8E8EE] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Banner with Close Button */}
        <div className="bg-[#1A1D26] p-5 text-white text-center relative border-b border-gray-800">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="inline-block bg-white px-3 py-1 rounded-full mb-2.5 shadow-sm">
            <Logo size="sm" showSubtitle={false} />
          </div>

          <h3 className="text-lg font-black text-white">
            {authMode === "login" ? "লগইন করুন (Sign In)" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            {authMode === "login"
              ? "অর্ডার হিস্ট্রি ও ওয়ালেট ব্যালেন্স দেখতে লগইন করুন।"
              : "সাইন আপ করে ডিজিটাল ওয়ালেটে যুক্ত হোন।"}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                  আপনার পূর্ণ নাম *
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. তানভীর আহমেদ"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:border-[#FC5C03] focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                {authMode === "login" ? "মোবাইল নাম্বার অথবা ইমেইল *" : "মোবাইল নাম্বার (বিকাশ/নগদ) *"}
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="text"
                  required
                  value={authMode === "login" ? phoneOrEmail : phone}
                  onChange={(e) =>
                    authMode === "login"
                      ? setPhoneOrEmail(e.target.value)
                      : setPhone(e.target.value)
                  }
                  placeholder={authMode === "login" ? "017XXXXXXXX / email@domain.com" : "017XXXXXXXX"}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:border-[#FC5C03] focus:outline-none transition-all"
                />
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                  ইমেইল অ্যাড্রেস
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:border-[#FC5C03] focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#1A1D26]">পাসওয়ার্ড *</label>
                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={() => alert("আপনার ফোনে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।")}
                    className="text-[11px] font-semibold text-[#FC5C03] hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:border-[#FC5C03] focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{authMode === "login" ? "সাইন ইন করুন" : "অ্যাকাউন্ট খুলুন"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle between login / register */}
          <div className="mt-4 text-center text-xs text-[#7A8190]">
            {authMode === "login" ? (
              <p>
                নতুন গ্রাহক?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="font-bold text-[#FC5C03] hover:underline"
                >
                  রেজিস্ট্রেশন করুন
                </button>
              </p>
            ) : (
              <p>
                ইতিমধ্যে একাউন্ট আছে?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="font-bold text-[#FC5C03] hover:underline"
                >
                  লগইন করুন
                </button>
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-1 text-[10.5px] text-[#7A8190]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>২৫৬-বিট এনক্রিপ্টেড নিরাপদ লগইন</span>
          </div>

        </div>

      </div>
    </div>
  );
}
