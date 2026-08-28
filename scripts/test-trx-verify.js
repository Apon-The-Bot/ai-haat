const fetch = require('node-fetch');

async function testPiprapay() {
  const baseUrl = process.env.PIPRAPAY_BASE_URL || "https://pay.aihaat.shop";
  const apiKey = process.env.PIPRAPAY_API_KEY;
  if (!apiKey) throw new Error("PIPRAPAY_API_KEY environment variable is required");

  console.log("1. Testing verify-payment with transaction_id: KKQ3TEYT7D");
  try {
    const res = await fetch(`${baseUrl}/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "MHS-PIPRAPAY-API-KEY": apiKey,
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ transaction_id: "KKQ3TEYT7D", trx_id: "KKQ3TEYT7D", pp_id: "KKQ3TEYT7D" }),
    });

    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

testPiprapay();
