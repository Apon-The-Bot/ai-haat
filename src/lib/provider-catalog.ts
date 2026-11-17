import { createHmac, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";

export const providers = {
  QAMIFY: "Qamify_bot",
  SUBEXPRESS: "Subexpressshope_bot",
  PREMIKEY: "PremiKeyBot",
  SHOP_CRON191: "shop_cron191_en_bot",
  FATBUNNY_HUB: "FatBunny_Hub_bot",
  CHEAP_LUXURY_AI: "CheapLuxuryAI_bot",
  ALDORADO_SALES: "Aldorado_sales_bot",
  AISHOPZ: "aishopzbot",
  QORIX3: "QORIX3_bot",
  LOJINHABR: "lojinhabr_bot",
  PA_STORE: "p_a_store_bot",
  FLOW_SELLER: "flow_seller_bot",
  DIGITAL_ASSET: "digital_assetbot",
  PDEAL: "pdealbot",
  PRODSELLER: "ProdSellerBot",
  DANTEHUB: "dantehubbot",
  EKLASSTORE: "eklasstorebot",
  GEMINIPROSUB: "geminiprosub_bot",
  SHOPCLAUDE: "shopclaude_bot",
  LOJA_GPT_PLUS: "loja_gpt_plus_bot",
  STOREBATMAN: "storeBatmanBot",
  VEXORIX_STORE: "VEXORIX_STORE_BOT",
  ACCZONE_STORE: "Acczone_Store_bot",
  ZFOURSTORE: "zfourstorebot",
  POWELL_DIGITAL_BLUEPRINTS: "PowellDigitalBlueprints_bot",
  AIDIGITALTOOLS: "aidigitaltools_bot",
  INSTM00N: "instm00nbot",
  GGSOMA: "Ggsomabot",
  SILENT_STORE: "Silent_Store_bot",
  SHOPEELABS: "ShopeeLabs_bot",
  TRIALSPACEHUB: "TrialSpaceHub_bot",
  BITE_STORE: "Bite_storee_bot",
  AITOOLIFY: "aitoolify_bot",
  CUPPON: "Cupponbot",
  BUNNYTOOLS: "bunnytoolss_bot",
  WARZONE_SHOP: "WarzoneShopbot",
} as const;

export const pendingProviders = {
  instm00nbot: "Catalog returned HTTP 403.",
  Silent_Store_bot: "Catalog returned HTTP 401.",
  ShopeeLabs_bot: "Catalog connection timed out.",
  aitoolify_bot: "Catalog connection timed out.",
  Cupponbot: "Catalog connection timed out.",
  bunnytoolss_bot: "Catalog connection timed out.",
  WarzoneShopbot: "Catalog connection timed out.",
} as const;

export type Provider = keyof typeof providers;
const usdToBdt = 130;
const additionalEndpoints: Partial<Record<Provider, { url: string; header?: string; paginated?: boolean; public?: boolean }>> = {
  QORIX3: { url: "https://qorixlab.com/api/public/reseller/v1/products" },
  LOJINHABR: { url: "https://api.cmpdr.dev/v1/catalog/products" },
  PA_STORE: { url: "https://store.proaccesses.com/api/v1/products", header: "X-API-Key" },
  FLOW_SELLER: { url: "https://flowseller-api.pe-supplykh.com/api/v1/products", paginated: true },
  DIGITAL_ASSET: { url: "https://digital-assets-api.pe-supplykh.com/api/v1/products", paginated: true },
  PDEAL: { url: "https://digioffers.xyz/api/v1/products", header: "X-API-Key" },
  PRODSELLER: { url: "https://prodseller.com/v1/products", header: "X-API-Key" },
  DANTEHUB: { url: "https://dantehub.shop/api/public/v1/products" },
  EKLASSTORE: { url: "https://api.eklas.dev/v1/products", paginated: true },
  GEMINIPROSUB: { url: "https://api-geminipro.ignorelist.com/api/reseller/v1/products", header: "X-API-Key" },
  SHOPCLAUDE: { url: "https://api.shop-tg.ru/api/v1/user/catalog", paginated: true },
  LOJA_GPT_PLUS: { url: "https://api.storegptplus.com/v1/products", header: "X-API-Key" },
  STOREBATMAN: { url: "https://web-production-1c7b1.up.railway.app/api/reseller/products", header: "X-Reseller-Key" },
  VEXORIX_STORE: { url: "https://207-148-64-141.sslip.io/api/reseller/products", header: "X-Reseller-Key" },
  ACCZONE_STORE: { url: "https://api.acczone.xyz/getServices", public: true },
  ZFOURSTORE: { url: "https://zfourstore.up.railway.app/api/v1/products", header: "X-API-Key" },
  POWELL_DIGITAL_BLUEPRINTS: { url: "https://powell-digital-blueprints-bot-api.onrender.com/api/reseller/catalogue" },
  AIDIGITALTOOLS: { url: "https://www.mediacraftshop.com/api/public/v2/products", header: "X-API-Key" },
  INSTM00N: { url: "https://instant.m00nshots.store/api/v1/products" },
  GGSOMA: { url: "https://ggsoma.store/api/partner/v1/catalog/products" },
  SILENT_STORE: { url: "https://api.cssx.store/api/v1/products", header: "X-API-Key" },
  SHOPEELABS: { url: "https://pirmelabs.mylabsstore.com/api/v1/products" },
  TRIALSPACEHUB: { url: "https://message-manager-bot.lovable.app/api/public/reseller/v1/products", header: "X-API-Key" },
  BITE_STORE: { url: "https://reseller.bite-store.com/v1/products?per_page=500", header: "X-API-Key" },
  AITOOLIFY: { url: "https://bot.aitoolifystudio.io/api/v1/products" },
  CUPPON: { url: "https://cupponhub.shop/reseller/api/?action=products", header: "X-API-Key" },
  BUNNYTOOLS: { url: "https://bunnytoolsbot.tech/api/v1/products", header: "X-API-Key" },
  WARZONE_SHOP: { url: "https://api.warzoneshop.in/api/v1/products", header: "X-API-Key" },
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function money(value: unknown, currency: unknown) {
  const code = typeof currency === "string" && /^[A-Z]{3,8}$/.test(currency) ? currency : null;
  const raw = typeof value === "string" || typeof value === "number" ? String(value) : "";
  if (!/^\d{1,24}(\.\d{1,12})?$/.test(raw)) return { original: null, currency: code, bdt: null };
  const original = new Prisma.Decimal(raw);
  const bdt = code === "USD" ? original.mul(usdToBdt) : code === "BDT" ? original : null;
  return { original: original.toFixed(), currency: code, bdt: bdt?.toFixed(2) ?? null };
}

async function fetchPage(url: URL, headers: Record<string, string>) {
  let response: Response;
  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(15000), redirect: "error", cache: "no-store" });
  } catch {
    throw new Error("Provider connection failed or timed out.");
  }
  if (!response.ok) throw new Error("Provider returned HTTP " + response.status + ".");
  const payload: unknown = await response.json().catch(() => null);
  const envelope = record(payload);
  const rows = Array.isArray(payload) ? payload : envelope.products ?? record(envelope.data).products
    ?? envelope.data ?? envelope.items ?? envelope.services;
  if (!Array.isArray(rows) || envelope.ok === false || envelope.success === false) {
    throw new Error("Provider returned an unexpected catalog response.");
  }
  return { rows, pagination: record(envelope.pagination), meta: record(envelope.meta), cursor: envelope.cursor };
}

