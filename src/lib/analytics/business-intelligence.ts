import { prisma } from "@/lib/prisma";
import { PaymentStatus, DeliveryStatus, TransactionType, TransactionStatus, RefundStatus, StockStatus } from "@prisma/client";

export type DateRangePreset =
  | "TODAY"
  | "YESTERDAY"
  | "7D"
  | "30D"
  | "90D"
  | "THIS_MONTH"
  | "PREVIOUS_MONTH"
  | "ALL"
  | "CUSTOM";

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: Date | null;
  endDate: Date | null;
  priorStartDate: Date | null;
  priorEndDate: Date | null;
}

export interface MetricComparison {
  current: number;
  previous: number;
  diff: number;
  percentageChange: number | null; // null if prior period was 0 to avoid Infinity%
}

export function calcMetricComparison(current: number, previous: number): MetricComparison {
  const diff = current - previous;
  let percentageChange: number | null = null;

  if (previous > 0) {
    percentageChange = Math.round(((current - previous) / previous) * 1000) / 10;
  } else if (previous === 0 && current > 0) {
    percentageChange = 100.0;
  } else if (previous === 0 && current === 0) {
    percentageChange = 0.0;
  }

  return {
    current,
    previous,
    diff,
    percentageChange,
  };
}

/**
 * Resolves DateRangeFilter including matching previous equivalent comparison period
 */
export function resolveDateRange(
  preset: string = "30D",
  customStart?: string | null,
  customEnd?: string | null
): DateRangeFilter {
  const now = new Date();
  const validPreset = (preset.toUpperCase() as DateRangePreset) || "30D";

  // Helper for midnight local boundaries
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  let startDate: Date | null = null;
  let endDate: Date | null = endOfDay(now);
  let priorStartDate: Date | null = null;
  let priorEndDate: Date | null = null;

  if (validPreset === "TODAY") {
    startDate = startOfDay(now);
    endDate = endOfDay(now);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    priorStartDate = startOfDay(yesterday);
    priorEndDate = endOfDay(yesterday);
  } else if (validPreset === "YESTERDAY") {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    startDate = startOfDay(yesterday);
    endDate = endOfDay(yesterday);
    const dayBefore = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    priorStartDate = startOfDay(dayBefore);
    priorEndDate = endOfDay(dayBefore);
  } else if (validPreset === "7D") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    endDate = endOfDay(now);
    const duration = endDate.getTime() - startDate.getTime();
    priorStartDate = new Date(startDate.getTime() - duration);
    priorEndDate = new Date(startDate.getTime());
  } else if (validPreset === "30D") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    endDate = endOfDay(now);
    const duration = endDate.getTime() - startDate.getTime();
    priorStartDate = new Date(startDate.getTime() - duration);
    priorEndDate = new Date(startDate.getTime());
  } else if (validPreset === "90D") {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    endDate = endOfDay(now);
    const duration = endDate.getTime() - startDate.getTime();
    priorStartDate = new Date(startDate.getTime() - duration);
    priorEndDate = new Date(startDate.getTime());
  } else if (validPreset === "THIS_MONTH") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    endDate = endOfDay(now);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1, 0, 0, 0, 0);
    priorStartDate = prevMonthStart;
    priorEndDate = prevMonthEnd;
  } else if (validPreset === "PREVIOUS_MONTH") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    priorStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
    priorEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
  } else if (validPreset === "CUSTOM" && customStart) {
    startDate = new Date(customStart);
    endDate = customEnd ? new Date(customEnd) : new Date();
    const duration = endDate.getTime() - startDate.getTime();
    priorStartDate = new Date(startDate.getTime() - duration);
    priorEndDate = new Date(startDate.getTime());
  } else if (validPreset === "ALL") {
    startDate = null;
    endDate = null;
    priorStartDate = null;
    priorEndDate = null;
  }

  return {
    preset: validPreset,
    startDate,
    endDate,
    priorStartDate,
    priorEndDate,
  };
}

/**
 * Commercial Overview KPIs
 */
