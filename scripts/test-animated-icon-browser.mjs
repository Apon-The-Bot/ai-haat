import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { chromium } from "playwright";
import ts from "typescript";

const require = createRequire(import.meta.url);
const reactDirectory = (pkg) => join(require.resolve(pkg + "/package.json"), "..", "umd");
const source = readFileSync("src/components/animated-icons/AnimatedIcon.tsx", "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS },
});

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 700 }, hasTouch: true });
  const errors = [];
  let clip;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://icons.test/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/") return route.fulfill({ contentType: "text/html", body: '<main id="root"></main>' });
    if (path.endsWith("poster.webp")) {
      return route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7"/></svg>' });
    }
    if (path === "/clip.webm") return route.fulfill({ contentType: "video/webm", body: clip });
    return route.fulfill({ status: 404 });
  });
  await page.goto("https://icons.test/");
  clip = Buffer.from(await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const context = canvas.getContext("2d");
    const stream = canvas.captureStream(12);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    recorder.ondataavailable = ({ data }) => chunks.push(data);
    const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
    let frame = 0;
    const timer = setInterval(() => {
      context.fillStyle = "white";
      context.fillRect(0, 0, 32, 32);
      context.fillStyle = "black";
      context.fillRect(frame++ % 12, 8, 12, 12);
    }, 80);
    recorder.start();
    await new Promise((resolve) => setTimeout(resolve, 900));
    recorder.stop();
    await stopped;
    clearInterval(timer);
    stream.getTracks().forEach((track) => track.stop());
    return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
  }));
  await page.addScriptTag({ path: join(reactDirectory("react"), "react.development.js") });
  await page.addScriptTag({ path: join(reactDirectory("react-dom"), "react-dom.development.js") });
  await page.addScriptTag({ content: `
    (() => {
      const exports = {};
      const assets = {
        test: { poster: "/poster.webp", video: "/unavailable.webm" },
        clip: { poster: "/poster.webp", video: "/clip.webm" },
      };
      const require = (name) => name === "react" ? React : { animatedIconAssets: assets };
      ${outputText}
      const root = ReactDOM.createRoot(document.querySelector("#root"));
      window.renderIcon = (name, trigger, active, loop) => {
        root.render(React.createElement("button", { "aria-label": "Search" },
          React.createElement(exports.AnimatedIcon, {
            name, trigger, active, loop, fallback: React.createElement("span", null, "Fallback"),
          })));
      };
    })();
  ` });
  const search = page.getByRole("button", { name: "Search" });
  await page.evaluate(() => window.renderIcon("absent", "hover", false));
  await search.getByText("Fallback").waitFor();
  assert.equal(await page.locator("video").count(), 0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => window.renderIcon("test", "hover", false));
  await page.waitForFunction(() => document.querySelector("img")?.style.visibility === "visible");
  await page.keyboard.press("Tab");
  assert.equal(await search.evaluate((node) => node === document.activeElement), true);
  assert.equal(await page.locator("video").getAttribute("src"), null);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await search.blur();
  const failed = page.waitForResponse("https://icons.test/unavailable.webm");
  await search.focus();
  assert.equal((await failed).status(), 404);
  await search.getByText("Fallback").waitFor();
  assert.equal(await page.locator("video").count(), 0);

  await page.evaluate(() => window.renderIcon("clip", "press", false));
  await page.waitForFunction(() => document.querySelector("img")?.style.visibility === "visible");
  assert.equal(await page.locator("video").getAttribute("src"), null);
  await search.tap();
  await page.waitForFunction(() => document.querySelector("video")?.currentTime > 0);
  await page.waitForFunction(() => document.querySelector("video")?.paused);
  assert.equal(await page.locator("video").evaluate((node) => node.loop), false);

  await page.evaluate(() => window.renderIcon("clip", "state", true, true));
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video?.loop && !video.paused;
  });
  await page.evaluate(() => window.renderIcon("clip", "state", false, true));
  await page.waitForFunction(() => document.querySelector("video")?.paused);
  await page.evaluate(() => {
    document.querySelector("main").style.marginTop = "1200px";
    window.renderIcon("clip", "viewport", false);
  });
  await page.waitForFunction(() => document.querySelector("video")?.getBoundingClientRect().top > innerHeight);
  assert.equal(await page.locator("video").getAttribute("src"), null);
  await search.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("video")?.currentTime > 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => document.querySelector("video")?.paused);
  assert.deepEqual(errors, []);
  console.log("Animated icon browser fixture passed: fallbacks, keyboard focus, reduced motion, accessible name, tap playback, state looping, viewport entry, and offscreen pause.");
} finally {
  await browser.close();
}
