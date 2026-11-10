import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";

const staged = process.argv.includes("--staged");
const git = (args) => execFileSync("git", args, { maxBuffer: 32 * 1024 * 1024 });
const paths = git(staged
  ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
  : ["ls-files", "-z"]
).toString("utf8").split("\0").filter(Boolean);

const rules = [
  ["private-key", /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/],
  ["google-oauth-secret", /\bGOCSPX-[A-Za-z0-9_-]{20,}\b/],
  ["github-token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ["cloud-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["telegram-token", /\b\d{8,12}:[A-Za-z0-9_-]{34,}\b/],
  ["admin-identity-rule", /\b(?:DEFAULT_ADMIN_EMAILS|isUserAdmin|process\.env\.ADMIN_EMAILS)\b/],
];

let findings = 0;
function report(path, rule, line) {
  findings++;
  console.error(`${JSON.stringify(path)}${line ? `:${line}` : ""} [${rule}]`);
}

for (const path of new Set(paths)) {
  if (/(?:^|\/)(?:\.env(?:\..+)?|[^/]+\.env)$/i.test(path) &&
      !/(?:^|\/)\.env\.example$/i.test(path)) {
    report(path, "private-env-file");
    continue;
  }
  if (/\.(?:pem|key|p12|pfx)$/i.test(path)) {
    report(path, "credential-file");
    continue;
  }
  const stat = staged ? null : lstatSync(path, { throwIfNoEntry: false });
  if (!staged && !stat?.isFile()) continue;
  const mode = staged ? git(["ls-files", "--stage", "--", path]).toString("utf8") : "";
  if (mode.startsWith("120000 ") || mode.startsWith("160000 ")) continue;
  const bytes = staged ? git(["show", `:${path}`]) : readFileSync(path);
  if (bytes.includes(0)) continue;
  bytes.toString("utf8").split(/\r?\n/).forEach((line, index) => {
    for (const [name, pattern] of rules) {
      if (name === "admin-identity-rule" && !path.startsWith("src/")) continue;
      if (path === "scripts/check-secrets.mjs") continue;
      if (pattern.test(line)) report(path, name, index + 1);
    }
    if (/(?:^|\/)\.env\.example$/i.test(path) &&
        /^(?!NEXT_PUBLIC_)[A-Z0-9_]*(?:SECRET|PASSWORD|PASS|KEY|PEPPER|TOKEN|DATABASE_URL)=\S/.test(line) &&
        line !== "DATABASE_URL=mysql://user:password@host:3306/dbname") {
      report(path, "non-empty-example-secret", index + 1);
    }
  });
}
if (findings) process.exitCode = 1;
console.log(`Secret gate: ${paths.length} paths checked, ${findings} findings.`);
