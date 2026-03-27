import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/server/db/db";
import { crawlJobs, products, productImages, channelConnections } from "@/server/db/schema";
import { buildEmbeddingText } from "@/features/products/lib/embedding";
import { generateEmbeddings } from "@/server/ai/voyage";
import { decryptToken } from "@/server/lib/meta/crypto";
import { fetchInstagramMediaBatch, getProductImageUrl } from "./media-fetcher";
import { parseInstagramCaption } from "./caption-parser";
import type { IGMedia, IGSyncConfig, IGSyncStepResult } from "./types";

const EXTRACT_BATCH_SIZE = 10;
const EMBED_BATCH_SIZE = 50;

/**
 * IG sync job-ийн state machine-ийг нэг step урагшлуулна.
 * Frontend 3 секунд тутам дуудна.
 *
 * States: pending → discovering → extracting → embedding → completed
 */
export async function processIGSyncStep(
  jobId: string,
  tenantId: string,
): Promise<IGSyncStepResult> {
  const [job] = await db
    .select()
    .from(crawlJobs)
    .where(and(eq(crawlJobs.id, jobId), eq(crawlJobs.tenantId, tenantId)))
    .limit(1);

  if (!job) {
    return { done: true, nextStepNeeded: false, status: "failed", message: "Job олдсонгүй" };
  }

  if (job.status === "completed" || job.status === "failed") {
    return { done: true, nextStepNeeded: false, status: job.status };
  }

  try {
    switch (job.status) {
      case "pending":
      case "discovering":
        return await stepDiscover(job, tenantId);
      case "extracting":
        return await stepExtract(job, tenantId);
      case "embedding":
        return await stepEmbed(job, tenantId);
      default:
        return { done: true, nextStepNeeded: false, status: job.status };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db
      .update(crawlJobs)
      .set({ status: "failed", error: message, updatedAt: new Date() })
      .where(eq(crawlJobs.id, jobId));
    return { done: true, nextStepNeeded: false, status: "failed", message };
  }
}

// ─── Step 1: Discover — IG posts fetch (batch per step) ──────────

async function stepDiscover(
  job: typeof crawlJobs.$inferSelect,
  tenantId: string,
): Promise<IGSyncStepResult> {
  const config = (job.config as IGSyncConfig) ?? {};

  // Анхны step бол discovering руу шилжих
  if (job.status === "pending") {
    await db
      .update(crawlJobs)
      .set({ status: "discovering", startedAt: new Date(), updatedAt: new Date() })
      .where(eq(crawlJobs.id, job.id));
  }

  // Access token авах
  console.log(
    `[IG Sync] Discover step — connectionId: ${config.connectionId}, tenantId: ${tenantId}`,
  );
  const accessToken = await getAccessToken(config.connectionId, tenantId);
  console.log(
    `[IG Sync] Access token: ${accessToken ? `found (${accessToken.length} chars)` : "NOT FOUND"}`,
  );
  if (!accessToken) {
    await db
      .update(crawlJobs)
      .set({
        status: "failed",
        error: "Instagram token олдсонгүй эсвэл хугацаа дууссан",
        updatedAt: new Date(),
      })
      .where(eq(crawlJobs.id, job.id));
    return { done: true, nextStepNeeded: false, status: "failed", message: "Token олдсонгүй" };
  }

  // Batch fetch (100 post per step, timeout-аас зайлсхийх)
  const existingMedia = (job.discoveredUrls as IGMedia[]) ?? [];
  const cursor = config.paginationCursor ?? null;
  const maxPosts = config.maxPosts ?? 500;

  console.log(
    `[IG Sync] Fetching batch — cursor: ${cursor ?? "null"}, existingMedia: ${existingMedia.length}`,
  );
  const { media, nextCursor } = await fetchInstagramMediaBatch(accessToken, cursor, 100);
  console.log(
    `[IG Sync] Batch result — got ${media.length} media, nextCursor: ${nextCursor ?? "null"}`,
  );
  const allMedia = [...existingMedia, ...media];

  if (nextCursor && allMedia.length < maxPosts) {
    // Дахин fetch хэрэгтэй — cursor хадгалж дараагийн step-д үргэлжлүүлнэ
    await db
      .update(crawlJobs)
      .set({
        discoveredUrls: allMedia,
        totalFound: allMedia.length,
        config: { ...config, paginationCursor: nextCursor },
        updatedAt: new Date(),
      })
      .where(eq(crawlJobs.id, job.id));

    return {
      done: false,
      nextStepNeeded: true,
      status: "discovering",
      message: `${allMedia.length} пост олдлоо, үргэлжлүүлж байна...`,
    };
  }

  // Бүх post-ууд татагдлаа — extracting руу шилжих
  const limitedMedia = allMedia.slice(0, maxPosts);

  if (limitedMedia.length === 0) {
    console.log(`[IG Sync] No media found — marking completed`);
    await db
      .update(crawlJobs)
      .set({
        status: "completed",
        totalFound: 0,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(crawlJobs.id, job.id));
    return {
      done: true,
      nextStepNeeded: false,
      status: "completed",
      message: "Instagram пост олдсонгүй",
    };
  }

  await db
    .update(crawlJobs)
    .set({
      status: "extracting",
      discoveredUrls: limitedMedia,
      totalFound: limitedMedia.length,
      cursor: 0,
      config: { ...config, paginationCursor: undefined },
      updatedAt: new Date(),
    })
    .where(eq(crawlJobs.id, job.id));

  return {
    done: false,
    nextStepNeeded: true,
    status: "extracting",
    message: `${limitedMedia.length} пост олдлоо, задалж байна...`,
  };
}

// ─── Step 2: Extract — Caption parse + product upsert ────────────

async function stepExtract(
  job: typeof crawlJobs.$inferSelect,
  tenantId: string,
): Promise<IGSyncStepResult> {
  const mediaList = (job.discoveredUrls as IGMedia[]) ?? [];
  const cursor = job.cursor;

  if (cursor >= mediaList.length) {
    await db
      .update(crawlJobs)
      .set({ status: "embedding", updatedAt: new Date() })
      .where(eq(crawlJobs.id, job.id));
    return { done: false, nextStepNeeded: true, status: "embedding" };
  }

  const batch = mediaList.slice(cursor, cursor + EXTRACT_BATCH_SIZE);
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const media of batch) {
    // Caption байхгүй post skip
    if (!media.caption || media.caption.trim().length === 0) {
      skipped++;
      continue;
    }

    // Claude Haiku-аар caption parse
    const parsed = await parseInstagramCaption(media.caption);

    if (!parsed.isProduct || !parsed.name) {
      skipped++;
      continue;
    }

    // Product upsert
    const result = await upsertIGProduct(tenantId, media, parsed, job.id);
    if (result === "created") imported++;
    else if (result === "updated") updated++;
    else skipped++;
  }

  const newCursor = cursor + batch.length;
  await db
    .update(crawlJobs)
    .set({
      cursor: newCursor,
      totalImported: job.totalImported + imported,
      totalUpdated: job.totalUpdated + updated,
      totalSkipped: job.totalSkipped + skipped,
      updatedAt: new Date(),
    })
    .where(eq(crawlJobs.id, job.id));

  const allDone = newCursor >= mediaList.length;
  if (allDone) {
    await db
      .update(crawlJobs)
      .set({ status: "embedding", updatedAt: new Date() })
      .where(eq(crawlJobs.id, job.id));
  }

  return {
    done: false,
    nextStepNeeded: true,
    status: allDone ? "embedding" : "extracting",
    message: `${newCursor}/${mediaList.length} пост задлав`,
  };
}

// ─── Step 3: Embed — Voyage AI embeddings ────────────────────────

async function stepEmbed(
  job: typeof crawlJobs.$inferSelect,
  tenantId: string,
): Promise<IGSyncStepResult> {
  const productsNeedingEmbed = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      category: products.category,
      brand: products.brand,
    })
    .from(products)
    .where(
      and(eq(products.tenantId, tenantId), isNull(products.embedding), isNull(products.deletedAt)),
    )
    .limit(EMBED_BATCH_SIZE);

  if (productsNeedingEmbed.length === 0) {
    await db
      .update(crawlJobs)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(crawlJobs.id, job.id));
    return { done: true, nextStepNeeded: false, status: "completed", message: "Импорт дууслаа" };
  }

  const texts = productsNeedingEmbed.map((p) =>
    buildEmbeddingText({
      name: p.name,
      description: p.description,
      category: p.category,
      brand: p.brand,
      price: p.price,
    }),
  );

  try {
    const embeddings = await generateEmbeddings(texts);
    for (let i = 0; i < productsNeedingEmbed.length; i++) {
      await db
        .update(products)
        .set({
          embedding: embeddings[i],
          embeddingText: texts[i],
          updatedAt: new Date(),
        })
        .where(eq(products.id, productsNeedingEmbed[i].id));
    }
  } catch (err) {
    console.error("[IG Sync] Embedding generation failed, completing:", err);
    await db
      .update(crawlJobs)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(crawlJobs.id, job.id));
    return {
      done: true,
      nextStepNeeded: false,
      status: "completed",
      message: "Импорт дууслаа (embedding алдаатай)",
    };
  }

  // Дахин шалгах — бүгд embedding авсан уу
  const remaining = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(eq(products.tenantId, tenantId), isNull(products.embedding), isNull(products.deletedAt)),
    )
    .limit(1);

  if (remaining.length === 0) {
    await db
      .update(crawlJobs)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(crawlJobs.id, job.id));
    return { done: true, nextStepNeeded: false, status: "completed", message: "Импорт дууслаа" };
  }

  return {
    done: false,
    nextStepNeeded: true,
    status: "embedding",
    message: "Embedding үүсгэж байна...",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────

/** channelConnections-аас decrypted access token авах */
async function getAccessToken(connectionId: string, tenantId: string): Promise<string | null> {
  const [conn] = await db
    .select({ accessToken: channelConnections.accessToken })
    .from(channelConnections)
    .where(
      and(
        eq(channelConnections.id, connectionId),
        eq(channelConnections.tenantId, tenantId),
        eq(channelConnections.status, "active"),
      ),
    )
    .limit(1);

  if (!conn) return null;

  try {
    return decryptToken(conn.accessToken);
  } catch {
    return null;
  }
}

/** IG media → product upsert (externalId = "ig_{mediaId}") */
async function upsertIGProduct(
  tenantId: string,
  media: IGMedia,
  parsed: {
    name: string | null;
    price: string | null;
    description: string | null;
    category: string | null;
  },
  jobId: string,
): Promise<"created" | "updated" | "skipped"> {
  if (!parsed.name) return "skipped";

  const externalId = `ig_${media.id}`;
  const now = new Date();
  const imageUrl = getProductImageUrl(media);

  const metadata = {
    source: "instagram" as const,
    postId: media.id,
    permalink: media.permalink,
    syncedAt: now.toISOString(),
    jobId,
  };

  // Existing product шалгах
  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.externalId, externalId)))
    .limit(1);

  if (existing) {
    await db
      .update(products)
      .set({
        name: parsed.name,
        description: parsed.description ?? undefined,
        price: parsed.price ?? "0",
        category: parsed.category ?? undefined,
        metadata,
        embedding: null,
        embeddingText: null,
        deletedAt: null,
        updatedAt: now,
      })
      .where(eq(products.id, existing.id));

    if (imageUrl) {
      await upsertProductImage(existing.id, tenantId, imageUrl);
    }
    return "updated";
  }

  // Шинэ product үүсгэх
  const [newProduct] = await db
    .insert(products)
    .values({
      tenantId,
      externalId,
      name: parsed.name,
      description: parsed.description,
      price: parsed.price ?? "0",
      category: parsed.category,
      metadata,
      isAvailable: true,
      stockQty: 0,
    })
    .returning({ id: products.id });

  if (newProduct && imageUrl) {
    await upsertProductImage(newProduct.id, tenantId, imageUrl);
  }

  return "created";
}

/** Product image upsert (crawler-тай ижил pattern) */
async function upsertProductImage(productId: string, tenantId: string, imageUrl: string) {
  const [existing] = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(and(eq(productImages.productId, productId), eq(productImages.tenantId, tenantId)))
    .limit(1);

  if (existing) {
    await db.update(productImages).set({ url: imageUrl }).where(eq(productImages.id, existing.id));
  } else {
    await db.insert(productImages).values({ productId, tenantId, url: imageUrl, position: 0 });
  }
}
