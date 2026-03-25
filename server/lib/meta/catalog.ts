import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/server/db/db";
import { products, productImages } from "@/server/db/schema";
import { buildEmbeddingText } from "@/features/products/lib/embedding";
import { generateEmbeddings } from "@/server/ai/voyage";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";
const PRODUCTS_PER_PAGE = 250;

interface FBCatalogProduct {
  id: string;
  name: string;
  description?: string;
  price?: string;
  currency?: string;
  category?: string;
  image_url?: string;
  url?: string;
  availability?: string;
  brand?: string;
}

interface FBPagingCursors {
  before?: string;
  after?: string;
}

interface FBPagedResponse<T> {
  data: T[];
  paging?: { cursors?: FBPagingCursors; next?: string };
}

/**
 * Page-д холбогдсон FB Commerce Catalog-уудыг авах.
 */
export async function getPageCatalogs(
  pageId: string,
  pageAccessToken: string,
): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(`${GRAPH_API_BASE}/${pageId}/product_catalogs?fields=id,name`, {
    headers: { Authorization: `Bearer ${pageAccessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch page catalogs: ${err}`);
  }

  const data = (await res.json()) as FBPagedResponse<{ id: string; name: string }>;
  return data.data;
}

/**
 * Catalog-ийн бүх бүтээгдэхүүнүүдийг paginated татах.
 */
async function fetchCatalogProducts(
  catalogId: string,
  pageAccessToken: string,
): Promise<FBCatalogProduct[]> {
  const fields = "id,name,description,price,currency,category,image_url,url,availability,brand";
  const allProducts: FBCatalogProduct[] = [];
  let afterCursor: string | undefined;

  do {
    const params = new URLSearchParams({
      fields,
      limit: String(PRODUCTS_PER_PAGE),
    });
    if (afterCursor) params.set("after", afterCursor);

    const res = await fetch(`${GRAPH_API_BASE}/${catalogId}/products?${params.toString()}`, {
      headers: { Authorization: `Bearer ${pageAccessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch catalog products: ${err}`);
    }

    const data = (await res.json()) as FBPagedResponse<FBCatalogProduct>;
    allProducts.push(...data.data);

    afterCursor = data.paging?.cursors?.after;
    // Stop if no next page
    if (!data.paging?.next) break;
  } while (afterCursor);

  return allProducts;
}

/**
 * FB price string-ийг тоон утга руу хөрвүүлэх.
 * "12,000 MNT" → "12000", "25.50 USD" → "25.50"
 */
function parseFBPrice(priceString: string | undefined): string {
  if (!priceString) return "0";
  // Зөвхөн тоо + цэг үлдээх
  const cleaned = priceString.replace(/[^\d.]/g, "");
  return cleaned || "0";
}

/**
 * FB Catalog-аас бүтээгдэхүүнүүдийг sync хийж Vela DB-д upsert + embedding generate.
 */
export async function syncCatalogProducts(params: {
  tenantId: string;
  catalogId: string;
  pageAccessToken: string;
}): Promise<{ created: number; updated: number; total: number }> {
  const { tenantId, catalogId, pageAccessToken } = params;

  // 1. FB Catalog-аас бүх products татах
  const fbProducts = await fetchCatalogProducts(catalogId, pageAccessToken);

  let created = 0;
  let updated = 0;
  const now = new Date();

  // 2. Product бүрт upsert хийх
  for (const fbProduct of fbProducts) {
    const externalId = `fb_${fbProduct.id}`;
    const result = await upsertProduct(tenantId, fbProduct, externalId, catalogId, now);
    if (result === "created") created++;
    else if (result === "updated") updated++;
  }

  // 3. Embedding-гүй бүтээгдэхүүнүүдэд batch embedding generate
  await generateMissingEmbeddings(tenantId);

  return { created, updated, total: fbProducts.length };
}

/** Нэг бүтээгдэхүүн upsert хийх. */
async function upsertProduct(
  tenantId: string,
  fbProduct: FBCatalogProduct,
  externalId: string,
  catalogId: string,
  now: Date,
): Promise<"created" | "updated"> {
  const metadata = {
    source: "fb_catalog" as const,
    catalogId,
    fbProductId: fbProduct.id,
    url: fbProduct.url,
    syncedAt: now.toISOString(),
  };

  const price = parseFBPrice(fbProduct.price);
  const isAvailable = fbProduct.availability === "in stock";

  // Existing product шалгах
  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.externalId, externalId)))
    .limit(1);

  if (existing) {
    // Update
    await db
      .update(products)
      .set({
        name: fbProduct.name,
        description: fbProduct.description ?? null,
        price,
        category: fbProduct.category ?? null,
        brand: fbProduct.brand ?? null,
        isAvailable,
        metadata,
        embedding: null,
        embeddingText: null,
        deletedAt: null,
        updatedAt: now,
      })
      .where(eq(products.id, existing.id));

    if (fbProduct.image_url) {
      await upsertProductImage(existing.id, tenantId, fbProduct.image_url);
    }
    return "updated";
  }

  // Insert
  const [newProduct] = await db
    .insert(products)
    .values({
      tenantId,
      externalId,
      name: fbProduct.name,
      description: fbProduct.description,
      price,
      category: fbProduct.category,
      brand: fbProduct.brand,
      stockQty: 0,
      isAvailable,
      metadata,
    })
    .returning({ id: products.id });

  if (newProduct && fbProduct.image_url) {
    await upsertProductImage(newProduct.id, tenantId, fbProduct.image_url);
  }
  return "created";
}

/** Product image upsert (existing байвал update, үгүй бол insert). */
async function upsertProductImage(productId: string, tenantId: string, imageUrl: string) {
  const [existing] = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(and(eq(productImages.productId, productId), eq(productImages.tenantId, tenantId)))
    .limit(1);

  if (existing) {
    await db.update(productImages).set({ url: imageUrl }).where(eq(productImages.id, existing.id));
  } else {
    await db.insert(productImages).values({
      productId,
      tenantId,
      url: imageUrl,
      position: 0,
    });
  }
}

/** Embedding-гүй бүтээгдэхүүнүүдэд batch embedding generate хийх. */
async function generateMissingEmbeddings(tenantId: string) {
  const missing = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      category: products.category,
      brand: products.brand,
      price: products.price,
    })
    .from(products)
    .where(
      and(eq(products.tenantId, tenantId), isNull(products.embedding), isNull(products.deletedAt)),
    )
    .limit(500);

  if (missing.length === 0) return;

  const texts = missing.map((p) => buildEmbeddingText(p));

  try {
    const embeddings = await generateEmbeddings(texts);

    for (let i = 0; i < missing.length; i++) {
      await db
        .update(products)
        .set({
          embedding: embeddings[i],
          embeddingText: texts[i],
        })
        .where(eq(products.id, missing[i].id));
    }
  } catch (err) {
    console.error("[Catalog Sync] Embedding generation failed:", err);
    // Embedding fail байсан ч sync амжилттай гэж тооцно
  }
}
