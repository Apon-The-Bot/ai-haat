"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, CheckCircle2, Loader2, Send } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = [
  "Payment Issue",
  "Delivery Delay",
  "Account Login Problem",
  "License Key Invalid",
  "Warranty Replacement Help",
  "Refund Question",
  "Other"
];

function NewTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const defaultOrderId = searchParams?.get("orderId") || "";
  const defaultItemId = searchParams?.get("itemId") || "";
  const defaultCategory = searchParams?.get("category") || "";

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [selectedOrderId, setSelectedOrderId] = useState(defaultOrderId);
  const [selectedItemId, setSelectedItemId] = useState(defaultItemId);
  const [category, setCategory] = useState(defaultCategory);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          // Assuming data is an array of orders or data.orders
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, []);

  const selectedOrder = orders.find(o => o.id === selectedOrderId || o.orderNumber === selectedOrderId);
  const orderItems = selectedOrder?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!category || !subject || !description) {
      alert(isBn ? "অনুগ্রহ করে সব তথ্য দিন" : "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/support");
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">
          {isBn ? "টিকিট তৈরি হয়েছে!" : "Ticket Created Successfully!"}
        </h2>
        <p className="text-sm text-slate-500 max-w-md">
          {isBn 
            ? "আপনার সাপোর্ট টিকিট সফলভাবে তৈরি হয়েছে। আমরা দ্রুত আপনার সাথে যোগাযোগ করবো।" 
            : "Your support ticket has been created successfully. Our team will get back to you shortly."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/support"
          className="w-8 h-8 flex items-center justify-center bg-white border border-[#E8E8EE] rounded-lg text-slate-600 hover:text-[#FC5C03] hover:border-[#FC5C03] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-[#1A1D26]">
            {isBn ? "নতুন সাপোর্ট টিকিট" : "Create New Support Ticket"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn ? "আপনার সমস্যার বিস্তারিত আমাদের জানান" : "Provide details about your issue so we can help"}
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-amber-900">
            {isBn ? "নিরাপত্তা সতর্কতা" : "Security Notice"}
          </h3>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            {isBn 
              ? "আপনার OTP, 2FA রিকভারি কোড বা ব্যক্তিগত ইমেইল পাসওয়ার্ড এখানে শেয়ার করবেন না। AI Haat কর্তৃপক্ষ কখনোই আপনার কাছে এগুলো চাইবে না।" 
              : "Do NOT share your OTP, 2FA recovery codes, or personal email passwords here. AI Haat staff will never ask for them."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs space-y-5">
        
        {/* Order Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isBn ? "অর্ডার সিলেক্ট করুন (ঐচ্ছিক)" : "Select Order (Optional)"}
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setSelectedItemId("");
                }}
                disabled={loadingOrders}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03]/20 transition-all disabled:opacity-50"
              >
                <option value="">{loadingOrders ? (isBn ? "লোড হচ্ছে..." : "Loading...") : (isBn ? "অর্ডার নির্বাচন করুন" : "Select an order")}</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedOrderId && orderItems.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {isBn ? "প্রোডাক্ট সিলেক্ট করুন" : "Select Product"}
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03]/20 transition-all"
                >
                  <option value="">{isBn ? "প্রোডাক্ট নির্বাচন করুন" : "Select a product"}</option>
                  {orderItems.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.productName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Category & Subject */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {isBn ? "ক্যাটাগরি" : "Category"} <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03]/20 transition-all"
            >
              <option value="" disabled>{isBn ? "সমস্যার ধরন নির্বাচন করুন" : "Select issue type"}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {isBn ? "বিষয়" : "Subject"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder={isBn ? "যেমন: নেটফ্লিক্স একাউন্ট কাজ করছে না" : "e.g., Netflix account stopped working"}
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03]/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {isBn ? "বিস্তারিত বিবরণ" : "Problem Description"} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder={isBn ? "আপনার সমস্যার বিস্তারিত লিখুন..." : "Please describe your issue in detail..."}
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03]/20 transition-all resize-none"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmitting ? (isBn ? "সাবমিট হচ্ছে..." : "Submitting...") : (isBn ? "টিকিট সাবমিট করুন" : "Submit Ticket")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#FC5C03]"/></div>}>
      <NewTicketForm />
    </Suspense>
  );
}
