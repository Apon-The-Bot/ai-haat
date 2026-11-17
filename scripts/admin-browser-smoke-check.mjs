import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const baseUrl = (process.env.ADMIN_SMOKE_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
const storageStatePath = process.env.PLAYWRIGHT_STORAGE_STATE;
const reportDir = path.resolve(process.cwd(), "output", "playwright");

const adminRoutes = [
  "/admin", "/admin/command-center", "/admin/operations", "/admin/alerts", "/admin/search", "/admin/bulk-operations",
  "/admin/orders", "/admin/inventory", "/admin/inventory/batches", "/admin/coupons", "/admin/coupons/simulator",
  "/admin/replacements", "/admin/refunds", "/admin/suppliers", "/admin/suppliers/scorecard", "/admin/products",
  "/admin/products/launch", "/admin/products/new", "/admin/categories", "/admin/users", "/admin/customers",
  "/admin/subscriptions", "/admin/wallet", "/admin/affiliates", "/admin/support", "/admin/email-marketing",
  "/admin/email-marketing/campaigns", "/admin/email-marketing/campaigns/new", "/admin/email-marketing/templates",
  "/admin/email-marketing/templates/new", "/admin/email-marketing/contacts", "/admin/email-marketing/segments",
  "/admin/email-marketing/scheduled", "/admin/email-marketing/suppressions", "/admin/email-marketing/logs",
  "/admin/email-marketing/settings", "/admin/blogs", "/admin/proofs", "/admin/reports", "/admin/reconciliation",
  "/admin/demand", "/admin/settings", "/admin/settings-center", "/admin/integrations/meta",
  "/admin/integrations/providers", "/admin/notifications", "/admin/audit-logs", "/admin/activity", "/admin/team",
  "/admin/approvals", "/admin/fraud", "/admin/mfa-setup",
];

const safeApiPaths = [
  "/api/auth/session", "/api/health", "/api/admin/dashboard/stats", "/api/admin/alerts", "/api/admin/activity",
  "/api/admin/customers", "/api/admin/demand", "/api/admin/fraud", "/api/admin/operations", "/api/admin/reports",
  "/api/admin/settings/general", "/api/admin/subscriptions", "/api/admin/suppliers/scorecard",
];

const result = { baseUrl, authenticated: Boolean(storageStatePath), pages: [], api: [], links: [], buttons: [], errors: [] };

function addError(message) { result.errors.push(message); }
function absoluteUrl(value) { return new URL(value, `${baseUrl}/`); }
function isLocalUrl(url) { return url.origin === new URL(baseUrl).origin; }

async function main() {
  if (!baseUrl.startsWith("http://localhost:") && !baseUrl.startsWith("http://127.0.0.1:")) {
    throw new Error(`Refusing non-local ADMIN_SMOKE_BASE_URL: ${baseUrl}`);
  }
  await fs.mkdir(reportDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(storageStatePath ? { storageState: storageStatePath } : {});
  const page = await context.newPage();
  const failedRequests = new Set();
  page.on("requestfailed", request => failedRequests.add(`${request.method()} ${request.url()} ${request.failure()?.errorText || "failed"}`));
  page.on("pageerror", error => addError(`pageerror ${page.url()} ${error.message}`));

  for (const route of adminRoutes) {
    const pageResult = { route, status: null, finalUrl: null, title: "", heading: "", auth: "unknown" };
    try {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 8_000 });
      pageResult.status = response?.status() ?? null;
      pageResult.finalUrl = page.url();
      pageResult.title = await page.title();
      pageResult.heading = (await page.locator("h1").first().textContent().catch(() => ""))?.trim() || "";
      pageResult.auth = page.url().includes("/login") ? "redirected-to-login" : "loaded";
      if (response && response.status() >= 400) addError(`page ${route} returned ${response.status()}`);

      const links = await page.locator("a[href]").evaluateAll(anchors => anchors.map(anchor => ({
        href: anchor.getAttribute("href") || "",
        name: (anchor.textContent || anchor.getAttribute("aria-label") || "").trim(),
      })));
      for (const link of links) {
        if (!link.href || link.href.startsWith("#") || link.href.startsWith("mailto:") || link.href.startsWith("tel:")) continue;
        const url = absoluteUrl(link.href);
        if (isLocalUrl(url)) result.links.push({ from: route, href: url.pathname + url.search, name: link.name });
      }
      const buttons = await page.locator("button").evaluateAll(items => items.map(button => ({
        name: (button.textContent || button.getAttribute("aria-label") || button.getAttribute("title") || "").trim(),
        disabled: button.hasAttribute("disabled"),
        type: button.getAttribute("type") || "button",
      })));
      for (const button of buttons) result.buttons.push({ from: route, ...button });
      if (!pageResult.heading && pageResult.auth === "loaded") addError(`page ${route} has no h1`);
    } catch (error) {
      addError(`page ${route} ${error instanceof Error ? error.message : String(error)}`);
    }
    result.pages.push(pageResult);
  }

  const seenLinks = new Set();
  for (const link of result.links) {
    const key = `${link.href}`;
    if (seenLinks.has(key)) continue;
    seenLinks.add(key);
    try {
      const response = await context.request.get(`${baseUrl}${link.href}`, { maxRedirects: 0, timeout: 15_000 });
      const status = response.status();
      link.status = status;
      if (status >= 400 && status !== 401 && status !== 403) addError(`broken link ${link.href} returned ${status}`);
    } catch (error) { addError(`link ${link.href} ${error instanceof Error ? error.message : String(error)}`); }
  }

  for (const route of safeApiPaths) {
    try {
      const response = await context.request.get(`${baseUrl}${route}`, { timeout: 15_000 });
      result.api.push({ route, status: response.status(), contentType: response.headers()["content-type"] || "" });
      if (response.status() >= 500) addError(`api ${route} returned ${response.status()}`);
    } catch (error) { result.api.push({ route, status: null, error: String(error) }); }
  }

  for (const button of result.buttons) {
    if (!button.name) addError(`unnamed button on ${button.from}`);
  }
  for (const request of failedRequests) addError(`requestfailed ${request}`);
  await fs.writeFile(path.join(reportDir, "admin-smoke-report.json"), JSON.stringify(result, null, 2));
  await browser.close();

  const loaded = result.pages.filter(pageResult => pageResult.auth === "loaded").length;
  const redirected = result.pages.filter(pageResult => pageResult.auth === "redirected-to-login").length;
  console.log(JSON.stringify({
    baseUrl,
    authenticated: result.authenticated,
    pages: { total: result.pages.length, loaded, redirected },
    linksChecked: seenLinks.size,
    buttonsChecked: result.buttons.length,
    apisChecked: result.api.length,
    errors: result.errors.length,
    report: path.join(reportDir, "admin-smoke-report.json"),
  }, null, 2));
  if (result.errors.length > 0) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
