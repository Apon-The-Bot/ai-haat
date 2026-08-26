"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthModal } from "@/components/AuthModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <main className="flex-1 w-full min-h-screen bg-slate-900">{children}</main>
        <AuthModal />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 w-full bg-white">{children}</main>
      <Footer />
      <CartDrawer />
      <AuthModal />
    </>
  );
}
