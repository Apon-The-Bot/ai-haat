"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product, Variation } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { safeAuthReturn } from "@/lib/security/auth-return";
import { useToast } from "@/context/ToastContext";

const pendingKey = "aihaat_pending_buy_now";
const currentPath = () => safeAuthReturn(window.location.pathname + window.location.search);

interface QuickCheckoutContextType {
  isOpen: boolean;
  product: Product | null;
  selectedVariation: Variation | null;
  initialQuantity: number;
  openQuickCheckout: (product: Product, initialVariation?: Variation, initialQuantity?: number) => void;
  resumeAfterLogin: (product: Product, variation?: Variation, quantity?: number) => void;
  closeQuickCheckout: () => void;
  setSelectedVariation: (variation: Variation) => void;
}

const QuickCheckoutContext = createContext<QuickCheckoutContextType | undefined>(undefined);

export function QuickCheckoutProvider({ children }: { children: React.ReactNode }) {
  const { user, openLoginModal } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariationState] = useState<Variation | null>(null);
  const [initialQuantity, setInitialQuantity] = useState(1);

  const showCheckout = useCallback(
    (prod: Product, initialVar?: Variation, initialQty?: number) => {
      setProduct(prod);
      const defaultVar: Variation =
        initialVar ||
        prod.variations?.[0] || {
          id: "default",
          name: "Standard",
          priceBDT: prod.minPriceBDT || 0,
          inStock: prod.inStock ?? true,
        };
      setSelectedVariationState(defaultVar);
      setInitialQuantity(initialQty && initialQty > 0 ? initialQty : 1);
      setIsOpen(true);
    },
    []
  );

  const resumeAfterLogin = useCallback(
    (prod: Product, variation?: Variation, quantity = 1) => {
      const path = currentPath();
      try {
        sessionStorage.setItem(pendingKey, JSON.stringify({
          path,
          productId: prod.id,
          slug: prod.slug,
          variationId: prod.variations?.length ? (variation || prod.variations[0]).id : undefined,
          quantity,
          expiresAt: Date.now() + 30 * 60 * 1000,
        }));
      } catch {
        showToast("লগইনের পর আবার Buy Now চাপুন।", "error");
      }
      setIsOpen(false);
      openLoginModal(path);
    },
    [openLoginModal, showToast]
  );

  const openQuickCheckout = useCallback((prod: Product, variation?: Variation, quantity?: number) => {
    if (user?.id) showCheckout(prod, variation, quantity);
    else resumeAfterLogin(prod, variation, quantity);
  }, [user?.id, showCheckout, resumeAfterLogin]);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    async function resume() {
      try {
        const saved = sessionStorage.getItem(pendingKey);
        if (!saved) return;
        const intent = JSON.parse(saved);
        if (intent.expiresAt < Date.now()) {
          sessionStorage.removeItem(pendingKey);
          return;
        }
        if (intent.path !== currentPath()) return;
        const response = await fetch(`/api/products/${encodeURIComponent(intent.slug)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const { product: fresh } = await response.json() as { product?: Product };
        if (controller.signal.aborted || sessionStorage.getItem(pendingKey) !== saved) return;
        sessionStorage.removeItem(pendingKey);
        const variation = fresh?.variations?.find((entry) => entry.id === intent.variationId);
        if (!response.ok || !fresh || fresh.id !== intent.productId || (intent.variationId && !variation)) {
          showToast("পণ্য বা ভ্যারিয়েশনটি বদলে গেছে। আবার নির্বাচন করুন।", "error");
          return;
        }
        showCheckout(fresh, variation, intent.quantity);
      } catch {
        if (!controller.signal.aborted) showToast("Buy Now আবার চেষ্টা করুন।", "error");
      }
    }
    void resume();
    return () => controller.abort();
  }, [user?.id, showCheckout, showToast]);

  const closeQuickCheckout = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setSelectedVariation = useCallback((v: Variation) => {
    setSelectedVariationState(v);
  }, []);

  return (
    <QuickCheckoutContext.Provider
      value={{
        isOpen,
        product,
        selectedVariation,
        initialQuantity,
        openQuickCheckout,
        resumeAfterLogin,
        closeQuickCheckout,
        setSelectedVariation,
      }}
    >
      {children}
    </QuickCheckoutContext.Provider>
  );
}

export function useQuickCheckout() {
  const context = useContext(QuickCheckoutContext);
  if (!context) {
    throw new Error("useQuickCheckout must be used within a QuickCheckoutProvider");
  }
  return context;
}
