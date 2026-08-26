"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Currency } from "@/types";
import { formatPrice as formatPriceUtil, formatPriceRange as formatPriceRangeUtil } from "@/utils/currency";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (amountBDT: number) => string;
  formatPriceRange: (minBDT: number, maxBDT: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("BDT");

  useEffect(() => {
    const saved = localStorage.getItem("aihaat_currency") as Currency;
    if (saved === "BDT" || saved === "USD") {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("aihaat_currency", c);
  };

  const toggleCurrency = () => {
    const next = currency === "BDT" ? "USD" : "BDT";
    setCurrency(next);
  };

  const formatPrice = (amountBDT: number) => formatPriceUtil(amountBDT, currency);
  const formatPriceRange = (minBDT: number, maxBDT: number) =>
    formatPriceRangeUtil(minBDT, maxBDT, currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        formatPriceRange,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
