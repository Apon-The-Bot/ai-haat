import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const result = spawnSync(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "build", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: { ...process.env, TOKIO_WORKER_THREADS: "1" },
  }
);

if (result.error) throw result.error;
if (result.signal) console.error(`Next.js build terminated by ${result.signal}`);
process.exitCode = result.status ?? 1;
