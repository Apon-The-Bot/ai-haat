import type { Prisma } from "@prisma/client";
import { evaluateAutomationConsent, promotionalPurposes, type AutomationPurpose, type Suppression } from "./automation-consent";

type Store = Pick<Prisma.TransactionClient, "whatsappAutomationIdentity">;
type RevocationStore = Pick<Prisma.TransactionClient,
  "whatsappAutomationIdentity" | "whatsappAutomationConsent" | "whatsappAutomationSuppression">;

type ConsentStore = Pick<Prisma.TransactionClient,
  "whatsappAutomationIdentity" | "whatsappAutomationConsent">;

const purposes = new Set<AutomationPurpose>([
  "authentication", "order", "payment", "subscription", "abandoned-checkout",
  "campaign", "stock", "review", "reactivation", "support", "admin-operational",
]);

// Grants are accepted only for an existing, current, verified identity. The
// caller must establish ownership before invoking this transaction-scoped API.
export async function grantAutomationConsent(tx: ConsentStore, input: {
  userId: string;
  revision: string;
  addressFingerprint: string;
  purpose: AutomationPurpose;
  wordingVersion: string;
  locale: string;
  source: "preference-center" | "explicit-enrollment";
  now: Date;
}) {
  const { userId, revision, addressFingerprint, purpose, wordingVersion, locale, source, now } = input;
  if (!purposes.has(purpose) || !/^[a-f0-9]{64}$/.test(addressFingerprint)
    || !wordingVersion.trim() || !locale.trim() || !Number.isFinite(now.getTime())) {
    return { granted: false, reason: "invalid-evidence" } as const;
  }
  const identity = await tx.whatsappAutomationIdentity.findUnique({
    where: { userId_revision: { userId, revision } },
    select: { id: true, addressFingerprint: true, verifiedAt: true, revokedAt: true },
  });
  if (!identity || identity.revokedAt !== null || identity.addressFingerprint !== addressFingerprint
    || identity.verifiedAt.getTime() > now.getTime()) {
    return { granted: false, reason: "unverified-identity" } as const;
  }
  await tx.whatsappAutomationConsent.upsert({
    where: { identityId_purpose: { identityId: identity.id, purpose } },
    create: { identityId: identity.id, purpose, grantedAt: now, revokedAt: null, wordingVersion, locale, source },
    update: { grantedAt: now, revokedAt: null, wordingVersion, locale, source },
  });
  return { granted: true, identityId: identity.id, purpose } as const;
}

// The application supplies the authenticated user ID and wraps both writes in
// its transaction. Repeating an opt-out leaves the original evidence intact.
export async function revokeAutomationConsent(tx: RevocationStore, input: {
  userId: string;
  revision: string;
  scope: Suppression["scope"];
  now: Date;
}) {
  const { userId, revision, scope, now } = input;
  const identity = await tx.whatsappAutomationIdentity.findUnique({
    where: { userId_revision: { userId, revision } },
    select: { id: true },
  });
  if (!identity) return { suppressed: false } as const;
  await tx.whatsappAutomationSuppression.createMany({
    data: { identityId: identity.id, scope, createdAt: now },
    skipDuplicates: true,
  });
  await tx.whatsappAutomationConsent.updateMany({
    where: {
      identityId: identity.id,
      revokedAt: null,
      ...(scope === "global" ? {} : {
        purpose: scope === "promotional" ? { in: [...promotionalPurposes] } : scope,
      }),
    },
    data: { revokedAt: now },
  });
  return { suppressed: true } as const;
}

// The caller must resolve the recipient from an authoritative domain record and
// supply the current address fingerprint. A profile phone alone is insufficient.
export async function readAutomationEligibility(db: Store, input: {
  userId: string;
  revision: string;
  addressFingerprint: string;
  purpose: AutomationPurpose;
  now: Date;
}) {
  const { userId, revision, addressFingerprint, purpose, now } = input;
  if (!/^[a-f0-9]{64}$/.test(addressFingerprint)) return { allowed: false, reason: "unverified-identity" } as const;
  const identity = await db.whatsappAutomationIdentity.findUnique({
    where: { userId_revision: { userId, revision } },
    select: {
      id: true, userId: true, revision: true, addressFingerprint: true, verifiedAt: true, revokedAt: true,
      consents: { where: { purpose }, take: 1 },
      suppressions: { where: { scope: { in: ["global", "promotional", purpose] } }, take: 3, select: { scope: true } },
    },
  });
  if (!identity || identity.addressFingerprint !== addressFingerprint) {
    return { allowed: false, reason: "unverified-identity" } as const;
  }
  const row = identity.consents[0];
  const consent = row && row.purpose === purpose
    && (row.source === "preference-center" || row.source === "explicit-enrollment")
    ? { ...row, purpose, source: row.source, identityRevision: identity.revision } as const
    : null;
  const suppressions = identity.suppressions.flatMap<Suppression>(({ scope }) =>
    scope === "global" || scope === "promotional" || scope === purpose
      ? [{ identityId: identity.id, scope }] : []);
  return evaluateAutomationConsent({ userId, purpose, now, identity, consent, suppressions });
}
