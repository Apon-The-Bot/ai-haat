"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { User } from "@/types";
import { useToast } from "@/context/ToastContext";

interface AuthContextType {
  user: User | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  redirectCallbackUrl: string | null;
  setRedirectCallbackUrl: (url: string | null) => void;
  openLoginModal: (redirectUrl?: any) => void;
  openRegisterModal: (redirectUrl?: any) => void;
  login: (phoneOrEmail: string, redirectUrl?: string) => void;
  register: (name: string, email: string, phone: string, redirectUrl?: string) => void;
  logout: () => void;
  rechargeWallet: (amountBDT: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [redirectCallbackUrl, setRedirectCallbackUrl] = useState<string | null>(null);
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const email = user?.email || session?.user?.email;
      if (!email) return;

      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser((prev) => ({
            ...(prev || {}),
            ...data.user,
          }));
          localStorage.setItem("aihaat_user", JSON.stringify(data.user));
        }
      }
    } catch (e) {
      console.debug("Refresh user error:", e);
    }
  }, [user?.email, session?.user?.email]);

  // Sync NextAuth Google session with AuthContext
  useEffect(() => {
    if (session?.user) {
      const email = session.user.email?.toLowerCase() || "";
      const isAdmin =
        (session.user as any).role === "ADMIN" ||
        email === "mdamanullahsheikhapon@gmail.com" ||
        email === "admin@aihaat.com";

      const googleUser: User = {
        id: (session.user as any).id || `google-${email}`,
        name: session.user.name || "AI Haat Member",
        email: session.user.email || "",
        phone: "",
        avatar: session.user.image || undefined,
        role: isAdmin ? "ADMIN" : "USER",
        walletBalanceBDT: (session.user as any).walletBalanceBDT || 0,
      };

      setUser(googleUser);
      localStorage.setItem("aihaat_user", JSON.stringify(googleUser));
      refreshUser();
    } else {
      try {
        const savedUser = localStorage.getItem("aihaat_user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [session, refreshUser]);

  const openLoginModal = (redirectUrl?: any) => {
    setRedirectCallbackUrl(typeof redirectUrl === "string" ? redirectUrl : null);
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = (redirectUrl?: any) => {
    setRedirectCallbackUrl(typeof redirectUrl === "string" ? redirectUrl : null);
    setAuthMode("register");
    setIsAuthModalOpen(true);
  };

  const login = (phoneOrEmail: string, redirectUrl?: string) => {
    const email = phoneOrEmail.toLowerCase();
    const isAdmin =
      email === "mdamanullahsheikhapon@gmail.com" ||
      email === "admin@aihaat.com";

    const loggedUser: User = {
      id: `usr_${Date.now().toString().slice(-5)}`,
      name: email.includes("@") ? email.split("@")[0] : "AI Haat Member",
      email: email.includes("@") ? email : `${email}@user.aihaat.com`,
      phone: email.includes("@") ? "" : email,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: isAdmin ? "ADMIN" : "USER",
      walletBalanceBDT: 0,
    };
    setUser(loggedUser);
    localStorage.setItem("aihaat_user", JSON.stringify(loggedUser));
    setIsAuthModalOpen(false);
    showToast(`স্বাগতম, ${loggedUser.name}!`, "success");

    const target = redirectUrl || redirectCallbackUrl;
    if (target && typeof window !== "undefined") {
      window.location.href = target;
    }
  };

  const register = (name: string, email: string, phone: string, redirectUrl?: string) => {
    const isAdmin = email.toLowerCase() === "mdamanullahsheikhapon@gmail.com";
    const newUser: User = {
      id: `usr_${Date.now().toString().slice(-5)}`,
      name,
      email,
      phone,
      role: isAdmin ? "ADMIN" : "USER",
      walletBalanceBDT: 0,
    };
    setUser(newUser);
    localStorage.setItem("aihaat_user", JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    showToast(`অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!`, "success");

    const target = redirectUrl || redirectCallbackUrl;
    if (target && typeof window !== "undefined") {
      window.location.href = target;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("aihaat_user");
    try {
      await signOut({ redirect: false });
    } catch {}
    showToast("লগআউট সম্পন্ন হয়েছে", "info");
  };

  const rechargeWallet = (amountBDT: number) => {
    if (!user) return;
    const updated = {
      ...user,
      walletBalanceBDT: user.walletBalanceBDT + amountBDT,
    };
    setUser(updated);
    localStorage.setItem("aihaat_user", JSON.stringify(updated));
    showToast(`৳${amountBDT.toLocaleString()} ওয়ালেটে যোগ হয়েছে।`, "success");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        redirectCallbackUrl,
        setRedirectCallbackUrl,
        openLoginModal,
        openRegisterModal,
        login,
        register,
        logout,
        rechargeWallet,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
