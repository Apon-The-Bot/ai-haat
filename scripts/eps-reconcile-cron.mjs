const origin = new URL(process.env.NEXTAUTH_URL ?? "");
const secret = process.env.CRON_SECRET?.trim();
const loopbackSandbox = process.env.EPS_MODE === "sandbox" &&
  origin.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
if ((!loopbackSandbox && origin.protocol !== "https:") || origin.username || origin.password || !secret) {
  throw new Error("Configure an HTTPS application origin and cron secret.");
}

const response = await fetch(new URL("/api/cron/eps-reconcile", origin), {
  method: "POST",
  redirect: "error",
  headers: { Authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(55_000),
});
if (!response.ok) throw new Error(`EPS reconciliation returned HTTP ${response.status}.`);
const result = await response.json();
if (result.status === "DISABLED") {
  console.log("EPS reconciliation is disabled.");
} else {
  const { checked, finalized, errors } = result;
  if (![checked, finalized, errors].every((value) => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error("EPS reconciliation returned an invalid summary.");
  }
  console.log(`EPS reconciliation checked ${checked}, finalized ${finalized}, errors ${errors}.`);
  if (errors > 0) process.exitCode = 1;
}
