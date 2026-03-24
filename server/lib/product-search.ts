import { and, eq, gte, isNull, lte, sql, desc } from "drizzle-orm";
import { db } from "@/server/db/db";
import { products, productImages } from "@/server/db/schema";
import { generateEmbedding } from "@/server/ai/voyage";

interface SearchParams {
  tenantId: string;
  query: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  brand: string | null;
  stockQty: number;
  isAvailable: boolean;
  similarity: number;
  imageUrl: string | null;
}

/**
 * Vector similarity search for products.
 * Generates embedding for the query, then finds most similar products
 * using pgvector cosine distance with HNSW index.
 */
export async function searchProducts(params: SearchParams): Promise<SearchResult[]> {
  const { tenantId, query, category, brand, minPrice, maxPrice, limit = 5 } = params;

  const queryEmbedding = await generateEmbedding(query);
  const validated = queryEmbedding.map(Number);
  if (validated.some(isNaN)) throw new Error("Invalid embedding vector");
  const embeddingStr = `[${validated.join(",")}]`;

  const conditions = [
    eq(products.tenantId, tenantId),
    eq(products.isAvailable, true),
    isNull(products.deletedAt),
    sql`${products.embedding} IS NOT NULL`,
  ];

  if (category) {
    conditions.push(eq(products.category, category));
  }
  if (brand) {
    conditions.push(eq(products.brand, brand));
  }
  if (minPrice !== undefined) {
    conditions.push(gte(products.price, String(minPrice)));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, String(maxPrice)));
  }

  const results = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      category: products.category,
      brand: products.brand,
      stockQty: products.stockQty,
      isAvailable: products.isAvailable,
      similarity: sql<number>`1 - (${products.embedding} <=> ${embeddingStr}::vector)`,
      imageUrl: sql<string | null>`(
        SELECT ${productImages.url}
        FROM ${productImages}
        WHERE ${productImages.productId} = ${products.id}
        ORDER BY ${productImages.position} ASC
        LIMIT 1
      )`,
    })
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(sql`1 - (${products.embedding} <=> ${embeddingStr}::vector)`))
    .limit(limit);

  return results;
}
