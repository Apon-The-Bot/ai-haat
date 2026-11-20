"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthModal } from "@/components/AuthModal";
import { useQuickCheckout } from "@/context/QuickCheckoutContext";
import {
  FloatingOfferBar,
  FloatingWhatsAppWidget,
} from "@/components/cro";

function DeferredQuickCheckout() {
  const { isOpen, closeQuickCheckout } = useQuickCheckout();
  const [Modal, setModal] = useState<React.ComponentType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isOpen || Modal || failed) return;
    let active = true;
    import("@/components/checkout/QuickCheckoutModal")
      .then(({ QuickCheckoutModal }) => {
        if (active) setModal(() => QuickCheckoutModal);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => { active = false; };
  }, [isOpen, Modal, failed]);

  if (Modal) return <Modal />;
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-[calc(100%-2rem)] rounded-xl bg-white p-4 shadow-lg">
      <p role="status">{failed ? "চেকআউট লোড করা যায়নি।" : "চেকআউট লোড হচ্ছে…"}</p>
      {failed && <button type="button" className="mr-4 underline" onClick={() => setFailed(false)}>আবার চেষ্টা করুন</button>}
      <button type="button" className="underline" onClick={() => { closeQuickCheckout(); setFailed(false); }}>বন্ধ করুন</button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <main className="flex-1 w-full min-h-screen bg-[#F8FAFC] text-slate-900">{children}</main>
        <AuthModal />
      </>
    );
  }

  return (
    <>
      <FloatingOfferBar />
      <Header />
      <main className="flex-1 w-full bg-white">{children}</main>
      <Footer />
      <CartDrawer />
      <AuthModal />
      <DeferredQuickCheckout />
      <FloatingWhatsAppWidget />
    </>
  );
}

