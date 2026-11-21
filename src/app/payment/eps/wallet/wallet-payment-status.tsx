"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export function WalletPaymentStatus({ reference }: { reference?: string }) {
  const [state, setState] = useState("ready");
  const [purpose, setPurpose] = useState<"ORDER" | "WALLET_TOPUP" | null>(null);
  const isOrder = purpose === "ORDER";
  const validReference = typeof reference === "string" && /^\d{10,40}$/.test(reference);
  const checkedReference = useRef<string>();
  const inFlight = useRef(false);

  const checkPayment = useCallback(async () => {
    if (!validReference || inFlight.current) return;
    inFlight.current = true;
    setState("loading");
    try {
      const query = new URLSearchParams({ merchantTransactionId: reference ?? "" });
      const response = await fetch(`/api/payment/eps/wallet/verify?${query}`, {
        method: "POST",
        cache: "no-store",
      });
      if (response.status === 401) return setState("login");
      const result = await response.json();
      if (result.purpose === "ORDER" || result.purpose === "WALLET_TOPUP") setPurpose(result.purpose);
      if (response.status === 409 && result.status === "REVIEW_REQUIRED") return setState("review");
      if (!response.ok) return setState("error");
      if (response.status === 202 && result.status === "PENDING") return setState("pending");
      setState(result.status === "FINALIZED" ? "done" : "error");
    } catch {
      setState("error");
    } finally {
      inFlight.current = false;
    }
  }, [reference, validReference]);

  useEffect(() => {
    if (!validReference || checkedReference.current === reference) return;
    checkedReference.current = reference;
    void checkPayment();
  }, [checkPayment, reference, validReference]);

  const message = {
    ready: "EPS থেকে পেমেন্টের অবস্থা যাচাই করুন।",
    loading: "পেমেন্ট যাচাই হচ্ছে…",
    pending: "পেমেন্ট এখনো নিশ্চিত হয়নি। কিছুক্ষণ পর আবার যাচাই করুন।",
    done: isOrder ? "অর্ডারের পেমেন্ট নিশ্চিত হয়েছে।" : "পেমেন্ট নিশ্চিত হয়েছে। ওয়ালেটে ব্যালান্স দেখুন।",
    login: "পেমেন্ট যাচাই করতে আগে সাইন ইন করুন।",
    error: "যাচাই করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    review: "পেমেন্টটি পর্যালোচনার জন্য রাখা হয়েছে। নতুন পেমেন্ট করার আগে সাপোর্টে যোগাযোগ করুন।",
  }[state];

  return (
    <div className="space-y-4">
      <p role="status">{validReference ? message : "পেমেন্ট রেফারেন্সটি সঠিক নয়।"}</p>
      {validReference && state !== "done" && state !== "login" && state !== "review" && (
        <button type="button" disabled={state === "loading"} onClick={checkPayment}
          className="rounded-lg bg-[var(--primary-orange)] px-4 py-2 text-white disabled:opacity-60">
          পেমেন্ট যাচাই করুন
        </button>
      )}
      <div>
        {state === "login" ? (
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/payment/eps/wallet?merchantTransactionId=${reference}`)}`}>
            সাইন ইন করুন
          </Link>
        ) : (
          <div className="flex flex-wrap gap-4">
            {purpose !== "WALLET_TOPUP" && <Link href="/dashboard/orders">অর্ডার দেখুন</Link>}
            {purpose !== "ORDER" && <Link href="/dashboard/wallet">ওয়ালেটে যান</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
