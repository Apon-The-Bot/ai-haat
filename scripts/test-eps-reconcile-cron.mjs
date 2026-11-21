import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const secret = "eps-cron-fixture";
const calls = [];
let summary = { checked: 2, finalized: 1, errors: 0 };
const server = createServer((request, response) => {
  calls.push({ url: request.url, method: request.method, authenticated: request.headers.authorization === `Bearer ${secret}` });
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(summary));
});
server.listen(0, "127.0.0.1");
await once(server, "listening");

async function runCron() {
  const script = fileURLToPath(new URL("./eps-reconcile-cron.mjs", import.meta.url));
  const child = spawn(process.execPath, [script], {
    env: { ...process.env, NEXTAUTH_URL: `http://127.0.0.1:${server.address().port}`, CRON_SECRET: secret, EPS_MODE: "sandbox" },
    stdio: ["ignore", "pipe", "pipe"], timeout: 5_000,
  });
  let output = "";
  child.stdout.on("data", (data) => { output += data; });
  child.stderr.on("data", (data) => { output += data; });
  const [code] = await once(child, "close");
  assert(!output.includes(secret));
  return { code, output };
}

try {
  const success = await runCron();
  assert.equal(success.code, 0);
  assert.match(success.output, /checked 2, finalized 1, errors 0/);
  summary = { checked: 1, finalized: 0, errors: 1 };
  const failure = await runCron();
  assert.equal(failure.code, 1);
  assert.match(failure.output, /checked 1, finalized 0, errors 1/);
  for (const call of calls) {
    assert.deepEqual(call, { url: "/api/cron/eps-reconcile", method: "POST", authenticated: true });
  }
  assert.equal(calls.length, 2);
  console.log("EPS reconciliation runner contract passed.");
} finally {
  server.close();
}
