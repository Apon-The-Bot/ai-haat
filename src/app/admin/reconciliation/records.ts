import { prisma } from "@/lib/prisma";
import { resolveDateRange } from "@/lib/analytics/business-intelligence";

export type Query = Record<string, string | string[] | undefined>;
export const pageSize = 25;

export function value(query: Query, key: string) {
  const input = query[key];
  return typeof input === "string" ? input : "";
}

export function pageNumber(query: Query) {
  const page = Number(value(query, "page"));
  return Number.isSafeInteger(page) && page >= 1 && page <= 10000 ? page : 1;
}

export function period(query: Query) {
  const range = value(query, "range");
  const filter = resolveDateRange(/^(TODAY|7D|30D|90D|THIS_MONTH|ALL)$/.test(range) ? range : "30D");
  const start = value(query, "from");
  const end = value(query, "to");
  const iso = (input: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(input) &&
    Number.isFinite(Date.parse(input));
  if (iso(start) && iso(end) && Date.parse(start) <= Date.parse(end)) {
    return { gte: new Date(start), lte: new Date(end) };
  }
  return filter.startDate ? { gte: filter.startDate, lte: filter.endDate ?? undefined } : undefined;
}

export const orderRef = { id: true, orderNumber: true } as const;
export const refundAmounts = { approvedAmountBDT: true, requestedAmountBDT: true } as const;
export const descending = (field: string) => [{ [field]: "desc" as const }, { id: "desc" as const }];

const walletFields = {
  id: true, userId: true, amountBDT: true, type: true, status: true, method: true, trxId: true, createdAt: true,
} as const;

function matchesAmount(left: number, right: number) {
  return Math.round(left * 100) === Math.round(right * 100);
}

export async function readOrders(query: Query, offset: number) {
  const q = value(query, "q").trim().slice(0, 191);
  const orders = await prisma.order.findMany({
    where: q ? { OR: [
      { id: q }, { orderNumber: q }, { trxId: q },
      { refunds: { some: { OR: [{ id: q }, { payoutTrxId: q }] } } },
    ] } : { createdAt: period(query) },
    orderBy: descending("createdAt"), skip: offset, take: pageSize + 1,
    select: {
      ...orderRef, createdAt: true, userId: true, totalBDT: true, refundedBDT: true,
      paymentMethod: true, paymentStatus: true, trxId: true,
      timelineEvents: {
        where: { status: "PAYMENT_VERIFIED", actor: { in: ["GATEWAY_CALLBACK", "GATEWAY_WEBHOOK"] } },
        orderBy: descending("createdAt"), take: 1,
        select: { actor: true, note: true, createdAt: true },
      },
      refunds: {
        orderBy: descending("createdAt"),
        select: {
          id: true, status: true, refundMethod: true, ...refundAmounts, processedAt: true,
          payoutTrxId: true, gatewayRef: true, walletTransactionId: true, userId: true,
        },
      },
    },
  });
  const purchaseRefs = orders.flatMap(order => order.trxId &&
    (order.trxId === `WAL-${order.id}` || order.trxId === `WAL-${order.orderNumber}`) ? [order.trxId] : []);
  const refundIds = orders.flatMap(order => order.refunds.flatMap(refund =>
    refund.walletTransactionId ? [refund.walletTransactionId] : []));
  const ledger = purchaseRefs.length || refundIds.length ? await prisma.walletTransaction.findMany({
    where: { OR: [{ trxId: { in: purchaseRefs } }, { id: { in: refundIds } }] },
    select: walletFields,
  }) : [];
  const byId = new Map(ledger.map(row => [row.id, row]));
  const byRef = new Map(ledger.map(row => [row.trxId, row]));

  return orders.map(order => {
    const wallet = order.trxId === `WAL-${order.id}` || order.trxId === `WAL-${order.orderNumber}`
      ? byRef.get(order.trxId) : undefined;
    const event = order.timelineEvents[0];
    const evidence = event?.note?.match(/^Payment verified: ৳(\d+(?:\.\d+)?)\. TrxId: (.+)$/);
    const gateway = event && evidence ? {
      actor: event.actor, amount: Number(evidence[1]), reference: evidence[2], date: event.createdAt,
    } : null;
    let paymentCheck = "Order payment record only";
    if (gateway) {
      paymentCheck = order.paymentStatus === "VERIFIED" && matchesAmount(gateway.amount, order.totalBDT) &&
        (!order.trxId || order.trxId === gateway.reference)
        ? "Recorded gateway verification matches" : "Review recorded gateway verification";
    }
    if (order.paymentMethod.toLowerCase() === "wallet" || wallet) {
      if (wallet) {
        paymentCheck = wallet.type === "PURCHASE" && wallet.status === "APPROVED" &&
          order.paymentStatus === "VERIFIED" && wallet.userId === order.userId &&
          matchesAmount(wallet.amountBDT, order.totalBDT) ? "Wallet debit matches" : "Review wallet debit";
      } else if (order.paymentStatus === "VERIFIED") {
        paymentCheck = "Verified wallet order has no linked debit";
      } else {
        paymentCheck = "Awaiting verified wallet payment";
      }
    }
    const completed = order.refunds.filter(refund => refund.status === "REFUNDED");
    const recordedRefunds = completed.reduce((sum, refund) => sum + (refund.approvedAmountBDT ?? 0), 0);
    const refundCheck = !completed.some(refund => refund.approvedAmountBDT === null) &&
      matchesAmount(recordedRefunds, order.refundedBDT);
    return {
      ...order, wallet, gateway, paymentCheck, recordedRefunds, refundCheck,
      refunds: order.refunds.map(refund => {
        const credit = refund.walletTransactionId ? byId.get(refund.walletTransactionId) : undefined;
        let check = "Awaiting completed refund";
        if (refund.status === "REFUNDED") {
          const walletPayout = refund.walletTransactionId || refund.gatewayRef === "WALLET_CREDIT" ||
            (refund.refundMethod === "WALLET" && !refund.payoutTrxId && !refund.gatewayRef);
          if (walletPayout) {
            check = credit && credit.type === "REFUND" && credit.status === "APPROVED" &&
              credit.userId === refund.userId && refund.approvedAmountBDT !== null &&
              matchesAmount(credit.amountBDT, refund.approvedAmountBDT)
              ? "Wallet credit matches" : "Review wallet credit";
          } else {
            check = refund.payoutTrxId || refund.gatewayRef ? "Payout reference recorded" : "Payout reference missing";
          }
        }
        return { ...refund, credit, check };
      }),
    };
  });
}

export async function readWallet(query: Query, offset: number) {
  const q = value(query, "q").trim().slice(0, 191);
  const rows = await prisma.walletTransaction.findMany({
    where: q ? { OR: [{ id: q }, { trxId: q }] } : { createdAt: period(query) },
    orderBy: descending("createdAt"), skip: offset, take: pageSize + 1, select: walletFields,
  });
  const purchases = rows.flatMap(row => row.type === "PURCHASE" && row.trxId?.startsWith("WAL-") ? [row.trxId] : []);
  const refs = purchases.map(ref => ref.slice(4));
  const [orders, refunds] = await Promise.all([
    purchases.length ? prisma.order.findMany({
      where: { trxId: { in: purchases }, OR: [{ id: { in: refs } }, { orderNumber: { in: refs } }] },
      select: { ...orderRef, trxId: true },
    }) : [],
    rows.length ? prisma.refund.findMany({
      where: { walletTransactionId: { in: rows.map(row => row.id) } },
      select: { walletTransactionId: true, order: { select: orderRef } },
    }) : [],
  ]);
  return rows.map(row => ({
    ...row,
    order: orders.find(order => order.trxId === row.trxId &&
      (row.trxId === `WAL-${order.id}` || row.trxId === `WAL-${order.orderNumber}`)) ??
      refunds.find(refund => refund.walletTransactionId === row.id)?.order,
  }));
}
