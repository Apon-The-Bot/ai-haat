"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Minus, Plus, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { SafeImage } from "@/components/SafeImage";
import { trackViewCart } from "@/lib/analytics/client";
import { sanitizeItem } from "@/lib/analytics/sanitize";

export function CartDrawer() {
  const router = useRouter();
  const { user, openLoginModal } = useAuth();
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, subtotalBDT } = useCart();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountBDT: number;
    description?: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const viewCartTrackedRef = useRef<string>("");

  useEffect(() => {
    if (!isCartOpen || items.length === 0) return;
    const cartKey = items.map(i => `${i.id}:${i.quantity}`).join(',');
    if (viewCartTrackedRef.current === cartKey) return;
    viewCartTrackedRef.current = cartKey;
    try {
      const analyticsItems = items.map(i => sanitizeItem({
        id: i.product.id,
        name: i.product.name,
        category: i.product.category,
        variant: i.selectedVariation.name,
        price: i.selectedVariation.priceBDT,
        quantity: i.quantity,
      }));
      trackViewCart(analyticsItems, subtotalBDT);
    } catch {}
  }, [isCartOpen, items, subtotalBDT]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      showToast("অনুগ্রহ করে একটি কুপন কোড দিন।", "error");
      return;
    }

    if (items.length === 0) {
      showToast("কুপন ব্যবহারের জন্য কার্টে প্রোডাক্ট যুক্ত করুন।", "error");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: cleanCode,
          items: items.map((it) => ({
            productId: it.product.id,
            variationId: it.selectedVariation?.id === "default" ? null : (it.selectedVariation?.id || null),
            quantity: it.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.isValid && data.quote) {
        setAppliedCoupon({
          code: cleanCode,
          discountBDT: data.quote.discountBDT || 0,
          description: `${cleanCode} ডিসকাউন্ট যুক্ত হয়েছে!`,
        });
        showToast(`৳${data.quote.discountBDT} কুপন ডিসকাউন্ট যুক্ত হয়েছে!`, "success");
      } else {
        showToast(data.error || "দুঃখিত, কুপন কোডটি প্রযোজ্য নয় বা মেয়াদ উত্তীর্ণ।", "error");
      }
    } catch {
      showToast("কুপন যাচাই করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", "error");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    showToast("কুপন সরানো হয়েছে।", "info");
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountBDT : 0;
  const finalTotalBDT = Math.max(0, subtotalBDT - discountAmount);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    const checkoutUrl = appliedCoupon?.code
      ? `/checkout?coupon=${encodeURIComponent(appliedCoupon.code)}`
      : "/checkout";

    if (!user) {
      openLoginModal(checkoutUrl);
    } else {
      router.push(checkoutUrl);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-6">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        >
          {/* 1. CART HEADER */}
          <div className="p-4 border-b border-[#E8E8EE] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-[#1A1D26]">
                শপিং কার্ট ({items.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full text-gray-400 hover:text-[#1A1D26] hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center justify-between">
                  <div className="w-14 h-14 relative rounded-xl overflow-hidden border border-[#E8E8EE] bg-gray-50 shrink-0">
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
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-extrabold text-[#FC5C03]">
                        {formatPrice(item.selectedVariation.priceBDT * item.quantity)}
                      </span>

                      {/* Quantity Selector with >=40px Touch Targets */}
                      <div className="flex items-center border border-[#E8E8EE] rounded-lg bg-gray-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs text-gray-700 hover:bg-gray-200 hover:text-black transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#1A1D26]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs text-gray-700 hover:bg-gray-200 hover:text-black transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 bg-orange-50 text-[#FC5C03] rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-[#1A1D26]">আপনার কার্ট বর্তমানে খালি</h3>
                <p className="text-xs text-[#7A8190] max-w-xs mx-auto">
                  আপনার প্রয়োজনীয় ডিজিটাল প্রোডাক্ট, সাবস্ক্রিপশন ও সফটওয়্যার কার্টে যুক্ত করুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/shop");
                  }}
                  className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  প্রোডাক্ট ব্রাউজ করুন
                </button>
              </div>
            )}
          </div>

          {/* 3. CART FOOTER (Coupon & Checkout Action) */}
          {items.length > 0 && (
            <div className="p-4 border-t border-[#E8E8EE] bg-gray-50/80 space-y-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {/* Coupon Row */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>কুপন কোড: {appliedCoupon.code} (-{formatPrice(appliedCoupon.discountBDT)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    সরান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="কুপন কোড (যেমন: AIHAAT10)"
                      className="w-full pl-8 pr-2 py-2 bg-white border border-[#E8E8EE] rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#FC5C03]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isValidatingCoupon ? "..." : "এপ্লাই"}
                  </button>
                </form>
              )}

              {/* Subtotal & Discounts */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-[#1A1D26]">{formatPrice(subtotalBDT)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>কুপন ডিসকাউন্ট</span>
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
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
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
