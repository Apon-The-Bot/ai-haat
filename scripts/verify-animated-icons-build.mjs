import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";

const checkMotion = process.argv.includes('--motion');
const builds = process.argv.slice(2).filter((value) => value !== '--motion');
if (builds.length !== 2) throw new Error("Pass the baseline and updated Next.js build directories.");
const routes = ["/", "/shop", "/cart", "/checkout/success", "/gift-cards", "/login", "/dashboard", "/admin/email-marketing/contacts"];
const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
const publicRoot = resolve("public");

function publicFile(path) {
  const file = resolve(publicRoot, "." + path);
  const fromRoot = relative(publicRoot, file);
  if (!fromRoot || fromRoot.startsWith("..") || isAbsolute(fromRoot)) return "";
  return file;
}

const browser = await chromium.launch();
try {
  for (const build of builds) {
    const { pages } = JSON.parse(readFileSync(join(build, "app-build-manifest.json")));
    const { rootMainFiles } = JSON.parse(readFileSync(join(build, "build-manifest.json")));
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const mime = {
      js: "application/javascript", css: "text/css", html: "text/html", svg: "image/svg+xml",
      webp: "image/webp", png: "image/png", jpg: "image/jpeg", woff2: "font/woff2",
    };
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== "https://aihaat.test") return route.abort();
      const path = decodeURIComponent(url.pathname);
      if (path.startsWith("/api/")) {
        return route.fulfill({ json: path === "/api/auth/session" ? {} : { products: [], notifications: [], orders: [] } });
      }
      const file = /^\/_next\/static\/[\w/.-]+$/.test(path) && !path.split("/").includes("..") ? join(build, path.slice(7))
        : path === "/_next/image" ? publicFile(url.searchParams.get("url") ?? "")
        : routes.includes(path) ? join(build, "server/app", path === "/" ? "index.html" : path.slice(1) + ".html")
        : publicFile(path);
      if (existsSync(file) && statSync(file).isFile()) {
        return route.fulfill({ path: file, contentType: mime[file.split(".").pop()] ?? "application/octet-stream" });
      }
      return route.fulfill({ status: 404 });
    });
    for (const path of routes) {
      const results = [];
      const entry = path === "/" ? "/page" : path + "/page";
      const chunks = new Set([...rootMainFiles, ...(pages[entry] ?? [])]);
      const files = [...chunks].filter((file) => file.endsWith(".js")).map((file) => readFileSync(join(build, file)));
      const jsBytes = files.reduce((sum, file) => sum + file.length, 0);
      const jsGzip = files.reduce((sum, file) => sum + gzipSync(file).length, 0);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 820 });
        const response = await page.goto("https://aihaat.test" + path, { waitUntil: "load" });
        if (response.status() !== 200) {
          results.push({ width, status: response.status() });
          break;
        }
        results.push({ width, ...(await page.evaluate(() => ({
          path: location.pathname,
          overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          animationRequests: performance.getEntriesByType("resource").filter((r) => r.name.includes("/animations/flaticon/")).length,
        }))) });
      }
      console.log(JSON.stringify({ build, path, jsBytes, jsGzip, results, errors: errors.splice(0) }));
    }
    if (checkMotion && build === builds.at(-1)) {
      await page.setViewportSize({ width: 390, height: 820 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto("https://aihaat.test/", { waitUntil: "load" });
      const search = page.getByRole("button", { name: "Search", exact: true }).first();
      await search.waitFor();
      await page.waitForFunction(() => {
        const button = document.querySelector('button[aria-label="Search"]');
        return button && Object.keys(button).some((key) => key.startsWith("__reactProps"));
      });
      const svg = search.locator("svg[data-animateicons]");
      assert.equal(await svg.count(), 1);
      const lens = svg.locator("g").first();
      const idle = await lens.evaluate((node) => node.style.transform);
      let moved = lens.evaluate((node, resting) => new Promise((resolve, reject) => {
        const deadline = performance.now() + 1800;
        function frame() {
          if (node.style.transform !== resting) resolve(true);
          else if (performance.now() > deadline) reject(Error("Search icon did not animate"));
          else requestAnimationFrame(frame);
        }
        frame();
      }), idle);
      await search.hover();
      await moved;
      await page.mouse.move(0, 0);
      await page.waitForFunction((resting) =>
        document.querySelector('button[aria-label="Search"] svg[data-animateicons] g')?.style.transform === resting,
        idle);
      moved = lens.evaluate((node, resting) => new Promise((resolve, reject) => {
        const deadline = performance.now() + 1800;
        function frame() {
          if (node.style.transform !== resting) resolve(true);
          else if (performance.now() > deadline) reject(Error("Keyboard focus did not animate the icon"));
          else requestAnimationFrame(frame);
        }
        frame();
      }), idle);
      await search.focus();
      await moved;
      await search.blur();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction((resting) =>
        document.querySelector('button[aria-label="Search"] svg[data-animateicons] g')?.style.transform === resting,
        idle);
      await search.hover();
      const stayedIdle = await lens.evaluate(async (node, resting) => {
        for (let frame = 0; frame < 15; frame++) {
          await new Promise(requestAnimationFrame);
          if (node.style.transform !== resting) return false;
        }
        return true;
      }, idle);
      assert.equal(stayedIdle, true);
      await search.click();
      await page.getByRole("heading", { name: "Search Digital Products" }).waitFor();
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ build, motion: "passed", checks: ["hover", "keyboard focus", "reduced motion", "search action"] }));
    }
    await page.close();
  }
} finally {
  await browser.close();
}
