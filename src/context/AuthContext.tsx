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
  mfaRequired: boolean;
  mfaVerified: boolean;
  isMfaPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [redirectCallbackUrl, setRedirectCallbackUrl] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const { showToast } = useToast();

  const isMfaPending = mfaRequired && !mfaVerified;

  const refreshUser = useCallback(async () => {
    try {
      const email = user?.email || session?.user?.email;
      if (!email) return;

      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser((prev) => {
            const next = {
              ...(prev || {}),
              ...data.user,
            };
            if (typeof window !== "undefined") {
              localStorage.setItem("aihaat_user", JSON.stringify(next));
            }
            return next;
          });
        }
        if (data.mfaRequired !== undefined) {
          setMfaRequired(!!data.mfaRequired);
        } else if (data.totpEnabled !== undefined) {
          setMfaRequired(!!data.totpEnabled);
        }
        if (data.mfaVerified !== undefined) {
          setMfaVerified(!!data.mfaVerified);
        }
      }
    } catch (e) {
      console.debug("Refresh user error:", e);
    }
  }, [user?.email, session?.user?.email]);

  // Sync NextAuth Google session with AuthContext
  useEffect(() => {
    if (session?.user) {
      const sessionUser = session.user;
      setUser((prev) => ({
        id: (sessionUser as any).id || prev?.id || `google-${sessionUser.email}`,
        name: sessionUser.name || prev?.name || "AI Haat Member",
        email: sessionUser.email || prev?.email || "",
        phone: prev?.phone || "",
        avatar: sessionUser.image || prev?.avatar || undefined,
        role: (sessionUser as any).role || "USER",
        walletBalanceBDT: prev?.walletBalanceBDT ?? (sessionUser as any).walletBalanceBDT ?? 0,
      }));
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
    openLoginModal(redirectUrl);
  };

  const register = (name: string, email: string, phone: string, redirectUrl?: string) => {
    openRegisterModal(redirectUrl);
  };

  const logout = async () => {
    try {
      await fetch('/api/security/sessions/revoke', { method: 'POST' });
    } catch (e) {
      console.debug("Logout session revoke error:", e);
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("aihaat_user");
      sessionStorage.clear();
    }
    try {
      await signOut({ callbackUrl: "/", redirect: true });
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
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
        mfaRequired,
        mfaVerified,
        isMfaPending,
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
