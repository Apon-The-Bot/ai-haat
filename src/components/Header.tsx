"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ChevronRight, Zap, User, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { SafeImage } from "@/components/SafeImage";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const isBn = language === "bn";
  const { totalItems, setIsCartOpen } = useCart();
  const { user, openLoginModal, logout } = useAuth();
  const { products } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile menu or mobile search is open, and handle Escape key
  useEffect(() => {
    if (isMobileMenuOpen || isMobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
        setIsSearchFocused(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "SHOP", href: "/shop" },
    { name: "WALLET", href: "/wallet" },
    { name: "PROOFS", href: "/proofs" },
    { name: "BLOG", href: "/blog" },
    { name: "ORDER TRACKING", href: "/order-tracking" },
    { name: "PRODUCT REQUEST", href: "/product-request" },
    { name: "ABOUT US", href: "/about" },
  ];

  const filteredSearchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleProductSelect = (slug: string) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    router.push(`/product/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E8E8EE] shadow-2xs">
      
      {/* ================= FIRST HEADER ROW (~68px) ================= */}
      <div className="h-[64px] sm:h-[68px] border-b border-[#E8E8EE]">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto h-full flex items-center justify-between gap-3">
          
          {/* Mobile: Hamburger Button on Left */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-[#1A1D26] hover:text-[#FC5C03] rounded-lg active:bg-gray-100 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Left: AI Haat Logo */}
          <div className="flex items-center shrink-0">
            <Logo size="md" showSubtitle={false} />
          </div>

          {/* Center: Long Rounded Search Field (Desktop & Tablet) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-[650px] relative mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative flex items-center w-full bg-[#F3F4F6] rounded-full border border-[#E8E8EE] focus-within:border-[#FC5C03] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FC5C03]/15 transition-all">
                <Search className="w-4 h-4 text-[#7A8190] ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="I’m shopping for..."
                  className="w-full py-2 pl-3 pr-4 bg-transparent text-sm text-[#1A1D26] placeholder-[#7A8190] focus:outline-none rounded-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mr-3 text-xs text-gray-400 hover:text-gray-600 p-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Instant Live Search Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E8E8EE] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                  {filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => handleProductSelect(prod.slug)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-[#FFF9F5] rounded-xl text-left transition-colors group"
                      >
                        <div className="w-10 h-10 relative rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          <SafeImage
                            src={prod.image}
                            alt={prod.name}
                            aspectRatio="1/1"
                            objectFit="cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#1A1D26] group-hover:text-[#FC5C03] truncate transition-colors">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium text-[#7A8190] bg-gray-100 px-1.5 py-0.5 rounded">
                              {prod.category}
                            </span>
                            <span className="text-xs font-bold text-[#FC5C03]">
                              {formatPrice(prod.minPriceBDT)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FC5C03] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-[#7A8190]">
                      No digital products found for &ldquo;<span className="text-[#1A1D26] font-semibold">{searchQuery}</span>&rdquo;
                    </div>
                  )}
                </div>
                {filteredSearchResults.length > 0 && (
                  <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-semibold text-[#FC5C03] hover:underline"
                    >
                      View all results in Shop →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Currency Toggle, Search (Mobile), Cart Icon, Login Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#1A1D26] hover:text-[#FC5C03] rounded-lg active:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop Currency Selector (BDT / USD) */}
            <div className="hidden sm:flex items-center bg-[#F3F4F6] p-0.5 rounded-full border border-[#E8E8EE]">
              <button
                type="button"
                onClick={() => setCurrency("BDT")}
                className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                  currency === "BDT"
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-[#7A8190] hover:text-[#1A1D26]"
                }`}
              >
                BDT ৳
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                  currency === "USD"
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-[#7A8190] hover:text-[#1A1D26]"
                }`}
              >
                USD $
              </button>
            </div>

            {/* Cart Icon & Counter */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#1A1D26] hover:bg-[#FFF2E8] hover:text-[#FC5C03] transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute 1 top-0.5 right-0.5 bg-[#FC5C03] text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Desktop Login / Account Pill */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/dashboard/wallet"
                  className="flex items-center gap-1 bg-[#FFF2E8] text-[#FC5C03] px-3 py-1.5 rounded-full text-xs font-bold border border-[#FC5C03]/20 hover:bg-[#FFE6D3] transition-colors"
                >
                  <span>{formatPrice(user.walletBalanceBDT)}</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 h-8 px-3.5 bg-[#1A1D26] hover:bg-black text-white text-xs font-bold rounded-full transition-all"
                  title="Dashboard"
                >
                  <User className="w-3.5 h-3.5 text-[#FC5C03]" />
                  <span>{isBn ? "ড্যাশবোর্ড" : "Dashboard"}</span>
                </Link>
                {(user.role === "ADMIN" ||
                  ["mdamanullahsheikhapon@gmail.com", "seratul.alim@gmail.com", "seratulalimkhanrhythm@gmail.com", "admin@aihaat.com"].includes(
                    (user.email || "").toLowerCase().trim()
                  )) && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 h-8 px-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white text-xs font-bold rounded-full transition-all border border-slate-700 shadow-xs"
                    title="Admin Control Panel"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FC5C03]" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="hidden sm:flex w-[78px] h-8 bg-gradient-to-r from-[#FE7113] to-[#FC5C03] hover:from-[#FC5C03] hover:to-[#EC4001] text-white text-xs font-bold rounded-full shadow-xs hover:shadow-sm transition-all items-center justify-center cursor-pointer"
              >
                {isBn ? "লগইন" : "Login"}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ================= SECOND HEADER ROW (Centered Navigation) ================= */}
      <div className="hidden md:block bg-white border-b border-[#E8E8EE]">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
          <nav className="flex items-center justify-center gap-1 py-1.5 overflow-x-auto scrollbar-none">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || (pathname ? pathname.startsWith(link.href + "/") : false);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#FFF2E8] text-[#FC5C03] font-bold shadow-2xs"
                      : "text-[#7A8190] hover:text-[#FC5C03] hover:bg-[#FFF2E8]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ================= MOBILE FULL-WIDTH SEARCH OVERLAY ================= */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs p-4 flex flex-col justify-start animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1A1D26]">Search Digital Products</h3>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#7A8190] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ChatGPT, Canva, VPN, Software..."
                className="w-full py-2.5 pl-10 pr-3 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FC5C03]"
              />
            </form>

            {filteredSearchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {filteredSearchResults.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductSelect(prod.slug)}
                    className="w-full py-2.5 flex items-center justify-between text-left"
                  >
                    <span className="text-xs font-bold text-[#1A1D26] truncate max-w-[200px]">
                      {prod.name}
                    </span>
                    <span className="text-xs font-bold text-[#FC5C03]">
                      {formatPrice(prod.minPriceBDT)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MOBILE DRAWER MENU (Body Scroll Locked) ================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200">
          <div className="w-[85%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-[#E8E8EE] flex items-center justify-between">
                <Logo size="sm" showSubtitle={false} />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1A1D26] rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links with Touch Targets >= 44px */}
              <div className="p-3 space-y-1">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname === link.href || (pathname ? pathname.startsWith(link.href + "/") : false);

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                        isActive
                          ? "bg-[#FFF2E8] text-[#FC5C03]"
                          : "text-[#1A1D26] hover:bg-[#FFF2E8] hover:text-[#FC5C03]"
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Drawer Footer with Currency & Login */}
            <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Currency</span>
                <div className="flex items-center bg-gray-200/80 p-0.5 rounded-full">
                  <button
                    onClick={() => setCurrency("BDT")}
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      currency === "BDT" ? "bg-white text-[#FC5C03] shadow-xs" : "text-gray-600"
                    }`}
                  >
                    BDT ৳
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      currency === "USD" ? "bg-white text-[#FC5C03] shadow-xs" : "text-gray-600"
                    }`}
                  >
                    USD $
                  </button>
                </div>
              </div>

              {user ? (
                <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1A1D26]">{user.name}</p>
                    <p className="text-xs text-[#FC5C03] font-bold">
                      Wallet: {formatPrice(user.walletBalanceBDT)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-red-600 hover:underline min-h-[44px] px-2 flex items-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    openLoginModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] bg-gradient-to-r from-[#FE7113] to-[#FC5C03] text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-md"
                >
                  Login / Register
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