export async function fetchProviderCatalog(provider: Provider) {
  const additional = additionalEndpoints[provider];
  const token = provider === "AIDIGITALTOOLS" ? process.env.AIDIGITALTOOLS_API_KEY : process.env[provider + "_API_TOKEN"];
  if (!token && !additional?.public) throw new Error("Server credential is missing.");
  const qamify = provider === "QAMIFY";
  const subexpress = provider === "SUBEXPRESS";
  const url = new URL(additional?.url ?? (qamify
    ? "https://api.qamify.site/v1/products?capabilities=deferred-v1"
    : subexpress ? "https://api.subexpress.space/v1/products"
      : "https://canboso.com/api/v2/telegram-buyer/products"));
  const header = additional?.header ?? (additional || qamify || subexpress ? "Authorization" : "x-buyer-key");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!additional?.public && token) headers[header] = header === "Authorization" ? "Bearer " + token : token;
  if (provider === "AIDIGITALTOOLS") {
    const secret = process.env.AIDIGITALTOOLS_API_SECRET;
    if (!secret) throw new Error("Server credential is missing.");
    const timestamp = String(Math.floor(Date.now() / 1000));
    const nonce = randomUUID();
    headers["X-API-Secret"] = secret;
    headers["X-Timestamp"] = timestamp;
    headers["X-Nonce"] = nonce;
    headers["X-Signature"] = createHmac("sha256", secret).update(timestamp + "." + nonce + ".").digest("hex");
  }
  const rows: unknown[] = [];
  for (let page = 1; ; page++) {
    if (additional?.paginated && provider !== "SHOPCLAUDE") url.searchParams.set("page", String(page));
    const result = await fetchPage(url, headers);
    rows.push(...result.rows);
    if (!additional?.paginated) break;
    if (provider === "SHOPCLAUDE") {
      if (result.cursor === null) break;
      if (typeof result.cursor !== "string" || !/^\d+$/.test(result.cursor) || result.cursor === url.searchParams.get("cursor")) {
        throw new Error("Provider returned invalid pagination.");
      }
      url.searchParams.set("cursor", result.cursor);
    } else if (provider === "EKLASSTORE") {
      const { total, limit } = result.meta;
      if (typeof total !== "number" || typeof limit !== "number" || limit < 1 || result.meta.page !== page) {
        throw new Error("Provider returned invalid pagination.");
      }
      if (page * limit >= total) break;
    } else {
      if (result.pagination.page !== page || typeof result.pagination.has_more !== "boolean") {
        throw new Error("Provider returned invalid pagination.");
      }
      if (!result.pagination.has_more) break;
    }
    if (page === 10) throw new Error("Catalog exceeded the per-request page limit.");
  }
  return rows.map((item: unknown) => {
    const row = record(item);
    const id = provider === "CUPPON" ? row.key ?? row.id : provider === "WARZONE_SHOP" ? row.service_id ?? row.id
      : provider === "POWELL_DIGITAL_BLUEPRINTS" ? row.product_code
      : provider === "ACCZONE_STORE" ? row.key : provider === "LOJA_GPT_PLUS"
      ? row.product_key : qamify || subexpress || additional ? row.id : row.productId;
    if (typeof id !== "string" && !Number.isSafeInteger(id)) throw new Error("Provider returned a product without a valid ID.");
    const price = record(row.price);
    const amount = provider === "GGSOMA" ? row.yourPrice : provider === "AITOOLIFY" ? row.price_usdt ?? row.price
      : provider === "CUPPON" ? row.price_usdt_from ?? row.price_usdt ?? row.price
      : provider === "BUNNYTOOLS" ? row.base_price ?? row.price
      : qamify ? row.unit_price : subexpress || provider === "STOREBATMAN" ? row.price_usd
      : provider === "SHOPCLAUDE" ? row.price_rub
      : provider === "POWELL_DIGITAL_BLUEPRINTS" ? row.reseller_price_ghs
        : provider === "AIDIGITALTOOLS" ? row.your_price
      : provider === "ZFOURSTORE" ? row.api_price
      : provider === "PA_STORE" ? row.price_usdt : provider === "PRODSELLER" ? row.finalPrice
        : additional ? row.price : price.amount;
    const currency = subexpress || provider === "WARZONE_SHOP" || provider === "STOREBATMAN" || provider === "FLOW_SELLER" || provider === "DIGITAL_ASSET" ? "USD"
      : (provider === "AITOOLIFY" && row.price_usdt != null) || (provider === "CUPPON" && (row.price_usdt_from != null || row.price_usdt != null)) ? "USDT"
      : provider === "POWELL_DIGITAL_BLUEPRINTS" ? "GHS" : provider === "SHOPCLAUDE" ? "RUB" : provider === "PA_STORE" ? "USDT"
      : qamify || additional ? row.currency : price.currency;
    const stock = additional || qamify ? row.stock ?? row.available_stock : record(row.availability).available;
    const stockFlag = subexpress || additional ? row.in_stock ?? row.inStock ?? record(row.stock).inStock : null;
    let availability = "Unknown";
    if (typeof stockFlag === "boolean") availability = stockFlag ? "In stock" : "Out of stock";
    if (typeof stock === "number" && row.stock_known !== false && row.stock_is_stale !== true) availability = String(stock);
    if (row.stock_unlimited === true || row.unlimited_stock === true) availability = "Unlimited";
    const quantityTiers = Array.isArray(row.pricing_tiers) ? row.pricing_tiers : [];
    const tiers = quantityTiers.map((value: unknown) => {
      const tier = record(value);
      const min = typeof tier.min_qty === "number" ? String(tier.min_qty) : "?";
      const max = typeof tier.max_qty === "number" ? String(tier.max_qty) : null;
      return { label: max === null ? min + "+" : min + "–" + max, ...money(tier.unit_price, currency) };
    });
    if (provider === "PDEAL") {
      [row.tier1_price, row.tier2_price, row.tier3_price].forEach((value, index) => {
        tiers.push({ label: "Tier " + (index + 1), ...money(value, currency) });
      });
    }
    if (provider === "AIDIGITALTOOLS" && Array.isArray(row.variants)) {
      for (const value of row.variants) {
        const variant = record(value);
        const label = typeof variant.name === "string" ? variant.name : "Variant " + String(variant.id ?? "");
        tiers.push({ label, ...money(variant.your_price, currency) });
      }
    }
    if (provider === "TRIALSPACEHUB" && Array.isArray(row.variants)) {
      for (const value of row.variants) {
        const variant = record(value);
        const label = typeof variant.name === "string" ? variant.name : String(variant.variant_id ?? "Variant");
        for (const [code, price] of [["MYR", variant.price_myr], ["USDT", variant.price_usdt]] as const) {
          tiers.push({ label: label + " (" + code + ")", ...money(price, code) });
        }
      }
    }
    const powellName = [row.product_name, row.plan_name].filter(value => typeof value === "string").join(" · ");
    return {
      id: String(id),
      name: typeof row.name === "string" ? row.name : typeof row.title === "string" ? row.title : powellName || "Unnamed product",
      description: typeof row.description === "string" ? row.description : null,
      availability,
      tiers: tiers.filter(tier => tier.original !== null),
      ...money(amount, currency),
    };
  });
}
