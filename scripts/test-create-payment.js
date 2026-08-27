const fetch = require('node-fetch');

async function testCreate() {
  const baseUrl = "https://pay.aihaat.shop";
  const apiKey = "6efac52b56d3a19e2b7f39d54df43a8653e5dd21fe93249f84";

  const payload = {
    full_name: "Md.Amanullah Sheikh Apon",
    email_address: "mdamanullahsheikhapon@gmail.com",
    mobile_number: "01700000000",
    amount: "2000.00",
    currency: "BDT",
    return_url: "https://aihaat.shop/api/payment/callback?orderId=WT-999999&customerEmail=mdamanullahsheikhapon@gmail.com&amount=2000",
    webhook_url: "https://aihaat.shop/api/payment/webhook",
    metadata: {
      orderId: "WT-999999",
      email: "mdamanullahsheikhapon@gmail.com",
    }
  };

  const res = await fetch(`${baseUrl}/api/checkout/redirect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "MHS-PIPRAPAY-API-KEY": apiKey,
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Create result:", data);

  if (data.pp_id || data.transaction_ref) {
    const pp_id = data.pp_id || data.transaction_ref;
    console.log("Now verifying pp_id right after creation:", pp_id);
    const verifyRes = await fetch(`${baseUrl}/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "MHS-PIPRAPAY-API-KEY": apiKey,
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ pp_id }),
    });
    console.log("Verify Status:", verifyRes.status);
    const verifyData = await verifyRes.json();
    console.log("Verify Data:", JSON.stringify(verifyData, null, 2));
  }
}

testCreate();
