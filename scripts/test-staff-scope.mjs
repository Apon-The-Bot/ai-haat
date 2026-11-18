import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadModule(path, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  function requireMock(name) {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  }
  new Function("require", "module", "exports", outputText)(requireMock, module, module.exports);
  return module.exports;
}

class JsonResponse {
  constructor(status) { this.status = status; }
  static json(_body, { status }) { return new JsonResponse(status); }
}

const staffRoles = loadModule("../src/lib/staff-roles.ts", {});
const staffId = "staff-fixture";
const staffUser = { id: staffId, role: "USER", email: "staff@example.test" };
const staffSession = { user: staffUser, mfaSession: { mfaLevel: "MFA_VERIFIED" } };
let staffAuth = JsonResponse.json({}, { status: 401 });
let staffDbRole = "USER";
let staffStatus = "ACTIVE";
const staffGrants = new Map();
const staffGuard = loadModule("../src/lib/staff-access.ts", {
  "next/server": { NextResponse: JsonResponse },
  "@/lib/auth-guard": {
    requireMfaVerified: async () => staffAuth,
    requireAdminMfa: async () => staffAuth.user?.role === "ADMIN" ? staffAuth : JsonResponse.json({}, { status: 403 }),
  },
  "@/lib/staff-roles": staffRoles,
  "@/lib/prisma": { prisma: {
    user: { findUnique: async () => ({ role: staffDbRole }) },
    siteSetting: { findMany: async ({ where }) => where.key.in.flatMap(key =>
      staffGrants.has(key) ? [{ key, value: staffGrants.get(key) }] : []) },
  } },
  "@/lib/user-control/user-control-service": { getUserEffectiveStatus: async () => ({ status: staffStatus }) },
});
assert.equal((await staffGuard.requireStaffAccess("SUPPORT")).status, 401);
staffAuth = { ...staffSession, mfaSession: { mfaLevel: "NONE" } };
staffGrants.set(staffRoles.staffGrantKey(staffId, "SUPPORT"), "SUPPORT:fixture");
assert.equal((await staffGuard.requireStaffAccess("SUPPORT")).status, 403);
staffAuth = staffSession;
assert.deepEqual((await staffGuard.requireStaffAccess()).roles, ["SUPPORT"]);
assert.equal((await staffGuard.requireTeamAdmin()).status, 403);
assert.equal((await staffGuard.requireStaffAccess("FULFILLMENT")).status, 403);
assert.equal((await staffGuard.requireStaffAccess("FINANCE")).status, 403);
assert.equal((await staffGuard.requireStaffAuditor()).status, 403);
staffGrants.set(staffRoles.staffGrantKey(staffId, "FINANCE"), "FINANCE:fixture");
assert.deepEqual((await staffGuard.requireStaffAccess()).roles, ["SUPPORT", "FINANCE"]);
staffStatus = "SUSPENDED";
assert.equal((await staffGuard.requireStaffAccess("SUPPORT")).status, 403);
staffStatus = "ACTIVE";
staffGrants.set(staffRoles.staffGrantKey(staffId, "SUPPORT"), "REVOKED:fixture");
assert.equal((await staffGuard.requireStaffAccess("SUPPORT")).status, 403);
staffAuth = { ...staffSession, user: { ...staffUser, role: "ADMIN" } };
assert.equal((await staffGuard.requireStaffAccess("FULFILLMENT")).status, 403);
staffDbRole = "ADMIN";
assert.deepEqual((await staffGuard.requireStaffAccess()).roles, staffRoles.staffRoles);
assert.equal((await staffGuard.requireTeamAdmin()).user.id, staffId);

const accounts = [
  { id: "admin-one", email: "one@example.test", role: "ADMIN" },
  { id: "admin-two", email: "two@example.test", role: "ADMIN" },
  staffUser,
];
const settings = new Map();
const audit = [];
const transaction = {
  user: { findUnique: async ({ where }) => accounts.find(account =>
    where.id === account.id || where.email === account.email) },
  siteSetting: {
    findUnique: async ({ where }) => settings.get(where.key),
    create: async ({ data }) => settings.set(data.key, { id: data.key, ...data }),
    deleteMany: async ({ where }) => ({ count: Number(settings.delete(where.id)) }),
    upsert: async ({ where, create, update }) => settings.set(where.key, { ...create, ...update }),
  },
  adminAuditLog: { create: async ({ data }) => audit.push(data) },
};
const { requestStaffChange, decideStaffChange } = loadModule("../src/lib/staff-access-requests.ts", {
  "node:crypto": await import("node:crypto"),
  "@/lib/prisma": { prisma: { $transaction: callback => callback(transaction) } },
  "@/lib/staff-access": staffGuard,
  "@/lib/staff-roles": staffRoles,
});
const [requester, reviewer] = accounts;
for (const role of staffRoles.staffRoles) {
  const key = staffRoles.staffGrantKey(staffId, role);
  await requestStaffChange(requester, staffUser.email, "grant", "Fixture grant", role);
  const grantId = JSON.parse(audit.at(-1).details).requestId;
  assert.equal(settings.has(key), false);
  await assert.rejects(decideStaffChange(requester, grantId, "approve", "Fixture self review"), /Another administrator/);
  await decideStaffChange(reviewer, grantId, "approve", "Fixture approval");
  assert.equal(settings.get(key).value, `${role}:${grantId}`);
  await assert.rejects(decideStaffChange(reviewer, grantId, "approve", "Fixture replay"), /no longer pending/);
  await requestStaffChange(requester, staffUser.email, "revoke", "Fixture revoke", role);
  const revokeId = JSON.parse(audit.at(-1).details).requestId;
  await decideStaffChange(reviewer, revokeId, "approve", "Fixture approval");
  assert.equal(settings.get(key).value, `REVOKED:${revokeId}`);
}
console.log("Scoped staff authorization fixtures passed.");
