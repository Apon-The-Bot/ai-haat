import React from "react";
import type { Metadata } from "next";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { requireAdmin, requireAdminMfa } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Admin Portal | AI Haat",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const requestedPath = requestHeaders.get("x-admin-path") || "/admin";
  const destination = requestedPath.startsWith("/admin") ? requestedPath : "/admin";
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) {
    if (admin.status === 401) redirect(`/login?callbackUrl=${encodeURIComponent(destination)}`);
    redirect("/dashboard");
  }
  // Enrollment must remain reachable before an administrator has configured MFA.
  if (destination.split("?")[0] !== "/admin/mfa-setup") {
    const mfa = await requireAdminMfa();
    if (mfa instanceof NextResponse) {
      const failure = await mfa.json();
      if (failure.code === "MFA_ENROLLMENT_REQUIRED") redirect("/admin/mfa-setup");
      if (failure.code === "MFA_REQUIRED") {
        redirect(`/auth/verify?callbackUrl=${encodeURIComponent(destination)}`);
      }
      throw new Error("Unable to verify administrator access");
    }
  }
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
