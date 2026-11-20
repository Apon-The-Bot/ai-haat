import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const origin = "http://fixture.test";
const build = path.resolve(process.argv[2] ?? ".next/optimization-candidate");
const assets = path.join(build, "static");
const home = path.join(build, "server/app/index.html");
assert.ok(existsSync(home), "Build the candidate before running the fixture.");

const modalChunks = new Set(
  readdirSync(path.join(assets, "chunks"), { recursive: true })
    .filter((file) => file.endsWith(".js"))
    .map((file) => path.join(assets, "chunks", file))
    .filter((file) => readFileSync(file, "utf8").includes("Close Quick Checkout"))
);
assert.equal(modalChunks.size, 1, "Expected one identifiable checkout JS chunk.");

const user = {
  id: "fixture",
  name: "Fixture Shopper",
  email: "shopper@example.test",
  walletBalanceBDT: 999999,
};
const orders = [];
const errors = [];
let downloads = 0;
const browser = await chromium.launch({ channel: "chrome" });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  page.on("pageerror", (error) => errors.push(error.message));
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) return route.abort();
    if (request.method() === "POST") {
      const body = request.postDataJSON();
      orders.push([url.pathname, body]);
      if (url.pathname === "/api/orders") {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return route.fulfill({ json: { success: true, order: { orderNumber: "fixture-order" } } });
      }
      if (url.pathname === "/api/wallet/purchase") return route.fulfill({ json: { success: true } });
      if (url.pathname === "/api/payment/create") return route.fulfill({ json: { pp_url: origin + "/gateway" } });
      return route.fulfill({ status: 400, json: {} });
    }
    if (url.pathname === "/gateway") return route.fulfill({ body: "Fixture gateway" });
    if (url.pathname === "/api/auth/session") return route.fulfill({ json: { user, expires: "2099-01-01" } });
    if (url.pathname.startsWith("/api/")) return route.fulfill({ json: {} });
    if (url.pathname === "/") return route.fulfill({ path: home });

    const root = url.pathname.startsWith("/_next/static/") ? assets : path.resolve("public");
    const relative = root === assets ? url.pathname.slice("/_next/static/".length) : url.pathname.slice(1);
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !existsSync(file) || !statSync(file).isFile()) {
      return route.fulfill({ status: 404 });
    }
    if (modalChunks.has(file) && ++downloads === 1) return route.abort();
    return route.fulfill({ path: file });
  });

  await page.goto(origin, { waitUntil: "networkidle" });
  assert.equal(downloads, 0);
  const buy = page.locator('button[title="1-Click Buy Now"]').first();
  const dialog = page.getByRole("dialog", { name: /Quick Buy/ });
  await buy.click();
  const retry = page.getByRole("button", { name: "আবার চেষ্টা করুন" });
  await retry.waitFor();
  assert.ok(await buy.isVisible());
  await retry.click();
  await dialog.waitFor();
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });

  for (const method of ["wallet", "gateway"]) {
    await buy.click();
    await dialog.waitFor();
    await page.waitForFunction(() =>
      document.querySelector('[aria-labelledby="quick-checkout-title"]')?.contains(document.activeElement)
    );
    for (const key of ["Shift+Tab", ...Array(25).fill("Tab")]) {
      await page.keyboard.press(key);
      assert.ok(await dialog.evaluate((element) => element.contains(document.activeElement)), key);
    }
    await page.getByPlaceholder("০১৭XXXXXXXX").fill("01700000000");
    await page.locator(`input[name="quickPaymentMethod"][value="${method}"]`).check();
    await dialog.locator('button[type="submit"]').click({ clickCount: 2 });
    if (method === "wallet") {
      const success = dialog.getByRole("heading", { name: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!" });
      await success.waitFor();
      assert.ok(await success.evaluate((element) => element === document.activeElement));
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert.ok(await buy.evaluate((element) => element === document.activeElement));
    } else {
      await page.waitForURL(origin + "/gateway");
    }
  }
  assert.equal(downloads, 2, "Expected one aborted request and one successful retry.");
  assert.deepEqual(orders.map(([url]) => url), [
    "/api/orders", "/api/wallet/purchase", "/api/orders", "/api/payment/create",
  ]);
  assert.equal(orders[0][1].paymentMethod, "wallet");
  assert.equal(orders[2][1].paymentMethod, "gateway");
  assert.equal(orders[1][1].orderId, "fixture-order");
  assert.equal(orders[3][1].orderId, "fixture-order");
  assert.deepEqual(errors, []);
  console.log("Quick Checkout fixture passed: chunk retry/reuse, keyboard focus, wallet and gateway.");
} finally {
  await browser.close();
}
