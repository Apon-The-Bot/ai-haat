import assert from "node:assert/strict";
import { validateAiContentPatch } from "../src/lib/ai/content-validation";
import { validateAiRoute } from "../src/lib/ai/routing";
import { getAiProvider, providerSupports } from "../src/lib/ai/providers";

assert.equal(getAiProvider("openai")?.status, "CONFIG_REQUIRED");
assert.equal(providerSupports("openai", "JSON"), true);
assert.equal(validateAiRoute({ task: "METADATA", providerId: "openai", modelId: "configured-model", maxOutputTokens: 500 }).allowed, true);
assert.equal(validateAiRoute({ task: "METADATA", providerId: "unknown", modelId: "x" }).allowed, false);
const validation = validateAiContentPatch({ seoTitle: "<b>Title</b>", price: "999", seoDescription: 123 }, ["seoTitle", "seoDescription"]);
assert.equal(validation.safePatch.seoTitle, "<b>Title</b>");
assert.deepEqual(validation.blockedFields, ["price"]);
assert.equal(validation.warnings.length, 1);
console.log("AI foundation checks passed");
