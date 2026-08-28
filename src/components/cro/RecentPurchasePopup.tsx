"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

export interface PurchaseNotification {
  id: string;
  customerName: string;
  city: string;
  area?: string;
  productName: string;
  slug: string;
  image: string;
  timeAgoEn: string;
  timeAgoBn: string;
  priceBDT: number;
}

const PURCHASE_POOL: PurchaseNotification[] = [
  {
    id: "p1",
    customerName: "Tanvir H.",
    city: "Dhaka",
    area: "Dhanmondi",
    productName: "ChatGPT Plus (GPT-4o & Canvas Access)",
    slug: "chatgpt-plus",
    image: "/images/products/chatgpt-plus.svg",
    timeAgoEn: "2 mins ago",
    timeAgoBn: "২ মিনিট আগে",
    priceBDT: 290,
  },
  {
    id: "p2",
    customerName: "Sakib A.",
    city: "Chittagong",
    area: "GEC Circle",
    productName: "Windows 11 Pro Retail Key",
    slug: "windows-11-pro-retail-key",
    image: "/images/products/windows-11.svg",
    timeAgoEn: "4 mins ago",
    timeAgoBn: "৪ মিনিট আগে",
    priceBDT: 450,
  },
  {
    id: "p3",
    customerName: "Nusrat J.",
    city: "Sylhet",
    area: "Zindabazar",
    productName: "Canva Pro Subscription (Brand Kit & AI)",
    slug: "canva-pro",
    image: "/images/products/canva-pro.svg",
    timeAgoEn: "6 mins ago",
    timeAgoBn: "৬ মিনিট আগে",
    priceBDT: 99,
  },
  {
    id: "p4",
    customerName: "Farhan M.",
    city: "Rajshahi",
    area: "Shaheb Bazar",
    productName: "CapCut Pro PC & Mobile (VIP Auto Captions)",
    slug: "capcut-pro",
    image: "/images/products/capcut-pro.svg",
    timeAgoEn: "9 mins ago",
    timeAgoBn: "৯ মিনিট আগে",
    priceBDT: 150,
  },
  {
    id: "p5",
    customerName: "Mahmud R.",
    city: "Dhaka",
    area: "Uttara",
    productName: "Google Gemini Advanced (2TB Storage)",
    slug: "google-gemini-advanced",
    image: "/images/products/gemini-advanced.svg",
    timeAgoEn: "3 mins ago",
    timeAgoBn: "৩ মিনিট আগে",
    priceBDT: 350,
  },
  {
    id: "p6",
    customerName: "Ahsan K.",
    city: "Khulna",
    area: "Sonadanga",
    productName: "NordVPN Complete Security (2-Year)",
    slug: "nordvpn-complete-security",
    image: "/images/products/nordvpn.svg",
    timeAgoEn: "11 mins ago",
    timeAgoBn: "১১ মিনিট আগে",
    priceBDT: 450,
  },
  {
    id: "p7",
    customerName: "Rafiul I.",
    city: "Comilla",
    area: "Kandirpar",
    productName: "Midjourney v6 Fast GPU Credits",
    slug: "midjourney-v6-fast-gpu-credits",
    image: "/images/products/chatgpt-plus.svg",
    timeAgoEn: "5 mins ago",
    timeAgoBn: "৫ মিনিট আগে",
    priceBDT: 550,
  },
  {
    id: "p8",
    customerName: "Arif H.",
    city: "Dhaka",
    area: "Gulshan-2",
    productName: "Microsoft 365 Family Seat + 1TB OneDrive",
    slug: "microsoft-365-family-seat",
    image: "/images/products/microsoft-365.svg",
    timeAgoEn: "8 mins ago",
    timeAgoBn: "৮ মিনিট আগে",
    priceBDT: 299,
  },
  {
    id: "p9",
    customerName: "Sabbir N.",
    city: "Barisal",
    area: "Sadar Road",
    productName: "Telegram Premium Gift Subscription",
    slug: "telegram-premium-gift",
    image: "/images/products/telegram-premium.svg",
    timeAgoEn: "13 mins ago",
    timeAgoBn: "১৩ মিনিট আগে",
    priceBDT: 390,
  },
  {
    id: "p10",
    customerName: "Nafisa T.",
    city: "Mymensingh",
    area: "Town Hall",
    productName: "YouTube Premium Family Seat (Ad-Free)",
    slug: "youtube-premium-family-seat",
    image: "/images/products/youtube-premium.svg",
    timeAgoEn: "7 mins ago",
    timeAgoBn: "৭ মিনিট আগে",
    priceBDT: 130,
  },
  {
    id: "p11",
    customerName: "Zubair E.",
    city: "Rangpur",
    area: "Dhap",
    productName: "Cursor AI Pro (Developer Assistant)",
    slug: "cursor-ai-pro-subscription",
    image: "/images/products/chatgpt-plus.svg",
    timeAgoEn: "15 mins ago",
    timeAgoBn: "১৫ মিনিট আগে",
    priceBDT: 380,
  },
  {
    id: "p12",
    customerName: "Mehedi H.",
    city: "Dhaka",
    area: "Mirpur-10",
    productName: "Netflix Premium 4K UHD Private Profile",
    slug: "netflix-premium-4k-uhd",
    image: "/images/products/netflix.svg",
    timeAgoEn: "1 min ago",
    timeAgoBn: "১ মিনিট আগে",
    priceBDT: 280,
  },
];

