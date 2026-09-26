"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Users,
  Package,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { useToast } from "@/context/ToastContext";

interface ProductDemand {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    inStock: boolean;
    category: string;
  };
  totalWaiting: number;
  variations: Array<{
    variation: { id?: string; name: string; inStock?: boolean; priceBDT?: number };
    count: number;
  }>;
  recentSubscribers: Array<{
    id: string;
    email: string;
    phone?: string | null;
    createdAt: string;
    variationName: string;
  }>;
}

interface StockWaitlistAdminTabProps {
  onAddStockForProduct?: (productId: string) => void;
}

export function StockWaitlistAdminTab({ onAddStockForProduct }: StockWaitlistAdminTabProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalPendingSubscribers: number;
    distinctProductsCount: number;
    productDemands: ProductDemand[];
  } | null>(null);
  const [notifyingProductId, setNotifyingProductId] = useState<string | null>(null);

  const fetchWaitlistData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stock-waitlist");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } else {
        showToast("ওয়েটলিস্ট ডাটা লোড করা সম্ভব হয়নি", "error");
      }
    } catch {
      showToast("নেটওয়ার্ক সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const handleNotifySubscribers = async (productId: string, productName: string) => {
    if (!confirm(`আপনি কি "${productName}" এর অপেক্ষমান সকল গ্রাহককে রিস্টক ইমেইল পাঠাতে চান?`)) {
      return;
    }

    setNotifyingProductId(productId);
    try {
      const res = await fetch("/api/admin/stock-waitlist/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(json.message || "ইমেইল সফলভাবে পাঠানো হয়েছে!", "success");
        // Refresh waitlist
        await fetchWaitlistData();
      } else {
        showToast(json.error || "নোটিফিকেশন পাঠানো ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("নেটওয়ার্ক ত্রুটি ঘটেছে", "error");
    } finally {
      setNotifyingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              অপেক্ষমান ক্রেতা
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {data?.totalPendingSubscribers ?? 0} জন
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              ● রিস্টক এলার্ট এর জন্য অপেক্ষমান
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              ডিমান্ডিং প্রোডাক্ট
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {data?.distinctProductsCount ?? 0} টি
            </span>
            <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
              যেগুলোতে গ্রাহকরা স্টক রিকোয়েস্ট করেছেন
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center border border-orange-200">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              স্বয়ংক্রিয় রিস্টক ইঞ্জিন
            </span>
            <span className="text-sm font-bold text-white mt-1 block">
              অটো-ইমেইল সিস্টেম সক্রিয়
            </span>
            <span className="text-[11px] text-slate-300 mt-0.5 block">
              নতুন স্টক যোগ করলেই কাস্টমার ইমেইল পেয়ে যাবেন
            </span>
          </div>
          <button
            onClick={fetchWaitlistData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Waitlist Product Cards */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-bold">ওয়েটলিস্ট তথ্য লোড হচ্ছে...</p>
        </div>
      ) : data?.productDemands && data.productDemands.length > 0 ? (
        <div className="space-y-4">
          {data.productDemands.map((item) => {
            const isNotifying = notifyingProductId === item.product.id;
            return (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-[#FC5C03]/40 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <SafeImage
                        src={item.product.image}
                        alt={item.product.name}
                        aspectRatio="1/1"
                        objectFit="cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.product.category}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            item.product.inStock
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.product.inStock ? "ইন স্টক" : "স্টক আউট"}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                        {item.product.name}
                      </h4>
                    </div>
                  </div>

                  {/* Demand Badge & Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>{item.totalWaiting} জন অপেক্ষমান</span>
                    </span>

                    <button
                      type="button"
                      disabled={isNotifying}
                      onClick={() => handleNotifySubscribers(item.product.id, item.product.name)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FC5C03] to-[#EC4001] hover:from-[#EC4001] hover:to-[#D43700] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="অপেক্ষমান সকল গ্রাহককে রিস্টক ইমেইল পাঠান"
                    >
                      {isNotifying ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>ইমেইল পাঠানো হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>নোটিফাই করুন</span>
                        </>
                      )}
                    </button>

                    {onAddStockForProduct && (
                      <button
                        type="button"
                        onClick={() => onAddStockForProduct(item.product.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="এই প্রোডাক্টে নতুন স্টক যোগ করুন"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>স্টক যুক্ত করুন</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Variations Breakdown */}
                {item.variations.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      ভ্যারিয়েন্ট ভিত্তিক চাহিদা:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.variations.map((v, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                        >
                          <span className="font-semibold text-slate-700">{v.variation.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 font-black text-[10.5px]">
                            {v.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Subscribers List */}
                {item.recentSubscribers.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      সাম্প্রতিক সাবস্ক্রিপশন:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {item.recentSubscribers.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-150 text-[11px] flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-800 truncate max-w-[160px]">
                            {sub.email}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(sub.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-black text-slate-900">
            বর্তমানে কোনো অপেক্ষমান স্টক রিকোয়েস্ট নেই
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            কোনো প্রোডাক্ট স্টক আউট হলে গ্রাহকরা সেখানে নোটিফিকেশন রিকোয়েস্ট করলে তাদের তথ্য এখানে স্বয়ংক্রিয়ভাবে জমা হবে।
          </p>
        </div>
      )}
    </div>
  );
}
