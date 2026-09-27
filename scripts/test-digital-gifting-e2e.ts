import { prisma } from "../src/lib/prisma";
import {
  generateGiftToken,
  getGiftByClaimToken,
  markGiftAsOpened,
  GIFT_THEMES,
  QUICK_GREETINGS,
} from "../src/lib/gifting/product-gifting";

async function runE2ETest() {
  console.log("==================================================");
  console.log("🎁 STARTING DIGITAL GIFTING SYSTEM E2E VERIFICATION");
  console.log("==================================================");

  // 1. Verify Themes and Quick Greetings
  console.log("\n[Test 1] Validating Themes & Greetings...");
  const themeKeys = Object.keys(GIFT_THEMES);
  console.log(`✓ Loaded ${themeKeys.length} gift themes:`, themeKeys.join(", "));
  if (themeKeys.length !== 5) {
    throw new Error(`Expected 5 themes, got ${themeKeys.length}`);
  }
  console.log(`✓ Loaded ${QUICK_GREETINGS.length} quick greetings.`);

  // 2. Token Generation
  console.log("\n[Test 2] Generating Gift Claim Token...");
  const testToken = generateGiftToken();
  console.log(`✓ Generated Token: ${testToken}`);
  if (!testToken.startsWith("gift_") || testToken.length < 15) {
    throw new Error("Invalid token format generated!");
  }

  // 3. Create a Test Gift Order in Database
  console.log("\n[Test 3] Creating Real DB Order with Gifting Metadata...");
  const testOrderNumber = `TESTGIFT-${Date.now().toString().slice(-6)}`;
  
  const createdOrder = await prisma.order.create({
    data: {
      orderNumber: testOrderNumber,
      customerName: "Mahfuz Rahman (Sender)",
      customerEmail: "mahfuz.test@aihaat.shop",
      customerPhone: "+8801700112233",
      paymentMethod: "bKash",
      trxId: "TEST_GIFT_TRX",
      paymentStatus: "VERIFIED",
      deliveryStatus: "DELIVERED",
      totalBDT: 850,
      subtotalBDT: 850,
      discountBDT: 0,
      notes: "Test order for digital gifting feature",
      // Gifting fields
      isGift: true,
      recipientName: "Tanvir Hasan (Recipient)",
      recipientEmail: "tanvir.test@gmail.com",
      recipientPhone: "+8801811223344",
      giftMessage: "Happy Birthday my friend! Enjoy ChatGPT Plus on me!",
      giftTheme: "birthday",
      hidePriceOnGift: true,
      giftClaimToken: testToken,
      giftWrapOpened: false,
      // Attached Item
      items: {
        create: [
          {
            productName: "ChatGPT Plus Subscription",
            variationName: "1 Month Shared Profile",
            priceBDT: 850,
            quantity: 1,
            image: "https://aihaat.shop/images/products/chatgpt.png",
            deliveryStatus: "DELIVERED",
          },
        ],
      },
      // Attached Delivered Credential
      deliveredKeys: {
        create: [
          {
            productName: "ChatGPT Plus Subscription",
            accountType: "Shared Profile",
            credentials: "tanvir.gift@aihaat.io:SecretPass2026#",
            instructions: "Login at chatgpt.com. Do not change password.",
            warrantyExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
    include: {
      items: true,
      deliveredKeys: true,
    },
  });

  console.log(`✓ Created DB Order: ${createdOrder.orderNumber} (ID: ${createdOrder.id})`);
  console.log(`  - isGift: ${createdOrder.isGift}`);
  console.log(`  - recipientName: ${createdOrder.recipientName}`);
  console.log(`  - giftClaimToken: ${createdOrder.giftClaimToken}`);

  // 4. Test Public Claim Retrieval via Token
  console.log("\n[Test 4] Querying Public Gift Claim Portal API...");
  const publicGift = await getGiftByClaimToken(testToken);
  if (!publicGift) {
    throw new Error("Failed to retrieve gift details using token!");
  }

  console.log("✓ Retrieved Public Gift Details Successfully:");
  console.log(`  - Sender: ${publicGift.senderName}`);
  console.log(`  - Recipient: ${publicGift.recipientName}`);
  console.log(`  - Message: "${publicGift.giftMessage}"`);
  console.log(`  - Theme: ${publicGift.giftTheme}`);
  console.log(`  - Hide Price: ${publicGift.hidePriceOnGift}`);
  console.log(`  - Item Price Hidden?: ${publicGift.items[0].priceBDT === undefined ? "YES (Secure)" : "NO"}`);
  console.log(`  - Credentials Revealed: ${publicGift.deliveredCredentials.length} item(s)`);
  if (publicGift.deliveredCredentials.length > 0) {
    const cred = publicGift.deliveredCredentials[0] as any;
    console.log(`    * Email: ${cred.accountEmail || 'N/A'}`);
    console.log(`    * Password: ${cred.accountPassword || 'N/A'}`);
  }
  console.log(`  - Wrap Status: ${publicGift.giftWrapOpened ? "Opened" : "Unopened / Wrapped"}`);

  if (publicGift.items[0].priceBDT !== undefined) {
    throw new Error("Security Alert: Price was not hidden when hidePriceOnGift was true!");
  }

  // 5. Test Unboxing Action
  console.log("\n[Test 5] Simulating Recipient Unboxing Event...");
  const unwrapResult = await markGiftAsOpened(testToken);
  console.log("✓ Unbox Mutation Executed. Result:", unwrapResult);
  if (!unwrapResult) {
    throw new Error("Failed to mark gift as opened!");
  }

  // 6. Verify State After Unboxing
  console.log("\n[Test 6] Re-fetching to Verify Opened State in DB...");
  const refreshedGift = await getGiftByClaimToken(testToken);
  console.log(`  - giftWrapOpened: ${refreshedGift?.giftWrapOpened}`);
  console.log(`  - giftOpenedAt: ${refreshedGift?.giftOpenedAt}`);
  if (!refreshedGift?.giftWrapOpened || !refreshedGift?.giftOpenedAt) {
    throw new Error("Gift order was not updated with open status!");
  }

  // 7. Cleanup
  console.log("\n[Test 7] Cleaning Up Test Order from DB...");
  await prisma.deliveredKey.deleteMany({ where: { orderId: createdOrder.id } });
  await prisma.orderItem.deleteMany({ where: { orderId: createdOrder.id } });
  await prisma.order.delete({ where: { id: createdOrder.id } });
  console.log("✓ Test Order, Items, and Keys successfully cleaned up.");

  console.log("\n==================================================");
  console.log("🎉 ALL DIGITAL GIFTING E2E TESTS PASSED PERFECTLY!");
  console.log("==================================================");
}

runE2ETest()
  .catch((err) => {
    console.error("❌ E2E TEST FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
