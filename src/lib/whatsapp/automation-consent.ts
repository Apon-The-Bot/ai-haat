export type AutomationPurpose = "authentication" | "order" | "payment" | "subscription"
  | "abandoned-checkout" | "campaign" | "stock" | "review" | "reactivation" | "support" | "admin-operational";

export type ChannelIdentity = {
  id: string;
  userId: string;
  revision: string;
  verifiedAt: Date;
  revokedAt: Date | null;
};

export type ConsentEvidence = {
  identityId: string;
  identityRevision: string;
  purpose: AutomationPurpose;
  grantedAt: Date;
  revokedAt: Date | null;
  wordingVersion: string;
  locale: string;
  source: "preference-center" | "explicit-enrollment";
};

export type Suppression = {
  scope: "global" | "promotional" | AutomationPurpose;
  identityId: string;
};

export const promotionalPurposes = ["abandoned-checkout", "campaign", "review", "reactivation"] as const;
const promotional = new Set<AutomationPurpose>(promotionalPurposes);

export function evaluateAutomationConsent(input: {
  userId: string;
  purpose: AutomationPurpose;
  identity: ChannelIdentity | null;
  consent: ConsentEvidence | null;
  suppressions: readonly Suppression[];
  now: Date;
}) {
  const { userId, purpose, identity, consent, suppressions, now } = input;
  const timestamp = now.getTime();
  const verified = identity?.verifiedAt.getTime();
  if (!identity || identity.userId !== userId || identity.revokedAt !== null
    || verified === undefined || !Number.isFinite(verified) || !Number.isFinite(timestamp) || verified > timestamp) {
    return { allowed: false, reason: "unverified-identity" } as const;
  }
  if (suppressions.some(({ identityId, scope }) => identityId === identity.id
    && (scope === "global" || scope === purpose || (scope === "promotional" && promotional.has(purpose))))) {
    return { allowed: false, reason: "suppressed" } as const;
  }
  const granted = consent?.grantedAt.getTime();
  if (!consent || consent.identityId !== identity.id || consent.identityRevision !== identity.revision
    || consent.purpose !== purpose || consent.revokedAt !== null || !consent.wordingVersion.trim()
    || !consent.locale.trim() || !["preference-center", "explicit-enrollment"].includes(consent.source)
    || granted === undefined || !Number.isFinite(granted) || granted < verified || granted > timestamp) {
    return { allowed: false, reason: "consent-required" } as const;
  }
  return { allowed: true } as const;
}
