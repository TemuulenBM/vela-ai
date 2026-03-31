import { z } from "zod/v4";
import { and, eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { withTenantCtx } from "@/server/db/rls";
import { crawlJobs, tenants } from "@/server/db/schema";
import { processCrawlStep } from "@/server/lib/crawler/orchestrator";

export const crawlerRouter = router({
  // ─── Crawl эхлүүлэх ──────────────────────────────────────────
  startCrawl: protectedProcedure
    .input(
      z.object({
        websiteUrl: z.string().url(),
        maxPages: z.number().int().min(1).max(500).default(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { jobId } = await withTenantCtx(ctx.tenantId, async (tx) => {
        // Check for active crawl (any non-terminal status)
        const [runningCrawl] = await tx
          .select({ id: crawlJobs.id, status: crawlJobs.status })
          .from(crawlJobs)
          .where(eq(crawlJobs.tenantId, ctx.tenantId))
          .orderBy(desc(crawlJobs.createdAt))
          .limit(1);

        if (
          runningCrawl &&
          ["pending", "discovering", "extracting", "embedding"].includes(runningCrawl.status)
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Аль хэдийн ажиллаж буй crawl байна. Дуусахыг хүлээнэ үү.",
          });
        }

        // Create crawl job
        const [job] = await tx
          .insert(crawlJobs)
          .values({
            tenantId: ctx.tenantId,
            websiteUrl: input.websiteUrl,
            status: "pending",
            config: { maxPages: input.maxPages },
          })
          .returning({ id: crawlJobs.id });

        // Save website URL to tenant settings
        const [tenant] = await tx
          .select({ settings: tenants.settings })
          .from(tenants)
          .where(eq(tenants.id, ctx.tenantId))
          .limit(1);

        const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};
        await tx
          .update(tenants)
          .set({
            settings: {
              ...currentSettings,
              crawlerConfig: {
                ...((currentSettings.crawlerConfig as Record<string, unknown>) ?? {}),
                websiteUrl: input.websiteUrl,
              },
            },
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, ctx.tenantId));

        return { jobId: job.id };
      });

      // processCrawlStep is a long-running orchestrator with its own DB ops —
      // runs outside the transaction intentionally
      const result = await processCrawlStep(jobId, ctx.tenantId);

      return { jobId, ...result };
    }),

  // ─── Crawl статус шалгах ─────────────────────────────────────
  getCrawlStatus: protectedProcedure.query(async ({ ctx }) => {
    const [job] = await db
      .select({
        id: crawlJobs.id,
        websiteUrl: crawlJobs.websiteUrl,
        status: crawlJobs.status,
        cursor: crawlJobs.cursor,
        totalFound: crawlJobs.totalFound,
        totalImported: crawlJobs.totalImported,
        totalUpdated: crawlJobs.totalUpdated,
        totalSkipped: crawlJobs.totalSkipped,
        error: crawlJobs.error,
        startedAt: crawlJobs.startedAt,
        completedAt: crawlJobs.completedAt,
        createdAt: crawlJobs.createdAt,
      })
      .from(crawlJobs)
      .where(eq(crawlJobs.tenantId, ctx.tenantId))
      .orderBy(desc(crawlJobs.createdAt))
      .limit(1);

    return job ?? null;
  }),

  // ─── Дараагийн алхам гүйцэтгэх ─────────────────────────────
  continueWork: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Ownership check
      const [job] = await db
        .select({ id: crawlJobs.id })
        .from(crawlJobs)
        .where(and(eq(crawlJobs.id, input.jobId), eq(crawlJobs.tenantId, ctx.tenantId)))
        .limit(1);

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Crawl job олдсонгүй" });
      }

      return processCrawlStep(input.jobId, ctx.tenantId);
    }),

  // ─── Crawl цуцлах ───────────────────────────────────────────
  cancelCrawl: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await withTenantCtx(ctx.tenantId, async (tx) => {
        const [job] = await tx
          .select({ id: crawlJobs.id, status: crawlJobs.status })
          .from(crawlJobs)
          .where(and(eq(crawlJobs.id, input.jobId), eq(crawlJobs.tenantId, ctx.tenantId)))
          .limit(1);

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Crawl job олдсонгүй" });
        }

        if (job.status === "completed" || job.status === "failed") {
          return;
        }

        await tx
          .update(crawlJobs)
          .set({
            status: "failed",
            error: "Хэрэглэгч цуцалсан",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(crawlJobs.id, input.jobId), eq(crawlJobs.tenantId, ctx.tenantId)));
      });

      return { success: true };
    }),

  // ─── Crawler тохиргоо шинэчлэх ──────────────────────────────
  updateConfig: protectedProcedure
    .input(
      z.object({
        websiteUrl: z.string().url().optional(),
        autoSync: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [tenant] = await db
        .select({ settings: tenants.settings })
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId))
        .limit(1);

      const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};
      const currentCrawlerConfig = (currentSettings.crawlerConfig as Record<string, unknown>) ?? {};

      await db
        .update(tenants)
        .set({
          settings: {
            ...currentSettings,
            crawlerConfig: {
              ...currentCrawlerConfig,
              ...(input.websiteUrl !== undefined && { websiteUrl: input.websiteUrl }),
              ...(input.autoSync !== undefined && { autoSync: input.autoSync }),
            },
          },
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenantId));

      return { success: true };
    }),
});
