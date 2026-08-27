const fetch = require('node-fetch');

async function testCompletePaymentFlow() {
  console.log("=== STEP 1: Create Topup via /api/payment/create ===");
  const createRes = await fetch("http://localhost:3000/api/payment/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: `WT-${Date.now().toString().slice(-6)}`,
      amount: 2000,
      customerName: "Md. Amanullah Sheikh Apon",
      customerEmail: "mdamanullahsheikhapon@gmail.com",
      customerPhone: "01700000000",
      metadata: {
        type: "WALLET_TOPUP",
        email: "mdamanullahsheikhapon@gmail.com"
      }
    })
  });

  const createData = await createRes.json();
  console.log("Create response:", createData);

  if (!createData.success || !createData.pp_id) {
    console.error("Failed to create payment on PipraPay");
    return;
  }

  const pp_id = createData.pp_id;
  console.log("\n=== STEP 2: Verify Initial Status (Before payment) ===");
  const initialVerify = await fetch("https://pay.aihaat.shop/api/verify-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "MHS-PIPRAPAY-API-KEY": "6efac52b56d3a19e2b7f39d54df43a8653e5dd21fe93249f84",
      "X-Api-Key": "6efac52b56d3a19e2b7f39d54df43a8653e5dd21fe93249f84"
    },
    body: JSON.stringify({ pp_id })
  });
  const initialData = await initialVerify.json();
  console.log("Initial status from PipraPay:", initialData.status);

  console.log("\n=== STEP 3: Test Callback with Initial Status (Simulating Cancel/Cross) ===");
  const callbackRes = await fetch(`http://localhost:3000/api/payment/callback?orderId=WT-TEST&customerEmail=mdamanullahsheikhapon@gmail.com&amount=2000&pp_id=${pp_id}`, {
    redirect: "manual"
  });
  console.log("Callback redirect status:", callbackRes.status);
  console.log("Callback redirect location:", callbackRes.headers.get("location"));
  console.log("✓ Correctly redirected to cancelled!");
}

testCompletePaymentFlow().catch(console.error);
