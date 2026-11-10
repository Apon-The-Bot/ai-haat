"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  Copy,
  X,
  RefreshCw,
  Clock,
  Plus,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  Ban,
  Lock,
  Unlock,
  Tag,
  Coins,
  SlidersHorizontal,
  KeyRound,
  FileText,
  Activity,
  Smartphone,
  Laptop,
  Share2,
  Trash2,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Globe,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import UserIntelligencePanel from "@/components/admin/UserIntelligencePanel";

interface UserProfile360 {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  image: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;

  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "RESTRICTED" | "PENDING_VERIFICATION" | "DEACTIVATED";
  statusReason: string | null;
  statusExpiresAt: string | null;
  statusHistory: Array<{
    id: string;
    status: string;
    reason: string;
    internalNote?: string;
    adminEmail: string;
    durationHours?: number;
    expiresAt: string | null;
    createdAt: string;
    isActive: boolean;
  }>;

  walletBalanceBDT: number;
  lifetimeSpendBDT: number;
  lifetimeCreditsBDT: number;
  lifetimeDebitsBDT: number;
  totalRefundsBDT: number;
  totalOrdersCount: number;
  verifiedOrdersCount: number;

  coinBalance: number;
  lifetimeCoinsEarned: number;

  affiliate: {
    code: string;
    status: string;
    tier: string;
    totalClicks: number;
    totalOrdersCount: number;
    totalEarnedBDT: number;
    earningsBalanceBDT: number;
  } | null;

  security: {
    isMfaEnabled: boolean;
    totpEnabledAt: string | null;
    activeSessionsCount: number;
    activeMfaSessionsCount: number;
    trustedDevices: Array<{
      id: string;
      name: string;
      lastUsedAt: string;
      isRevoked: boolean;
    }>;
  };

  tags: string[];
  adminNotes: Array<{
    id: string;
    note: string;
    category: string;
    adminEmail: string;
    createdAt: string;
  }>;

  features: Array<{
    key: string;
    name: string;
    description: string;
    category: string;
    isAllowed: boolean;
    restriction: {
      id: string;
      reason: string;
      adminNote?: string;
      spendingLimitBDT?: number;
      dailyLimitBDT?: number;
      expiresAt: string | null;
      createdAt: string;
    } | null;
  }>;

  orders: Array<{
    id: string;
    orderNumber: string;
    totalBDT: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryStatus: string;
    createdAt: string;
    items: Array<{
      id: string;
      productName: string;
      variationName: string;
      quantity: number;
      priceBDT: number;
    }>;
  }>;

  transactions: Array<{
    id: string;
    amountBDT: number;
    type: string;
    method: string;
    trxId: string;
    status: string;
    createdAt: string;
  }>;

  deliveredKeys: Array<{
    id: string;
    orderId: string;
    orderItemId: string | null;
    productName: string;
    accountType: string;
    maskedValue: string;
    deliveredAt: string;
    isReplacement: boolean;
  }>;

  activityLogs: Array<{
    id: string;
    eventType: string;
    category: string;
    description: string;
    metadata: any;
    ipAddress?: string;
    createdAt: string;
  }>;
}

