import { prisma } from "@/lib/prisma";
import { CampaignRecipientSnapshot, SegmentRuleGroup } from "./types";

export interface AudienceResolutionResult {
  recipients: CampaignRecipientSnapshot[];
  totalEligible: number;
  totalSuppressed: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resolves audience criteria into a deduplicated, suppression-filtered list of eligible recipients.
 */
export async function resolveAudience(params: {
  audienceType: string;
  audienceFilter?: string | Record<string, any> | null;
  segmentId?: string | null;
  manualEmails?: string[];
}): Promise<AudienceResolutionResult> {
  const { audienceType, audienceFilter, segmentId, manualEmails } = params;

  // 1. Fetch full suppression set
  const suppressions = await prisma.emailSuppression.findMany({
    select: { email: true },
  });
  const suppressionSet = new Set(suppressions.map((s) => s.email.toLowerCase().trim()));

  // 2. Fetch opt-out contacts
  const optOutContacts = await prisma.emailContact.findMany({
    where: {
      OR: [{ isSubscribed: false }, { promotionalConsent: false }],
    },
    select: { email: true },
  });
  for (const c of optOutContacts) {
    suppressionSet.add(c.email.toLowerCase().trim());
  }

  let rawCandidates: Array<{
    email: string;
    name?: string | null;
    userId?: string | null;
    orderCount?: number;
    totalSpent?: number;
    lastOrderDate?: string;
  }> = [];

  let parsedFilter: Record<string, any> = {};
  if (audienceFilter) {
    parsedFilter = typeof audienceFilter === "string" ? JSON.parse(audienceFilter) : audienceFilter;
  }

  // 3. Resolve by audience type
  switch (audienceType) {
    case "ALL_SUBSCRIBED": {
      // Users + EmailContacts that are subscribed
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          orders: {
            where: { paymentStatus: "VERIFIED" },
            select: { totalBDT: true, createdAt: true },
          },
        },
      });

      rawCandidates = users.map((u) => {
        const orderCount = u.orders.length;
        const totalSpent = u.orders.reduce((sum, o) => sum + o.totalBDT, 0);
        const lastOrder = u.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        return {
          email: u.email,
          name: u.name,
          userId: u.id,
          orderCount,
          totalSpent,
          lastOrderDate: lastOrder ? lastOrder.createdAt.toISOString().split("T")[0] : undefined,
        };
      });

