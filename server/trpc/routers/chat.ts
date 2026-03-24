import { z } from "zod/v4";
import { and, eq, desc, count, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { conversations, messages, shoppers } from "@/server/db/schema";

export const chatRouter = router({
  listConversations: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).max(50).default(20),
        status: z.enum(["active", "resolved", "abandoned", "escalated"]).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, status, search } = input;
      const offset = (page - 1) * perPage;

      const conditions = [eq(conversations.tenantId, ctx.tenantId)];
      if (status) {
        conditions.push(eq(conversations.status, status));
      }
      const escapedSearch = search?.replace(/[%_\\]/g, "\\$&");
      if (escapedSearch) {
        conditions.push(
          sql`(${shoppers.name} ILIKE ${"%" + escapedSearch + "%"} OR ${shoppers.email} ILIKE ${"%" + escapedSearch + "%"})`,
        );
      }

      const [items, [{ total }]] = await Promise.all([
        db
          .select({
            id: conversations.id,
            channel: conversations.channel,
            status: conversations.status,
            summary: conversations.summary,
            rating: conversations.rating,
            createdAt: conversations.createdAt,
            endedAt: conversations.endedAt,
            shopperName: shoppers.name,
            shopperEmail: shoppers.email,
            messageCount: sql<number>`(
              SELECT count(*)::int
              FROM ${messages}
              WHERE ${messages.conversationId} = ${conversations.id}
            )`,
            lastMessage: sql<string | null>`(
              SELECT ${messages.content}
              FROM ${messages}
              WHERE ${messages.conversationId} = ${conversations.id}
                AND ${messages.role} IN ('user', 'assistant')
              ORDER BY ${messages.createdAt} DESC
              LIMIT 1
            )`,
            lastMessageAt: sql<Date | null>`(
              SELECT ${messages.createdAt}
              FROM ${messages}
              WHERE ${messages.conversationId} = ${conversations.id}
              ORDER BY ${messages.createdAt} DESC
              LIMIT 1
            )`,
          })
          .from(conversations)
          .leftJoin(shoppers, eq(conversations.shopperId, shoppers.id))
          .where(and(...conditions))
          .orderBy(desc(conversations.createdAt))
          .limit(perPage)
          .offset(offset),

        db
          .select({ total: count() })
          .from(conversations)
          .leftJoin(shoppers, eq(conversations.shopperId, shoppers.id))
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

  getConversation: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [conversation] = await db
        .select({
          id: conversations.id,
          channel: conversations.channel,
          status: conversations.status,
          summary: conversations.summary,
          rating: conversations.rating,
          createdAt: conversations.createdAt,
          endedAt: conversations.endedAt,
          shopperName: shoppers.name,
          shopperEmail: shoppers.email,
          shopperAnonymousId: shoppers.anonymousId,
        })
        .from(conversations)
        .leftJoin(shoppers, eq(conversations.shopperId, shoppers.id))
        .where(and(eq(conversations.id, input.id), eq(conversations.tenantId, ctx.tenantId)))
        .limit(1);

      if (!conversation) return null;

      const msgs = await db
        .select({
          id: messages.id,
          role: messages.role,
          content: messages.content,
          toolCalls: messages.toolCalls,
          tokensUsed: messages.tokensUsed,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(and(eq(messages.conversationId, input.id), eq(messages.tenantId, ctx.tenantId)))
        .orderBy(messages.createdAt);

      return { ...conversation, messages: msgs };
    }),

  getRecentConversations: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      return db
        .select({
          id: conversations.id,
          status: conversations.status,
          shopperName: shoppers.name,
          shopperEmail: shoppers.email,
          createdAt: conversations.createdAt,
          lastMessage: sql<string | null>`(
            SELECT ${messages.content}
            FROM ${messages}
            WHERE ${messages.conversationId} = ${conversations.id}
              AND ${messages.role} IN ('user', 'assistant')
            ORDER BY ${messages.createdAt} DESC
            LIMIT 1
          )`,
          lastMessageAt: sql<Date | null>`(
            SELECT ${messages.createdAt}
            FROM ${messages}
            WHERE ${messages.conversationId} = ${conversations.id}
            ORDER BY ${messages.createdAt} DESC
            LIMIT 1
          )`,
        })
        .from(conversations)
        .leftJoin(shoppers, eq(conversations.shopperId, shoppers.id))
        .where(eq(conversations.tenantId, ctx.tenantId))
        .orderBy(desc(conversations.createdAt))
        .limit(input.limit);
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["active", "resolved", "abandoned", "escalated"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(conversations)
        .set({
          status: input.status,
          updatedAt: new Date(),
          endedAt: input.status === "resolved" || input.status === "abandoned" ? new Date() : null,
        })
        .where(and(eq(conversations.id, input.id), eq(conversations.tenantId, ctx.tenantId)))
        .returning({ id: conversations.id });

      return updated ?? null;
    }),
});