export async function getCommercialOverview(filter: DateRangeFilter) {
  const currentOrderWhere: any = {};
  const priorOrderWhere: any = {};

  if (filter.startDate) {
    currentOrderWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  if (filter.priorStartDate && filter.priorEndDate) {
    priorOrderWhere.createdAt = {
      gte: filter.priorStartDate,
      lte: filter.priorEndDate,
    };
  }

  // 1. Fetch Current Orders
  const currentOrders = await prisma.order.findMany({
    where: currentOrderWhere,
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      customerEmail: true,
      subtotalBDT: true,
      discountBDT: true,
      totalBDT: true,
      paymentStatus: true,
      deliveryStatus: true,
      paymentMethod: true,
      createdAt: true,
    },
  });

  // 2. Fetch Prior Orders (if comparison period available)
  let priorOrders: typeof currentOrders = [];
  if (filter.priorStartDate && filter.priorEndDate) {
    priorOrders = await prisma.order.findMany({
      where: priorOrderWhere,
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        customerEmail: true,
        subtotalBDT: true,
        discountBDT: true,
        totalBDT: true,
        paymentStatus: true,
        deliveryStatus: true,
        paymentMethod: true,
        createdAt: true,
      },
    });
  }

  // Current Period Calculations
  const currentVerified = currentOrders.filter((o) => o.paymentStatus === "VERIFIED");
  const currentGrossSales = currentVerified.reduce((sum, o) => sum + (o.subtotalBDT || o.totalBDT || 0), 0);
  const currentDiscounts = currentVerified.reduce((sum, o) => sum + (o.discountBDT || 0), 0);
  const currentVerifiedRevenue = currentVerified.reduce((sum, o) => sum + (o.totalBDT || 0), 0);
  const currentAOV = currentVerified.length > 0 ? Math.round(currentVerifiedRevenue / currentVerified.length) : 0;

  // Completed Refunds in Current Period
  const refundWhere: any = { status: { in: ["REFUNDED" as RefundStatus, "APPROVED" as RefundStatus] } };
  if (filter.startDate) {
    refundWhere.processedAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }
  const currentRefunds = await prisma.refund.findMany({
    where: refundWhere,
    select: { approvedAmountBDT: true, requestedAmountBDT: true },
  });
  const currentRefundedAmount = currentRefunds.reduce((sum, r) => sum + (r.approvedAmountBDT || r.requestedAmountBDT || 0), 0);
  const currentNetRevenue = Math.max(0, currentVerifiedRevenue - currentRefundedAmount);

  // COGS in Current Period (Delivered Digital Stocks + Replaced Stocks + Manual Fulfillment Costs)
  const currentDeliveredStocks = await prisma.digitalStock.findMany({
    where: {
      status: { in: ["DELIVERED", "REPLACED"] },
      deliveredAt: filter.startDate
        ? { gte: filter.startDate, ...(filter.endDate ? { lte: filter.endDate } : {}) }
        : undefined,
    },
    select: { costPriceBDT: true, status: true },
  });

  const currentManualCosts = await prisma.orderItemCost.findMany({
    where: {
      createdAt: filter.startDate
        ? { gte: filter.startDate, ...(filter.endDate ? { lte: filter.endDate } : {}) }
        : undefined,
    },
    select: { costBDT: true },
  });

  let currentStockCogs = 0;
  let currentStockKnownCount = 0;
  let currentStockUnknownCount = 0;

  for (const s of currentDeliveredStocks) {
    if (s.costPriceBDT !== null && s.costPriceBDT !== undefined) {
      currentStockCogs += Number(s.costPriceBDT);
      currentStockKnownCount++;
    } else {
      currentStockUnknownCount++;
    }
  }

  const currentManualCogs = currentManualCosts.reduce((sum, c) => sum + (c.costBDT || 0), 0);
  const currentTotalCogs = Math.round((currentStockCogs + currentManualCogs) * 100) / 100;
  const currentGrossProfit = Math.round((currentNetRevenue - currentTotalCogs) * 100) / 100;
  const currentGrossMarginPct = currentNetRevenue > 0
    ? Math.round((currentGrossProfit / currentNetRevenue) * 1000) / 10
    : 0;

  const totalCurrentStockCount = currentStockKnownCount + currentStockUnknownCount;
  const currentCostCoveragePct = totalCurrentStockCount > 0
    ? Math.round((currentStockKnownCount / totalCurrentStockCount) * 1000) / 10
    : 100.0;

  // Procurement Spend in Current Period
  const batchWhere: any = {};
  if (filter.startDate) {
    batchWhere.purchaseDate = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }
  const currentBatches = await prisma.inventoryBatch.findMany({
    where: batchWhere,
    select: { totalCostBDT: true, totalCount: true, unitCostBDT: true },
  });
  const currentProcurementSpend = currentBatches.reduce(
    (sum, b) => sum + (b.totalCostBDT || ((b.totalCount || 0) * (b.unitCostBDT || 0))),
    0
  );

  // Prior Period Calculations
  const priorVerified = priorOrders.filter((o) => o.paymentStatus === "VERIFIED");
  const priorVerifiedRevenue = priorVerified.reduce((sum, o) => sum + (o.totalBDT || 0), 0);
  const priorAOV = priorVerified.length > 0 ? Math.round(priorVerifiedRevenue / priorVerified.length) : 0;

  const priorRefundWhere: any = { status: { in: ["REFUNDED" as RefundStatus, "APPROVED" as RefundStatus] } };
  if (filter.priorStartDate && filter.priorEndDate) {
    priorRefundWhere.processedAt = {
      gte: filter.priorStartDate,
      lte: filter.priorEndDate,
    };
  }
  const priorRefunds = (filter.priorStartDate && filter.priorEndDate)
    ? await prisma.refund.findMany({ where: priorRefundWhere, select: { approvedAmountBDT: true, requestedAmountBDT: true } })
    : [];
  const priorRefundedAmount = priorRefunds.reduce((sum, r) => sum + (r.approvedAmountBDT || r.requestedAmountBDT || 0), 0);
  const priorNetRevenue = Math.max(0, priorVerifiedRevenue - priorRefundedAmount);

  // Prior Period COGS
  const priorDeliveredStocks = (filter.priorStartDate && filter.priorEndDate)
    ? await prisma.digitalStock.findMany({
        where: {
          status: { in: ["DELIVERED", "REPLACED"] },
          deliveredAt: { gte: filter.priorStartDate, lte: filter.priorEndDate },
        },
        select: { costPriceBDT: true },
      })
    : [];

  const priorManualCosts = (filter.priorStartDate && filter.priorEndDate)
    ? await prisma.orderItemCost.findMany({
        where: { createdAt: { gte: filter.priorStartDate, lte: filter.priorEndDate } },
        select: { costBDT: true },
      })
    : [];

  const priorTotalCogs = priorDeliveredStocks.reduce((sum, s) => sum + Number(s.costPriceBDT || 0), 0) +
    priorManualCosts.reduce((sum, c) => sum + (c.costBDT || 0), 0);
  const priorGrossProfit = Math.max(0, priorNetRevenue - priorTotalCogs);

  // Wallet Funding (Inflows from TOPUP/DEPOSIT) vs Spending
  const walletTxWhere: any = { status: "APPROVED" as TransactionStatus };
  if (filter.startDate) {
    walletTxWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }
  const walletTxs = await prisma.walletTransaction.findMany({
    where: walletTxWhere,
    select: { type: true, amountBDT: true },
  });

  const walletFundingTotal = walletTxs
    .filter((tx) => tx.type === "DEPOSIT")
    .reduce((sum, tx) => sum + (tx.amountBDT || 0), 0);

  const walletPurchaseSpendTotal = walletTxs
    .filter((tx) => tx.type === "PURCHASE")
    .reduce((sum, tx) => sum + (tx.amountBDT || 0), 0);

  // Customer Repeat Metrics
  const customerEmailOrdersCount: Record<string, number> = {};
  for (const o of currentVerified) {
    const email = o.customerEmail.toLowerCase().trim();
    customerEmailOrdersCount[email] = (customerEmailOrdersCount[email] || 0) + 1;
  }
  const purchasingCustomerCount = Object.keys(customerEmailOrdersCount).length;
  const repeatCustomerCount = Object.values(customerEmailOrdersCount).filter((cnt) => cnt >= 2).length;
  const repeatPurchaseRate = purchasingCustomerCount > 0
    ? Math.round((repeatCustomerCount / purchasingCustomerCount) * 1000) / 10
    : 0;

  // Operational Counts
  const pendingDeliveries = await prisma.order.count({
    where: {
      deliveryStatus: { in: ["ORDER_PLACED", "PREPARING", "PROCESSING"] },
      paymentStatus: "VERIFIED",
    },
  });

  const pendingPaymentReviews = await prisma.order.count({
    where: { paymentStatus: "PENDING" },
  });

  const pendingReplacementClaims = await prisma.replacementRequest.count({
    where: { status: "REQUESTED" },
  });

  const pendingRefundClaims = await prisma.refund.count({
    where: { status: "REQUESTED" },
  });

  const openSupportTickets = await prisma.supportTicket.count({
    where: { status: { in: ["OPEN", "WAITING_FOR_ADMIN"] } },
  });

  const availableStockCount = await prisma.digitalStock.count({
    where: { status: "AVAILABLE" },
  });

  const lowStockThresholdProducts = await prisma.product.count({
    where: {
      inStock: true,
      digitalStocks: {
        none: { status: "AVAILABLE" },
      },
    },
  });

  return {
    period: filter.preset,
    startDate: filter.startDate?.toISOString() || null,
    endDate: filter.endDate?.toISOString() || null,
    kpis: {
      verifiedRevenue: calcMetricComparison(currentVerifiedRevenue, priorVerifiedRevenue),
      grossOrderValue: calcMetricComparison(currentGrossSales, priorVerified.reduce((s, o) => s + (o.subtotalBDT || o.totalBDT || 0), 0)),
      netRevenue: calcMetricComparison(currentNetRevenue, priorNetRevenue),
      cogs: calcMetricComparison(currentTotalCogs, priorTotalCogs),
      grossProfit: calcMetricComparison(currentGrossProfit, priorGrossProfit),
      grossMarginPct: currentGrossMarginPct,
      costCoveragePct: currentCostCoveragePct,
      procurementSpend: Math.round(currentProcurementSpend * 100) / 100,
      refundedValue: calcMetricComparison(currentRefundedAmount, priorRefundedAmount),
      totalDiscountGranted: calcMetricComparison(currentDiscounts, priorVerified.reduce((s, o) => s + (o.discountBDT || 0), 0)),
      totalOrders: calcMetricComparison(currentOrders.length, priorOrders.length),
      verifiedOrders: calcMetricComparison(currentVerified.length, priorVerified.length),
      averageOrderValue: calcMetricComparison(currentAOV, priorAOV),
      walletFundingInflow: walletFundingTotal,
      walletPurchaseSpend: walletPurchaseSpendTotal,
      purchasingCustomers: purchasingCustomerCount,
      repeatCustomers: repeatCustomerCount,
      repeatPurchaseRatePct: repeatPurchaseRate,
    },
    operational: {
      pendingDeliveries,
      pendingPaymentReviews,
      pendingReplacementClaims,
      pendingRefundClaims,
      openSupportTickets,
      availableStockCount,
      lowStockAlertCount: lowStockThresholdProducts,
    },
  };
}

