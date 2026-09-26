import React from "react";
import type { Metadata } from "next";
import { ComparisonView } from "@/components/compare/ComparisonView";

export const metadata: Metadata = {
  title: "AI Tools Comparison | ChatGPT vs Claude vs Midjourney | AI Haat",
  description:
    "Compare features, pricing in BDT, context limits, and capabilities of ChatGPT Plus, Claude Pro, Midjourney, Canva Pro, and GitHub Copilot in Bangladesh.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <ComparisonView />
    </div>
  );
}
