import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const registrySource = readFileSync("src/components/animated-icons/registry.ts", "utf8");
const registryCode = ts.transpile(registrySource, { module: ts.ModuleKind.ESNext });
const { animatedIconAssets, iconNames } = await import("data:text/javascript," + encodeURIComponent(registryCode));
const register = readFileSync("docs/animated-icons/LICENSE_REGISTER.md", "utf8");
const paths = new Set();
for (const [name, asset] of Object.entries(animatedIconAssets)) {
  assert(iconNames.includes(name), "Unknown icon name: " + name);
  assert.match(asset.source, /^https:\/\/www\.flaticon\.com\/(?:free|premium)-animated-icon\/[\w-]+_\d+$/);
  assert(asset.author.trim(), "Missing author: " + name);
  assert(["free-with-attribution", "premium"].includes(asset.license));
  assert(register.includes(asset.source) && register.includes(asset.author), "Missing license entry: " + name);
  for (const path of [asset.video, asset.poster]) {
    assert.match(path, /^\/animations\/flaticon\/(?:[\w-]+\/)*[\w-]+\.(?:mp4|webm|webp)$/);
    assert(!paths.has(path), "Reuse the same registry entry for " + path);
    paths.add(path);
    const file = readFileSync("public" + path);
    if (path.endsWith(".webp")) assert.equal(file.toString("ascii", 8, 12), "WEBP");
    if (path.endsWith(".mp4")) assert.equal(file.toString("ascii", 4, 8), "ftyp");
    if (path.endsWith(".webm")) assert.equal(file.subarray(0, 4).toString("hex"), "1a45dfa3");
  }
}
console.log(`Validated ${Object.keys(animatedIconAssets).length} registered Flaticon assets. Browser playback and license review are separate checks.`);