/**
 * Sales Time-Series Trend
 */
export async function getSalesTimeSeries(filter: DateRangeFilter) {
  const orderWhere: any = {};
  if (filter.startDate) {
    orderWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      totalBDT: true,
      paymentStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const timeSeriesMap: Record<string, { date: string; verifiedRevenue: number; totalOrders: number; verifiedOrders: number }> = {};

  for (const o of orders) {
    const d = new Date(o.createdAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    if (!timeSeriesMap[dateKey]) {
      timeSeriesMap[dateKey] = {
        date: dateKey,
        verifiedRevenue: 0,
        totalOrders: 0,
        verifiedOrders: 0,
      };
    }

    timeSeriesMap[dateKey].totalOrders += 1;
    if (o.paymentStatus === "VERIFIED") {
      timeSeriesMap[dateKey].verifiedRevenue += o.totalBDT || 0;
      timeSeriesMap[dateKey].verifiedOrders += 1;
    }
  }

  return Object.values(timeSeriesMap).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Product & Variation Performance and Profitability Report
 */
export async function getProductPerformanceReport(filter: DateRangeFilter) {
  const orderWhere: any = { paymentStatus: "VERIFIED" as PaymentStatus };
  if (filter.startDate) {
    orderWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const verifiedOrders = await prisma.order.findMany({
    where: orderWhere,
    include: {
      items: {
        include: {
          deliveredKeys: {
            select: { id: true, stockId: true, isReplacement: true },
          },
          digitalStocks: {
            select: { id: true, costPriceBDT: true, status: true },
          },
          fulfillmentCosts: {
            select: { costBDT: true },
          },
          replacements: true,
          refunds: true,
        },
      },
    },
  });

  const productMap: Record<
    string,
    {
      productId: string;
      productName: string;
      variationId: string | null;
      variationName: string;
      unitsSold: number;
      verifiedOrdersCount: number;
      grossRevenue: number;
      refundedAmount: number;
      netRevenue: number;
      originalCogs: number;
      replacementCogs: number;
      manualCogs: number;
      totalCogs: number;
      grossProfit: number;
      grossMarginPct: number;
      costCoveragePct: number;
      isCostComplete: boolean;
      unknownCostUnits: number;
      knownCostUnits: number;
      replacementsCount: number;
      refundsCount: number;
      availableStock: number;
      availableStockValueBDT: number;
    }
  > = {};

  for (const o of verifiedOrders) {
    for (const item of o.items) {
      const key = `${item.productId || item.productName}_${item.variationId || item.variationName}`;
      if (!productMap[key]) {
        productMap[key] = {
          productId: item.productId || "",
          productName: item.productName,
          variationId: item.variationId || null,
          variationName: item.variationName || "Standard",
          unitsSold: 0,
          verifiedOrdersCount: 0,
          grossRevenue: 0,
          refundedAmount: 0,
          netRevenue: 0,
          originalCogs: 0,
          replacementCogs: 0,
          manualCogs: 0,
          totalCogs: 0,
          grossProfit: 0,
          grossMarginPct: 0,
          costCoveragePct: 100,
          isCostComplete: true,
          unknownCostUnits: 0,
          knownCostUnits: 0,
          replacementsCount: 0,
          refundsCount: 0,
          availableStock: 0,
          availableStockValueBDT: 0,
        };
      }

      const itemUnits = item.quantity || 1;
      const itemTotal = (item.priceBDT || 0) * itemUnits;
      const refunded = item.refundedBDT || 0;
      const itemNet = Math.max(0, itemTotal - refunded);

      let itemOriginalCogs = 0;
      let itemReplacementCogs = 0;
      let itemManualCogs = 0;
      let itemKnownCostUnits = 0;
      let itemUnknownCostUnits = 0;

      // Evaluate assigned DigitalStock
      if (item.digitalStocks && item.digitalStocks.length > 0) {
        for (const stock of item.digitalStocks) {
          if (stock.costPriceBDT === null || stock.costPriceBDT === undefined) {
            itemUnknownCostUnits++;
          } else {
            itemKnownCostUnits++;
            const cost = Number(stock.costPriceBDT);
            if (stock.status === "REPLACED") {
              itemOriginalCogs += cost;
            } else {
              itemOriginalCogs += cost;
            }
          }
        }
      }

      // Evaluate replacement deliveries
      const repDeliveries = (item.deliveredKeys || []).filter((k) => k.isReplacement);
      if (repDeliveries.length > 0) {
        for (const rd of repDeliveries) {
          if (rd.stockId) {
            const st = item.digitalStocks?.find((s) => s.id === rd.stockId);
            if (st && st.costPriceBDT !== null && st.costPriceBDT !== undefined) {
              itemReplacementCogs += Number(st.costPriceBDT);
              itemOriginalCogs = Math.max(0, itemOriginalCogs - Number(st.costPriceBDT));
            }
          }
        }
      }

      // Evaluate manual fulfillment costs
      if (item.fulfillmentCosts && item.fulfillmentCosts.length > 0) {
        for (const fc of item.fulfillmentCosts) {
          itemManualCogs += Number(fc.costBDT || 0);
          itemKnownCostUnits++;
        }
      }

      if ((!item.digitalStocks || item.digitalStocks.length === 0) && (!item.fulfillmentCosts || item.fulfillmentCosts.length === 0)) {
        itemUnknownCostUnits += itemUnits;
      }

      productMap[key].unitsSold += itemUnits;
      productMap[key].verifiedOrdersCount += 1;
      productMap[key].grossRevenue += itemTotal;
      productMap[key].refundedAmount += refunded;
      productMap[key].netRevenue += itemNet;
      productMap[key].originalCogs += itemOriginalCogs;
      productMap[key].replacementCogs += itemReplacementCogs;
      productMap[key].manualCogs += itemManualCogs;
      productMap[key].knownCostUnits += itemKnownCostUnits;
      productMap[key].unknownCostUnits += itemUnknownCostUnits;
      productMap[key].replacementsCount += item.replacements.length;
      productMap[key].refundsCount += item.refunds.length;
    }
  }

  // Calculate final margin, coverage, and live available stock per product/variation
  const productKeys = Object.values(productMap);
  for (const p of productKeys) {
    p.totalCogs = Math.round((p.originalCogs + p.replacementCogs + p.manualCogs) * 100) / 100;
    p.grossProfit = Math.round((p.netRevenue - p.totalCogs) * 100) / 100;
    p.grossMarginPct = p.netRevenue > 0
      ? Math.round((p.grossProfit / p.netRevenue) * 1000) / 10
      : 0;

    const totalEvaluated = p.knownCostUnits + p.unknownCostUnits;
    p.costCoveragePct = totalEvaluated > 0
      ? Math.round((p.knownCostUnits / totalEvaluated) * 1000) / 10
      : (p.unknownCostUnits > 0 ? 0.0 : 100.0);
    p.isCostComplete = p.unknownCostUnits === 0;

    if (p.productId) {
      const availStocks = await prisma.digitalStock.findMany({
        where: {
          productId: p.productId,
          ...(p.variationId ? { variationId: p.variationId } : {}),
          status: "AVAILABLE" as StockStatus,
        },
        select: { costPriceBDT: true },
      });

      p.availableStock = availStocks.length;
      p.availableStockValueBDT = availStocks.reduce(
        (sum, s) => sum + (s.costPriceBDT !== null ? Number(s.costPriceBDT) : 0),
        0
      );
    }
  }

  return productKeys.sort((a, b) => b.grossRevenue - a.grossRevenue);
}

/**
 * Profit & Margins Master Report
 */
export async function getProfitAndMarginReport(filter: DateRangeFilter) {
  const products = await getProductPerformanceReport(filter);

  const totalUnitsSold = products.reduce((sum, p) => sum + p.unitsSold, 0);
  const totalGrossRevenue = products.reduce((sum, p) => sum + p.grossRevenue, 0);
  const totalRefunded = products.reduce((sum, p) => sum + p.refundedAmount, 0);
  const totalNetRevenue = products.reduce((sum, p) => sum + p.netRevenue, 0);
  const totalOriginalCogs = products.reduce((sum, p) => sum + p.originalCogs, 0);
  const totalReplacementCogs = products.reduce((sum, p) => sum + p.replacementCogs, 0);
  const totalManualCogs = products.reduce((sum, p) => sum + p.manualCogs, 0);
  const totalCogs = products.reduce((sum, p) => sum + p.totalCogs, 0);
  const totalGrossProfit = Math.round((totalNetRevenue - totalCogs) * 100) / 100;
  const overallGrossMarginPct = totalNetRevenue > 0
    ? Math.round((totalGrossProfit / totalNetRevenue) * 1000) / 10
    : 0;

  const totalKnownUnits = products.reduce((sum, p) => sum + p.knownCostUnits, 0);
  const totalUnknownUnits = products.reduce((sum, p) => sum + p.unknownCostUnits, 0);
  const overallCostCoveragePct = (totalKnownUnits + totalUnknownUnits) > 0
    ? Math.round((totalKnownUnits / (totalKnownUnits + totalUnknownUnits)) * 1000) / 10
    : 100.0;

  return {
    kpis: {
      totalUnitsSold,
      totalGrossRevenue: Math.round(totalGrossRevenue * 100) / 100,
      totalRefunded: Math.round(totalRefunded * 100) / 100,
      totalNetRevenue: Math.round(totalNetRevenue * 100) / 100,
      totalOriginalCogs: Math.round(totalOriginalCogs * 100) / 100,
      totalReplacementCogs: Math.round(totalReplacementCogs * 100) / 100,
      totalManualCogs: Math.round(totalManualCogs * 100) / 100,
      totalCogs: Math.round(totalCogs * 100) / 100,
      totalGrossProfit,
      overallGrossMarginPct,
      overallCostCoveragePct,
      isCostComplete: totalUnknownUnits === 0,
      totalUnknownUnits,
      totalKnownUnits,
    },
    products,
  };
}

/**
 * Supplier Performance Master Report
 */
export async function getSupplierPerformanceReport(filter: DateRangeFilter) {
  const suppliers = await prisma.supplier.findMany({
    include: {
      batches: {
        where: filter.startDate ? { purchaseDate: { gte: filter.startDate, ...(filter.endDate ? { lte: filter.endDate } : {}) } } : undefined,
        orderBy: { createdAt: "desc" },
      },
      digitalStocks: {
        select: {
          id: true,
          status: true,
          costPriceBDT: true,
          deliveredAt: true,
        },
      },
      productSuppliers: {
        include: {
          product: { select: { id: true, name: true } },
          variation: { select: { id: true, name: true } },
        },
      },
    },
  });

  return suppliers.map((s) => {
    const totalBatches = s.batches.length;
    const totalPurchasedUnits = s.batches.reduce((sum, b) => sum + (b.totalCount || b.quantityPurchased || 0), 0);
    const totalSpendBDT = s.batches.reduce(
      (sum, b) => sum + (b.totalCostBDT || ((b.totalCount || 0) * (b.unitCostBDT || 0))),
      0
    );

    const periodStocks = s.digitalStocks;
    const availableCount = periodStocks.filter((st) => st.status === "AVAILABLE").length;
    const deliveredCount = periodStocks.filter((st) => st.status === "DELIVERED").length;
    const replacedCount = periodStocks.filter((st) => st.status === "REPLACED").length;
    const invalidCount = periodStocks.filter((st) => st.status === "INVALID").length;
    const expiredCount = periodStocks.filter((st) => st.status === "EXPIRED").length;

    const availableValueBDT = periodStocks
      .filter((st) => st.status === "AVAILABLE" && st.costPriceBDT !== null)
      .reduce((sum, st) => sum + Number(st.costPriceBDT), 0);

    const stocksWithCost = periodStocks.filter((st) => st.costPriceBDT !== null);
    const avgCostBDT = stocksWithCost.length > 0
      ? Math.round((stocksWithCost.reduce((sum, st) => sum + Number(st.costPriceBDT), 0) / stocksWithCost.length) * 100) / 100
      : null;

    const invalidRatePct = periodStocks.length > 0
      ? Math.round((invalidCount / periodStocks.length) * 1000) / 10
      : 0;

    const replacementRatePct = (deliveredCount + replacedCount) > 0
      ? Math.round((replacedCount / (deliveredCount + replacedCount)) * 1000) / 10
      : 0;

    return {
      id: s.id,
      name: s.name,
      code: s.code,
      contactName: s.contactName,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      telegram: s.telegram,
      status: s.status || (s.isActive ? "ACTIVE" : "INACTIVE"),
      isActive: s.isActive,
      mappedProductsCount: s.productSuppliers.length,
      totalBatches,
      totalPurchasedUnits,
      totalSpendBDT: Math.round(totalSpendBDT * 100) / 100,
      availableCount,
      availableValueBDT: Math.round(availableValueBDT * 100) / 100,
      deliveredCount,
      replacedCount,
      invalidCount,
      expiredCount,
      avgCostBDT,
      invalidRatePct,
      replacementRatePct,
    };
  }).sort((a, b) => b.totalSpendBDT - a.totalSpendBDT);
}

/**
 * Inventory Valuation Report
 */
export async function getInventoryValuationReport() {
  const stocks = await prisma.digitalStock.findMany({
    select: {
      status: true,
      costPriceBDT: true,
    },
  });

  const valuationMap: Record<string, { count: number; knownCostCount: number; unknownCostCount: number; valueBDT: number }> = {
    AVAILABLE: { count: 0, knownCostCount: 0, unknownCostCount: 0, valueBDT: 0 },
    RESERVED: { count: 0, knownCostCount: 0, unknownCostCount: 0, valueBDT: 0 },
    DELIVERED: { count: 0, knownCostCount: 0, unknownCostCount: 0, valueBDT: 0 },
    REPLACED: { count: 0, knownCostCount: 0, unknownCostCount: 0, valueBDT: 0 },
    INVALID: { count: 0, knownCostCount: 0, unknownCostCount: 0, valueBDT: 0 },
    EXPIRED: { count: 0, knownCostCount: 0, unknownCostCount: 0, valueBDT: 0 },
    REFUNDED: { count: 0, knownCostCount: 0, unknownCostCount: 0, valueBDT: 0 },
  };

  for (const s of stocks) {
    const statusKey = s.status in valuationMap ? s.status : "AVAILABLE";
    valuationMap[statusKey].count++;
    if (s.costPriceBDT !== null && s.costPriceBDT !== undefined) {
      valuationMap[statusKey].knownCostCount++;
      valuationMap[statusKey].valueBDT += Number(s.costPriceBDT);
    } else {
      valuationMap[statusKey].unknownCostCount++;
    }
  }

  // Round values
  for (const key of Object.keys(valuationMap)) {
    valuationMap[key].valueBDT = Math.round(valuationMap[key].valueBDT * 100) / 100;
  }

  const totalStockUnits = stocks.length;
  const totalAvailableValueBDT = valuationMap.AVAILABLE.valueBDT;
  const totalReservedValueBDT = valuationMap.RESERVED.valueBDT;
  const totalDeliveredValueBDT = valuationMap.DELIVERED.valueBDT;
  const totalReplacedValueBDT = valuationMap.REPLACED.valueBDT;
  const totalInvalidWriteOffLossBDT = valuationMap.INVALID.valueBDT;
  const totalExpiredLossBDT = valuationMap.EXPIRED.valueBDT;

  return {
    totalStockUnits,
    totalAvailableValueBDT,
    totalReservedValueBDT,
    totalDeliveredValueBDT,
    totalReplacedValueBDT,
    totalInvalidWriteOffLossBDT,
    totalExpiredLossBDT,
    statusBreakdown: valuationMap,
  };
}

/**
 * Customer Cohort & Top Spender Analytics
 */
export async function getCustomerCohortsReport(filter: DateRangeFilter) {
  const orderWhere: any = { paymentStatus: "VERIFIED" as PaymentStatus };
  if (filter.startDate) {
    orderWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      userId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      totalBDT: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const customerMap: Record<
    string,
    {
      userId: string | null;
      email: string;
      name: string;
      phone: string;
      verifiedOrdersCount: number;
      totalVerifiedSpend: number;
      lastOrderDate: string;
      isRepeatCustomer: boolean;
    }
  > = {};

  for (const o of orders) {
    const email = o.customerEmail.toLowerCase().trim();
    if (!customerMap[email]) {
      customerMap[email] = {
        userId: o.userId || null,
        email,
        name: o.customerName,
        phone: o.customerPhone,
        verifiedOrdersCount: 0,
        totalVerifiedSpend: 0,
        lastOrderDate: o.createdAt.toISOString(),
        isRepeatCustomer: false,
      };
    }

    customerMap[email].verifiedOrdersCount += 1;
    customerMap[email].totalVerifiedSpend += o.totalBDT || 0;
    if (customerMap[email].verifiedOrdersCount >= 2) {
      customerMap[email].isRepeatCustomer = true;
    }
  }

  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.totalVerifiedSpend - a.totalVerifiedSpend)
    .slice(0, 50);

  return {
    totalPurchasingCustomers: Object.keys(customerMap).length,
    repeatCustomersCount: Object.values(customerMap).filter((c) => c.isRepeatCustomer).length,
    topCustomers,
  };
}

/**
 * Payment Gateway Breakdown & Settlement Health
 */
export async function getPaymentGatewayReport(filter: DateRangeFilter) {
  const orderWhere: any = {};
  if (filter.startDate) {
    orderWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      paymentMethod: true,
      paymentStatus: true,
      totalBDT: true,
    },
  });

  const gatewayMap: Record<
    string,
    {
      gateway: string;
      totalAttempts: number;
      verifiedCount: number;
      pendingCount: number;
      failedCount: number;
      verifiedVolumeBDT: number;
      successRatePct: number;
    }
  > = {};

  for (const o of orders) {
    const gw = (o.paymentMethod || "other").toLowerCase();
    if (!gatewayMap[gw]) {
      gatewayMap[gw] = {
        gateway: gw,
        totalAttempts: 0,
        verifiedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        verifiedVolumeBDT: 0,
        successRatePct: 0,
      };
    }

    gatewayMap[gw].totalAttempts += 1;
    if (o.paymentStatus === "VERIFIED") {
      gatewayMap[gw].verifiedCount += 1;
      gatewayMap[gw].verifiedVolumeBDT += o.totalBDT || 0;
    } else if (o.paymentStatus === "PENDING") {
      gatewayMap[gw].pendingCount += 1;
    } else {
      gatewayMap[gw].failedCount += 1;
    }
  }

  for (const g of Object.values(gatewayMap)) {
    g.successRatePct = g.totalAttempts > 0
      ? Math.round((g.verifiedCount / g.totalAttempts) * 1000) / 10
      : 0;
  }

  return Object.values(gatewayMap).sort((a, b) => b.verifiedVolumeBDT - a.verifiedVolumeBDT);
}

/**
 * Coupon & Promotional Performance
 */
export async function getCouponPerformanceReport(filter: DateRangeFilter) {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const orderWhere: any = {
    paymentStatus: "VERIFIED" as PaymentStatus,
    discountBDT: { gt: 0 },
  };

  if (filter.startDate) {
    orderWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const verifiedDiscountedOrders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      subtotalBDT: true,
      discountBDT: true,
      totalBDT: true,
      notes: true,
    },
  });

  const couponStats = coupons.map((c) => {
    return {
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      usedCount: c.usedCount,
      usageLimit: c.usageLimit,
      isActive: c.isActive,
      validUntil: c.validUntil.toISOString(),
      minOrderBDT: c.minOrderBDT,
      maxDiscountBDT: c.maxDiscountBDT,
    };
  });

  return {
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter((c) => c.isActive && new Date(c.validUntil) > new Date()).length,
    coupons: couponStats,
    verifiedDiscountedOrdersCount: verifiedDiscountedOrders.length,
    totalDiscountsGrantedBDT: verifiedDiscountedOrders.reduce((sum, o) => sum + (o.discountBDT || 0), 0),
  };
}

