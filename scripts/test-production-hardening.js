const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('================================================================');
  console.log('AI HAAT PRODUCTION HARDENING & COMMERCE ENGINE VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} -> ${details}`);
      failed++;
    }
  }

  // 1. TEST: Unauthenticated GET /api/orders (Must return 401 Unauthorized)
  try {
    const res = await fetch(`${BASE_URL}/api/orders`);
    assert(
      res.status === 401,
      'P0-A: Unauthenticated GET /api/orders denied',
      `Expected status 401, got ${res.status}`
    );
  } catch (err) {
    assert(false, 'P0-A: Unauthenticated GET /api/orders', err.message);
  }

  // 2. TEST: Safe Public Order Tracking with stripped fields
  try {
    const res = await fetch(`${BASE_URL}/api/orders?query=AH-12345&tracking=true`);
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true,
      'P0-A: Safe Public Tracking Pathway Available',
      `Status: ${res.status}`
    );
  } catch (err) {
    assert(false, 'P0-A: Safe Public Tracking', err.message);
  }

  // 3. TEST: Price Tampering Defense on POST /api/orders
  // Client sends forged totalBDT = 1, but order contains a product with higher price
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Price Tamperer',
        customerPhone: '01711111111',
        customerEmail: 'tamper@example.com',
        items: [
          {
            productId: 'chatgpt-plus-1m',
            productName: 'ChatGPT Plus Shared',
            variationName: '1 Month Shared',
            priceBDT: 1, // Forged client price
            quantity: 1,
          },
        ],
        subtotalBDT: 1, // Forged client subtotal
        discountBDT: 0,
        totalBDT: 1, // Forged client total: ৳1
        paymentMethod: 'gateway',
      }),
    });

    const data = await res.json();
    if (res.ok && data.order) {
      // Check if server recalculated price based on real catalog instead of trusting ৳1
      const authoritativeTotal = data.order.totalBDT;
      assert(
        authoritativeTotal > 1,
        'P0-B: Server-Authoritative Price Recalculation (Forged ৳1 ignored)',
        `Server stored ৳${authoritativeTotal} instead of forged ৳1`
      );
    } else {
      assert(
        res.status === 400,
        'P0-B: Invalid items rejected by pricing engine',
        `Status: ${res.status}`
      );
    }
  } catch (err) {
    assert(false, 'P0-B: Price Tampering Defense', err.message);
  }

  // 4. TEST: Unverified Webhook Spoofing Defense
  try {
    const res = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pp_id: 'fake_fake_fake_trx_999',
        status: 'completed',
        amount: '500.00',
        metadata: { orderId: 'AH-99999' },
      }),
    });

    assert(
      res.status === 400,
      'P0-C: Unverified Fake Webhook Rejected (Direct API verification check)',
      `Expected status 400 for fake transaction reference, got ${res.status}`
    );
  } catch (err) {
    assert(false, 'P0-C: Webhook Spoofing Defense', err.message);
  }

  // 5. TEST: Unauthenticated Admin Mutations Blocked
  try {
    const res = await fetch(`${BASE_URL}/api/admin/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'HACK100', discountValue: 100 }),
    });

    assert(
      res.status === 401 || res.status === 403,
      'P0-D: Unauthenticated Admin Coupon Creation Blocked',
      `Expected 401/403, got ${res.status}`
    );
  } catch (err) {
    assert(false, 'P0-D: Admin Auth Guard', err.message);
  }

  // 6. TEST: Unauthenticated Admin Inventory Blocked
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'chatgpt-plus', lines: ['KEY1', 'KEY2'] }),
    });

    assert(
      res.status === 401 || res.status === 403,
      'P0-D: Unauthenticated Admin Inventory Upload Blocked',
      `Expected 401/403, got ${res.status}`
    );
  } catch (err) {
    assert(false, 'P0-D: Admin Inventory Guard', err.message);
  }

  // 7. TEST: Unauthenticated Vault Credentials Blocked
  try {
    const res = await fetch(`${BASE_URL}/api/vault/credentials`);
    assert(
      res.status === 401,
      'P1-A: Unauthenticated Vault Credentials Retrieval Denied',
      `Expected 401, got ${res.status}`
    );
  } catch (err) {
    assert(false, 'P1-A: Vault Credentials Guard', err.message);
  }

  // 8. TEST: Public Settings Endpoint Available
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true && typeof data.whatsapp === 'string',
      'P1-H: Public Settings API Operational',
      `Status: ${res.status}`
    );
  } catch (err) {
    assert(false, 'P1-H: Public Settings API', err.message);
  }

  // 9. TEST: Product Request API Operational
  try {
    const res = await fetch(`${BASE_URL}/api/product-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Claude Pro Team Plan',
        contact: '01700000000',
        details: 'Need 5 seats for engineering team',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true,
      'P1-G: Product Request Submission & Alert Dispatch Operational',
      `Status: ${res.status}`
    );
  } catch (err) {
    assert(false, 'P1-G: Product Request API', err.message);
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Give server 1 second to accept connections
setTimeout(runTests, 1500);
