"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { playOrderChime, playSuccessChime } from "@/utils/audio";

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "DELIVERY" | "WALLET" | "SYSTEM";
  date: string;
  isRead: boolean;
  link: string;
}

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Omit<InAppNotification, "id" | "date" | "isRead">) => void;
  requestPushPermission: () => Promise<boolean>;
  pushPermission: NotificationPermission | "default";
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "default">("default");

  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const knownDeliveredIdsRef = useRef<Set<string>>(new Set());
  const isFirstPollRef = useRef(true);

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.email === "mdamanullahsheikhapon@gmail.com" ||
    user?.email === "admin@aihaat.com";

  // Check browser Notification API permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      return perm === "granted";
    } catch {
      return false;
    }
  };

  const triggerBrowserPush = (title: string, body: string, url?: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notif = new Notification(title, {
          body,
          icon: "/images/logo.png",
          badge: "/images/logo.png",
        });
        if (url) {
          notif.onclick = () => {
            window.focus();
            window.location.href = url;
          };
        }
      } catch (e) {
        console.debug("Browser push notification error:", e);
      }
    }
  };

  const addNotification = (n: Omit<InAppNotification, "id" | "date" | "isRead">) => {
    const newItem: InAppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Real-Time Poller for Admin & User
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollOrders = async () => {
      try {
        // If admin, fetch all orders. If customer, fetch user orders.
        const endpoint = isAdmin
          ? "/api/orders"
          : user?.email
          ? `/api/orders?email=${encodeURIComponent(user.email)}`
          : null;

        if (!endpoint) return;

        const res = await fetch(endpoint);
        if (!res.ok) return;

        const data = await res.json();
        const orders: any[] = data.orders || [];

        if (isFirstPollRef.current) {
          // Initialize known orders without ringing on page load
          orders.forEach((o) => {
            const id = o.orderNumber || o.id;
            knownOrderIdsRef.current.add(id);
            if (o.deliveryStatus === "Delivered" || o.deliveryStatus === "DELIVERED") {
              knownDeliveredIdsRef.current.add(id);
            }
          });
          isFirstPollRef.current = false;
          return;
        }

        // 1. ADMIN CHECK: Detect newly placed orders
        if (isAdmin) {
          orders.forEach((o) => {
            const id = o.orderNumber || o.id;
            if (!knownOrderIdsRef.current.has(id)) {
              knownOrderIdsRef.current.add(id);

              // Sound Chime!
              playOrderChime();

              // Toast + In-App Notification
              showToast(`🔔 নতুন অর্ডার এসেছে! (#${id}) - ৳${o.totalBDT || 0}`, "success");
              addNotification({
                title: `নতুন অর্ডার: #${id}`,
                message: `${o.customerName || "Customer"} ৳${o.totalBDT || 0} মূল্যের অর্ডার প্লেস করেছেন।`,
                type: "ORDER",
                link: `/admin/orders`,
              });

              // Browser Push
              triggerBrowserPush(
                `🔔 AI Haat: নতুন অর্ডার (#${id})`,
                `${o.customerName} - ৳${o.totalBDT} (${o.paymentMethod || "Gateway"})`,
                `/admin/orders`
              );
            }
          });
        }

        // 2. USER CHECK: Detect delivery completion
        if (user && !isAdmin) {
          orders.forEach((o) => {
            const id = o.orderNumber || o.id;
            const isDelivered = o.deliveryStatus === "Delivered" || o.deliveryStatus === "DELIVERED";
            if (isDelivered && !knownDeliveredIdsRef.current.has(id)) {
              knownDeliveredIdsRef.current.add(id);

              // Success Chime!
              playSuccessChime();

              // Toast + In-App Notification
              showToast(`🎉 আপনার অর্ডার #${id} সফলভাবে ডেলিভারি হয়েছে!`, "success");
              addNotification({
                title: `অর্ডার #${id} ডেলিভারি সম্পন্ন!`,
                message: `আপনার ডিজিটাল কি / সাবস্ক্রিপশন ডেলিভারি হয়েছে। ভল্ট থেকে অ্যাক্সেস করুন।`,
                type: "DELIVERY",
                link: `/dashboard/keys`,
              });

              // Browser Push
              triggerBrowserPush(
                `🎉 AI Haat: অর্ডার ডেলিভারি সম্পন্ন!`,
                `আপনার অর্ডার #${id} এর ক্রেডেনশিয়াল প্রস্তুত রয়েছে।`,
                `/dashboard/keys`
              );
            }
          });
        }
      } catch (err) {
        console.debug("Order poller error:", err);
      }
    };

    // Run poll every 4.5 seconds
    intervalId = setInterval(pollOrders, 4500);
    pollOrders();

    return () => clearInterval(intervalId);
  }, [user, isAdmin]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        requestPushPermission,
        pushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return ctx;
}
