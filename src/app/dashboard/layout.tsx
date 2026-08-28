import React from "react";
import type { Metadata } from "next";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export const metadata: Metadata = {
  title: "Customer Dashboard | AI Haat",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
