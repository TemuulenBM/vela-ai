import { z } from "zod/v4";
import { and, count, eq, gte, lt, sql, desc, inArray, isNull } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { events, conversations, products } from "@/server/db/schema";

const daysInput = z.object({
  days: z.number().int().min(1).max(365).default(7),
});

function getDateRange(days: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);

  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);

  return { now, start, prevStart };
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export const analyticsRouter = router({
  // W2 fix: 8 query → 2 query (GROUP BY event_type)
  getOverviewStats: protectedProcedure.input(daysInput).query(async ({ ctx, input }) => {
    const { start, prevStart } = getDateRange(input.days);

    async function countByType(from: Date, to: Date) {
      const rows = await db
        .select({
          eventType: events.eventType,
          count: count(),
        })
        .from(events)
        .where(
          and(
            eq(events.tenantId, ctx.tenantId),
            gte(events.createdAt, from),
            lt(events.createdAt, to),
          ),
        )
        .groupBy(events.eventType);

      const map: Record<string, number> = {};
      for (const row of rows) {
        map[row.eventType] = row.count;
      }
      return map;
    }

    const [current, previous] = await Promise.all([
      countByType(start, new Date()),
      countByType(prevStart, start),
    ]);

    return {
      pageViews: current.page_view ?? 0,
      chatInteractions: current.chat_interaction ?? 0,
      addToCarts: current.add_to_cart ?? 0,
      checkouts: current.checkout_completed ?? 0,
      pageViewsTrend: calcTrend(current.page_view ?? 0, previous.page_view ?? 0),
      chatInteractionsTrend: calcTrend(
        current.chat_interaction ?? 0,
        previous.chat_interaction ?? 0,
      ),
      addToCartsTrend: calcTrend(current.add_to_cart ?? 0, previous.add_to_cart ?? 0),
      checkoutsTrend: calcTrend(current.checkout_completed ?? 0, previous.checkout_completed ?? 0),
    };
  }),

  getEventsOverTime: protectedProcedure.input(daysInput).query(async ({ ctx, input }) => {
    const { start } = getDateRange(input.days);

    const rows = await db
      .select({
        day: sql<string>`date_trunc('day', ${events.createdAt})::date`.as("day"),
        eventType: events.eventType,
        count: count(),
      })
      .from(events)
      .where(and(eq(events.tenantId, ctx.tenantId), gte(events.createdAt, start)))
      .groupBy(sql`date_trunc('day', ${events.createdAt})::date`, events.eventType)
      .orderBy(sql`date_trunc('day', ${events.createdAt})::date`);

    const dayMap = new Map<string, Record<string, number>>();

    for (const row of rows) {
      const dayStr = String(row.day);
      if (!dayMap.has(dayStr)) {
        dayMap.set(dayStr, {});
      }
      dayMap.get(dayStr)![row.eventType] = row.count;
    }

    return Array.from(dayMap.entries()).map(([day, counts]) => ({
      day,
      page_view: counts.page_view ?? 0,
      product_view: counts.product_view ?? 0,
      add_to_cart: counts.add_to_cart ?? 0,
      checkout_completed: counts.checkout_completed ?? 0,
      chat_interaction: counts.chat_interaction ?? 0,
    }));
  }),

  getEventTypeCounts: protectedProcedure.input(daysInput).query(async ({ ctx, input }) => {
    const { start } = getDateRange(input.days);

    const rows = await db
      .select({
        eventType: events.eventType,
        count: count(),
      })
      .from(events)
      .where(and(eq(events.tenantId, ctx.tenantId), gte(events.createdAt, start)))
      .groupBy(events.eventType)
      .orderBy(desc(count()));

    return rows.map((r) => ({
      event: r.eventType,
      count: r.count,
    }));
  }),

  getConversationStats: protectedProcedure.input(daysInput).query(async ({ ctx, input }) => {
    const { start } = getDateRange(input.days);

    const rows = await db
      .select({
        day: sql<string>`date_trunc('day', ${conversations.createdAt})::date`.as("day"),
        status: conversations.status,
        count: count(),
      })
      .from(conversations)
      .where(and(eq(conversations.tenantId, ctx.tenantId), gte(conversations.createdAt, start)))
      .groupBy(sql`date_trunc('day', ${conversations.createdAt})::date`, conversations.status)
      .orderBy(sql`date_trunc('day', ${conversations.createdAt})::date`);

    const dayMap = new Map<string, { started: number; completed: number }>();

    for (const row of rows) {
      const dayStr = String(row.day);
      if (!dayMap.has(dayStr)) {
        dayMap.set(dayStr, { started: 0, completed: 0 });
      }
      const entry = dayMap.get(dayStr)!;
      entry.started += row.count;
      if (row.status === "resolved") {
        entry.completed += row.count;
      }
    }

    return Array.from(dayMap.entries()).map(([day, data]) => ({
      day,
      ...data,
    }));
  }),

  // W3 fix: 4 query → 2 query (GROUP BY status)
  getConversationSummary: protectedProcedure.input(daysInput).query(async ({ ctx, input }) => {
    const { start, prevStart } = getDateRange(input.days);

    async function countByStatus(from: Date, to: Date) {
      const rows = await db
        .select({
          status: conversations.status,
          count: count(),
        })
        .from(conversations)
        .where(
          and(
            eq(conversations.tenantId, ctx.tenantId),
            gte(conversations.createdAt, from),
            lt(conversations.createdAt, to),
          ),
        )
        .groupBy(conversations.status);

      let total = 0;
      let resolved = 0;
      for (const row of rows) {
        total += row.count;
        if (row.status === "resolved") resolved = row.count;
      }
      return { total, resolved };
    }

    const [current, previous] = await Promise.all([
      countByStatus(start, new Date()),
      countByStatus(prevStart, start),
    ]);

    const resolutionRate =
      current.total > 0 ? Math.round((current.resolved / current.total) * 100) : 0;

    return {
      total: current.total,
      resolved: current.resolved,
      resolutionRate,
      totalTrend: calcTrend(current.total, previous.total),
      resolvedTrend: calcTrend(current.resolved, previous.resolved),
    };
  }),

  // C5 fix: inArray ашиглах, W5 fix: DB-level sort
  getTopProducts: protectedProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(365).default(7),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { start } = getDateRange(input.days);

      const productId = sql<string>`${events.metadata}->>'productId'`;

      const rows = await db
        .select({
          productId,
          eventType: events.eventType,
          count: count(),
        })
        .from(events)
        .where(
          and(
            eq(events.tenantId, ctx.tenantId),
            gte(events.createdAt, start),
            inArray(events.eventType, ["product_view", "add_to_cart", "checkout_completed"]),
            sql`${events.metadata}->>'productId' IS NOT NULL`,
          ),
        )
        .groupBy(productId, events.eventType);

      const productMap = new Map<string, { views: number; carts: number; orders: number }>();

      for (const row of rows) {
        const pid = row.productId;
        if (!productMap.has(pid)) {
          productMap.set(pid, { views: 0, carts: 0, orders: 0 });
        }
        const entry = productMap.get(pid)!;
        if (row.eventType === "product_view") entry.views += row.count;
        if (row.eventType === "add_to_cart") entry.carts += row.count;
        if (row.eventType === "checkout_completed") entry.orders += row.count;
      }

      const productIds = Array.from(productMap.keys());
      if (productIds.length === 0) return [];

      const productRows = await db
        .select({ id: products.id, name: products.name })
        .from(products)
        .where(and(eq(products.tenantId, ctx.tenantId), inArray(products.id, productIds)));

      const nameMap = new Map(productRows.map((p) => [p.id, p.name]));

      return Array.from(productMap.entries())
        .map(([pid, stats]) => ({
          productId: pid,
          name: nameMap.get(pid) ?? "Unknown",
          views: stats.views,
          carts: stats.carts,
          orders: stats.orders,
          conversionRate:
            stats.views > 0 ? Math.round((stats.orders / stats.views) * 100 * 10) / 10 : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, input.limit);
    }),

  // W4 fix: daysInput шаардлагагүй тул хассан
  getProductSummary: protectedProcedure.query(async ({ ctx }) => {
    const [totalResult, availableResult] = await Promise.all([
      db
        .select({ value: count() })
        .from(products)
        .where(and(eq(products.tenantId, ctx.tenantId), isNull(products.deletedAt))),
      db
        .select({ value: count() })
        .from(products)
        .where(
          and(
            eq(products.tenantId, ctx.tenantId),
            eq(products.isAvailable, true),
            isNull(products.deletedAt),
          ),
        ),
    ]);

    const total = totalResult[0]?.value ?? 0;
    const available = availableResult[0]?.value ?? 0;

    return {
      totalProducts: total,
      activeProducts: available,
      outOfStock: total - available,
    };
  }),
});
