const fetch = require('node-fetch');

async function testVerify() {
  const baseUrl = "https://pay.aihaat.shop";
  const apiKey = "6efac52b56d3a19e2b7f39d54df43a8653e5dd21fe93249f84";
  const pp_id = "598614988923587181908033796";

  console.log(`Checking verification for pp_id: ${pp_id}...`);
  try {
    const res = await fetch(`${baseUrl}/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "MHS-PIPRAPAY-API-KEY": apiKey,
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ pp_id }),
    });

    console.log('Status code:', res.status);
    const data = await res.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testVerify();
