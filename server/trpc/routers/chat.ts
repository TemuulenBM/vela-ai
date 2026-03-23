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
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, status } = input;
      const offset = (page - 1) * perPage;

      const conditions = [eq(conversations.tenantId, ctx.tenantId)];
      if (status) {
        conditions.push(eq(conversations.status, status));
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
