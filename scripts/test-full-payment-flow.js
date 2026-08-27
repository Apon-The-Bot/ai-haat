async function testFlow() {
  console.log('1. Creating a new checkout session on pay.aihaat.shop...');
  const createRes = await fetch('https://pay.aihaat.shop/api/checkout/redirect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'MHS-PIPRAPAY-API-KEY': '6efac52b56d3a19e2b7f39d54df43a8653e5dd21fe93249f84',
    },
    body: JSON.stringify({
      amount: '150',
      currency: 'BDT',
      full_name: 'Test Customer',
      email_address: 'test@aihaat.shop',
      mobile_number: '01700000000',
      webhook_url: 'https://aihaat.shop/api/payment/callback',
      return_url: 'https://aihaat.shop/checkout/success',
      cancel_url: 'https://aihaat.shop/checkout',
    }),
  });

  const session = await createRes.json();
  console.log('Session Created:', session);

  if (!session.pp_url) {
    throw new Error('Failed to create session');
  }

  const ref = session.pp_url.split('/payment/')[1];
  console.log('Payment Ref:', ref);

  console.log('\n2. Verifying transaction with TrxID...');
  const form = new URLSearchParams();
  form.append('action-v2', 'transaction-verify');
  form.append('gateway-id', 'gw_bkash_01_154');
  form.append('transaction-id', ref);
  form.append('trxid', 'TRX_TEST_' + Date.now().toString().slice(-6));

  const verifyRes = await fetch(`https://pay.aihaat.shop/payment/${ref}?gateway=gw_bkash_01_154`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const verifyData = await verifyRes.json();
  console.log('Verification Result:', verifyData);
}

testFlow().catch(console.error);
