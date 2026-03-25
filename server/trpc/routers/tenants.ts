import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";
import { and, eq, ne, isNull, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { tenants, tenantMembers, apiKeys, products, conversations } from "@/server/db/schema";

export const tenantsRouter = router({
  getStore: protectedProcedure.query(async ({ ctx }) => {
    const [tenant] = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        plan: tenants.plan,
        settings: tenants.settings,
        createdAt: tenants.createdAt,
      })
      .from(tenants)
      .where(eq(tenants.id, ctx.tenantId))
      .limit(1);

    return tenant ?? null;
  }),

  updateStore: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(100).optional(),
        description: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, slug, description } = input;

      if (slug !== undefined) {
        const [existing] = await db
          .select({ id: tenants.id })
          .from(tenants)
          .where(and(eq(tenants.slug, slug), ne(tenants.id, ctx.tenantId)))
          .limit(1);

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Энэ slug аль хэдийн ашиглагдаж байна",
          });
        }
      }

      // Build settings update if description provided
      let settingsUpdate: Record<string, unknown> | undefined;
      if (description !== undefined) {
        const [current] = await db
          .select({ settings: tenants.settings })
          .from(tenants)
          .where(eq(tenants.id, ctx.tenantId))
          .limit(1);

        const currentSettings = (current?.settings as Record<string, unknown> | null) ?? {};
        settingsUpdate = { ...currentSettings, description };
      }

      const [updated] = await db
        .update(tenants)
        .set({
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(settingsUpdate && { settings: settingsUpdate }),
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenantId))
        .returning({ id: tenants.id });

      return updated ?? null;
    }),

  listApiKeys: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.tenantId, ctx.tenantId), isNull(apiKeys.revokedAt)))
      .orderBy(apiKeys.createdAt);
  }),

  createApiKey: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const MAX_KEYS_PER_TENANT = 10;
      const [activeKeyCount] = await db
        .select({ value: count() })
        .from(apiKeys)
        .where(and(eq(apiKeys.tenantId, ctx.tenantId), isNull(apiKeys.revokedAt)));

      if ((activeKeyCount?.value ?? 0) >= MAX_KEYS_PER_TENANT) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Хамгийн ихдээ ${MAX_KEYS_PER_TENANT} API түлхүүр үүсгэх боломжтой`,
        });
      }

      const rawKey = `sk_live_${crypto.randomBytes(24).toString("hex")}`;
      const keyPrefix = rawKey.slice(0, 8);
      const keyHash = await bcrypt.hash(rawKey, 10);

      const [created] = await db
        .insert(apiKeys)
        .values({
          tenantId: ctx.tenantId,
          name: input.name,
          keyHash,
          keyPrefix,
        })
        .returning({ id: apiKeys.id, createdAt: apiKeys.createdAt });

      return {
        id: created.id,
        name: input.name,
        key: rawKey,
        keyPrefix,
        createdAt: created.createdAt,
      };
    }),

  revokeApiKey: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [revoked] = await db
        .update(apiKeys)
        .set({ revokedAt: new Date() })
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.tenantId, ctx.tenantId)))
        .returning({ id: apiKeys.id });

      return revoked ?? null;
    }),

  listMembers: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        role: tenantMembers.role,
        lastLoginAt: tenantMembers.lastLoginAt,
        createdAt: tenantMembers.createdAt,
      })
      .from(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, ctx.tenantId), isNull(tenantMembers.deletedAt)))
      .orderBy(tenantMembers.createdAt);
  }),

  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const [convCount, prodCount, memberCount] = await Promise.all([
      db
        .select({ value: count() })
        .from(conversations)
        .where(eq(conversations.tenantId, ctx.tenantId)),
      db
        .select({ value: count() })
        .from(products)
        .where(and(eq(products.tenantId, ctx.tenantId), isNull(products.deletedAt))),
      db
        .select({ value: count() })
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, ctx.tenantId), isNull(tenantMembers.deletedAt))),
    ]);

    return {
      conversations: convCount[0]?.value ?? 0,
      products: prodCount[0]?.value ?? 0,
      members: memberCount[0]?.value ?? 0,
    };
  }),
});
