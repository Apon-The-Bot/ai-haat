import React from "react";
import type { Metadata } from "next";
import { ReferralHubClient } from "@/components/dashboard/ReferralHubClient";

export const metadata: Metadata = {
  title: "Give ৳৫০, Get ৳৫০ — রেফার ও ফ্রি এআই রিওয়ার্ডস | AI Haat",
  description: "বন্ধুদের রেফার করে ফ্রি এআই টুলস, ৫০০ রিওয়ার্ড কয়েন ও ১০০ টাকা ওয়ালেট ক্যাশব্যাক জিতে নিন।",
};

export default function ReferralsDashboardPage() {
  return (
    <div className="space-y-6">
      <ReferralHubClient />
    </div>
  );
}
