"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Product, Variation } from "@/types";

interface QuickCheckoutContextType {
  isOpen: boolean;
  product: Product | null;
  selectedVariation: Variation | null;
  initialQuantity: number;
  openQuickCheckout: (product: Product, initialVariation?: Variation, initialQuantity?: number) => void;
  closeQuickCheckout: () => void;
  setSelectedVariation: (variation: Variation) => void;
}

const QuickCheckoutContext = createContext<QuickCheckoutContextType | undefined>(undefined);

export function QuickCheckoutProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariationState] = useState<Variation | null>(null);
  const [initialQuantity, setInitialQuantity] = useState(1);

  const openQuickCheckout = useCallback(
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
