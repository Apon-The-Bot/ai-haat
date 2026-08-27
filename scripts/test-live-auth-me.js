const fetch = require('node-fetch');

async function checkLiveAuthMe() {
  const url = "https://aihaat.shop/api/auth/me?email=mdamanullahsheikhapon@gmail.com";
  console.log("Checking live /api/auth/me...");
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Live auth me response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

checkLiveAuthMe();
