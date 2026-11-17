import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const [refunds, coupons, walletTransactions, users, devices] = await Promise.all([
      prisma.refund.findMany({
        select: { id: true, userId: true, orderId: true, status: true, requestedAmountBDT: true, approvedAmountBDT: true, createdAt: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.coupon.findMany({ select: { id: true, code: true, usedCount: true, usageLimit: true, isActive: true, validUntil: true, discountType: true, discountValue: true }, orderBy: { usedCount: "desc" }, take: 100 }),
      prisma.walletTransaction.findMany({ select: { id: true, userId: true, amountBDT: true, type: true, status: true, method: true, createdAt: true, user: { select: { name: true, email: true, walletBalanceBDT: true } } }, orderBy: { createdAt: "desc" }, take: 1000 }),
      prisma.user.findMany({ select: { id: true, name: true, email: true, walletBalanceBDT: true }, take: 1000 }),
      prisma.userDeviceInstance.findMany({ select: { userId: true, deviceInstanceId: true, deviceType: true, browserName: true, osName: true, lastSeenAt: true }, orderBy: { lastSeenAt: "desc" }, take: 2000 }),
    ]);

    const refundByUser = new Map<string, typeof refunds>();
    for (const refund of refunds) refundByUser.set(refund.userId, [...(refundByUser.get(refund.userId) || []), refund]);
    const repeatedRefunds = Array.from(refundByUser.entries())
      .filter(([, items]) => items.length >= 2)
      .map(([userId, items]) => ({ userId, name: items[0].user.name || "Unnamed customer", email: items[0].user.email, count: items.length, totalRequestedBDT: round(items.reduce((sum, item) => sum + item.requestedAmountBDT, 0)), approvedCount: items.filter((item) => ["APPROVED", "REFUNDED"].includes(item.status)).length, latestAt: items[0].createdAt.toISOString(), orderIds: items.slice(0, 5).map((item) => item.orderId) }))
      .sort((a, b) => b.count - a.count || b.totalRequestedBDT - a.totalRequestedBDT)
      .slice(0, 50);

    const couponPressure = coupons.filter((coupon) => coupon.usageLimit > 0 && coupon.usedCount / coupon.usageLimit >= 0.8).map((coupon) => ({ code: coupon.code, usedCount: coupon.usedCount, usageLimit: coupon.usageLimit, usageRate: round((coupon.usedCount / coupon.usageLimit) * 100), active: coupon.isActive && coupon.validUntil > new Date(), validUntil: coupon.validUntil.toISOString(), discount: `${coupon.discountValue}${coupon.discountType === "PERCENTAGE" ? "%" : " BDT"}` }));

    const txByUser = new Map<string, typeof walletTransactions>();
    for (const tx of walletTransactions) txByUser.set(tx.userId, [...(txByUser.get(tx.userId) || []), tx]);
    const walletAnomalies = users.map((user) => {
      const txs = txByUser.get(user.id) || [];
      const approved = txs.filter((tx) => tx.status === "APPROVED");
      const deposits = approved.filter((tx) => tx.type === "DEPOSIT" || tx.type === "BONUS").reduce((sum, tx) => sum + tx.amountBDT, 0);
      const purchases = approved.filter((tx) => tx.type === "PURCHASE").reduce((sum, tx) => sum + tx.amountBDT, 0);
      const refundsTotal = approved.filter((tx) => tx.type === "REFUND").reduce((sum, tx) => sum + tx.amountBDT, 0);
      const expectedBalance = deposits + refundsTotal - purchases;
      const mismatch = Math.abs(expectedBalance - user.walletBalanceBDT);
      const rejected = txs.filter((tx) => tx.status === "REJECTED").length;
      const pending = txs.filter((tx) => tx.status === "PENDING").length;
      return { userId: user.id, name: user.name || "Unnamed customer", email: user.email, walletBalanceBDT: round(user.walletBalanceBDT), expectedBalanceBDT: round(expectedBalance), mismatchBDT: round(mismatch), rejected, pending, transactionCount: txs.length };
    }).filter((item) => item.mismatchBDT >= 1 || item.rejected >= 3 || item.pending >= 3).sort((a, b) => b.mismatchBDT - a.mismatchBDT).slice(0, 50);

    const deviceGroups = new Map<string, typeof devices>();
    for (const device of devices) deviceGroups.set(device.deviceInstanceId, [...(deviceGroups.get(device.deviceInstanceId) || []), device]);
    const sharedDevices = Array.from(deviceGroups.entries()).map(([deviceInstanceId, entries]) => {
      const userIds = Array.from(new Set(entries.map((entry) => entry.userId)));
      return { deviceInstanceId, deviceType: entries[0].deviceType, browser: entries[0].browserName, os: entries[0].osName, userCount: userIds.length, userIds: userIds.slice(0, 10), lastSeenAt: entries[0].lastSeenAt.toISOString() };
    }).filter((item) => item.userCount >= 2).sort((a, b) => b.userCount - a.userCount).slice(0, 50);

    return NextResponse.json({ success: true, generatedAt: new Date().toISOString(), limitations: ["Signals are review queues, not fraud determinations.", "Coupon records do not link usage to a customer, so coupon results show usage pressure only.", "Device matching is shown only when recorded deviceInstanceId values are shared by multiple accounts."], summary: { repeatedRefundUsers: repeatedRefunds.length, couponPressure: couponPressure.length, walletAnomalies: walletAnomalies.length, sharedDevices: sharedDevices.length }, signals: { repeatedRefunds, couponPressure, walletAnomalies, sharedDevices } });
  } catch (error) {
    console.error("[Admin Fraud GET Error]", error);
    return NextResponse.json({ success: false, error: "Fraud signals could not be loaded" }, { status: 500 });
  }
}
