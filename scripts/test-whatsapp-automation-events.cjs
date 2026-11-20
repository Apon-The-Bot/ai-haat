const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

function load(name, dependencies = {}) {
  const file = path.join(__dirname, "../src/lib/whatsapp", name + ".ts");
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  Function("require", "exports", code)(
    (id) => Object.hasOwn(dependencies, id) ? dependencies[id] : require(id),
    loaded.exports
  );
  return loaded.exports;
}
const events = load("automation-events");
const { parseAutomationEvent, describeAutomationEvent } = events;
const { recordAutomationEvent } = load("automation-outbox", { "./automation-events": events });
const { inspectAutomationBatch } = load("automation-inspector", { "./automation-events": events });
const consentPolicy = load("automation-consent");
const { evaluateAutomationConsent } = consentPolicy;
const { readAutomationEligibility } = load("automation-consent-store", { "./automation-consent": consentPolicy });
const { revokeAutomationConsent } = load("automation-consent-store", { "./automation-consent": consentPolicy });

const event = Object.freeze({
  schemaVersion: 1, type: "payment.settled", producer: "payments",
  entityId: "order_001", entityVersion: "settlement_001", correlationId: "request_001",
  occurredAt: "2026-11-21T00:00:00.000Z",
});

test("durable consent lookup rejects a changed address and respects stored suppression", async () => {
  const now = new Date("2026-11-21T00:00Z");
  const input = { userId: "user", revision: "2", addressFingerprint: "a".repeat(64), purpose: "campaign", now };
  const identity = { ...input, id: "identity", verifiedAt: now, revokedAt: null, suppressions: [],
    consents: [{ identityId: "identity", purpose: "campaign", grantedAt: now, revokedAt: null,
      wordingVersion: "v1", locale: "bn", source: "preference-center" }] };
  const db = { whatsappAutomationIdentity: { findUnique: async ({ where, select }) => {
    assert.deepEqual(where.userId_revision, { userId: "user", revision: "2" });
    assert.equal(select.consents.take, 1);
    assert.equal(select.suppressions.take, 3);
    return identity;
  } } };
  assert.deepEqual(await readAutomationEligibility(db, input), { allowed: true });
  assert.equal((await readAutomationEligibility(db, { ...input, addressFingerprint: "b".repeat(64) })).reason,
    "unverified-identity");
  identity.suppressions.push({ scope: "promotional" });
  assert.equal((await readAutomationEligibility(db, input)).reason, "suppressed");
});

test("retries share a key, while different versions and entities have separate keys", () => {
  const describe = (patch) => describeAutomationEvent(parseAutomationEvent({ ...event, ...patch }));
  const first = describe({});
  assert.equal(first.disposition, "dry-run");
  assert.equal(first.templateKey, "payment-settled");
  assert.equal(first.dedupeKey, describe({ correlationId: "request_002", occurredAt: "2026-11-21T00:01:00.000Z" }).dedupeKey);
  assert.notEqual(first.dedupeKey, describe({ entityVersion: "settlement_002" }).dedupeKey);
  assert.notEqual(first.dedupeKey, describe({ entityId: "order_002" }).dedupeKey);
});

test("rejects unknown fields, mismatched producer, invalid version and malformed time", () => {
  for (const patch of [
    { body: "unapproved" }, { phone: "fixture" }, { type: "__proto__" }, { producer: "orders" },
    { schemaVersion: 2 }, { entityId: "fixture@example.test" }, { entityVersion: "" },
    { occurredAt: "2026-02-30T00:00:00.000Z" }, { occurredAt: "2026-11-21T06:00:00+06:00" },
  ]) assert.equal(parseAutomationEvent({ ...event, ...patch }), null);
});

test("outbox validates before writing and retries use the same primary key", async () => {
  const rows = new Map();
  const tx = { whatsappAutomationEvent: { createMany: async ({ data, skipDuplicates }) => {
    assert.equal(skipDuplicates, true);
    if (rows.has(data.id)) return { count: 0 };
    rows.set(data.id, data);
    return { count: 1 };
  } } };
  assert.deepEqual(await recordAutomationEvent(tx, { ...event, phone: "fixture" }), {
    recorded: false, reason: "invalid-event",
  });
  assert.equal(rows.size, 0);
  const first = await recordAutomationEvent(tx, event);
  const second = await recordAutomationEvent(tx, { ...event, correlationId: "request_002" });
  assert.deepEqual(second, { ...first, inserted: false });
  assert.equal(first.inserted, true);
  assert.equal(rows.size, 1);
});

