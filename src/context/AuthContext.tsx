"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { useToast } from "@/context/ToastContext";

interface AuthContextType {
  user: User | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  login: (phoneOrEmail: string) => void;
  register: (name: string, email: string, phone: string) => void;
  logout: () => void;
  rechargeWallet: (amountBDT: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("aihaat_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Provide a default demo logged-in profile if desired or start with guest
        const defaultUser: User = {
          id: "usr_10928",
          name: "Sabbir Hossain",
          email: "sabbir.aihaat@gmail.com",
          phone: "+8801712345678",
          walletBalanceBDT: 1540,
          isReseller: false,
        };
        setUser(defaultUser);
        localStorage.setItem("aihaat_user", JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const openLoginModal = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthMode("register");
    setIsAuthModalOpen(true);
  };

  const login = (phoneOrEmail: string) => {
    const loggedUser: User = {
      id: `usr_${Date.now().toString().slice(-5)}`,
      name: phoneOrEmail.includes("@") ? phoneOrEmail.split("@")[0] : "AI Haat Member",
      email: phoneOrEmail.includes("@") ? phoneOrEmail : `${phoneOrEmail}@user.aihaat.com`,
      phone: phoneOrEmail.includes("@") ? "+8801700000000" : phoneOrEmail,
      walletBalanceBDT: 2500,
      isReseller: false,
    };
    setUser(loggedUser);
    localStorage.setItem("aihaat_user", JSON.stringify(loggedUser));
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${loggedUser.name}!`, "success");
  };

  const register = (name: string, email: string, phone: string) => {
    const newUser: User = {
      id: `usr_${Date.now().toString().slice(-5)}`,
      name,
      email,
      phone,
      walletBalanceBDT: 50, // Welcome bonus
      isReseller: false,
    };
    setUser(newUser);
    localStorage.setItem("aihaat_user", JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    showToast(`Account created! ৳50 Welcome bonus added to your wallet.`, "success");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aihaat_user");
    showToast("Logged out successfully", "info");
  };

  const rechargeWallet = (amountBDT: number) => {
    if (!user) return;
    const updated = {
      ...user,
      walletBalanceBDT: user.walletBalanceBDT + amountBDT,
    };
    setUser(updated);
    localStorage.setItem("aihaat_user", JSON.stringify(updated));
    showToast(`Recharge successful! Added ৳${amountBDT.toLocaleString()} to wallet.`, "success");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        openLoginModal,
        openRegisterModal,
        login,
        register,
        logout,
        rechargeWallet,
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