/**
 * Inventory Operational Health
 */
export async function getInventoryOperationalReport() {
  const stockCounts = await prisma.digitalStock.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const countMap: Record<string, number> = {
    AVAILABLE: 0,
    RESERVED: 0,
    ASSIGNED: 0,
    DELIVERED: 0,
    REPLACED: 0,
    INVALID: 0,
    EXPIRED: 0,
  };

  for (const sc of stockCounts) {
    countMap[sc.status] = sc._count.id;
  }

  // Identify low stock products
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", inStock: true },
    select: {
      id: true,
      name: true,
      slug: true,
      lowStockThreshold: true,
      digitalStocks: {
        where: { status: "AVAILABLE" },
        select: { id: true },
      },
    },
  });

  const lowStockAlerts = products
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      availableCount: p.digitalStocks.length,
      threshold: p.lowStockThreshold || 3,
      isLowStock: p.digitalStocks.length <= (p.lowStockThreshold || 3),
    }))
    .filter((p) => p.isLowStock)
    .sort((a, b) => a.availableCount - b.availableCount);

  return {
    distribution: countMap,
    totalStockUnits: Object.values(countMap).reduce((a, b) => a + b, 0),
    lowStockAlerts,
  };
}

/**
 * After-Sales: Refunds & Replacements
 */
