"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Currency } from "@/types";
import {
  formatPrice as formatPriceUtil,
  formatPriceRange as formatPriceRangeUtil,
  convertBDTtoUSD as convertBDTtoUSDUtil,
  BDT_PER_USD,
} from "@/utils/currency";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (amountBDT: number | string | undefined | null) => string;
  formatPriceRange: (minBDT: number, maxBDT: number) => string;
  convertBDTtoUSD: (bdt: number) => number;
  rate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("BDT");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aihaat_currency") as Currency;
      if (saved === "BDT" || saved === "USD") {
        setCurrencyState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("aihaat_currency", c);
    } catch {
      // Ignore localStorage errors
    }
  };

  const toggleCurrency = () => {
    const next = currency === "BDT" ? "USD" : "BDT";
    setCurrency(next);
  };

  const formatPrice = (amountBDT: number | string | undefined | null) =>
    formatPriceUtil(amountBDT, currency);

  const formatPriceRange = (minBDT: number, maxBDT: number) =>
    formatPriceRangeUtil(minBDT, maxBDT, currency);

  const convertBDTtoUSD = (bdt: number) => convertBDTtoUSDUtil(bdt);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        formatPriceRange,
        convertBDTtoUSD,
        rate: BDT_PER_USD,
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
