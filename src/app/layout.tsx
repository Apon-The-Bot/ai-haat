import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "AI Haat - Premium Digital Products Marketplace",
  description: "Get trusted AI tools, developer software subscriptions, VPNs, and cloud storage at unbeatable prices in Bangladesh.",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between bg-white text-[#1A1D26] selection:bg-[#FC5C03] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
