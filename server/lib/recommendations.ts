import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "@/server/db/db";
import { products, crossSellRules } from "@/server/db/schema";
import { searchProducts } from "./product-search";

export interface RecommendationResult {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  brand: string | null;
  confidence?: string;
}

interface GetRecommendationsParams {
  tenantId: string;
  productId: string;
  limit?: number;
}

/**
 * Get product recommendations for a given product.
 * 1. Try cross-sell rules (batch job generated)
 * 2. Fallback to vector similarity search (same category)
 */
export async function getRecommendations(
  params: GetRecommendationsParams,
): Promise<{ recommendations: RecommendationResult[]; source: "cross_sell" | "similarity" }> {
  const { tenantId, productId, limit = 5 } = params;

  // 1. Try cross-sell rules
  const crossSellResults = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      category: products.category,
      brand: products.brand,
      confidence: crossSellRules.confidence,
    })
    .from(crossSellRules)
    .innerJoin(products, eq(crossSellRules.recommendedProductId, products.id))
    .where(
      and(
        eq(crossSellRules.tenantId, tenantId),
        eq(crossSellRules.triggerProductId, productId),
        isNull(products.deletedAt),
        eq(products.isAvailable, true),
      ),
    )
    .orderBy(desc(crossSellRules.confidence))
    .limit(limit);

  if (crossSellResults.length > 0) {
    return {
      recommendations: crossSellResults,
      source: "cross_sell",
    };
  }

  // 2. Fallback: vector similarity with same category
  const [targetProduct] = await db
    .select({
      category: products.category,
      embeddingText: products.embeddingText,
    })
    .from(products)
    .where(
      and(eq(products.id, productId), eq(products.tenantId, tenantId), isNull(products.deletedAt)),
    )
    .limit(1);

  if (targetProduct?.embeddingText) {
    try {
      const similar = await searchProducts({
        tenantId,
        query: targetProduct.embeddingText,
        category: targetProduct.category ?? undefined,
        limit: limit + 1,
      });

      const filtered = similar
        .filter((p) => p.id !== productId)
        .slice(0, limit)
        .map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          brand: p.brand,
        }));

      return { recommendations: filtered, source: "similarity" };
    } catch {
      // Embedding generation failed — return empty
      return { recommendations: [], source: "similarity" };
    }
  }

  return { recommendations: [], source: "similarity" };
}
