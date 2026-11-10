import fs from "fs";
import path from "path";

const adminDir = path.join(process.cwd(), "src", "app", "admin");
const componentsDir = path.join(process.cwd(), "src", "components", "admin");
const apiDir = path.join(process.cwd(), "src", "app", "api");

interface FetchCall {
  file: string;
  line: number;
  url: string;
  method: string;
}

const fetchCalls: FetchCall[] = [];

function scanDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");
      lines.forEach((lineText, idx) => {
        // Regex to capture fetch calls
        const match = lineText.match(/fetch\(\s*[`"']([^`"']+)`?|fetch\(\s*`([^`]+)`/);
        if (match) {
          const rawUrl = match[1] || match[2];
          // Check nearby lines for method
          let method = "GET";
          const snippet = lines.slice(idx, idx + 8).join(" ");
          const methodMatch = snippet.match(/method:\s*["'](GET|POST|PUT|PATCH|DELETE)["']/i);
          if (methodMatch) {
            method = methodMatch[1].toUpperCase();
          }
          fetchCalls.push({
            file: path.relative(process.cwd(), fullPath),
            line: idx + 1,
            url: rawUrl,
            method,
          });
        }
      });
    }
  }
}

scanDirectory(adminDir);
scanDirectory(componentsDir);

console.log(`Discovered ${fetchCalls.length} fetch calls in Admin UI.\n`);

const results: Array<{
  file: string;
  line: number;
  url: string;
  method: string;
  routeFile: string;
  status: "EXISTS" | "MISSING_ROUTE" | "MISSING_METHOD" | "DYNAMIC";
}> = [];

for (const call of fetchCalls) {
  let cleanUrl = call.url.split("?")[0];
  // Replace template literals like ${id} with [id]
  cleanUrl = cleanUrl.replace(/\$\{[^}]+\}/g, "[id]");
  // If starts with /api/
  if (cleanUrl.startsWith("/api/")) {
    const relativeApi = cleanUrl.slice("/api/".length);
    const targetRouteDir = path.join(apiDir, ...relativeApi.split("/"));
    const possibleRouteFile = path.join(targetRouteDir, "route.ts");

    if (fs.existsSync(possibleRouteFile)) {
      const routeContent = fs.readFileSync(possibleRouteFile, "utf-8");
      const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${call.method}\\b|export\\s+function\\s+${call.method}\\b`);
      if (methodRegex.test(routeContent)) {
        results.push({ ...call, routeFile: path.relative(process.cwd(), possibleRouteFile), status: "EXISTS" });
      } else {
        results.push({ ...call, routeFile: path.relative(process.cwd(), possibleRouteFile), status: "MISSING_METHOD" });
      }
    } else {
      results.push({ ...call, routeFile: targetRouteDir, status: "MISSING_ROUTE" });
    }
  }
}

const missing = results.filter((r) => r.status !== "EXISTS");
console.log(`Verified ${results.length} API connections:`);
console.log(`- Valid: ${results.filter((r) => r.status === "EXISTS").length}`);
console.log(`- Issues: ${missing.length}`);

if (missing.length > 0) {
  console.log("\nPotential endpoint issues detected:");
  for (const m of missing) {
    console.log(`  [${m.status}] ${m.method} ${m.url} (in ${m.file}:${m.line}) -> Route: ${m.routeFile}`);
  }
}
