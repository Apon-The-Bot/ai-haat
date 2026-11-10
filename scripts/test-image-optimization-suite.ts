import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  optimizeAndStoreImage,
  validateImageBuffer,
  getImageManifest,
  ImageOptimizationResult,
  MAX_UPLOAD_SIZE,
  MAX_IMAGE_DIMENSION,
} from "../src/lib/media/optimizer";
import { resolveNetworkProfile } from "../src/hooks/useNetworkQuality";

// Disable Sharp internal file caching to release file handles immediately on Windows
sharp.cache(false);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const testResults: TestResult[] = [];

function recordTest(name: string, passed: boolean, error?: string, details?: any) {
  testResults.push({ name, passed, error, details });
  const icon = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`[${icon}] ${name}`);
  if (!passed && error) {
    console.error(`       Error: ${error}`);
  }
  if (details) {
    console.log(`       Details:`, JSON.stringify(details, null, 2));
  }
}

async function runTestSuite() {
  console.log("==========================================================");
  console.log(" AI HAAT - IMAGE OPTIMIZATION & DELIVERY AUTOMATED TEST SUITE");
  console.log("==========================================================\n");

  // ------------------------------------------------------------------
  // TEST GROUP 1: Buffer Validation & Security Controls
  // ------------------------------------------------------------------
  console.log("--- Group 1: Buffer Validation & Security Controls ---");

  // Test 1.1: Valid PNG Buffer
  try {
    const pngBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 255, g: 92, b: 3, alpha: 0.8 },
      },
    })
      .png()
      .toBuffer();

    const check = validateImageBuffer(pngBuffer);
    recordTest("1.1 Valid PNG Buffer accepted", check.valid && check.detectedFormat === "png");
  } catch (err: any) {
    recordTest("1.1 Valid PNG Buffer accepted", false, err.message);
  }

  // Test 1.2: Valid JPEG Buffer
  try {
    const jpegBuffer = await sharp({
      create: {
        width: 300,
        height: 200,
        channels: 3,
        background: { r: 26, g: 29, b: 38 },
      },
    })
      .jpeg()
      .toBuffer();

    const check = validateImageBuffer(jpegBuffer);
    recordTest("1.2 Valid JPEG Buffer accepted", check.valid && check.detectedFormat === "jpeg");
  } catch (err: any) {
    recordTest("1.2 Valid JPEG Buffer accepted", false, err.message);
  }

  // Test 1.3: Valid WebP Buffer
  try {
    const webpBuffer = await sharp({
      create: {
        width: 150,
        height: 150,
        channels: 4,
        background: { r: 16, g: 185, b: 129, alpha: 1 },
      },
    })
      .webp()
      .toBuffer();

    const check = validateImageBuffer(webpBuffer);
    recordTest("1.3 Valid WebP Buffer accepted", check.valid && check.detectedFormat === "webp");
  } catch (err: any) {
    recordTest("1.3 Valid WebP Buffer accepted", false, err.message);
  }

  // Test 1.4: Reject Non-Image Random Buffer
  try {
    const fakeBuffer = Buffer.from("THIS_IS_NOT_AN_IMAGE_FILE_JUST_PLAIN_TEXT");
    const check = validateImageBuffer(fakeBuffer);
    recordTest("1.4 Non-image buffer rejected", !check.valid);
  } catch (err: any) {
    recordTest("1.4 Non-image buffer rejected", false, err.message);
  }

  // Test 1.5: Reject SVG / XML script payloads (Strict Anti-XSS)
  try {
    const svgScriptPayload = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
         <script>alert('XSS-ATTACK')</script>
         <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
       </svg>`
    );
    const check = validateImageBuffer(svgScriptPayload);
    recordTest(
      "1.5 SVG/Script injection payload rejected",
      !check.valid && (check.error?.includes("SVG") || false),
      undefined,
      { error: check.error }
    );
  } catch (err: any) {
    recordTest("1.5 SVG/Script injection payload rejected", false, err.message);
  }

  // Test 1.6: Reject Oversized Image (>10MB in optimizeAndStoreImage)
  try {
    const oversizedBuffer = Buffer.alloc(MAX_UPLOAD_SIZE + 1024, 0);
    let caughtOversized = false;
    try {
      await optimizeAndStoreImage(oversizedBuffer, "oversized.jpg");
    } catch (err: any) {
      caughtOversized = err.message.includes("10MB");
    }
    recordTest("1.6 Oversized (>10MB) buffer rejected", caughtOversized);
  } catch (err: any) {
    recordTest("1.6 Oversized (>10MB) buffer rejected", false, err.message);
  }

  // Test 1.7: Reject Extreme Pixel Decompression Bomb (>8192px)
  try {
    let caughtBomb = false;
    try {
      const bombBuffer = await sharp({
        create: {
          width: 9000,
          height: 100,
          channels: 3,
          background: { r: 0, g: 0, b: 0 },
        },
      })
        .png()
        .toBuffer();

      await optimizeAndStoreImage(bombBuffer, "bomb.png");
    } catch (err: any) {
      caughtBomb = err.message.includes("exceed maximum allowed limit") || err.message.includes("8192");
    }
    recordTest("1.7 Decompression bomb (>8192px) rejected", caughtBomb);
  } catch (err: any) {
    recordTest("1.7 Decompression bomb (>8192px) rejected", false, err.message);
  }

  // ------------------------------------------------------------------
  // TEST GROUP 2: Full Optimization, WebP Conversion & Multi-Variant Generation
  // ------------------------------------------------------------------
  console.log("\n--- Group 2: Full Optimization & Multi-Variant Generation ---");

  let testAssetId = "";

  try {
    // Create realistic test image with multi-color gradient and geometric shapes
    const sampleImageBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 128, g: 128, b: 128 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="800" height="600">
              <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#FC5C03"/>
                  <stop offset="50%" stop-color="#1A1D26"/>
                  <stop offset="100%" stop-color="#10B981"/>
                </linearGradient>
              </defs>
              <rect width="800" height="600" fill="url(#g)"/>
              <circle cx="200" cy="200" r="120" fill="#FFE5D9"/>
              <circle cx="600" cy="400" r="180" fill="#3B82F6"/>
            </svg>`
          ),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    const result: ImageOptimizationResult = await optimizeAndStoreImage(sampleImageBuffer, "test-product.png");
    testAssetId = result.assetId;

    recordTest("2.1 Optimization executed successfully", result.success && !!result.assetId, undefined, {
      assetId: result.assetId,
      originalDimensions: `${result.width}x${result.height}`,
      aspectRatio: result.manifest.aspectRatio,
      resolutionsCount: result.manifest.profiles.balanced.variants.length,
      manifestUrl: result.manifestUrl,
    });

    // Test 2.2: Aspect ratio calculation (800 / 600 = 1.3333)
    const expectedAspectRatio = Number((800 / 600).toFixed(4));
    recordTest(
      "2.2 Correct aspect ratio calculated",
      result.manifest.aspectRatio === expectedAspectRatio,
      undefined,
      { expected: expectedAspectRatio, actual: result.manifest.aspectRatio }
    );

    // Test 2.3: No upscaling beyond original width (800)
    const balancedVariants = result.manifest.profiles.balanced.variants;
    const hasNoUpscaledWidths = balancedVariants.every((v) => v.width <= 800);
    const hasOriginalWidth = balancedVariants.some((v) => v.width === 800);
    recordTest(
      "2.3 No upscaling beyond source image bounds",
      hasNoUpscaledWidths && hasOriginalWidth,
      undefined,
      { variants: balancedVariants.map((v) => v.width) }
    );

    // Test 2.4: Three quality profiles generated
    const hasAllProfiles =
      result.manifest.profiles.low?.variants.length > 0 &&
      result.manifest.profiles.balanced?.variants.length > 0 &&
      result.manifest.profiles.high?.variants.length > 0;
    recordTest("2.4 All 3 quality profiles generated for each resolution", hasAllProfiles);

    // Test 2.5: Quality profile size ordering (low <= balanced <= high)
    const lowVar = result.manifest.profiles.low.variants.find((v) => v.width === 800);
    const balancedVar = result.manifest.profiles.balanced.variants.find((v) => v.width === 800);
    const highVar = result.manifest.profiles.high.variants.find((v) => v.width === 800);

    const sizesOrdered =
      lowVar && balancedVar && highVar && lowVar.fileSize <= balancedVar.fileSize && balancedVar.fileSize <= highVar.fileSize;

    recordTest(
      "2.5 Quality profile sizes strictly ordered (low <= balanced <= high)",
      !!sizesOrdered,
      undefined,
      {
        low: `${lowVar?.fileSize} B`,
        balanced: `${balancedVar?.fileSize} B`,
        high: `${highVar?.fileSize} B`,
      }
    );

    // Test 2.6: Disk layout and manifest file presence
    const assetDir = path.join(process.cwd(), "public", "uploads", result.assetId);
    const manifestOnDisk = path.join(assetDir, "manifest.json");
    const originalWebPOnDisk = path.join(assetDir, "original.webp");

    const diskFilesExist = fs.existsSync(manifestOnDisk) && fs.existsSync(originalWebPOnDisk);
    recordTest("2.6 Disk files created (manifest.json and original.webp)", diskFilesExist);

    // Test 2.7: Manifest retrieval via getImageManifest
    const fetchedManifest = await getImageManifest(result.assetId);
    const manifestValid =
      fetchedManifest !== null &&
      fetchedManifest.assetId === result.assetId &&
      fetchedManifest.profiles.balanced.variants.length === result.manifest.profiles.balanced.variants.length;

    recordTest("2.7 getImageManifest returns complete manifest", manifestValid);
  } catch (err: any) {
    recordTest("2.1-2.7 Full Optimization Pipeline", false, err.message);
  }

  // ------------------------------------------------------------------
  // TEST GROUP 3: Alpha Channel & Transparency Preservation
  // ------------------------------------------------------------------
  console.log("\n--- Group 3: Transparency Preservation ---");

  let transAssetId = "";
  try {
    // Create an image with transparent areas (alpha = 0)
    const transparentBuffer = await sharp({
      create: {
        width: 320,
        height: 320,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();

    const transResult = await optimizeAndStoreImage(transparentBuffer, "transparent-icon.png");
    transAssetId = transResult.assetId;

    // Inspect the generated balanced WebP
    const webpVariantPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      transResult.assetId,
      "320-balanced.webp"
    );
    const variantBuf = fs.readFileSync(webpVariantPath);
    const variantMeta = await sharp(variantBuf).metadata();

    recordTest(
      "3.1 Transparency / Alpha channel preserved in WebP output",
      variantMeta.hasAlpha === true,
      undefined,
      { channels: variantMeta.channels, hasAlpha: variantMeta.hasAlpha }
    );
  } catch (err: any) {
    recordTest("3.1 Transparency preservation", false, err.message);
  } finally {
    if (transAssetId) {
      const transDir = path.join(process.cwd(), "public", "uploads", transAssetId);
      if (fs.existsSync(transDir)) {
        try {
          fs.rmSync(transDir, { recursive: true, force: true });
        } catch {}
      }
    }
  }

  // ------------------------------------------------------------------
  // TEST GROUP 4: Network Heuristics Engine
  // ------------------------------------------------------------------
  console.log("\n--- Group 4: Adaptive Network Heuristics ---");

  // Test 4.1: Save-Data header / flag active -> returns 'low'
  const p1 = resolveNetworkProfile({
    saveData: true,
    effectiveType: "4g",
    downlink: 20,
    rtt: 30,
  });
  recordTest("4.1 Save-Data flag forces 'low' profile", p1 === "low", undefined, { result: p1 });

  // Test 4.2: 2G connection -> returns 'low'
  const p2 = resolveNetworkProfile({
    saveData: false,
    effectiveType: "2g",
    downlink: 0.3,
    rtt: 800,
  });
  recordTest("4.2 2G network selects 'low' profile", p2 === "low", undefined, { result: p2 });

  // Test 4.3: Slow-2G connection -> returns 'low'
  const p3 = resolveNetworkProfile({
    saveData: false,
    effectiveType: "slow-2g",
    downlink: 0.1,
    rtt: 1500,
  });
  recordTest("4.3 slow-2g network selects 'low' profile", p3 === "low", undefined, { result: p3 });

  // Test 4.4: 3G connection -> returns 'balanced'
  const p4 = resolveNetworkProfile({
    saveData: false,
    effectiveType: "3g",
    downlink: 1.5,
    rtt: 350,
  });
  recordTest("4.4 3G network selects 'balanced' profile", p4 === "balanced", undefined, { result: p4 });

  // Test 4.5: High speed 4G -> returns 'high'
  const p5 = resolveNetworkProfile({
    saveData: false,
    effectiveType: "4g",
    downlink: 15.0,
    rtt: 45,
  });
  recordTest("4.5 Fast 4G / Broadband selects 'high' profile", p5 === "high", undefined, { result: p5 });

  // Test 4.6: Weak 4G (high latency / poor downlink) -> falls back to 'balanced'
  const p6 = resolveNetworkProfile({
    saveData: false,
    effectiveType: "4g",
    downlink: 1.2,
    rtt: 350,
  });
  recordTest("4.6 Jittery/Degraded 4G throttles down to 'balanced'", p6 === "balanced", undefined, { result: p6 });

  // Test 4.7: Unknown / Offline / SSR default -> returns 'balanced'
  const p7 = resolveNetworkProfile(null);
  recordTest("4.7 SSR / Missing Network API defaults to 'balanced'", p7 === "balanced", undefined, { result: p7 });

  // ------------------------------------------------------------------
  // TEST GROUP 5: Real-World Performance Benchmark vs Original Files
  // ------------------------------------------------------------------
  console.log("\n--- Group 5: Real-World Performance Benchmarking ---");

  const sampleProducts = [
    { name: "Windows 11 Image", path: path.join(process.cwd(), "public", "images", "products", "windows-11.png") },
    { name: "Payment bKash JPG", path: path.join(process.cwd(), "public", "images", "payments", "bkash.jpg") },
    { name: "Brand Logo PNG", path: path.join(process.cwd(), "public", "images", "logo.png") },
  ];

  const benchmarkCleanups: string[] = [];

  for (const item of sampleProducts) {
    if (fs.existsSync(item.path)) {
      try {
        const originalBuf = fs.readFileSync(item.path);
        const originalSize = originalBuf.length;

        const optResult = await optimizeAndStoreImage(originalBuf, path.basename(item.path));
        benchmarkCleanups.push(optResult.assetId);

        const balancedVariants = optResult.manifest.profiles.balanced.variants;
        const balancedVar = balancedVariants[balancedVariants.length - 1];
        const lowVar = optResult.manifest.profiles.low.variants[0];

        const savingsBytes = originalSize - balancedVar.fileSize;
        const savingsPct = (savingsBytes / originalSize) * 100;

        recordTest(
          `5.x Benchmark: ${item.name}`,
          balancedVar.fileSize <= originalSize,
          undefined,
          {
            originalSize: `${(originalSize / 1024).toFixed(1)} KB`,
            balancedWebP: `${(balancedVar.fileSize / 1024).toFixed(1)} KB (${savingsPct >= 0 ? `-${savingsPct.toFixed(1)}%` : `+${Math.abs(savingsPct).toFixed(1)}%`})`,
            mobileLowWebP: `${(lowVar.fileSize / 1024).toFixed(1)} KB`,
            assetId: optResult.assetId,
          }
        );
      } catch (err: any) {
        recordTest(`5.x Benchmark: ${item.name}`, false, err.message);
      }
    }
  }

  // Cleanup test directories safely
  if (testAssetId) {
    benchmarkCleanups.push(testAssetId);
  }

  for (const assetId of benchmarkCleanups) {
    const dir = path.join(process.cwd(), "public", "uploads", assetId);
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {}
    }
  }

  // ------------------------------------------------------------------
  // TEST SUMMARY
  // ------------------------------------------------------------------
  console.log("\n==========================================================");
  console.log(" TEST SUMMARY REPORT");
  console.log("==========================================================");
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;

  console.log(`Total Tests Run : ${total}`);
  console.log(`Passed          : ${passed} / ${total} (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`Failed          : ${failed}`);
  console.log("==========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite encountered fatal execution error:", err);
  process.exit(1);
});
