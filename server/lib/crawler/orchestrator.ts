import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/server/db/db";
import { crawlJobs, products, productImages } from "@/server/db/schema";
import { buildEmbeddingText } from "@/features/products/lib/embedding";
import { generateEmbeddings } from "@/server/ai/voyage";
import { discoverProductUrls } from "./sitemap-parser";
import { extractProduct } from "./extract";
import type { CrawlStepResult, CrawlConfig, ExtractedProduct } from "./types";

const EXTRACT_BATCH_SIZE = 10;
const EMBED_BATCH_SIZE = 50;

/**
 * Process one step of a crawl job (state machine).
 * Each call advances the job by one chunk of work.
 */
export async function processCrawlStep(jobId: string, tenantId: string): Promise<CrawlStepResult> {
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
        return await stepDiscover(job);
      case "discovering":
        // Discovery is done in one step, this shouldn't happen
        return await stepDiscover(job);
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

// ─── Step 1: Discover product URLs ─────────────────────────────
async function stepDiscover(job: typeof crawlJobs.$inferSelect): Promise<CrawlStepResult> {
  const config = (job.config as CrawlConfig) ?? {};

  await db
    .update(crawlJobs)
    .set({ status: "discovering", startedAt: new Date(), updatedAt: new Date() })
    .where(eq(crawlJobs.id, job.id));

  const urls = await discoverProductUrls(job.websiteUrl, config.productPathPatterns);

  if (urls.length === 0) {
    await db
      .update(crawlJobs)
      .set({
        status: "failed",
        error: "Бараа хуудсын URL олдсонгүй. Sitemap.xml байхгүй эсвэл бараа хуудас олдсонгүй.",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(crawlJobs.id, job.id));
    return { done: true, nextStepNeeded: false, status: "failed", message: "URL олдсонгүй" };
  }

  // Apply maxPages limit
  const maxPages = config.maxPages ?? 200;
  const limitedUrls = urls.slice(0, maxPages);

  await db
    .update(crawlJobs)
    .set({
      status: "extracting",
      discoveredUrls: limitedUrls,
      totalFound: limitedUrls.length,
      cursor: 0,
      updatedAt: new Date(),
    })
    .where(eq(crawlJobs.id, job.id));

  return {
    done: false,
    nextStepNeeded: true,
    status: "extracting",
    message: `${limitedUrls.length} URL олдлоо`,
  };
}

// ─── Step 2: Extract products from batch of URLs ───────────────
async function stepExtract(
  job: typeof crawlJobs.$inferSelect,
  tenantId: string,
): Promise<CrawlStepResult> {
  const urls = (job.discoveredUrls as string[]) ?? [];
  const cursor = job.cursor;

  if (cursor >= urls.length) {
    // All URLs processed, move to embedding
    await db
      .update(crawlJobs)
      .set({ status: "embedding", updatedAt: new Date() })
      .where(eq(crawlJobs.id, job.id));
    return { done: false, nextStepNeeded: true, status: "embedding" };
  }

  const batch = urls.slice(cursor, cursor + EXTRACT_BATCH_SIZE);
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  // Add small delay between requests to be polite
  for (const url of batch) {
    const extracted = await extractProduct(url);
    if (!extracted || !extracted.name) {
      skipped++;
      continue;
    }

    const result = await upsertProduct(tenantId, extracted, job.id);
    if (result === "created") imported++;
    else if (result === "updated") updated++;
    else skipped++;

    // 500ms delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  await db
    .update(crawlJobs)
    .set({
      cursor: cursor + batch.length,
      totalImported: job.totalImported + imported,
      totalUpdated: job.totalUpdated + updated,
      totalSkipped: job.totalSkipped + skipped,
      updatedAt: new Date(),
    })
    .where(eq(crawlJobs.id, job.id));

  const newCursor = cursor + batch.length;
  const allDone = newCursor >= urls.length;

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
    message: `${newCursor}/${urls.length} URL боловсруулсан`,
  };
}

// ─── Step 3: Generate embeddings for products without them ─────
async function stepEmbed(
  job: typeof crawlJobs.$inferSelect,
  tenantId: string,
): Promise<CrawlStepResult> {
  // Find products from this crawl without embeddings
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
    // All embedded, mark complete
    await db
      .update(crawlJobs)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(crawlJobs.id, job.id));
    return { done: true, nextStepNeeded: false, status: "completed", message: "Импорт дууслаа" };
  }

  // Build embedding texts
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

    // Update each product with its embedding
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
    // Embedding failed — mark complete to avoid infinite loop (graceful degradation)
    console.error("Embedding generation failed, completing without embeddings:", err);
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

  // Check if more products need embedding
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

// ─── Product upsert ────────────────────────────────────────────
async function upsertProduct(
  tenantId: string,
  extracted: ExtractedProduct,
  crawlJobId: string,
): Promise<"created" | "updated" | "skipped"> {
  const externalId = extracted.sourceUrl;
  const now = new Date();

  // Check for existing product by externalId
  const [existing] = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      deletedAt: products.deletedAt,
    })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.externalId, externalId)))
    .limit(1);

  const metadata = {
    source: "crawl" as const,
    crawlJobId,
    lastCrawledAt: now.toISOString(),
  };

  if (existing) {
    // Update existing product
    await db
      .update(products)
      .set({
        name: extracted.name,
        description: extracted.description ?? undefined,
        price: extracted.price ?? existing.price,
        category: extracted.category ?? undefined,
        brand: extracted.brand ?? undefined,
        metadata,
        embedding: null, // Clear to re-generate
        embeddingText: null,
        deletedAt: null, // Restore if soft-deleted
        updatedAt: now,
      })
      .where(eq(products.id, existing.id));

    // Update image if provided
    if (extracted.imageUrl) {
      await upsertProductImage(existing.id, tenantId, extracted.imageUrl);
    }

    return "updated";
  }

  // Insert new product
  const [newProduct] = await db
    .insert(products)
    .values({
      tenantId,
      externalId,
      name: extracted.name,
      description: extracted.description,
      price: extracted.price ?? "0",
      category: extracted.category,
      brand: extracted.brand,
      metadata,
      isAvailable: true,
      stockQty: 0,
    })
    .returning({ id: products.id });

  if (newProduct && extracted.imageUrl) {
    await upsertProductImage(newProduct.id, tenantId, extracted.imageUrl);
  }

  return "created";
}

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
