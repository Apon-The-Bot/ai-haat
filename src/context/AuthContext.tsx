"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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
  const { data: session, status } = useSession();
  const sessionUser = session?.user as (NonNullable<typeof session>["user"] & {
    id?: string;
    role?: User["role"];
    walletBalanceBDT?: number;
  }) | undefined;
  const accountId = status === "authenticated" ? sessionUser?.id : undefined;
  const refreshVersion = useRef(0);
  const signingOut = useRef(false);
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
      if (!accountId || signingOut.current) return;
      const version = ++refreshVersion.current;

      const res = await fetch("/api/auth/me", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (version !== refreshVersion.current || data.user?.id !== accountId) return;
        setUser({ ...data.user, avatar: data.user.avatar ?? undefined });
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
  }, [accountId]);

  // Sync NextAuth Google session with AuthContext
  useEffect(() => {
    if (accountId && sessionUser && !signingOut.current) {
      setUser((prev) => prev?.id === accountId ? prev : {
        id: accountId,
        name: sessionUser.name || "AI Haat Member",
        email: sessionUser.email || "",
        phone: "",
        avatar: sessionUser.image ?? undefined,
        role: sessionUser.role || "USER",
        walletBalanceBDT: sessionUser.walletBalanceBDT ?? 0,
      });
      refreshUser();
    } else {
      setUser(null);
      setMfaRequired(false);
      setMfaVerified(false);
    }
    return () => { refreshVersion.current++; };
  }, [accountId, sessionUser, refreshUser]);

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
    if (signingOut.current) return;
    signingOut.current = true;
    refreshVersion.current++;
    try {
      await fetch('/api/security/sessions/revoke', {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });
    } catch (e) {
      console.debug("Logout session revoke error:", e);
    }
    try {
      await signOut({ callbackUrl: "/", redirect: false });
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (!response.ok || (await response.json())?.user) {
        throw new Error("Session still active");
      }
      setUser(null);
      window.location.assign("/");
    } catch {
      signingOut.current = false;
      showToast("Could not confirm sign-out. Please try again.", "error");
    }
  };

  const rechargeWallet = (amountBDT: number) => {
    if (!user) return;
    const updated = {
      ...user,
      walletBalanceBDT: user.walletBalanceBDT + amountBDT,
    };
    setUser(updated);
    showToast(`৳${amountBDT.toLocaleString()} ওয়ালেটে যোগ হয়েছে।`, "success");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user?.id === accountId ? user : null,
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
