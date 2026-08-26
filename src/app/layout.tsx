import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthModal } from "@/components/AuthModal";

export const metadata: Metadata = {
  title: "AI Haat - Premium Digital Products Marketplace",
  description: "Get trusted AI tools, software subscriptions, VPNs, and game top-ups at unbeatable prices in Bangladesh.",
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
        <ToastProvider>
          <CurrencyProvider>
            <CartProvider>
              <AuthProvider>
                <Header />
                <main className="flex-1 w-full bg-white">{children}</main>
                <Footer />
                <CartDrawer />
                <AuthModal />
              </AuthProvider>
            </CartProvider>
          </CurrencyProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
