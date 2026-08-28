export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://aihaat.shop"
).replace(/\/$/, "");

/**
 * Safely serialize data into JSON-LD script payload.
 * Escapes `<` and `>` to prevent `</script>` breakout and XSS vulnerabilities.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Generates an absolute, clean canonical URL.
 */
export function getCanonicalUrl(pathname: string = ""): string {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  // Strip any query parameters or trailing slashes (except root)
  const urlWithoutQuery = cleanPath.split("?")[0].split("#")[0];
  if (urlWithoutQuery === "/" || urlWithoutQuery === "") {
    return SITE_URL;
  }
  return `${SITE_URL}${urlWithoutQuery.replace(/\/$/, "")}`;
}

/**
 * Factual Schema.org Organization for AI Haat
 */
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AI Haat",
  alternateName: "এআই হাট",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  description:
    "AI Haat is Bangladesh's premier digital goods and software subscription marketplace offering instant delivery and full warranty.",
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+8801712345678",
      contactType: "customer service",
      availableLanguage: ["Bengali", "English"],
      areaServed: "BD",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  sameAs: [
    "https://facebook.com/aihaat",
    "https://wa.me/8801712345678",
  ],
};

/**
 * Factual Schema.org WebSite for AI Haat
 */
export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AI Haat",
  alternateName: "AI Haat Bangladesh",
  url: SITE_URL,
  inLanguage: ["bn-BD", "en-US"],
  description:
    "Buy genuine AI subscriptions, software licenses, VPNs, and digital accounts with instant delivery in Bangladesh via bKash, Nagad & Rocket in BDT.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};
