import fs from "fs";
import path from "path";
import { optimizeAndStoreImage } from "../src/lib/media/optimizer";

interface OptimizationSummary {
  filePath: string;
  originalSize: number;
  optimizedSize: number;
  savingsBytes: number;
  savingsPercentage: number;
  assetId: string;
  manifestPath: string;
}

async function scanDirectory(dir: string, fileList: string[] = []): Promise<string[]> {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Don't recurse into uploads directory itself to avoid reprocessing generated variants
      if (entry.name === "uploads" || entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      await scanDirectory(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".png", ".jpg", ".jpeg"].includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }

  return fileList;
}

async function runLegacyOptimization() {
  const isDryRun = process.argv.includes("--dry-run");
  const targetDir = path.join(process.cwd(), "public", "images");

  console.log("==========================================================");
  console.log(" AI HAAT - LEGACY IMAGE BATCH OPTIMIZATION PIPELINE");
  console.log("==========================================================");
  console.log(`Mode: ${isDryRun ? "DRY RUN (Analysis Only)" : "LIVE PROCESSING"}`);
  console.log(`Target directory: ${targetDir}`);

  const files = await scanDirectory(targetDir);
  console.log(`Found ${files.length} raster image candidates for optimization.`);
  console.log("----------------------------------------------------------\n");

  const results: OptimizationSummary[] = [];
  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relPath = path.relative(process.cwd(), file);
    const stats = fs.statSync(file);
    const originalSize = stats.size;
    totalOriginalBytes += originalSize;

    console.log(`[${i + 1}/${files.length}] Processing: ${relPath} (${(originalSize / 1024).toFixed(1)} KB)`);

    if (isDryRun) {
      // Estimate 60% average savings
      const estimatedSavings = Math.round(originalSize * 0.6);
      const estimatedOptimized = originalSize - estimatedSavings;
      totalOptimizedBytes += estimatedOptimized;

      results.push({
        filePath: relPath,
        originalSize,
        optimizedSize: estimatedOptimized,
        savingsBytes: estimatedSavings,
        savingsPercentage: 60.0,
        assetId: "dry-run-preview",
        manifestPath: "n/a",
      });
      continue;
    }

    try {
      const buffer = fs.readFileSync(file);
      const filename = path.basename(file);
      
      const result = await optimizeAndStoreImage(buffer, filename);
      
      const balancedVar = result.manifest.profiles.balanced.variants[result.manifest.profiles.balanced.variants.length - 1];
      const primaryOptimizedSize = balancedVar ? balancedVar.fileSize : result.optimizedSizeKB * 1024;
      const savingsBytes = Math.max(0, originalSize - primaryOptimizedSize);
      const savingsPercentage = originalSize > 0 ? (savingsBytes / originalSize) * 100 : 0;
      
      totalOptimizedBytes += primaryOptimizedSize;

      results.push({
        filePath: relPath,
        originalSize,
        optimizedSize: primaryOptimizedSize,
        savingsBytes,
        savingsPercentage,
        assetId: result.assetId,
        manifestPath: result.manifestUrl,
      });

      console.log(`  ✓ Created Asset ID: ${result.assetId}`);
      console.log(`  ✓ WebP Primary Size: ${(primaryOptimizedSize / 1024).toFixed(1)} KB (-${savingsPercentage.toFixed(1)}%)`);
      console.log(`  ✓ Variants: ${result.manifest.profiles.balanced.variants.length} resolutions x 3 profiles`);
    } catch (err: any) {
      console.error(`  ✗ Failed to optimize ${relPath}:`, err.message);
    }
  }

  const overallSavingsBytes = Math.max(0, totalOriginalBytes - totalOptimizedBytes);
  const overallSavingsPct = totalOriginalBytes > 0 ? (overallSavingsBytes / totalOriginalBytes) * 100 : 0;

  console.log("\n==========================================================");
  console.log(" BATCH OPTIMIZATION COMPLETE");
  console.log("==========================================================");
  console.log(`Total Images Evaluated : ${files.length}`);
  console.log(`Total Original Footprint: ${(totalOriginalBytes / 1024).toFixed(1)} KB`);
  console.log(`Total WebP Footprint    : ${(totalOptimizedBytes / 1024).toFixed(1)} KB`);
  console.log(`Net Bandwidth Reduction : ${(overallSavingsBytes / 1024).toFixed(1)} KB (${overallSavingsPct.toFixed(1)}% reduction)`);
  console.log("==========================================================\n");

  // Output legacy image mapping JSON if not dry-run
  if (!isDryRun && results.length > 0) {
    const mapPath = path.join(process.cwd(), "public", "uploads", "legacy-migration-map.json");
    fs.mkdirSync(path.dirname(mapPath), { recursive: true });
    fs.writeFileSync(mapPath, JSON.stringify(results, null, 2), "utf8");
    console.log(`Migration mapping table written to: ${mapPath}`);
  }
}

runLegacyOptimization().catch((err) => {
  console.error("Batch optimization failed:", err);
  process.exit(1);
});