export async function getAfterSalesMetrics(filter: DateRangeFilter) {
  const refundWhere: any = {};
  const replacementWhere: any = {};

  if (filter.startDate) {
    refundWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
    replacementWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const [refunds, replacements] = await Promise.all([
    prisma.refund.findMany({
      where: refundWhere,
      select: {
        id: true,
        status: true,
        reason: true,
        requestedAmountBDT: true,
        approvedAmountBDT: true,
        createdAt: true,
      },
    }),
    prisma.replacementRequest.findMany({
      where: replacementWhere,
      select: {
        id: true,
        status: true,
        reason: true,
        createdAt: true,
      },
    }),
  ]);

  const refundStatusMap: Record<string, number> = {};
  for (const r of refunds) {
    refundStatusMap[r.status] = (refundStatusMap[r.status] || 0) + 1;
  }

  const replacementStatusMap: Record<string, number> = {};
  for (const rep of replacements) {
    replacementStatusMap[rep.status] = (replacementStatusMap[rep.status] || 0) + 1;
  }

  return {
    refunds: {
      totalRequests: refunds.length,
      byStatus: refundStatusMap,
      completedAmountBDT: refunds
        .filter((r) => r.status === "REFUNDED" || r.status === "APPROVED")
        .reduce((sum, r) => sum + (r.approvedAmountBDT || r.requestedAmountBDT || 0), 0),
    },
    replacements: {
      totalRequests: replacements.length,
      byStatus: replacementStatusMap,
    },
  };
}

/**
 * Acquisition & Marketing Attribution
 */
export async function getAcquisitionReport(filter: DateRangeFilter) {
  const orderWhere: any = { paymentStatus: "VERIFIED" as PaymentStatus };
  if (filter.startDate) {
    orderWhere.createdAt = {
      gte: filter.startDate,
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const verifiedOrders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      referrer: true,
      totalBDT: true,
    },
  });

  const campaignMap: Record<
    string,
    {
      source: string;
      medium: string;
      campaign: string;
      verifiedOrdersCount: number;
      verifiedRevenueBDT: number;
    }
  > = {};

  let directOrUnattributedRevenue = 0;
  let directOrUnattributedOrders = 0;

  for (const o of verifiedOrders) {
    const src = o.utmSource?.trim() || "direct";
    const med = o.utmMedium?.trim() || "none";
    const camp = o.utmCampaign?.trim() || "(not set)";

    if (src === "direct" && med === "none" && camp === "(not set)") {
      directOrUnattributedRevenue += o.totalBDT || 0;
      directOrUnattributedOrders += 1;
    }

    const key = `${src}|${med}|${camp}`;
    if (!campaignMap[key]) {
      campaignMap[key] = {
        source: src,
        medium: med,
        campaign: camp,
        verifiedOrdersCount: 0,
        verifiedRevenueBDT: 0,
      };
    }

    campaignMap[key].verifiedOrdersCount += 1;
    campaignMap[key].verifiedRevenueBDT += o.totalBDT || 0;
  }

  return {
    campaigns: Object.values(campaignMap).sort((a, b) => b.verifiedRevenueBDT - a.verifiedRevenueBDT),
    directSummary: {
      ordersCount: directOrUnattributedOrders,
      revenueBDT: directOrUnattributedRevenue,
    },
    adSpendAvailable: false, // Explicitly disclosed: ad spend is not modeled in MySQL
  };
}