const LOCAL_STORAGE_KEY = "aihaat_cro_popup_muted_until";
const DISPLAY_DURATION_MS = 6000; // Toast visible for 6 seconds
const MIN_INTERVAL_MS = 12000; // 12 seconds
const MAX_INTERVAL_MS = 25000; // 25 seconds
const MUTE_DURATION_ON_DISMISS_MS = 10 * 60 * 1000; // 10 minutes mute if dismissed manually

export function RecentPurchasePopup() {
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();
  const isBn = language === "bn";

  const [mounted, setMounted] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<PurchaseNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const lastIndexRef = useRef<number>(-1);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pick random next item not equal to the last one
  const getRandomNotification = useCallback((): PurchaseNotification => {
    let nextIndex = Math.floor(Math.random() * PURCHASE_POOL.length);
    if (PURCHASE_POOL.length > 1 && nextIndex === lastIndexRef.current) {
      nextIndex = (nextIndex + 1) % PURCHASE_POOL.length;
    }
    lastIndexRef.current = nextIndex;
    return PURCHASE_POOL[nextIndex];
  }, []);

  const clearAllTimers = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
  };

  const scheduleNext = useCallback(() => {
    clearAllTimers();

    // Check local storage mute memory
    if (typeof window !== "undefined") {
      try {
        const mutedUntil = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (mutedUntil && Date.now() < parseInt(mutedUntil, 10)) {
          return; // Currently muted
        }
      } catch {
        // Ignore storage errors
      }
    }

    const randomDelay = Math.floor(
      Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS + 1) + MIN_INTERVAL_MS
    );

    nextTimerRef.current = setTimeout(() => {
      const item = getRandomNotification();
      setCurrentNotification(item);
      setIsVisible(true);

      // Auto hide after DISPLAY_DURATION_MS
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        scheduleNext();
      }, DISPLAY_DURATION_MS);
    }, randomDelay);
  }, [getRandomNotification]);

  useEffect(() => {
    setMounted(true);

    // Initial warm-up delay before showing the very first popup (4-7 seconds)
    const initialDelay = Math.floor(Math.random() * 3000 + 4000);
    const initialTimer = setTimeout(() => {
      // Check mute
      try {
        const mutedUntil = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!mutedUntil || Date.now() >= parseInt(mutedUntil, 10)) {
          const item = getRandomNotification();
          setCurrentNotification(item);
          setIsVisible(true);

          hideTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            scheduleNext();
          }, DISPLAY_DURATION_MS);
        }
      } catch {
        // Fallback
      }
    }, initialDelay);

    return () => {
      clearTimeout(initialTimer);
      clearAllTimers();
    };
  }, [getRandomNotification, scheduleNext]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    clearAllTimers();

    // Mute for 10 minutes on explicit dismiss to avoid annoying the user
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        (Date.now() + MUTE_DURATION_ON_DISMISS_MS).toString()
      );
    } catch {
      // Ignore local storage error in private browsing
    }
  };

  if (!mounted || !currentNotification) return null;

  const locationText = currentNotification.area
    ? `${currentNotification.city} (${currentNotification.area})`
    : currentNotification.city;

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 pointer-events-none max-w-[calc(100vw-32px)] sm:max-w-[360px]">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentNotification.id + currentNotification.slug}
            initial={{ opacity: 0, y: 30, scale: 0.94, x: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto group relative flex items-start gap-3 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_4px_12px_rgba(252,92,3,0.06)] hover:shadow-[0_16px_40px_-6px_rgba(252,92,3,0.15)] transition-shadow duration-300"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#FC5C03] to-transparent opacity-80" />

            {/* Product Thumbnail with Live Pulse */}
            <Link
              href={`/product/${currentNotification.slug}`}
              className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 p-1 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <SafeImage
                src={currentNotification.image}
                alt={currentNotification.productName}
                aspectRatio="1/1"
                objectFit="contain"
                sizes="48px"
              />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E] border-2 border-white" />
              </span>
            </Link>

            {/* Content Details */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-gray-900 truncate">
                  {currentNotification.customerName}
                </span>
                <span className="text-[11px] text-gray-500 font-medium truncate">
                  {isBn ? `(${locationText} থেকে)` : `from ${locationText}`}
                </span>
              </div>

              <Link
                href={`/product/${currentNotification.slug}`}
                className="block text-xs font-semibold text-gray-800 hover:text-[#FC5C03] transition-colors line-clamp-1 mt-0.5"
              >
                {isBn ? "সবেমাত্র কিনেছেন " : "Purchased "}
                <span className="text-[#1A1D26] font-bold">{currentNotification.productName}</span>
              </Link>

              {/* Badges: Time Ago & Verified Purchase */}
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 font-medium">
                <span className="inline-flex items-center gap-1 text-[#059669] font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3 text-[#059669]" />
                  {isBn ? "ভেরিফাইড" : "Verified"}
                </span>

                <span className="text-gray-400">•</span>

                <span className="text-gray-500">
                  {isBn ? currentNotification.timeAgoBn : currentNotification.timeAgoEn}
                </span>

                <span className="text-gray-400">•</span>

                <span className="font-bold text-[#FC5C03]">
                  {formatPrice(currentNotification.priceBDT)}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss notification"
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
