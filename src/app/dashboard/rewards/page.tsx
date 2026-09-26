import React from "react";
import type { Metadata } from "next";
import { RewardsClubView } from "@/components/dashboard/RewardsClubView";

export const metadata: Metadata = {
  title: "রিওয়ার্ডস ক্লাব ও কয়েন | AI Haat",
  description: "আপনার অর্জিত এআই হাট কয়েন দিয়ে এক্সক্লুসিভ ডিসকাউন্ট কুপন রিডিম করুন।",
};

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <RewardsClubView />
    </div>
  );
}
