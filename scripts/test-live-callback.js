const fetch = require('node-fetch');

async function testLiveCallback() {
  const liveUrl = "https://aihaat.shop/api/payment/callback?orderId=WT-999999&customerEmail=mdamanullahsheikhapon@gmail.com&amount=2000&pp_id=660177260516682660009194763";
  console.log("Testing live callback with initiated status pp_id 660177260516682660009194763...");
  try {
    const res = await fetch(liveUrl, { redirect: 'manual' });
    console.log("Status:", res.status);
    console.log("Location header:", res.headers.get('location'));
  } catch (e) {
    console.error("Error:", e);
  }
}

testLiveCallback();
