import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as crypto from "node:crypto";
import ts from "typescript";

const settings = new Map();
const audits = [];
const admins = new Set(["requester", "reviewer"]);
let balance = 0;
const db = {
  user: { findUnique: async ({ where }) => ({ role: admins.has(where.id) ? "ADMIN" : "USER" }) },
  siteSetting: {
    findUnique: async ({ where }) => settings.get(where.key),
    findMany: async ({ where }) => Array.from(settings.values()).filter((row) => row.key.startsWith(where.key.startsWith)),
    upsert: async ({ where, create }) => settings.set(where.key, { ...create, id: where.key }),
    deleteMany: async ({ where }) => ({
      count: settings.get(where.id)?.value === where.value && settings.delete(where.id) ? 1 : 0,
    }),
  },
  adminAuditLog: { create: async ({ data }) => audits.push(data) },
};
const prisma = {
  ...db,
  async $transaction(operation, options) {
    assert.equal(options.isolationLevel, "Serializable");
    const original = new Map(settings);
    const auditCount = audits.length;
    const originalBalance = balance;
    try {
      return await operation(db);
    } catch (error) {
      settings.clear();
      for (const [key, value] of original) settings.set(key, value);
      audits.length = auditCount;
      balance = originalBalance;
      throw error;
    }
  },
};

const source = readFileSync(new URL("../src/lib/admin-approvals.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const module = { exports: {} };
new Function("require", "module", "exports", outputText)((name) => {
  if (name === "node:crypto") return crypto;
  if (name === "@/lib/prisma") return { prisma };
  throw new Error(`Unexpected dependency ${name}`);
}, module, module.exports);
const { requestAdminApproval, listAdminApprovals, claimAdminApproval } = module.exports;

const requester = { id: "requester", email: "one@example.test" };
const reviewer = { id: "reviewer", email: "two@example.test" };
const operation = {
  kind: "WALLET",
  input: { userId: "customer", type: "CREDIT", amountBDT: 42, category: "BONUS", reason: "Fixture credit" },
};
const requestId = await requestAdminApproval(requester, operation);
assert.equal(await requestAdminApproval(requester, operation), requestId);
await assert.rejects(requestAdminApproval(requester, {
  ...operation, input: { ...operation.input, amountBDT: 43 },
}), /already pending/);
const [pending] = await listAdminApprovals();
assert.equal(pending.id, requestId);
assert.equal(balance, 0);
const confirm = (request, actor) => claimAdminApproval(request, actor, "approve", "Fixture review");
const transaction = (op) => prisma.$transaction(op, { isolationLevel: "Serializable" });
await assert.rejects(transaction(confirm(pending, requester)), /Another administrator/);
await assert.rejects(transaction(confirm({ ...pending, expiresAt: 0 }, reviewer)), /expired/);
await assert.rejects(transaction(confirm({
  ...pending, operation: { ...operation, input: { ...operation.input, amountBDT: 43 } },
}, reviewer)), /no longer pending/);
admins.delete("requester");
await assert.rejects(transaction(confirm(pending, reviewer)), /access changed/);
admins.add("requester");
await assert.rejects(transaction(async (tx) => {
  await confirm(pending, reviewer)(tx);
  balance += operation.input.amountBDT;
  throw new Error("Fixture write failure");
}), /Fixture write failure/);
assert.equal(balance, 0);
assert.equal((await listAdminApprovals()).length, 1);
assert.equal(audits.length, 1);

await transaction(async (tx) => {
  await confirm(pending, reviewer)(tx);
  balance += operation.input.amountBDT;
});
await assert.rejects(transaction(confirm(pending, reviewer)), /no longer pending/);
assert.equal(balance, 42);
assert.equal(audits.at(-1).action, "OPERATION_APPROVED");
assert.equal(audits.at(-1).actorId, reviewer.id);

await requestAdminApproval(requester, operation);
const [rejected] = await listAdminApprovals();
await transaction(claimAdminApproval(rejected, reviewer, "reject", "Fixture rejection"));
assert.equal(audits.at(-1).action, "OPERATION_REJECTED");
assert.equal((await listAdminApprovals()).length, 0);
assert.equal(balance, 42);
console.log("Admin approvals fixture checks passed.");
