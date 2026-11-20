import type { Prisma } from "@prisma/client";
import { evaluateAutomationConsent, promotionalPurposes, type AutomationPurpose, type Suppression } from "./automation-consent";

type Store = Pick<Prisma.TransactionClient, "whatsappAutomationIdentity">;
type RevocationStore = Pick<Prisma.TransactionClient,
  "whatsappAutomationIdentity" | "whatsappAutomationConsent" | "whatsappAutomationSuppression">;

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
