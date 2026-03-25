import * as cheerio from "cheerio";

const DEFAULT_PRODUCT_PATTERNS = [
  "/product",
  "/products/",
  "/p/",
  "/shop/",
  "/item/",
  "/бүтээгдэхүүн",
  "/бараа",
  "/catalog/",
];

const MAX_URLS = 500;
const FETCH_TIMEOUT = 10_000;

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "metadata.google.internal",
]);

/**
 * Validate URL to prevent SSRF attacks.
 * Blocks private IPs, loopback, link-local, and cloud metadata endpoints.
 */
function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(hostname)) return false;
    // Block private/internal IP ranges
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url: string): Promise<string | null> {
  if (!isSafeUrl(url)) return null;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      redirect: "follow",
      headers: { "User-Agent": "VelaAI-Crawler/1.0 (+https://vela.mn)" },
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

function getSitemapUrlFromRobots(robotsTxt: string): string | null {
  for (const line of robotsTxt.split("\n")) {
    const match = line.match(/^Sitemap:\s*(.+)/i);
    if (match) return match[1].trim();
  }
  return null;
}

function extractUrlsFromSitemap(xml: string): string[] {
  const $ = cheerio.load(xml, { xml: true });
  const urls: string[] = [];

  // Sitemap index → child sitemaps
  const sitemapLocs = $("sitemapindex sitemap loc");
  if (sitemapLocs.length > 0) {
    sitemapLocs.each((_, el) => {
      const loc = $(el).text().trim();
      if (loc) urls.push(loc);
    });
    return urls;
  }

  // Regular sitemap → URLs
  $("urlset url loc").each((_, el) => {
    const loc = $(el).text().trim();
    if (loc) urls.push(loc);
  });

  return urls;
}

function isProductUrl(url: string, patterns: string[]): boolean {
  const path = new URL(url).pathname.toLowerCase();
  return patterns.some((p) => path.includes(p.toLowerCase()));
}

/**
 * Discover product URLs from a website's sitemap.
 * Strategy: robots.txt → sitemap.xml → filter product URLs
 */
export async function discoverProductUrls(
  baseUrl: string,
  customPatterns?: string[],
): Promise<string[]> {
  const origin = new URL(baseUrl).origin;
  const patterns = customPatterns?.length ? customPatterns : DEFAULT_PRODUCT_PATTERNS;
  const allUrls: string[] = [];

  // Step 1: Try robots.txt for sitemap location
  let sitemapUrl: string | null = null;
  const robotsTxt = await fetchText(`${origin}/robots.txt`);
  if (robotsTxt) {
    sitemapUrl = getSitemapUrlFromRobots(robotsTxt);
  }

  // Step 2: Fetch sitemap (fallback to /sitemap.xml)
  const sitemapUrls = sitemapUrl
    ? [sitemapUrl]
    : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];

  for (const url of sitemapUrls) {
    const xml = await fetchText(url);
    if (!xml) continue;

    const extracted = extractUrlsFromSitemap(xml);

    // Check if these are child sitemaps (sitemap index)
    const childSitemaps = extracted.filter((u) => u.endsWith(".xml") || u.includes("sitemap"));
    if (childSitemaps.length > 0 && childSitemaps.length === extracted.length) {
      // This is a sitemap index — fetch each child
      for (const childUrl of childSitemaps.slice(0, 10)) {
        const childXml = await fetchText(childUrl);
        if (childXml) {
          allUrls.push(...extractUrlsFromSitemap(childXml));
        }
        if (allUrls.length >= MAX_URLS) break;
      }
    } else {
      allUrls.push(...extracted);
    }

    if (allUrls.length > 0) break; // Found URLs, stop trying
  }

  // Step 3: Filter for product URLs
  const productUrls = allUrls.filter((u) => isProductUrl(u, patterns));

  // If no product-specific URLs found, return all URLs (user's site may not follow patterns)
  const result = productUrls.length > 0 ? productUrls : allUrls;
  return [...new Set(result)].slice(0, MAX_URLS);
}
