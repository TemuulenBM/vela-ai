import * as cheerio from "cheerio";
import type { ExtractedProduct } from "./types";

const FETCH_TIMEOUT = 8_000;

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "metadata.google.internal",
]);

function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(hostname)) return false;
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse MNT price strings: "1,500,000₮" → "1500000"
 */
function parsePrice(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return undefined;
  return String(Math.round(num));
}

/**
 * Extract product data from JSON-LD structured data
 */
function extractFromJsonLd($: cheerio.CheerioAPI): Partial<ExtractedProduct> | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const text = $(scripts[i]).html();
      if (!text) continue;

      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : data["@graph"] ? data["@graph"] : [data];

      for (const item of items) {
        if (item["@type"] !== "Product") continue;

        const offers = item.offers;
        const price =
          offers?.price ??
          offers?.lowPrice ??
          (Array.isArray(offers) ? offers[0]?.price : undefined);

        return {
          name: item.name,
          description: item.description,
          price: parsePrice(String(price)),
          category: item.category,
          brand: typeof item.brand === "string" ? item.brand : item.brand?.name,
          imageUrl: Array.isArray(item.image) ? item.image[0] : item.image,
        };
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }
  return null;
}

/**
 * Extract product data from Open Graph meta tags
 */
function extractFromOgTags($: cheerio.CheerioAPI): Partial<ExtractedProduct> | null {
  const ogTitle = $('meta[property="og:title"]').attr("content");
  if (!ogTitle) return null;

  return {
    name: ogTitle,
    description: $('meta[property="og:description"]').attr("content") ?? undefined,
    price:
      parsePrice($('meta[property="product:price:amount"]').attr("content")) ??
      parsePrice($('meta[property="og:price:amount"]').attr("content")),
    imageUrl: $('meta[property="og:image"]').attr("content") ?? undefined,
    brand: $('meta[property="product:brand"]').attr("content") ?? undefined,
  };
}

/**
 * Fallback: extract from HTML meta/title tags
 */
function extractFromHtml($: cheerio.CheerioAPI): Partial<ExtractedProduct> | null {
  const title = $("title").text().trim();
  if (!title) return null;

  const description = $('meta[name="description"]').attr("content") ?? undefined;

  // Try to find price in page content with MNT patterns
  let price: string | undefined;
  const pricePatterns = [
    /(\d{1,3}(?:[,，]\d{3})*(?:\.\d{1,2})?)\s*₮/,
    /₮\s*(\d{1,3}(?:[,，]\d{3})*(?:\.\d{1,2})?)/,
    /(\d{1,3}(?:[,，]\d{3})*(?:\.\d{1,2})?)\s*(?:MNT|төгрөг)/i,
  ];

  const bodyText = $("body").text();
  for (const pattern of pricePatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      price = parsePrice(match[1]);
      if (price) break;
    }
  }

  return { name: title, description, price };
}

/**
 * Extract product data from a single URL.
 * Priority: JSON-LD → Open Graph → HTML fallback
 */
export async function extractProduct(url: string): Promise<ExtractedProduct | null> {
  if (!isSafeUrl(url)) return null;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: { "User-Agent": "VelaAI-Crawler/1.0 (+https://vela.mn)" },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Try extraction in priority order
    const jsonLd = extractFromJsonLd($);
    const og = extractFromOgTags($);
    const htmlMeta = extractFromHtml($);

    // Merge: JSON-LD > OG > HTML (first non-null wins per field)
    const name = jsonLd?.name ?? og?.name ?? htmlMeta?.name;
    if (!name) return null;

    return {
      name,
      description: jsonLd?.description ?? og?.description ?? htmlMeta?.description,
      price: jsonLd?.price ?? og?.price ?? htmlMeta?.price,
      category: jsonLd?.category ?? og?.category,
      brand: jsonLd?.brand ?? og?.brand,
      imageUrl: jsonLd?.imageUrl ?? og?.imageUrl,
      sourceUrl: url,
    };
  } catch {
    return null;
  }
}
