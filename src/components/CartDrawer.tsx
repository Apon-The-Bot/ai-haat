"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";

export function CartDrawer() {
  const router = useRouter();
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, subtotalBDT } = useCart();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "AIHAAT10") {
      setDiscountPercent(10);
      showToast("১০% স্পেশাল ডিসকাউন্ট যুক্ত হয়েছে!", "success");
    } else if (couponCode.toUpperCase() === "FIRST50") {
      setDiscountPercent(15);
      showToast("১৫% ওয়েলকাম ডিসকাউন্ট যুক্ত হয়েছে!", "success");
    } else {
      showToast("দুঃখিত, কুপন কোডটি সঠিক নয়।", "error");
    }
  };

  const discountAmount = (subtotalBDT * discountPercent) / 100;
  const finalTotalBDT = subtotalBDT - discountAmount;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
          
          {/* 1. CART HEADER */}
          <div className="p-4 border-b border-[#E8E8EE] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FC5C03]" />
              <h2 className="text-base font-black text-[#1A1D26]">
                শপিং কার্ট ({items.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-[#1A1D26] hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center justify-between">
                  <div className="w-14 h-14 relative rounded-lg overflow-hidden border border-[#E8E8EE] bg-gray-50 shrink-0">
                    <SafeImage
                      src={item.product.image}
                      alt={item.product.name}
                      aspectRatio="1/1"
                      objectFit="cover"
                      sizes="56px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#1A1D26] truncate">
                      {item.product.name}
                    </h4>
                    <span className="text-[10.5px] text-[#7A8190] block truncate">
                      {item.selectedVariation.name}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#FC5C03]">
                        {formatPrice(item.selectedVariation.priceBDT * item.quantity)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#E8E8EE] rounded-md bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-xs text-gray-600 hover:text-black"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#1A1D26]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-xs text-gray-600 hover:text-black"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-[#1A1D26]">কার্ট বর্তমানে খালি</h3>
                <p className="text-xs text-[#7A8190] max-w-xs mx-auto">
                  আপনার প্রয়োজনীয় ডিজিটাল প্রোডাক্ট ও সফটওয়্যার কার্টে যুক্ত করুন।
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/shop");
                  }}
                  className="px-4 py-2 bg-[#FC5C03] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  প্রোডাক্ট দেখুন
                </button>
              </div>
            )}
          </div>

          {/* 3. CART FOOTER (Coupon & Checkout Action) */}
          {items.length > 0 && (
            <div className="p-4 border-t border-[#E8E8EE] bg-gray-50/50 space-y-3">
              {/* Coupon Row */}
              <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="কুপন কোড (AIHAAT10)"
                    className="w-full pl-8 pr-2 py-1.5 bg-white border border-[#E8E8EE] rounded-lg text-xs focus:outline-none focus:border-[#FC5C03]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors shrink-0"
                >
                  এপ্লাই
                </button>
              </form>

              {/* Subtotal & Discounts */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-[#1A1D26]">{formatPrice(subtotalBDT)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>ডিসকাউন্ট ({discountPercent}%)</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[#1A1D26] pt-1.5 border-t border-gray-200">
                  <span>সর্বমোট মূল্য</span>
                  <span className="text-[#FC5C03] text-base">{formatPrice(finalTotalBDT)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/checkout");
                }}
                className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <span>চেকআউট করুন (Proceed to Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
