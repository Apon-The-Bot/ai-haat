import { prisma } from "@/lib/prisma";
import { recordTechnicalObservation } from "@/lib/user-intelligence/user-intelligence-service";

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  conditionDescription: string;
  actionType: "CREATE_SECURITY_ALERT" | "AUTO_RESTORE_ACCESS" | "ASSIGN_TAG" | "CREATE_SUPPORT_INCIDENT" | "FLAG_FOR_REVIEW";
  isEnabled: boolean;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export const SYSTEM_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "RULE_FAIL_LOGINS_ALERT",
    name: "Brute-Force & Failed Logins Alert",
    triggerEvent: "AUTH_FAILED",
    conditionDescription: "3 or more failed authentication attempts within 24 hours",
    actionType: "CREATE_SECURITY_ALERT",
    isEnabled: true,
    severity: "CRITICAL",
  },
  {
    id: "RULE_RESTRICTION_EXPIRY_CLEANUP",
    name: "Automated Restriction Expiration Restoration",
    triggerEvent: "RESTRICTION_EXPIRED",
    conditionDescription: "expiresAt timestamp has elapsed for temporary feature restriction",
    actionType: "AUTO_RESTORE_ACCESS",
    isEnabled: true,
    severity: "INFO",
  },
  {
    id: "RULE_DATACENTER_PROXY_FLAG",
    name: "Cloud Datacenter / Proxy Ingestion Flag",
    triggerEvent: "IP_NETWORK_OBSERVED",
    conditionDescription: "Traffic detected originating from AWS/GCP/Azure hosting ranges",
    actionType: "FLAG_FOR_REVIEW",
    isEnabled: true,
    severity: "WARNING",
  },
  {
    id: "RULE_HIGH_VALUE_VIP_TAG",
    name: "High-Value VIP Customer Identification",
    triggerEvent: "ORDER_COMPLETED",
    conditionDescription: "Customer lifetime spending exceeds ৳10,000 BDT across verified orders",
    actionType: "ASSIGN_TAG",
    isEnabled: true,
    severity: "INFO",
  },
  {
    id: "RULE_FAILED_DELIVERY_INCIDENT",
    name: "Digital Asset Delivery Failure Resolution",
    triggerEvent: "DELIVERY_FAILED",
    conditionDescription: "Stock allocation or instant delivery webhook reports failure",
    actionType: "CREATE_SUPPORT_INCIDENT",
    isEnabled: true,
    severity: "CRITICAL",
  },
];

export async function evaluateUserAutomationRules(userId: string): Promise<{
  triggeredRules: Array<{ ruleId: string; name: string; actionExecuted: string; details: any }>;
}> {
  const triggered: Array<{ ruleId: string; name: string; actionExecuted: string; details: any }> = [];

  const [user, activityLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: { where: { paymentStatus: "VERIFIED" } },
        userTags: true,
        restrictions: { where: { isRestricted: true } },
      },
    }),
    prisma.userActivityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  if (!user) return { triggeredRules: [] };

  // Rule 1: High Value VIP Tag
  const lifetimeSpend = user.orders.reduce((sum, o) => sum + (o.totalBDT || 0), 0);
  const hasVipTag = user.userTags.some((t) => t.tag === "VIP");
  if (lifetimeSpend >= 10000 && !hasVipTag) {
    await prisma.userTag.create({
      data: {
        userId,
        tag: "VIP",
        assignedById: "SYSTEM_AUTOMATION_ENGINE",
      },
    }).catch(() => {});

    triggered.push({
      ruleId: "RULE_HIGH_VALUE_VIP_TAG",
      name: "High-Value VIP Customer Identification",
      actionExecuted: "ASSIGN_TAG: VIP",
      details: { lifetimeSpendBDT: lifetimeSpend },
    });
  }

  // Rule 2: Expired Restrictions auto-restoration
  const now = new Date();
  const expiredRestrictions = user.restrictions.filter((r) => r.expiresAt && r.expiresAt <= now);
  for (const exp of expiredRestrictions) {
    await prisma.userRestriction.update({
      where: { id: exp.id },
      data: { isRestricted: false, reason: "Automatically restored via restriction expiry schedule" },
    }).catch(() => {});

    triggered.push({
      ruleId: "RULE_RESTRICTION_EXPIRY_CLEANUP",
      name: "Automated Restriction Expiration Restoration",
      actionExecuted: `AUTO_RESTORE_ACCESS: ${exp.featureKey}`,
      details: { expiredAt: exp.expiresAt },
    });
  }

  return { triggeredRules: triggered };
}
