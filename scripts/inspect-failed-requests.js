const { chromium } = require('playwright');

async function inspectFailedRequests() {
  const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
  const browser = await chromium.launch({
    executablePath: bravePath,
    headless: true,
  });

  const page = await browser.newPage();

  const failedRequests = [];
  page.on('response', res => {
    if (res.status() >= 400) {
      failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  console.log("Checking https://aihaat.shop...");
  await page.goto("https://aihaat.shop", { waitUntil: 'networkidle' });

  console.log("Failed requests on Home Page:", failedRequests);

  const dashboardFailed = [];
  page.on('response', res => {
    if (res.status() >= 400) {
      dashboardFailed.push({ url: res.url(), status: res.status() });
    }
  });

  console.log("Checking https://aihaat.shop/dashboard/wallet...");
  await page.goto("https://aihaat.shop/dashboard/wallet", { waitUntil: 'networkidle' });

  console.log("Failed requests on Dashboard Wallet:", dashboardFailed);

  await browser.close();
}

inspectFailedRequests().catch(console.error);
