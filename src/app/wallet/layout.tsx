import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet Recharge & Balance | AI Haat",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
