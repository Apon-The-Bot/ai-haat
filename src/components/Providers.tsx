"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/context/ToastContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { AppShell } from "@/components/AppShell";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <ProductsProvider>
              <CartProvider>
                <AuthProvider>
                  <AppShell>{children}</AppShell>
                </AuthProvider>
              </CartProvider>
            </ProductsProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
