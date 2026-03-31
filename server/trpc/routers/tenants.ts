import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";
import { and, eq, ne, isNull, isNotNull, count, gte, lte, gt, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { SUBSCRIPTION_GRACE_DAYS } from "@/shared/lib/plan-config";
import { db } from "@/server/db/db";
import {
  tenants,
  tenantMembers,
  apiKeys,
  products,
  conversations,
  subscriptions,
} from "@/server/db/schema";
import { desc } from "drizzle-orm";

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

    if (!tenant) return null;

    if (tenant.plan !== "trial") {
      const now = new Date();

      // 1. Canceled sub-ийн хуучин логик хэвээр — canceledAt тавигдсан, periodEnd дуусвал downgrade
      const [canceledExpired] = await db
        .select({ id: subscriptions.id, periodEnd: subscriptions.periodEnd })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.tenantId, ctx.tenantId),
            eq(subscriptions.status, "active"),
            isNotNull(subscriptions.canceledAt),
          ),
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);

      if (canceledExpired?.periodEnd && now > canceledExpired.periodEnd) {
        await db
          .update(subscriptions)
          .set({ status: "canceled", updatedAt: now })
          .where(eq(subscriptions.id, canceledExpired.id));
        await db
          .update(tenants)
          .set({ plan: "trial", updatedAt: now })
          .where(eq(tenants.id, ctx.tenantId));
        return { ...tenant, plan: "trial" as const };
      }

      // 2. Cancel хийгээгүй ч гэсэн expired sub шалгах (bug fix)
      // Valid (non-expired) active sub байвал downgrade хийхгүй
      const [validSub] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.tenantId, ctx.tenantId),
            eq(subscriptions.status, "active"),
            isNull(subscriptions.canceledAt),
            gt(subscriptions.periodEnd, now),
          ),
        )
        .limit(1);

      if (!validSub) {
        // Valid sub байхгүй — grace period дуусвал downgrade
        // past_due ч гэсэн шалгах (cron-оос тэмдэглэгдсэн байж болно)
        const GRACE_MS = SUBSCRIPTION_GRACE_DAYS * 24 * 60 * 60 * 1000;
        const [expiredSub] = await db
          .select({ id: subscriptions.id, periodEnd: subscriptions.periodEnd })
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.tenantId, ctx.tenantId),
              inArray(subscriptions.status, ["active", "past_due"]),
              isNull(subscriptions.canceledAt),
              lte(subscriptions.periodEnd, now),
            ),
          )
          .orderBy(desc(subscriptions.createdAt))
          .limit(1);

        if (expiredSub?.periodEnd && now.getTime() > expiredSub.periodEnd.getTime() + GRACE_MS) {
          await db
            .update(subscriptions)
            .set({ status: "canceled", updatedAt: now })
            .where(eq(subscriptions.id, expiredSub.id));
          await db
            .update(tenants)
            .set({ plan: "trial", updatedAt: now })
            .where(eq(tenants.id, ctx.tenantId));
          return { ...tenant, plan: "trial" as const };
        }
      }
    }

    return tenant;
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
    // Сарын эхнээс тоолох (PLAN_LIMITS нь сарын хязгаарлалт)
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [convCount, prodCount, memberCount, channelCount] = await Promise.all([
      db
        .select({ value: count() })
        .from(conversations)
        .where(
          and(eq(conversations.tenantId, ctx.tenantId), gte(conversations.createdAt, monthStart)),
        ),
      db
        .select({ value: count() })
        .from(products)
        .where(and(eq(products.tenantId, ctx.tenantId), isNull(products.deletedAt))),
      db
        .select({ value: count() })
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, ctx.tenantId), isNull(tenantMembers.deletedAt))),
      db
        .select({ value: count() })
        .from(apiKeys)
        .where(and(eq(apiKeys.tenantId, ctx.tenantId), isNull(apiKeys.revokedAt))),
    ]);

    return {
      conversations: convCount[0]?.value ?? 0,
      products: prodCount[0]?.value ?? 0,
      members: memberCount[0]?.value ?? 0,
      channels: channelCount[0]?.value ?? 0,
    };
  }),
});
