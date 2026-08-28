import type { Metadata } from "next";
import { Hind_Siliguri, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SITE_URL } from "@/lib/seo";

const hindSiliguri = Hind_Siliguri({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-hind-siliguri",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Haat — Bangladesh's #1 Digital Products & Software Marketplace",
    template: "%s | AI Haat",
  },
  description:
    "Buy premium AI subscriptions (ChatGPT Plus, Claude, Midjourney), VPNs, Windows licenses, developer tools & digital accounts at lowest BDT prices with instant delivery in Bangladesh.",
  keywords: [
    "AI Tools Bangladesh",
    "ChatGPT Plus buy BD",
    "Claude Pro bKash",
    "Midjourney subscription BD",
    "Windows 11 Pro Retail Key BD",
    "Office 365 Genuine BD",
    "NordVPN buy BD",
    "Google One 2TB BD",
    "Digital Goods Bangladesh",
    "AI Haat",
  ],
  authors: [{ name: "AI Haat Engineering Team", url: SITE_URL }],
  creator: "AI Haat",
  publisher: "AI Haat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "AI Haat — Premium Digital Products & AI Marketplace in Bangladesh",
    description:
      "Instant delivery of ChatGPT Plus, Claude, Midjourney, Windows Keys, VPNs, and OTT subscriptions in BDT with bKash & Nagad.",
    url: SITE_URL,
    siteName: "AI Haat",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Haat Marketplace",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Haat — Premium Digital Products & Software Marketplace",
    description:
      "Get verified software licenses, AI subscriptions, and developer tools in Bangladesh with instant delivery in BDT.",
    images: ["/images/og-image.png"],
    creator: "@aihaat_bd",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col justify-between bg-white text-[#1A1D26] selection:bg-[#FC5C03] selection:text-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