/**
 * CSV Formula Injection Sanitizer
 * Prepend single quote (') if string begins with =, +, -, @, \t, \r
 */
export function sanitizeCsvValue(val: any): string {
  if (val === null || val === undefined) return "";
  let str = String(val);

  // CSV Injection defense
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape inner double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generate Sanitized CSV for given report type
 */
export async function generateReportCSV(type: string, filter: DateRangeFilter): Promise<string> {
  if (type === "SALES") {
    const sales = await getSalesTimeSeries(filter);
    const headers = ["Date", "Verified Revenue (BDT)", "Total Orders Placed", "Verified Paid Orders"];
    const rows = sales.map((s) => [
      sanitizeCsvValue(s.date),
      s.verifiedRevenue,
      s.totalOrders,
      s.verifiedOrders,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  if (type === "PRODUCTS") {
    const products = await getProductPerformanceReport(filter);
    const headers = [
      "Product Name",
      "Variation",
      "Units Sold",
      "Verified Orders",
      "Gross Revenue (BDT)",
      "Refunded Amount (BDT)",
      "Net Revenue (BDT)",
      "Replacements Count",
      "Refunds Count",
      "Available Stock",
    ];
    const rows = products.map((p) => [
      sanitizeCsvValue(p.productName),
      sanitizeCsvValue(p.variationName),
      p.unitsSold,
      p.verifiedOrdersCount,
      p.grossRevenue,
      p.refundedAmount,
      p.netRevenue,
      p.replacementsCount,
      p.refundsCount,
      p.availableStock,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  if (type === "CUSTOMERS") {
    const cohorts = await getCustomerCohortsReport(filter);
    const headers = ["Customer Name", "Email", "Phone", "Verified Orders Count", "Total Verified Spend (BDT)", "Last Order Date", "Is Repeat Customer"];
    const rows = cohorts.topCustomers.map((c) => [
      sanitizeCsvValue(c.name),
      sanitizeCsvValue(c.email),
      sanitizeCsvValue(c.phone),
      c.verifiedOrdersCount,
      c.totalVerifiedSpend,
      sanitizeCsvValue(c.lastOrderDate),
      c.isRepeatCustomer ? "YES" : "NO",
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  if (type === "PAYMENTS") {
    const gateways = await getPaymentGatewayReport(filter);
    const headers = ["Gateway / Method", "Total Attempts", "Verified Count", "Pending Count", "Failed Count", "Verified Volume (BDT)", "Success Rate (%)"];
    const rows = gateways.map((g) => [
      sanitizeCsvValue(g.gateway),
      g.totalAttempts,
      g.verifiedCount,
      g.pendingCount,
      g.failedCount,
      g.verifiedVolumeBDT,
      `${g.successRatePct}%`,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  if (type === "PROFIT") {
    const profitData = await getProfitAndMarginReport(filter);
    const headers = [
      "Product Name",
      "Variation",
      "Units Sold",
      "Gross Revenue (BDT)",
      "Refunded (BDT)",
      "Net Revenue (BDT)",
      "Delivered Stock COGS (BDT)",
      "Replacement Cost (BDT)",
      "Manual Fulfillment Cost (BDT)",
      "Total COGS (BDT)",
      "Realized Gross Profit (BDT)",
      "Gross Margin (%)",
      "Cost Coverage (%)",
      "Cost Status",
      "Available Stock Units",
      "Available Stock Value (BDT)",
    ];
    const rows = profitData.products.map((p) => [
      sanitizeCsvValue(p.productName),
      sanitizeCsvValue(p.variationName),
      p.unitsSold,
      p.grossRevenue,
      p.refundedAmount,
      p.netRevenue,
      p.originalCogs,
      p.replacementCogs,
      p.manualCogs,
      p.totalCogs,
      p.grossProfit,
      `${p.grossMarginPct}%`,
      `${p.costCoveragePct}%`,
      p.isCostComplete ? "COMPLETE" : "PARTIAL / COST UNKNOWN",
      p.availableStock,
      p.availableStockValueBDT,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  if (type === "SUPPLIERS") {
    const suppliers = await getSupplierPerformanceReport(filter);
    const headers = [
      "Supplier Name",
      "Supplier Code",
      "Contact Name",
      "Email",
      "Phone",
      "Status",
      "Mapped Products Count",
      "Total Batches",
      "Total Purchased Units",
      "Total Spend (BDT)",
      "Available Units",
      "Available Value (BDT)",
      "Delivered Units",
      "Replaced Units",
      "Invalid Units",
      "Invalid Rate (%)",
      "Replacement Rate (%)",
      "Average Acquisition Cost (BDT)",
    ];
    const rows = suppliers.map((s) => [
      sanitizeCsvValue(s.name),
      sanitizeCsvValue(s.code),
      sanitizeCsvValue(s.contactName),
      sanitizeCsvValue(s.contactEmail),
      sanitizeCsvValue(s.contactPhone),
      sanitizeCsvValue(s.status),
      s.mappedProductsCount,
      s.totalBatches,
      s.totalPurchasedUnits,
      s.totalSpendBDT,
      s.availableCount,
      s.availableValueBDT,
      s.deliveredCount,
      s.replacedCount,
      s.invalidCount,
      `${s.invalidRatePct}%`,
      `${s.replacementRatePct}%`,
      s.avgCostBDT !== null ? s.avgCostBDT : "N/A",
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  if (type === "PROCUREMENT") {
    const batchWhere: any = {};
    if (filter.startDate) {
      batchWhere.purchaseDate = {
        gte: filter.startDate,
        ...(filter.endDate ? { lte: filter.endDate } : {}),
      };
    }
    const batches = await prisma.inventoryBatch.findMany({
      where: batchWhere,
      include: {
        supplier: { select: { name: true, code: true } },
        product: { select: { name: true } },
        variation: { select: { name: true } },
      },
      orderBy: { purchaseDate: "desc" },
    });

    const headers = [
      "Batch Reference",
      "Supplier Name",
      "Supplier Code",
      "Product Name",
      "Variation",
      "Quantity Purchased",
      "Currency",
      "Unit Cost (Original)",
      "Exchange Rate (to BDT)",
      "Unit Cost (BDT)",
      "Total Cost (BDT)",
      "Available Count",
      "Delivered Count",
      "Replaced Count",
      "Invalid Count",
      "Status",
      "Purchase Date",
    ];

    const rows = batches.map((b) => [
      sanitizeCsvValue(b.batchRef),
      sanitizeCsvValue(b.supplier?.name || b.supplierName || "Direct / Internal"),
      sanitizeCsvValue(b.supplier?.code || "N/A"),
      sanitizeCsvValue(b.product.name),
      sanitizeCsvValue(b.variation?.name || "Standard"),
      b.quantityPurchased || b.totalCount,
      sanitizeCsvValue(b.currency || "BDT"),
      b.unitCost !== null ? b.unitCost : "N/A",
      b.exchangeRateToBDT || 1.0,
      b.unitCostBDT !== null ? b.unitCostBDT : "N/A",
      b.totalCostBDT !== null ? b.totalCostBDT : (b.unitCostBDT ? (b.quantityPurchased || b.totalCount) * b.unitCostBDT : "N/A"),
      b.availableCount,
      b.deliveredCount,
      b.replacedCount,
      (b.replacedCount || 0) + (b.refundedCount || 0),
      sanitizeCsvValue(b.status || "RECEIVED"),
      sanitizeCsvValue(b.purchaseDate ? b.purchaseDate.toISOString().split("T")[0] : b.createdAt.toISOString().split("T")[0]),
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  return "Report type not supported";
}
