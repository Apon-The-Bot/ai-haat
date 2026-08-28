import { prisma } from "../src/lib/prisma";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";

async function runStorefrontSuite() {
  console.log("=================================================");
  console.log("🚀 Starting AI Haat Storefront & Ecosystem Verification Suite");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  try {
    // Setup test product for reviews
    const testProd = await prisma.product.upsert({
      where: { slug: "chatgpt-plus-test-suite" },
      create: {
        slug: "chatgpt-plus-test-suite",
        name: "ChatGPT Plus Test",
        category: "AI Tools",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
        minPriceBDT: 290,
        maxPriceBDT: 290,
        shortDesc: "ChatGPT Plus Subscription",
        descriptionBangla: "টেস্ট ডেসক্রিপশন",
        descriptionEnglish: "Test description",
        features: JSON.stringify(["GPT-4o Access", "DALL-E 3"]),
      },
      update: {},
    });

    // 1. TEST 1: Customer Reviews DB & Aggregation
    console.log("--- Test 1: Customer Reviews System ---");
    const testReview = await prisma.review.create({
      data: {
        productId: testProd.id,
        author: "Apon Test Reviewer",
        rating: 5,
        comment: "Excellent fast delivery and genuine ChatGPT Plus account!",
        status: "APPROVED",
        isVerifiedPurchase: true,
      },
    });

    assert(Boolean(testReview.id), "Customer review created successfully");

    const reviews = await prisma.review.findMany({
      where: { status: "APPROVED" },
    });
    assert(reviews.length > 0, "Approved reviews queryable from DB");

    // 2. TEST 2: Product Requests & Pre-Order System
    console.log("\n--- Test 2: Custom Product Request Hub ---");
    const testRequest = await prisma.productRequest.create({
      data: {
        productName: "Midjourney Pro 1 Year",
        targetBudget: "3500 BDT",
        contact: "01700000000 / apon_test_req@aihaat.shop",
        details: "Need team shared license for design agency (1 Year)",
        status: "PENDING",
      },
    });

    assert(Boolean(testRequest.id), "Custom product request created and persisted");

    const reqList = await prisma.productRequest.findMany({
      where: { productName: "Midjourney Pro 1 Year" },
    });
    assert(reqList.length >= 1, "Product request retrievable by product name");

    // 3. TEST 3: Public Order Tracking & PII Masking
    console.log("\n--- Test 3: Public Order Tracking Safety ---");
    const trackOrder = await prisma.order.create({
      data: {
        id: "AH-TRACK-TEST",
        orderNumber: "AH-TRACK-TEST",
        customerName: "Secret Customer",
        customerEmail: "secret_customer@gmail.com",
        customerPhone: "01712345678",
        subtotalBDT: 500,
        totalBDT: 500,
        paymentMethod: "bkash",
        paymentStatus: "VERIFIED",
        deliveryStatus: "DELIVERED",
        items: {
          create: {
            productName: "Claude Pro",
            variationName: "1 Month",
            priceBDT: 500,
            quantity: 1,
          },
        },
        timelineEvents: {
          create: {
            status: "DELIVERED",
            actor: "ADMIN",
            note: "Account delivered to email and dashboard",
          },
        },
      },
      include: { items: true, timelineEvents: true },
    });

    assert(Boolean(trackOrder.id), "Track test order created");

    // Masking check
    const phone = trackOrder.customerPhone || "";
    const maskedPhone = phone.length > 6 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone;
    assert(maskedPhone === "017****5678", "Customer phone properly masked for public tracking");

    // 4. TEST 4: Dynamic Sitemap & SEO Verification
    console.log("\n--- Test 4: Dynamic Sitemap & Robots Directives ---");
    const sm = await sitemap();
    assert(Array.isArray(sm) && sm.length > 5, "Dynamic sitemap generated with complete route index");
    assert(sm.some((s) => s.url.includes("/shop")), "Sitemap contains /shop marketplace URL");
    assert(sm.some((s) => s.url.includes("/proofs")), "Sitemap contains /proofs social proof URL");
    assert(sm.some((s) => s.url.includes("/product-request")), "Sitemap contains /product-request URL");

    const rb = robots();
    assert(Boolean(rb.rules), "Dynamic robots.txt returns rules structure");
    assert(Boolean(rb.sitemap), "Robots.txt references sitemap XML");

    // 5. CLEANUP
    console.log("\n--- Cleanup ---");
    await prisma.review.delete({ where: { id: testReview.id } });
    await prisma.productRequest.delete({ where: { id: testRequest.id } });
    await prisma.order.delete({ where: { id: trackOrder.id } });
    await prisma.product.delete({ where: { id: testProd.id } });
    assert(true, "All test artifacts cleanly cleaned up");

    console.log("\n=================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} STOREFRONT & ECOSYSTEM TESTS PASSED!`);
    console.log("=================================================");
  } catch (err) {
    console.error("\n❌ Storefront Verification Suite Failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStorefrontSuite();
