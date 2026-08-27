const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testWithBrave() {
  const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
  const userDataDir = 'C:\\Users\\mdama\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data';

  console.log("Launching Brave browser with Profile 1...");
  try {
    // If Brave is open, we can launch a copy of Profile 1 or launch with custom user data
    const tempUserData = path.join(process.cwd(), 'scratch', 'brave-temp');
    if (!fs.existsSync(tempUserData)) {
      fs.mkdirSync(tempUserData, { recursive: true });
    }

    const browser = await chromium.launchPersistentContext(tempUserData, {
      executablePath: bravePath,
      headless: false,
      args: [
        '--no-first-run',
        '--no-default-browser-check',
      ],
      viewport: { width: 1440, height: 900 }
    });

    const page = browser.pages()[0] || await browser.newPage();
    
    // Capture console errors
    page.on('console', msg => console.log(`[CONSOLE ${msg.type()}]:`, msg.text()));
    page.on('pageerror', err => console.log(`[PAGE ERROR]:`, err.message));

    console.log("Navigating to https://aihaat.shop...");
    await page.goto('https://aihaat.shop', { waitUntil: 'networkidle' });
    console.log("Home page loaded. Title:", await page.title());

    await page.screenshot({ path: 'scripts/live-home.png' });

    console.log("Navigating to https://aihaat.shop/dashboard/wallet...");
    await page.goto('https://aihaat.shop/dashboard/wallet', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'scripts/live-dashboard-wallet.png' });

    console.log("Navigating to https://aihaat.shop/checkout...");
    await page.goto('https://aihaat.shop/checkout', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'scripts/live-checkout.png' });

    console.log("Navigating to https://aihaat.shop/shop...");
    await page.goto('https://aihaat.shop/shop', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'scripts/live-shop.png' });

    await browser.close();
    console.log("✓ All pages checked successfully!");
  } catch (err) {
    console.error("Error in Playwright test:", err);
  }
}

testWithBrave();