export default function User360DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserProfile360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "personal"
    | "status"
    | "features"
    | "wallet"
    | "orders"
    | "digital"
    | "loyalty"
    | "security"
    | "notes"
    | "activity"
    | "intelligence"
  >("overview");

  // Edit Personal Information state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "USER",
    image: "",
  });
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  // Status Action Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"ACTIVE" | "SUSPENDED" | "BANNED">("SUSPENDED");
  const [statusReason, setStatusReason] = useState("");
  const [suspensionDurationHours, setSuspensionDurationHours] = useState("24");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Feature Restriction Modal
  const [restrictionModalFeature, setRestrictionModalFeature] = useState<any | null>(null);
  const [restrictionReason, setRestrictionReason] = useState("");
  const [restrictionSpendingLimit, setRestrictionSpendingLimit] = useState("");
  const [restrictionDurationHours, setRestrictionDurationHours] = useState("");
  const [isUpdatingRestriction, setIsUpdatingRestriction] = useState(false);

  // Wallet Adjustment Modal
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletType, setWalletType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [isAdjustingWallet, setIsAdjustingWallet] = useState(false);

  // Credential Reveal State
  const [revealingKeyId, setRevealingKeyId] = useState<string | null>(null);
  const [revealReason, setRevealReason] = useState("");
  const [revealedCredentials, setRevealedCredentials] = useState<Record<string, string>>({});
  const [isRevealing, setIsRevealing] = useState(false);

  // Admin Note State
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("GENERAL");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Tags State
  const [tagInput, setTagInput] = useState("");
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setEditForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone === "N/A" ? "" : data.user.phone || "",
          role: data.user.role || "USER",
          image: data.user.image || "",
        });
      } else {
        showToast(data.error || "Customer profile not found", "error");
      }
    } catch (err) {
      console.error("[User 360 Fetch Error]:", err);
      showToast("Error retrieving customer profile", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // 1. Save Personal Information
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingPersonal(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Personal details updated successfully", "success");
        fetchUserData();
      } else {
        showToast(data.error || "Update failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update", "error");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // 2. Submit Status Change
  const handleStatusChange = async () => {
    if (targetStatus !== "ACTIVE" && !statusReason.trim()) {
      showToast("Mandatory justification reason required", "error");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          reason: statusReason.trim() || "Status restored by administrator",
          durationHours: targetStatus === "SUSPENDED" ? parseInt(suspensionDurationHours, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Account status updated to ${targetStatus}`, "success");
        setStatusModalOpen(false);
        setStatusReason("");
        fetchUserData();
      } else {
        showToast(data.error || "Failed to change status", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error modifying status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 3. Toggle or Set Feature Restriction
  const handleToggleRestriction = async (featureKey: string, currentAllowed: boolean) => {
    if (currentAllowed) {
      // Opening restriction dialog
      const feat = user?.features.find((f) => f.key === featureKey);
      setRestrictionModalFeature(feat);
      setRestrictionReason("");
      setRestrictionSpendingLimit("");
      setRestrictionDurationHours("");
    } else {
      // Direct removal
      try {
        const res = await fetch(`/api/admin/users/${userId}/restrictions?featureKey=${featureKey}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(`Restriction on ${featureKey} removed`, "success");
          fetchUserData();
        } else {
          showToast(data.error || "Failed to lift restriction", "error");
        }
      } catch (err: any) {
        showToast(err.message || "Error", "error");
      }
    }
  };

  const handleSaveRestriction = async () => {
    if (!restrictionModalFeature) return;
    if (!restrictionReason.trim()) {
      showToast("Mandatory justification reason is required", "error");
      return;
    }

    try {
      setIsUpdatingRestriction(true);
      const res = await fetch(`/api/admin/users/${userId}/restrictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureKey: restrictionModalFeature.key,
          isRestricted: true,
          reason: restrictionReason.trim(),
          spendingLimitBDT: restrictionSpendingLimit ? parseFloat(restrictionSpendingLimit) : undefined,
          durationHours: restrictionDurationHours ? parseInt(restrictionDurationHours, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Restriction applied to ${restrictionModalFeature.name}`, "success");
        setRestrictionModalFeature(null);
        fetchUserData();
      } else {
        showToast(data.error || "Failed to apply restriction", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to apply", "error");
    } finally {
      setIsUpdatingRestriction(false);
    }
  };

  // 4. Wallet Adjustment
  const handleWalletSubmit = async () => {
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    if (!walletReason.trim()) {
      showToast("Mandatory financial reason required", "error");
      return;
    }

    try {
      setIsAdjustingWallet(true);
      const res = await fetch(`/api/admin/users/${userId}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: walletType,
          amountBDT: amount,
          category: walletType === "CREDIT" ? "BONUS" : "MANUAL_ADJUSTMENT",
          reason: walletReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Wallet ${walletType === "CREDIT" ? "credited" : "debited"} successfully`, "success");
        setWalletModalOpen(false);
        setWalletAmount("");
        setWalletReason("");
        fetchUserData();
      } else {
        showToast(data.error || "Adjustment failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Wallet error", "error");
    } finally {
      setIsAdjustingWallet(false);
    }
  };

  // 5. Credential Reveal
  const handleRevealCredential = async () => {
    if (!revealingKeyId || !revealReason.trim()) {
      showToast("Mandatory justification reason is required", "error");
      return;
    }

    try {
      setIsRevealing(true);
      const res = await fetch(`/api/admin/users/${userId}/reveal-credential`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveredKeyId: revealingKeyId,
          reason: revealReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRevealedCredentials((prev) => ({
          ...prev,
          [revealingKeyId]: data.secretValue,
        }));
        showToast("Credential revealed & high-priority audit log created", "success");
        setRevealingKeyId(null);
        setRevealReason("");
      } else {
        showToast(data.error || "Reveal failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Reveal error", "error");
    } finally {
      setIsRevealing(false);
    }
  };

  // 6. Revoke All Sessions
  const handleRevokeAllSessions = async () => {
    if (!confirm("Are you sure you want to terminate all active sessions for this customer?")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/sessions`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "All sessions revoked", "success");
        fetchUserData();
      } else {
        showToast(data.error || "Failed to revoke sessions", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error revoking sessions", "error");
    }
  };

  // 7. Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      setIsSavingNote(true);
      const res = await fetch(`/api/admin/users/${userId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: newNoteText.trim(),
          category: newNoteCategory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Administrative note saved", "success");
        setNewNoteText("");
        fetchUserData();
      } else {
        showToast(data.error || "Failed to save note", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error saving note", "error");
    } finally {
      setIsSavingNote(false);
    }
  };

  // 8. Add Tag
  const handleAddTag = async () => {
    if (!tagInput.trim() || !user) return;
    const cleanTag = tagInput.trim().toUpperCase();
    if (user.tags.includes(cleanTag)) {
      setTagInput("");
      return;
    }

    const newTags = [...user.tags, cleanTag];
    try {
      setIsUpdatingTags(true);
      const res = await fetch(`/api/admin/users/${userId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Tag '${cleanTag}' added`, "success");
        setTagInput("");
        fetchUserData();
      } else {
        showToast(data.error || "Failed to update tags", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error", "error");
    } finally {
      setIsUpdatingTags(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!user) return;
    const newTags = user.tags.filter((t) => t !== tagToRemove);
    try {
      const res = await fetch(`/api/admin/users/${userId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
      if (res.ok) {
        showToast(`Tag '${tagToRemove}' removed`, "success");
        fetchUserData();
      }
    } catch {}
  };

  if (loading && !user) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FC5C03] mb-3" />
        <p className="font-bold text-gray-900">Loading Customer 360° Profile...</p>
        <p className="text-xs text-gray-500 mt-1">Aggregating transactions, entitlements, and orders</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-24 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Customer Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">This user account could not be retrieved.</p>
        <Link
          href="/admin/users"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation & Quick Profile Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/users"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors shrink-0"
              title="Back to Customers"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FC5C03] to-[#FF8C4B] text-white font-extrabold flex items-center justify-center text-xl shrink-0 shadow-md">
              {user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : user.email.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    user.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : user.status === "SUSPENDED"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {user.status}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                  {user.role}
                </span>
                {user.security.isMfaEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    2FA Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span>{user.email}</span>
                <span>•</span>
                <span>{user.phone}</span>
                <span>•</span>
                <span>Member since {user.createdAt.split("T")[0]}</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-gray-400">ID: {user.id}</span>
              </div>

              {/* Tags Row */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {user.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <span>{t}</span>
                    <button onClick={() => handleRemoveTag(t)} className="text-gray-400 hover:text-red-600">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="+ Tag..."
                    className="w-16 px-1.5 py-0.5 text-[10px] border border-gray-200 rounded outline-none focus:w-24 focus:border-[#FC5C03] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setWalletType("CREDIT");
                setWalletModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>± Adjust Wallet</span>
            </button>

            <button
              onClick={() => {
                setTargetStatus(user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE");
                setStatusModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Change Status</span>
            </button>

            <button
              onClick={handleRevokeAllSessions}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              title="Log user out from all devices"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Revoke Sessions</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Financial & Engagement KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Wallet Balance</p>
          <p className="text-lg font-black text-gray-900 mt-1">{formatPrice(user.walletBalanceBDT)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Credits: {formatPrice(user.lifetimeCreditsBDT)}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Lifetime Spend</p>
          <p className="text-lg font-black text-[#FC5C03] mt-1">{formatPrice(user.lifetimeSpendBDT)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Verified Gross Volume</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
          <p className="text-lg font-black text-gray-900 mt-1">{user.totalOrdersCount}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{user.verifiedOrdersCount} Verified</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Refunds</p>
          <p className="text-lg font-black text-rose-600 mt-1">{formatPrice(user.totalRefundsBDT)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Completed Refunds</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Loyalty Coins</p>
          <p className="text-lg font-black text-amber-600 mt-1">{user.coinBalance}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Lifetime: {user.lifetimeCoinsEarned}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Referral Program</p>
          <p className="text-lg font-black text-purple-700 mt-1">
            {user.affiliate ? formatPrice(user.affiliate.totalEarnedBDT) : "0 BDT"}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {user.affiliate ? `${user.affiliate.totalOrdersCount} Referred` : "Not Enrolled"}
          </p>
        </div>
      </div>

      {/* 3. Tabbed Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200">
        {[
          { key: "overview", label: "Overview", icon: Users },
          { key: "personal", label: "Personal Info", icon: UserCheck },
          { key: "status", label: "Account Status", icon: ShieldAlert },
          { key: "features", label: "Feature Entitlements", icon: SlidersHorizontal },
          { key: "wallet", label: "Wallet & Ledger", icon: Wallet },
          { key: "orders", label: "Orders & Purchases", icon: ShoppingBag },
          { key: "digital", label: "Digital Products", icon: KeyRound },
          { key: "loyalty", label: "Loyalty & Referrals", icon: Coins },
          { key: "security", label: "Sessions & Security", icon: ShieldCheck },
          { key: "intelligence", label: "User Intelligence", icon: Globe },
          { key: "notes", label: "Admin Notes", icon: FileText },
          { key: "activity", label: "Activity Logs", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#FC5C03] text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Panels */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Overview Card */}
              <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm">Customer Profile Overview</h3>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-gray-500">Full Name:</span>
                  <span className="font-bold text-gray-900">{user.name}</span>

                  <span className="text-gray-500">Email Address:</span>
                  <span className="font-semibold text-gray-900">{user.email}</span>

                  <span className="text-gray-500">Phone Number:</span>
                  <span className="font-semibold text-gray-900">{user.phone}</span>

                  <span className="text-gray-500">Account Status:</span>
                  <div>
                    <span className="font-bold text-emerald-700">{user.status}</span>
                  </div>

                  <span className="text-gray-500">Role:</span>
                  <span className="font-bold text-gray-900">{user.role}</span>

                  <span className="text-gray-500">2-Factor Auth:</span>
                  <span className="font-semibold text-gray-900">
                    {user.security.isMfaEnabled ? "Enabled" : "Disabled"}
                  </span>

                  <span className="text-gray-500">Active Sessions:</span>
                  <span className="font-semibold text-gray-900">{user.security.activeSessionsCount}</span>
                </div>
              </div>

              {/* Active Restrictions Card */}
              <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Active Feature Restrictions</h3>
                  <button
                    onClick={() => setActiveTab("features")}
                    className="text-xs font-bold text-[#FC5C03] hover:underline"
                  >
                    Configure
                  </button>
                </div>

                {user.features.filter((f) => !f.isAllowed).length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-xs">
                    <Check className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="font-bold text-gray-800">No active restrictions</p>
                    <p className="text-[11px] text-gray-400">Customer has full access to all platform features.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {user.features
                      .filter((f) => !f.isAllowed)
                      .map((f) => (
                        <div
                          key={f.key}
                          className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-rose-900">{f.name}</p>
                            <p className="text-[11px] text-rose-700">{f.restriction?.reason}</p>
                          </div>
                          <button
                            onClick={() => handleToggleRestriction(f.key, false)}
                            className="px-2 py-1 bg-white border border-rose-300 text-rose-700 rounded-lg text-[10px] font-bold hover:bg-rose-100"
                          >
                            Restore
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-[#FC5C03] hover:underline"
                >
                  View All ({user.orders.length})
                </button>
              </div>

              {user.orders.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Order Number</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Delivery</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {user.orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-bold text-gray-900 font-mono">{o.orderNumber}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">{formatPrice(o.totalBDT)}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                o.paymentStatus === "VERIFIED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                              {o.deliveryStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-[11px]">{o.createdAt.split("T")[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL INFORMATION */}
        {activeTab === "personal" && (
          <form onSubmit={handleSavePersonal} className="max-w-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Edit Personal Information</h3>
            <p className="text-xs text-gray-500">
              Modifying these fields creates an immutable administrative audit record with before/after state comparison.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none font-medium"
                >
                  <option value="USER">Customer (USER)</option>
                  <option value="RESELLER">Reseller</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Profile Image URL</label>
                <input
                  type="text"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  placeholder="/uploads/... or https://..."
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingPersonal}
                className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#e05202] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isSavingPersonal ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ACCOUNT STATUS & ACCESS CONTROL */}
        {activeTab === "status" && (
          <div className="space-y-6">
            <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Effective Account Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : user.status === "SUSPENDED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {user.status}
                  </span>
                  {user.statusExpiresAt && (
                    <span className="text-xs text-gray-500">
                      (Expires on {new Date(user.statusExpiresAt).toLocaleString("bn-BD")})
                    </span>
                  )}
                </div>
                {user.statusReason && (
                  <p className="text-xs text-gray-700 mt-2 font-medium">
                    Reason: <span className="font-normal text-gray-600">{user.statusReason}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTargetStatus("ACTIVE");
                    setStatusModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Restore Active
                </button>
                <button
                  onClick={() => {
                    setTargetStatus("SUSPENDED");
                    setStatusModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Suspend Account
                </button>
                <button
                  onClick={() => {
                    setTargetStatus("BANNED");
                    setStatusModalOpen(true);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Ban Permanently
                </button>
              </div>
            </div>

            {/* Status Transition History */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Status Transition Audit Trail</h3>
              {user.statusHistory.length === 0 ? (
                <p className="text-xs text-gray-400 py-3">No status modifications recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Duration / Expiry</th>
                        <th className="py-2.5 px-3">Authorizing Admin</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {user.statusHistory.map((sh) => (
                        <tr key={sh.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-gray-900">{sh.status}</span>
                            {sh.isActive && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                                Current
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-gray-700 max-w-xs truncate">{sh.reason}</td>
                          <td className="py-2.5 px-3 text-gray-500">
                            {sh.durationHours ? `${sh.durationHours} Hours` : "Permanent / Manual"}
                          </td>
                          <td className="py-2.5 px-3 text-gray-700 font-medium">{sh.adminEmail}</td>
                          <td className="py-2.5 px-3 text-gray-400 text-[11px]">
                            {new Date(sh.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FEATURE ENTITLEMENTS & RESTRICTIONS */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Granular Feature Access Matrix</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Each switch toggles server-side authorization enforcement. Restricted features reject direct API requests
                at the backend layer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.features.map((feat) => {
                const isAllowed = feat.isAllowed;
                return (
                  <div
                    key={feat.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      isAllowed
                        ? "bg-white border-gray-200"
                        : "bg-rose-50/40 border-rose-200 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs">{feat.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-gray-100 text-gray-600">
                            {feat.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">{feat.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleRestriction(feat.key, isAllowed)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                          isAllowed ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            isAllowed ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {!isAllowed && feat.restriction && (
                      <div className="mt-3 p-2 bg-white rounded-xl border border-rose-100 text-[11px] text-rose-800 space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-rose-600" />
                          <span>Restricted: {feat.restriction.reason}</span>
                        </p>
                        {feat.restriction.spendingLimitBDT && (
                          <p className="text-gray-600">
                            Spending Cap: {formatPrice(Number(feat.restriction.spendingLimitBDT))}
                          </p>
                        )}
                        {feat.restriction.expiresAt && (
                          <p className="text-gray-400">
                            Expires: {new Date(feat.restriction.expiresAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: WALLET & FINANCIAL LEDGER */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#FC5C03] uppercase tracking-wider">Current Available Balance</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{formatPrice(user.walletBalanceBDT)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Lifetime Credits: {formatPrice(user.lifetimeCreditsBDT)} • Lifetime Debits:{" "}
                  {formatPrice(user.lifetimeDebitsBDT)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setWalletType("CREDIT");
                    setWalletModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                >
                  + Add Balance
                </button>
                <button
                  onClick={() => {
                    setWalletType("DEBIT");
                    setWalletModalOpen(true);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                >
                  - Deduct Balance
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Financial Transaction Ledger</h3>
              {user.transactions.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No transactions recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Reference / TrxID</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {user.transactions.map((t) => {
                        const isCredit = t.type === "DEPOSIT" || t.type === "BONUS" || t.type === "REFUND";
                        return (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{t.trxId}</td>
                            <td className="py-2.5 px-3 font-semibold text-gray-700">{t.type}</td>
                            <td className={`py-2.5 px-3 font-extrabold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                              {isCredit ? "+" : "-"}
                              {formatPrice(t.amountBDT)}
                            </td>
                            <td className="py-2.5 px-3 text-gray-600">{t.method}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 text-[11px]">
                              {new Date(t.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: ORDERS & PURCHASES */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Customer Order History</h3>
            {user.orders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No orders placed by this customer.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                    <tr>
                      <th className="py-3 px-3">Order Number</th>
                      <th className="py-3 px-3">Items Purchased</th>
                      <th className="py-3 px-3">Total Amount</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Delivery Status</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                        <td className="py-3 px-3 text-gray-700 max-w-xs">
                          {o.items.map((it) => `${it.productName} (${it.variationName}) x${it.quantity}`).join(", ")}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-gray-900">{formatPrice(o.totalBDT)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.paymentStatus === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                            {o.deliveryStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-500 text-[11px]">{o.createdAt.split("T")[0]}</td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={`/api/orders/${o.id}/invoice`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FC5C03] hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>PDF</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: DIGITAL PRODUCTS & LICENSES */}
        {activeTab === "digital" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Delivered License Keys & Account Credentials</h3>
            <p className="text-xs text-gray-500">
              Credentials are encrypted and masked to preserve customer privacy. Revealing a credential creates a mandatory
              security audit record.
            </p>

            {user.deliveredKeys.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No digital keys delivered to this account.</p>
            ) : (
              <div className="space-y-3">
                {user.deliveredKeys.map((dk) => {
                  const revealedSecret = revealedCredentials[dk.id];
                  return (
                    <div
                      key={dk.id}
                      className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{dk.productName}</span>
                          <span className="px-2 py-0.5 rounded bg-orange-100 text-[#FC5C03] font-bold text-[10px]">
                            {dk.accountType}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-1">Delivered on {new Date(dk.deliveredAt).toLocaleString()}</p>

                        <div className="mt-2 font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200 inline-block font-bold">
                          {revealedSecret ? (
                            <span className="text-emerald-700 selection:bg-emerald-200">{revealedSecret}</span>
                          ) : (
                            <span className="text-gray-400">{dk.maskedValue}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        {!revealedSecret ? (
                          <button
                            onClick={() => {
                              setRevealingKeyId(dk.id);
                              setRevealReason("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Reveal Secret</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(revealedSecret);
                              showToast("Copied to clipboard", "success");
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: LOYALTY & REFERRALS */}
        {activeTab === "loyalty" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loyalty Overview */}
              <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Loyalty Coin Rewards</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="font-extrabold text-amber-700">{user.coinBalance} Coins</span>

                  <span className="text-gray-600">Lifetime Earned:</span>
                  <span className="font-semibold text-gray-900">{user.lifetimeCoinsEarned} Coins</span>
                </div>
              </div>

              {/* Affiliate / Referral Overview */}
              <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Referral & Affiliate Profile</h3>
                </div>
                {user.affiliate ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-600">Referral Code:</span>
                    <span className="font-mono font-bold text-purple-700">{user.affiliate.code}</span>

                    <span className="text-gray-600">Tier:</span>
                    <span className="font-bold text-gray-900">{user.affiliate.tier}</span>

                    <span className="text-gray-600">Link Clicks:</span>
                    <span className="font-semibold text-gray-900">{user.affiliate.totalClicks}</span>

                    <span className="text-gray-600">Referred Orders:</span>
                    <span className="font-semibold text-gray-900">{user.affiliate.totalOrdersCount}</span>

                    <span className="text-gray-600">Total Commissions:</span>
                    <span className="font-extrabold text-purple-700">{formatPrice(user.affiliate.totalEarnedBDT)}</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-3">Customer has not enrolled in the affiliate program yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SESSIONS & SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-sm">Active Browser Sessions</p>
                <p className="text-xs text-gray-500">
                  {user.security.activeSessionsCount} active login session{user.security.activeSessionsCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={handleRevokeAllSessions}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
              >
                Revoke All Active Sessions
              </button>
            </div>

            {/* Trusted Devices */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Trusted Devices</h3>
              {user.security.trustedDevices.length === 0 ? (
                <p className="text-xs text-gray-400 py-3">No trusted devices registered.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.security.trustedDevices.map((td) => (
                    <div
                      key={td.id}
                      className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Laptop className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-bold text-gray-900">{td.name}</p>
                          <p className="text-[10px] text-gray-400">
                            Last Active: {new Date(td.lastUsedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Trusted
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: ADMIN NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <form onSubmit={handleAddNote} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">Add Private Administrative Note</h3>
              <p className="text-xs text-gray-500">
                These notes are strictly internal to support and administration staff. Never visible to customers.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-3">
                  <textarea
                    rows={2}
                    required
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter observation, fraud verification status, or customer support notes..."
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-200 rounded-xl outline-none font-medium"
                  >
                    <option value="GENERAL">General</option>
                    <option value="FRAUD">Fraud Review</option>
                    <option value="BILLING">Billing / MFS</option>
                    <option value="SUPPORT">Customer Support</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isSavingNote}
                    className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSavingNote ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Internal Note History</h3>
              {user.adminNotes.length === 0 ? (
                <p className="text-xs text-gray-400 py-3">No admin notes logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {user.adminNotes.map((an) => (
                    <div key={an.id} className="p-3 bg-white border border-gray-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{an.adminEmail}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                            {an.category}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(an.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{an.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 11: ACTIVITY LOGS */}
        {activeTab === "activity" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Audit & User Activity Timeline</h3>
            {user.activityLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No activity events recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {user.activityLogs.map((al) => (
                  <div
                    key={al.id}
                    className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{al.eventType}</span>
                        <span className="px-1.5 py-0.2 bg-gray-200 text-gray-700 font-semibold text-[10px] rounded">
                          {al.category}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{al.description}</p>
                    </div>

                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(al.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 12: USER INTELLIGENCE & ENVIRONMENT */}
        {activeTab === "intelligence" && (
          <UserIntelligencePanel userId={userId} />
        )}
      </div>

      {/* 5. Credential Reveal Justification Modal */}
      {revealingKeyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900">
                <Lock className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base">Security Audit Verification</h3>
              </div>
              <button onClick={() => setRevealingKeyId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <p className="text-gray-600">
                You are requesting access to unmasked customer credentials. This action is permanently recorded in the
                compliance audit log.
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mandatory Justification Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={revealReason}
                  onChange={(e) => setRevealReason(e.target.value)}
                  placeholder="e.g. Investigating customer dispute / Replacing faulty key via ticket #104..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRevealingKeyId(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRevealCredential}
                  disabled={isRevealing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isRevealing ? "Authorizing..." : "Audit & Reveal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Feature Restriction Modal */}
      {restrictionModalFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900">
                <Lock className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base">Restrict {restrictionModalFeature.name}</h3>
              </div>
              <button onClick={() => setRestrictionModalFeature(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <p className="text-gray-600">{restrictionModalFeature.description}</p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Reason for Restriction <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                  placeholder="e.g. Fraudulent chargeback attempt / Account under verification..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Spending Limit (BDT, Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={restrictionSpendingLimit}
                    onChange={(e) => setRestrictionSpendingLimit(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duration (Hours, Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={restrictionDurationHours}
                    onChange={(e) => setRestrictionDurationHours(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Restriction Impact Simulator */}
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Restriction Impact Simulation</span>
                </div>
                <div className="text-gray-700 space-y-1">
                  <p>
                    <strong>Affected Workflows:</strong> Any attempt by the customer to invoke{" "}
                    <code className="text-[#FC5C03] font-mono">{restrictionModalFeature.key}</code> will be rejected at the API boundary with HTTP 403.
                  </p>
                  <p>
                    <strong>Customer Message:</strong> &ldquo;{restrictionReason || "Your access to this feature is restricted. Please contact support."}&rdquo;
                  </p>
                  <p className="text-gray-500">
                    <strong>Precedence:</strong> Other permitted features continue functioning normally.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRestrictionModalFeature(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRestriction}
                  disabled={isUpdatingRestriction}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isUpdatingRestriction ? "Applying..." : "Enforce Restriction"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Status Change Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">Account Status Action</h3>
              </div>
              <button onClick={() => setStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Account Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Full access restored)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporary lock)</option>
                  <option value="BANNED">BANNED (Permanent suspension & session invalidation)</option>
                </select>
              </div>

              {targetStatus === "SUSPENDED" && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Suspension Duration</label>
                  <select
                    value={suspensionDurationHours}
                    onChange={(e) => setSuspensionDurationHours(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  >
                    <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="72">72 Hours (3 Days)</option>
                    <option value="168">168 Hours (7 Days)</option>
                    <option value="720">720 Hours (30 Days)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mandatory Audit Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Provide detailed justification for status change..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusChange}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Updating..." : "Confirm Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Wallet Adjustment Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900">
                <Wallet className="w-5 h-5 text-[#FC5C03]" />
                <h3 className="font-bold text-base">Adjust Customer Wallet Balance</h3>
              </div>
              <button onClick={() => setWalletModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWalletType("CREDIT")}
                  className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    walletType === "CREDIT"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  + Add Balance (Credit)
                </button>
                <button
                  type="button"
                  onClick={() => setWalletType("DEBIT")}
                  className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    walletType === "DEBIT"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  - Deduct Balance (Debit)
                </button>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mandatory Financial Audit Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  placeholder="e.g. Dispute resolution / Promotional bonus / Manual billing adjustment"
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setWalletModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWalletSubmit}
                  disabled={isAdjustingWallet}
                  className="px-4 py-2 bg-[#FC5C03] hover:bg-[#e05202] text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isAdjustingWallet ? "Processing..." : "Confirm Adjustment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
