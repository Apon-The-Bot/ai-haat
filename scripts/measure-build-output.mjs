import { lstatSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

// Run from the application root (or pass an isolated build's root).
// Count directory entries without following symlinks or mutating the build.
const build = resolve(process.argv[2] || ".", ".next");
const totals = { files: 0, directories: 0, links: 0, bytes: 0 };
const compiler = { ...totals };
const groups = new Map();

function count(path, parts, group, inCompilerCache) {
  const stat = lstatSync(path);
  const targets = [totals, group, ...(inCompilerCache ? [compiler] : [])];
  if (stat.isSymbolicLink()) {
    targets.forEach((target) => target.links++);
  } else if (stat.isDirectory()) {
    targets.forEach((target) => target.directories++);
    for (const child of readdirSync(path)) {
      count(join(path, child), [...parts, child], group,
        inCompilerCache || (parts.length === 1 && parts[0] === "cache" && child === "webpack"));
    }
  } else if (stat.isFile()) {
    targets.forEach((target) => {
      target.files++;
      target.bytes += stat.size;
    });
  }
}

if (!lstatSync(build).isDirectory()) throw new Error("Expected a real .next directory");
for (const child of readdirSync(build)) {
  const group = { files: 0, directories: 0, links: 0, bytes: 0 };
  groups.set(child, group);
  count(join(build, child), [child], group, false);
}

console.log(JSON.stringify({
  totals,
  topLevel: Object.fromEntries(groups),
  webpackCompilerCache: compiler,
  estimatedWithoutWebpackCompilerCache: Object.fromEntries(
    Object.entries(totals).map(([key, value]) => [key, value - compiler[key]]),
  ),
}, null, 2));
