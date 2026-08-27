const fetch = require('node-fetch');

async function testDeliveryApi() {
  const payload = {
    customerName: "Md. Amanullah Sheikh Apon",
    customerEmail: "mdamanullahsheikhapon@gmail.com",
    orderId: "AH-TEST-001",
    productName: "Canva Pro Subscription",
    variationName: "1 Month - Personal Email",
    credentials: "Email: test@aihaat.shop\nPassword: TestPassword123!",
    instructions: "Login at canva.com using the credentials.",
    subject: "Your Canva Pro Delivery (Order #AH-TEST-001)",
  };

  console.log("1. Testing localhost /api/admin/send-delivery-email...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/send-delivery-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("Local Status:", res.status);
    const data = await res.json();
    console.log("Local Response:", data);
  } catch (e) {
    console.error("Local Error:", e);
  }

  console.log("\n2. Testing live https://aihaat.shop/api/admin/send-delivery-email...");
  try {
    const res = await fetch("https://aihaat.shop/api/admin/send-delivery-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("Live Status:", res.status);
    const data = await res.json();
    console.log("Live Response:", data);
  } catch (e) {
    console.error("Live Error:", e);
  }
}

testDeliveryApi();