      // Also include standalone EmailContacts
      const extraContacts = await prisma.emailContact.findMany({
        where: {
          isSubscribed: true,
          promotionalConsent: true,
          userId: null,
        },
        select: { email: true, name: true },
      });
      for (const ec of extraContacts) {
        rawCandidates.push({ email: ec.email, name: ec.name });
      }
      break;
    }

    case "ALL_CUSTOMERS": {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          orders: {
            where: { paymentStatus: "VERIFIED" },
            select: { totalBDT: true, createdAt: true },
          },
        },
      });

      rawCandidates = users.map((u) => ({
        email: u.email,
        name: u.name,
        userId: u.id,
        orderCount: u.orders.length,
        totalSpent: u.orders.reduce((sum, o) => sum + o.totalBDT, 0),
        lastOrderDate: u.orders[0]?.createdAt ? u.orders[0].createdAt.toISOString().split("T")[0] : undefined,
      }));
      break;
    }

    case "PURCHASED": {
      const users = await prisma.user.findMany({
        where: {
          orders: {
            some: { paymentStatus: "VERIFIED" },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          orders: {
            where: { paymentStatus: "VERIFIED" },
            select: { totalBDT: true, createdAt: true },
          },
        },
      });

      rawCandidates = users.map((u) => ({
        email: u.email,
        name: u.name,
        userId: u.id,
        orderCount: u.orders.length,
        totalSpent: u.orders.reduce((sum, o) => sum + o.totalBDT, 0),
        lastOrderDate: u.orders[0]?.createdAt ? u.orders[0].createdAt.toISOString().split("T")[0] : undefined,
      }));
      break;
    }

    case "NEVER_PURCHASED": {
      const users = await prisma.user.findMany({
        where: {
          orders: {
            none: { paymentStatus: "VERIFIED" },
          },
        },
        select: { id: true, email: true, name: true },
      });

      rawCandidates = users.map((u) => ({
        email: u.email,
        name: u.name,
        userId: u.id,
        orderCount: 0,
        totalSpent: 0,
      }));
      break;
    }

    case "SPECIFIC_PRODUCTS": {
      const productSlugs: string[] = parsedFilter.productSlugs || [];
      if (productSlugs.length === 0) break;

      const orders = await prisma.order.findMany({
        where: {
          paymentStatus: "VERIFIED",
          items: {
            some: {
              OR: [
                { productId: { in: productSlugs } },
                { productName: { in: productSlugs } },
              ],
            },
          },
        },
        select: {
          userId: true,
          customerEmail: true,
          customerName: true,
          totalBDT: true,
          createdAt: true,
        },
      });

      const userMap = new Map<string, typeof rawCandidates[0]>();
      for (const o of orders) {
        const em = o.customerEmail.toLowerCase().trim();
        if (!userMap.has(em)) {
          userMap.set(em, {
            email: o.customerEmail,
            name: o.customerName,
            userId: o.userId,
            orderCount: 1,
            totalSpent: o.totalBDT,
            lastOrderDate: o.createdAt.toISOString().split("T")[0],
          });
        }
      }
      rawCandidates = Array.from(userMap.values());
      break;
    }

    case "SPENT_RANGE": {
      const min = Number(parsedFilter.minSpent || 0);
      const max = parsedFilter.maxSpent ? Number(parsedFilter.maxSpent) : Infinity;

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          orders: {
            where: { paymentStatus: "VERIFIED" },
            select: { totalBDT: true, createdAt: true },
          },
        },
      });

      for (const u of users) {
        const spent = u.orders.reduce((sum, o) => sum + o.totalBDT, 0);
        if (spent >= min && spent <= max) {
          rawCandidates.push({
            email: u.email,
            name: u.name,
            userId: u.id,
            orderCount: u.orders.length,
            totalSpent: spent,
            lastOrderDate: u.orders[0]?.createdAt ? u.orders[0].createdAt.toISOString().split("T")[0] : undefined,
          });
        }
      }
      break;
    }

    case "CUSTOM_SEGMENT": {
      if (segmentId) {
        const segment = await prisma.emailSegment.findUnique({
          where: { id: segmentId },
        });
        if (segment && segment.conditions) {
          try {
            const ruleGroup: SegmentRuleGroup = JSON.parse(segment.conditions);
            // Default to all users and filter by rule group conditions
            const users = await prisma.user.findMany({
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                emailVerified: true,
                orders: {
                  where: { paymentStatus: "VERIFIED" },
                  select: { totalBDT: true, createdAt: true },
                },
              },
            });

            for (const u of users) {
              const orderCount = u.orders.length;
              const totalSpent = u.orders.reduce((sum, o) => sum + o.totalBDT, 0);
              const daysSinceRegistered = Math.floor(
                (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24)
              );

              let matches = ruleGroup.logic === "AND";
              for (const cond of ruleGroup.conditions || []) {
                let condMatch = false;
                if (cond.field === "order_count") {
                  const val = Number(cond.value || 0);
                  condMatch = cond.operator === "greater_than" ? orderCount > val : orderCount >= val;
                } else if (cond.field === "total_spent") {
                  const val = Number(cond.value || 0);
                  condMatch = cond.operator === "greater_than" ? totalSpent > val : totalSpent >= val;
                } else if (cond.field === "registered_days_ago") {
                  const val = Number(cond.value || 0);
                  condMatch = cond.operator === "less_than" ? daysSinceRegistered <= val : daysSinceRegistered >= val;
                } else {
                  condMatch = true;
                }

                if (ruleGroup.logic === "AND") {
                  matches = matches && condMatch;
                } else {
                  matches = matches || condMatch;
                }
              }

              if (matches) {
                rawCandidates.push({
                  email: u.email,
                  name: u.name,
                  userId: u.id,
                  orderCount,
                  totalSpent,
                });
              }
            }
          } catch (err) {
            console.error("Failed to parse segment conditions:", err);
          }
        }
      }
      break;
    }

    case "MANUAL": {
      const list = manualEmails || parsedFilter.manualEmails || [];
      for (const e of list) {
        if (e && typeof e === "string") {
          rawCandidates.push({ email: e.trim() });
        }
      }
      break;
    }

    default: {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true },
      });
      rawCandidates = users.map((u) => ({ email: u.email, name: u.name, userId: u.id }));
    }
  }

  // 4. Deduplicate & Filter Suppressions
  const eligibleMap = new Map<string, CampaignRecipientSnapshot>();
  let totalSuppressed = 0;

  for (const item of rawCandidates) {
    const cleanEmail = item.email.toLowerCase().trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      continue;
    }

    if (suppressionSet.has(cleanEmail)) {
      totalSuppressed++;
      continue;
    }

    if (!eligibleMap.has(cleanEmail)) {
      eligibleMap.set(cleanEmail, {
        email: cleanEmail,
        name: item.name || undefined,
        userId: item.userId || undefined,
        orderCount: item.orderCount || 0,
        totalSpent: item.totalSpent || 0,
        lastOrderDate: item.lastOrderDate,
      });
    }
  }

  const recipients = Array.from(eligibleMap.values());
  return {
    recipients,
    totalEligible: recipients.length,
    totalSuppressed,
  };
}