import { IG_GRAPH_API_BASE } from "@/server/lib/meta/api";
import type { IGMedia, IGMediaPage } from "./types";

const MEDIA_FIELDS = "id,caption,media_url,media_type,timestamp,permalink,thumbnail_url";
const PAGE_SIZE = 50; // IG API default хамгийн их 100

/**
 * Instagram хэрэглэгчийн post-уудыг Graph API-аар татах.
 * Cursor-based pagination ашиглан maxPosts хүртэл татна.
 *
 * @returns Бүх media objects (maxPosts хязгаартай)
 */
export async function fetchInstagramMedia(accessToken: string, maxPosts = 500): Promise<IGMedia[]> {
  const allMedia: IGMedia[] = [];
  let nextUrl: string | null =
    `${IG_GRAPH_API_BASE}/me/media?fields=${MEDIA_FIELDS}&limit=${PAGE_SIZE}&access_token=${accessToken}`;

  while (nextUrl && allMedia.length < maxPosts) {
    const page = await fetchMediaPage(nextUrl);
    if (!page.data || page.data.length === 0) break;

    allMedia.push(...page.data);
    nextUrl = page.paging?.next ?? null;
  }

  return allMedia.slice(0, maxPosts);
}

/**
 * Discover step-д batch-аар fetch хийх (timeout-аас зайлсхийхийн тулд).
 * Нэг удаа дуудахад maxPerStep хүртэл татаж, дараагийн cursor буцаана.
 *
 * @returns { media, nextCursor } — nextCursor null бол бүгдийг татсан
 */
export async function fetchInstagramMediaBatch(
  accessToken: string,
  cursor: string | null,
  maxPerStep = 100,
): Promise<{ media: IGMedia[]; nextCursor: string | null }> {
  const media: IGMedia[] = [];
  let nextUrl: string | null = cursor
    ? `${IG_GRAPH_API_BASE}/me/media?fields=${MEDIA_FIELDS}&limit=${PAGE_SIZE}&after=${cursor}&access_token=${accessToken}`
    : `${IG_GRAPH_API_BASE}/me/media?fields=${MEDIA_FIELDS}&limit=${PAGE_SIZE}&access_token=${accessToken}`;

  while (nextUrl && media.length < maxPerStep) {
    const page = await fetchMediaPage(nextUrl);
    if (!page.data || page.data.length === 0) {
      return { media, nextCursor: null };
    }

    media.push(...page.data);

    const afterCursor = page.paging?.cursors?.after ?? null;
    nextUrl = page.paging?.next ?? null;

    if (media.length >= maxPerStep) {
      return { media: media.slice(0, maxPerStep), nextCursor: afterCursor };
    }
  }

  return { media, nextCursor: null };
}

/** Нэг page fetch хийх (error handling-тай) */
async function fetchMediaPage(url: string): Promise<IGMediaPage> {
  // Log URL without access_token for debugging
  const safeUrl = url.replace(/access_token=[^&]+/, "access_token=***");
  console.log(`[IG Media] Fetching: ${safeUrl}`);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[IG Media] API error: ${response.status}`, errorText);

    // Token expired эсвэл invalid (Meta returns 400/401 with error.code 190)
    if (response.status === 400 || response.status === 401) {
      throw new Error("Instagram token хугацаа дууссан. Дахин холбоно уу.");
    }

    // Rate limit
    if (response.status === 429) {
      throw new Error("Instagram API rate limit. Түр хүлээнэ үү.");
    }

    throw new Error(`Instagram API error: ${response.status}`);
  }

  const data = (await response.json()) as IGMediaPage;
  console.log(`[IG Media] Got ${data.data?.length ?? 0} items, has next: ${!!data.paging?.next}`);
  return data;
}

/**
 * Media object-оос бүтээгдэхүүний зураг URL авах.
 * IMAGE → media_url, VIDEO → thumbnail_url, CAROUSEL → media_url
 */
export function getProductImageUrl(media: IGMedia): string | undefined {
  if (media.media_type === "VIDEO") {
    return media.thumbnail_url ?? media.media_url;
  }
  return media.media_url;
}
