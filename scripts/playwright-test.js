const { chromium } = require('playwright');

async function run() {
  console.log("Launching Playwright with Brave browser...");
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      headless: true,
    });
  } catch (e) {
    console.log("Fallback to bundled Chromium:", e.message);
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to https://aihaat.shop/dashboard/wallet...");
  await page.goto("https://aihaat.shop/dashboard/wallet", { waitUntil: 'networkidle' });

  console.log("Page title:", await page.title());
  console.log("Page URL:", page.url());

  // Capture screenshot
  await page.screenshot({ path: 'scripts/wallet-page-screenshot.png', fullPage: true });
  console.log("✓ Saved screenshot to scripts/wallet-page-screenshot.png");

  // Check console messages and network errors
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await browser.close();
}

run().catch(console.error);
