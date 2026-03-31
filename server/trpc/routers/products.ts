import { z } from "zod/v4";
import { and, eq, isNull, desc, count, ilike, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { products, productImages, tenants } from "@/server/db/schema";
import { buildEmbeddingText } from "@/features/products/lib/embedding";
import { generateEmbedding } from "@/server/ai/voyage";
import { searchProducts } from "@/server/lib/product-search";
import { PLAN_LIMITS } from "@/shared/lib/plan-config";

export const productsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).max(100).default(20),
        category: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, category, search } = input;
      const offset = (page - 1) * perPage;

      const conditions = [eq(products.tenantId, ctx.tenantId), isNull(products.deletedAt)];

      if (category) {
        conditions.push(eq(products.category, category));
      }
      if (search) {
        const escaped = search.replace(/[%_\\]/g, "\\$&");
        conditions.push(ilike(products.name, `%${escaped}%`));
      }

      const [items, [{ total }]] = await Promise.all([
        db
          .select({
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            category: products.category,
            brand: products.brand,
            stockQty: products.stockQty,
            isAvailable: products.isAvailable,
            hasEmbedding: sql<boolean>`${products.embedding} IS NOT NULL`,
            createdAt: products.createdAt,
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
          .orderBy(desc(products.createdAt))
          .limit(perPage)
          .offset(offset),

        db
          .select({ total: count() })
          .from(products)
          .where(and(...conditions)),
      ]);

      return {
        items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, input.id),
            eq(products.tenantId, ctx.tenantId),
            isNull(products.deletedAt),
          ),
        )
        .limit(1);

      if (!product) return null;

      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.position);

      return { ...product, images };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(500),
        description: z.string().optional(),
        price: z.string(),
        category: z.string().optional(),
        brand: z.string().optional(),
        stockQty: z.number().int().min(0).default(0),
        isAvailable: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check product limit for current plan
      const [[tenantRow], [{ value: productCount }]] = await Promise.all([
        db
          .select({ plan: tenants.plan })
          .from(tenants)
          .where(eq(tenants.id, ctx.tenantId))
          .limit(1),
        db
          .select({ value: count() })
          .from(products)
          .where(and(eq(products.tenantId, ctx.tenantId), isNull(products.deletedAt))),
      ]);

      const plan = tenantRow?.plan ?? "trial";
      const productLimit = PLAN_LIMITS[plan]?.products ?? 0;

      if (productCount >= productLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Бүтээгдэхүүний лимит (${productLimit}) хүрлээ. Өргөтгөхийн тулд төлөвлөгөөгөө шинэчилнэ үү.`,
        });
      }

      const embeddingText = buildEmbeddingText({
        name: input.name,
        description: input.description ?? null,
        category: input.category ?? null,
        brand: input.brand ?? null,
        price: input.price,
      });

      let embedding: number[] | null = null;
      try {
        embedding = await generateEmbedding(embeddingText);
      } catch {
        // Embedding generation failed — save product without embedding
      }

      const [product] = await db
        .insert(products)
        .values({
          tenantId: ctx.tenantId,
          name: input.name,
          description: input.description,
          price: input.price,
          category: input.category,
          brand: input.brand,
          stockQty: input.stockQty,
          isAvailable: input.isAvailable,
          embedding,
          embeddingText: embedding ? embeddingText : null,
        })
        .returning();

      return product;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(500).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        stockQty: z.number().int().min(0).optional(),
        isAvailable: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Check if text fields changed — re-embed if so
      const textFieldsChanged =
        updates.name !== undefined ||
        updates.description !== undefined ||
        updates.category !== undefined ||
        updates.brand !== undefined ||
        updates.price !== undefined;

      let embeddingUpdate: { embedding?: number[] | null; embeddingText?: string | null } = {};

      if (textFieldsChanged) {
        // Fetch current product to merge with updates
        const [current] = await db
          .select()
          .from(products)
          .where(
            and(
              eq(products.id, id),
              eq(products.tenantId, ctx.tenantId),
              isNull(products.deletedAt),
            ),
          )
          .limit(1);

        if (current) {
          const mergedProduct = {
            name: updates.name ?? current.name,
            description: updates.description ?? current.description,
            category: updates.category ?? current.category,
            brand: updates.brand ?? current.brand,
            price: updates.price ?? current.price,
          };

          const embeddingText = buildEmbeddingText(mergedProduct);

          try {
            const embedding = await generateEmbedding(embeddingText);
            embeddingUpdate = { embedding, embeddingText };
          } catch {
            // Keep existing embedding on failure
          }
        }
      }

      const [product] = await db
        .update(products)
        .set({
          ...updates,
          ...embeddingUpdate,
          updatedAt: new Date(),
        })
        .where(
          and(eq(products.id, id), eq(products.tenantId, ctx.tenantId), isNull(products.deletedAt)),
        )
        .returning();

      return product ?? null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [product] = await db
        .update(products)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(products.id, input.id),
            eq(products.tenantId, ctx.tenantId),
            isNull(products.deletedAt),
          ),
        )
        .returning({ id: products.id });

      return product ?? null;
    }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        category: z.string().optional(),
        brand: z.string().optional(),
        limit: z.number().int().min(1).max(20).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      return searchProducts({
        tenantId: ctx.tenantId,
        query: input.query,
        category: input.category,
        brand: input.brand,
        limit: input.limit,
      });
    }),
});
