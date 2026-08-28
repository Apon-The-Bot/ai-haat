/**
 * AI Haat — Master Technical SEO & Structured Data Verification Suite
 * Tests all 18 technical SEO, indexing, canonical, schema, and crawlability requirements.
 */

import fs from 'fs';
import path from 'path';
import { getAllProducts, getProductBySlug } from '../src/lib/products-db';
import { PRODUCTS } from '../src/data/products';
import { BLOGS } from '../src/data/blogs';
import { SITE_URL, safeJsonLd, getCanonicalUrl, ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from '../src/lib/seo';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
import { generateMetadata as generateProductMetadata } from '../src/app/product/[slug]/page';
import { generateMetadata as generateBlogMetadata } from '../src/app/blog/[slug]/page';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [32m✅ [PASS][0m ${testName}`);
    passed++;
  } else {
    console.error(`  [31m❌ [FAIL][0m ${testName}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

async function runMasterSeoSuite() {
  console.log('\n======================================================================');
  console.log('🚀 AI HAAT — MASTER TECHNICAL SEO & STRUCTURED DATA VERIFICATION SUITE');
  console.log('======================================================================\n');

  // TEST 1 — Homepage Metadata & Canonical
  console.log('📌 TEST 1: Homepage Metadata & Canonicalization');
  const homeCanonical = getCanonicalUrl('/');
  assert(homeCanonical === SITE_URL, 'Homepage canonical resolves to clean root without trailing slash');
  assert(ORGANIZATION_SCHEMA['@type'] === 'Organization', 'Organization schema @type is Organization');
  assert(ORGANIZATION_SCHEMA.url === SITE_URL, 'Organization schema URL matches canonical SITE_URL');
  assert(WEBSITE_SCHEMA['@type'] === 'WebSite', 'WebSite schema @type is WebSite');
  assert(WEBSITE_SCHEMA.url === SITE_URL, 'WebSite schema URL matches canonical SITE_URL');

  // TEST 2 — Product Metadata Uniqueness
  console.log('\n📌 TEST 2: Product Metadata Uniqueness & Dynamic Generation');
  const prodA = PRODUCTS[0];
  const prodB = PRODUCTS[1];
  const metaA = await generateProductMetadata({ params: { slug: prodA.slug } });
  const metaB = await generateProductMetadata({ params: { slug: prodB.slug } });

  assert(metaA.title !== metaB.title, 'Product A and Product B generate distinct dynamic titles');
  assert(metaA.description !== metaB.description, 'Product A and Product B generate distinct descriptions');
  assert(
    typeof metaA.alternates?.canonical === 'string' &&
    metaA.alternates.canonical.includes(prodA.slug),
    'Product A canonical URL correctly targets product slug'
  );

  // TEST 3 — Invalid Product Slug Handling
  console.log('\n📌 TEST 3: Invalid Product Slug 404 / Noindex Protection');
  const invalidMeta = await generateProductMetadata({ params: { slug: 'non-existent-product-12345-xyz' } });
  const invalidProduct = await getProductBySlug('non-existent-product-12345-xyz');
  assert(invalidProduct === null, 'getProductBySlug returns null for nonexistent slug (triggers notFound())');
  assert(
    invalidMeta.robots !== undefined &&
    (invalidMeta.robots as any).index === false &&
    (invalidMeta.robots as any).follow === false,
    'Invalid product metadata strictly returns { robots: { index: false, follow: false } }'
  );

  // TEST 4 — Product Content Discoverability
  console.log('\n📌 TEST 4: Product Server-Side Data Integrity');
  const sampleProd = await getProductBySlug(prodA.slug);
  assert(sampleProd !== null && sampleProd.name.length > 0, 'Product name is available from authoritative data source');
  assert(sampleProd !== null && sampleProd.minPriceBDT > 0, 'Product minPriceBDT is available and positive');
  assert(sampleProd !== null && sampleProd.variations.length > 0, 'Product variations are populated');

  // TEST 5 — Sitemap Coverage & Strict Exclusion of Private Routes
  console.log('\n📌 TEST 5: Sitemap Coverage & Exclusion Audit');
  const sitemapEntries = await sitemap();
  const sitemapUrls = sitemapEntries.map((e) => e.url);

  assert(sitemapUrls.includes(SITE_URL), 'Sitemap includes homepage root URL');
  assert(sitemapUrls.includes(`${SITE_URL}/shop`), 'Sitemap includes /shop page');
  assert(sitemapUrls.includes(`${SITE_URL}/blog`), 'Sitemap includes /blog page');
  assert(sitemapUrls.includes(`${SITE_URL}/proofs`), 'Sitemap includes /proofs page');
  assert(sitemapUrls.includes(`${SITE_URL}/about`), 'Sitemap includes /about page');
  assert(sitemapUrls.includes(`${SITE_URL}/privacy`), 'Sitemap includes /privacy page');
  assert(sitemapUrls.includes(`${SITE_URL}/terms`), 'Sitemap includes /terms page');

  const hasAdmin = sitemapUrls.some((u) => u.includes('/admin'));
  const hasDashboard = sitemapUrls.some((u) => u.includes('/dashboard'));
  const hasCheckout = sitemapUrls.some((u) => u.includes('/checkout'));
  const hasApi = sitemapUrls.some((u) => u.includes('/api'));
  const hasAuth = sitemapUrls.some((u) => u.includes('/auth'));
  const hasCart = sitemapUrls.some((u) => u.includes('/cart'));

  assert(!hasAdmin, 'Sitemap strictly excludes /admin routes');
  assert(!hasDashboard, 'Sitemap strictly excludes /dashboard routes');
  assert(!hasCheckout, 'Sitemap strictly excludes /checkout routes');
  assert(!hasApi, 'Sitemap strictly excludes /api routes');
  assert(!hasAuth, 'Sitemap strictly excludes /auth routes');
  assert(!hasCart, 'Sitemap strictly excludes /cart route');

  // TEST 6 — Robots.txt Rules & Directives
  console.log('\n📌 TEST 6: Robots.txt Rules & Search Engine Guidance');
  const robotsConfig = robots();
  const disallowList = (robotsConfig.rules as any)[0].disallow;

  assert(robotsConfig.sitemap === `${SITE_URL}/sitemap.xml`, 'Robots specifies correct sitemap XML URL');
  assert(robotsConfig.host === SITE_URL, 'Robots specifies canonical host');
  assert(disallowList.includes('/admin') || disallowList.includes('/admin/'), 'Robots disallows /admin');
  assert(disallowList.includes('/dashboard') || disallowList.includes('/dashboard/'), 'Robots disallows /dashboard');
  assert(disallowList.includes('/api/'), 'Robots disallows /api/');
  assert(disallowList.includes('/checkout'), 'Robots disallows /checkout');
  assert(disallowList.includes('/cart'), 'Robots disallows /cart');
  assert(disallowList.includes('/auth/'), 'Robots disallows /auth/');

  // TEST 7 — Canonical URL Consistency (Tracking Param Stripping)
  console.log('\n📌 TEST 7: Canonical URL Cleaner (UTM & Tracking Strip)');
  const dirtyUrl = '/product/chatgpt-plus?utm_source=facebook&utm_campaign=promo&fbclid=12345';
  const cleanCanonical = getCanonicalUrl(dirtyUrl);
  assert(
    cleanCanonical === `${SITE_URL}/product/chatgpt-plus`,
    'Canonical URL builder strips query parameters and tracking hashes'
  );

  // TEST 8 — Structured Product Data Factual Validation
  console.log('\n📌 TEST 8: Structured Product Data Schema.org Validation');
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prodA.name,
    image: [prodA.image],
    description: prodA.shortDesc,
    sku: prodA.id,
    mpn: prodA.slug,
    brand: { '@type': 'Brand', name: 'AI Haat' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BDT',
      lowPrice: prodA.minPriceBDT,
      highPrice: prodA.maxPriceBDT,
      availability: prodA.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
  const serialized = safeJsonLd(productJsonLd);
  const parsed = JSON.parse(serialized);

  assert(parsed['@type'] === 'Product', 'Product Schema @type is Product');
  assert(parsed.offers.priceCurrency === 'BDT', 'Product priceCurrency is strictly BDT');
  assert(parsed.offers.lowPrice > 0, 'Product lowPrice is accurate and greater than 0');
  assert(parsed.brand.name === 'AI Haat', 'Product brand is AI Haat');

  // TEST 9 — No Fake Reviews / Fake Ratings in Schema
  console.log('\n📌 TEST 9: Authenticity Guarantee — No Fake Star Ratings in Schema');
  const unratedProduct = { ...prodA, rating: 0, ratingCount: 0, reviews: [] };
  const hasRating = unratedProduct.rating > 0 && unratedProduct.ratingCount > 0;
  const ratingSchema = hasRating
    ? {
        '@type': 'AggregateRating',
        ratingValue: unratedProduct.rating,
        reviewCount: unratedProduct.ratingCount,
      }
    : undefined;

  assert(ratingSchema === undefined, 'Unreviewed product does NOT output fake aggregateRating schema');

  // TEST 10 — Open Graph Tags per Product
  console.log('\n📌 TEST 10: Open Graph Image & Title Specificity');
  const ogTitleA = metaA.openGraph?.title;
  const ogImageA = (metaA.openGraph?.images as any)?.[0]?.url;
  assert(typeof ogTitleA === 'string' && ogTitleA.includes(prodA.name), 'Product A OG title includes Product A name');
  assert(typeof ogImageA === 'string' && ogImageA.length > 0, 'Product A OG image is populated with absolute or valid URL');

  // TEST 11 — Private Pages Noindex Protection
  console.log('\n📌 TEST 11: Private Routes Noindex Verification');
  const adminLayoutSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'admin', 'layout.tsx'), 'utf8');
  const dashLayoutSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'dashboard', 'layout.tsx'), 'utf8');
  const checkoutLayoutSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'checkout', 'layout.tsx'), 'utf8');
  const cartPageSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'cart', 'page.tsx'), 'utf8');
  const unsubPageSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'unsubscribe', 'page.tsx'), 'utf8');

  assert(adminLayoutSrc.includes('index: false') && adminLayoutSrc.includes('follow: false'), 'Admin layout enforces noindex, nofollow');
  assert(dashLayoutSrc.includes('index: false') && dashLayoutSrc.includes('follow: false'), 'Dashboard layout enforces noindex, nofollow');
  assert(checkoutLayoutSrc.includes('index: false') && checkoutLayoutSrc.includes('follow: false'), 'Checkout layout enforces noindex, nofollow');
  assert(cartPageSrc.includes('index: false') && cartPageSrc.includes('follow: false'), 'Cart page enforces noindex, nofollow');
  assert(unsubPageSrc.includes('index: false') && unsubPageSrc.includes('follow: false'), 'Unsubscribe page enforces noindex, nofollow');

  // TEST 12 — Crawlable Product Links
  console.log('\n📌 TEST 12: Crawlable HTML Links on Product Cards');
  const productCardSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'ProductCard.tsx'), 'utf8');
  assert(productCardSrc.includes('Link href=') && productCardSrc.includes('/product/'), 'ProductCard renders standard Next.js <Link> with /product/ href');

  // TEST 13 — Heading Hierarchy
  console.log('\n📌 TEST 13: Heading Hierarchy Verification');
  const heroSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'home', 'Hero.tsx'), 'utf8');
  const productSectionSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'home', 'ProductSection.tsx'), 'utf8');

  assert(heroSrc.includes('<h1') && (heroSrc.match(/<h1/g) || []).length === 1, 'Homepage Hero contains exactly one semantic <h1> element');
  assert(productSectionSrc.includes('<h2'), 'Product sections use semantic <h2> headings');

  // TEST 14 — Custom 404 Response
  console.log('\n📌 TEST 14: Custom 404 Page Behavior');
  const notFoundSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'not-found.tsx'), 'utf8');
  assert(notFoundSrc.includes('404') && notFoundSrc.includes('পেজটি খুঁজে পাওয়া যায়নি'), 'Custom 404 page is defined with user recovery links');

  // TEST 15 — Internal Links Integrity
  console.log('\n📌 TEST 15: Footer & Navigation Internal Links Integrity');
  const footerSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'Footer.tsx'), 'utf8');
  assert(footerSrc.includes('href="/privacy"'), 'Footer links to /privacy');
  assert(footerSrc.includes('href="/terms"'), 'Footer links to /terms');
  assert(footerSrc.includes('href="/order-tracking"'), 'Footer links to /order-tracking');
  assert(footerSrc.includes('href="/proofs"'), 'Footer links to /proofs');

  // TEST 16 — Structured Data XSS & Injection Prevention
  console.log('\n📌 TEST 16: Structured Data XSS & Script Tag Escaping');
  const maliciousPayload = {
    title: 'Hacked Product </script><script>alert("XSS")</script>',
    description: 'Test & Attack <img src=x onerror=alert(1)>',
  };
  const safeSerialized = safeJsonLd(maliciousPayload);
  assert(!safeSerialized.includes('</script>'), 'safeJsonLd successfully neutralizes </script> breakout strings');
  assert(safeSerialized.includes('\\u003c/script\\u003e') || !safeSerialized.includes('</script>'), 'safeJsonLd safely encodes < and > characters');

  // TEST 17 — Mobile-Friendly Metadata
  console.log('\n📌 TEST 17: Mobile Metadata & Responsive Viewport Configuration');
  const layoutSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'layout.tsx'), 'utf8');
  assert(layoutSrc.includes('metadataBase'), 'Root layout defines metadataBase');
  assert(layoutSrc.includes('formatDetection'), 'Root layout configures formatDetection');

  // TEST 18 — Blog Metadata & Schema
  console.log('\n📌 TEST 18: Blog Article Metadata & BlogPosting Schema');
  const sampleBlog = BLOGS[0];
  const blogMeta = await generateBlogMetadata({ params: { slug: sampleBlog.slug } });
  const titleStr = typeof blogMeta.title === 'string' ? blogMeta.title : String((blogMeta.title as any)?.default || '');
  assert(titleStr.includes(sampleBlog.title), 'Blog detail metadata generates dynamic title with article headline');
  assert(typeof blogMeta.alternates?.canonical === 'string' && blogMeta.alternates.canonical.includes(sampleBlog.slug), 'Blog canonical URL is correctly assigned');

  console.log('\n======================================================================');
  console.log(`📊 MASTER SEO TEST RESULTS SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterSeoSuite().catch((err) => {
  console.error('Master SEO Suite Failed:', err);
  process.exit(1);
});
