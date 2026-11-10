import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadModule(path, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const requireMock = (name) => {
    if (!Object.hasOwn(dependencies, name)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  };
  new Function("require", "module", "exports", "process", code)(
    requireMock, module, module.exports, { env: { NEXTAUTH_SECRET: "synthetic-test-only" } }
  );
  return module.exports;
}

let session;
class JsonResponse {
  constructor(body, { status = 200 } = {}) { Object.assign(this, { body, status }); }
  static json(body, options) { return new JsonResponse(body, options); }
}
const server = { NextResponse: JsonResponse };
const nextAuth = { getServerSession: async () => session };
const forbiddenDb = new Proxy({}, { get() { throw new Error("Unexpected database access"); } });
const { GET } = loadModule("../src/app/api/auth/me/route.ts", {
  "next/server": server,
  "next-auth": nextAuth,
  "@/lib/auth": { authOptions: {} },
  "@/lib/prisma": { prisma: forbiddenDb },
  "@/lib/mfa/session": {},
  "@/lib/wallet-db": {},
});
const profile = await GET(new Request("https://example.test/api/auth/me?email=admin@example.test"));
assert.equal(profile.status, 401);

const { requireAdmin, requireMfaVerified } = loadModule("../src/lib/auth-guard.ts", {
  "next/server": server,
  "next-auth": nextAuth,
  "./auth": { authOptions: {} },
  "./mfa/session": {},
  "./prisma": { prisma: forbiddenDb },
  "./user-control/user-control-service": { getUserEffectiveStatus: async () => ({ status: "ACTIVE" }) },
});
assert.equal((await requireAdmin()).status, 401);
session = { user: { id: "fixture", email: "admin@example.test", role: "USER" } };
assert.equal((await requireAdmin()).status, 403);
session.user.role = "ADMIN";
assert.equal((await requireAdmin()).user.id, "fixture");
assert.equal((await requireMfaVerified()).status, 503);

let row = { id: "fixture", role: "USER", security: null };
const { authOptions } = loadModule("../src/lib/auth.ts", {
  "next-auth/providers/google": { default: (options) => options },
  "@/utils/email": {},
  "@/lib/prisma": { prisma: { user: { findFirst: async () => row } } },
});
const staleAdmin = { email: "admin@example.test", role: "ADMIN", id: "fixture" };
assert.equal((await authOptions.callbacks.jwt({ token: staleAdmin })).role, "USER");
row = null;
const missing = await authOptions.callbacks.jwt({ token: staleAdmin });
assert.equal(missing.role, "USER");
assert.equal(missing.id, undefined);
console.log("Auth boundary tests passed.");