test("two inspectors finalize an expired lease only once and leave future events alone", async () => {
  const now = new Date("2026-11-21T00:01:00Z");
  const id = describeAutomationEvent(event).dedupeKey;
  const rows = [
    { ...event, id, occurredAt: new Date(event.occurredAt), state: "Pending", availableAt: now, claimToken: "old" },
    { ...event, id: "wrong-key", occurredAt: new Date(event.occurredAt), state: "Pending", availableAt: now },
    { ...event, id: "future", occurredAt: new Date(event.occurredAt), state: "Pending", availableAt: new Date(now.getTime() + 1) },
  ];
  const db = { whatsappAutomationEvent: {
    findMany: async ({ where, take, select }) => {
      assert.equal(take, 20);
      return rows.filter((row) => row.state === where.state && row.availableAt <= where.availableAt.lte)
        .map((row) => Object.fromEntries(Object.keys(select).map((key) => [key, row[key]])));
    },
    updateMany: async ({ where, data }) => {
      const row = rows.find((candidate) => candidate.id === where.id && candidate.state === where.state
        && (where.availableAt.lte ? candidate.availableAt <= where.availableAt.lte
          : candidate.claimToken === where.claimToken && candidate.availableAt > where.availableAt.gt));
      if (!row) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    },
  } };
  const results = await Promise.all([inspectAutomationBatch(db, () => now), inspectAutomationBatch(db, () => now)]);
  assert.equal(results.reduce((sum, result) => sum + result.inspected, 0), 1);
  assert.equal(results.reduce((sum, result) => sum + result.invalid, 0), 1);
  assert.deepEqual(rows.map(({ state }) => state), ["Inspected", "Invalid", "Pending"]);
});

test("consent is explicit and bound to verified ownership, purpose and current number revision", () => {
  const verifiedAt = new Date("2026-11-20T00:00Z");
  const now = new Date("2026-11-21T00:00Z");
  const identity = { id: "identity", userId: "user", revision: "2", verifiedAt, revokedAt: null };
  const consent = {
    identityId: identity.id, identityRevision: "2", purpose: "campaign", grantedAt: now,
    revokedAt: null, wordingVersion: "v1", locale: "bn", source: "preference-center",
  };
  const input = { identity, consent, userId: "user", purpose: "campaign", now, suppressions: [] };
  assert.deepEqual(evaluateAutomationConsent(input), { allowed: true });
  for (const patch of [
    { consent: null }, { userId: "different" }, { purpose: "reactivation" },
    { identity: { ...identity, revokedAt: now } },
    { consent: { ...consent, identityRevision: "1" } },
    { consent: { ...consent, revokedAt: now } },
    { consent: { ...consent, grantedAt: new Date("invalid") } },
    { suppressions: [{ identityId: identity.id, scope: "promotional" }] },
  ]) assert.equal(evaluateAutomationConsent({ ...input, ...patch }).allowed, false);
  assert.equal(evaluateAutomationConsent({
    ...input, purpose: "support", consent: { ...consent, purpose: "support" },
    suppressions: [{ identityId: identity.id, scope: "promotional" }],
  }).allowed, true);
});

test("consent revocation is scoped, ownership-bound and idempotent", async () => {
  const now = new Date("2026-11-21T00:00Z");
  const calls = { suppression: [], updates: [] };
  const tx = {
    whatsappAutomationIdentity: {
      findUnique: async ({ where }) => where.userId_revision.userId === "user"
        ? { id: "identity" } : null,
    },
    whatsappAutomationSuppression: {
      createMany: async ({ data, skipDuplicates }) => {
        assert.equal(skipDuplicates, true);
        calls.suppression.push(data);
        return { count: calls.suppression.length === 1 ? 1 : 0 };
      },
    },
    whatsappAutomationConsent: {
      updateMany: async ({ where, data }) => {
        calls.updates.push({ where, data });
        return { count: 1 };
      },
    },
  };
  assert.deepEqual(await revokeAutomationConsent(tx, {
    userId: "user", revision: "2", scope: "promotional", now,
  }), { suppressed: true });
  assert.equal(calls.suppression[0].identityId, "identity");
  assert.equal(calls.suppression[0].scope, "promotional");
  assert.deepEqual(calls.updates[0].where.purpose, {
    in: ["abandoned-checkout", "campaign", "review", "reactivation"],
  });
  assert.equal(calls.updates[0].data.revokedAt, now);
  assert.deepEqual(await revokeAutomationConsent(tx, {
    userId: "other", revision: "2", scope: "global", now,
  }), { suppressed: false });
});

test("WhatsApp fingerprints require canonical E.164 and a dedicated 256-bit key", () => {
  const { fingerprintWhatsAppAddress } = load("automation-fingerprint");
  const key = Buffer.alloc(32, 7);
  const first = fingerprintWhatsAppAddress("+8801700000000", key);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, fingerprintWhatsAppAddress("+8801700000000", key));
  assert.notEqual(first, fingerprintWhatsAppAddress("+8801800000000", key));
  assert.throws(() => fingerprintWhatsAppAddress("8801700000000", key));
  assert.throws(() => fingerprintWhatsAppAddress("+8801700000000", Buffer.alloc(31)));
});
