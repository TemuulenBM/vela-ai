import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { channelConnections } from "@/server/db/schema";
import { encryptToken, decryptToken } from "@/server/lib/meta/crypto";
import { buildOAuthUrl, subscribePageToWebhook } from "@/server/lib/meta/oauth";

/** Encrypted pages data-г задалж parsed object буцаана. */
function decryptPagesData(pagesData: string, tenantId: string) {
  let parsed: {
    tenantId: string;
    pages: Array<{
      pageId: string;
      pageName: string;
      pageAccessToken: string;
      igAccountId?: string;
      igUsername?: string;
    }>;
    tokenExpiresAt: string;
  };

  try {
    parsed = JSON.parse(decryptToken(pagesData));
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Буруу pages data" });
  }

  if (parsed.tenantId !== tenantId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Tenant таарахгүй байна" });
  }

  return parsed;
}

/** Channel connection upsert хийнэ (Messenger/Instagram ижил логик). */
async function upsertConnection(params: {
  tenantId: string;
  platform: "messenger" | "instagram";
  pageId: string;
  pageName: string;
  igAccountId?: string;
  igUsername?: string;
  encryptedToken: string;
  tokenExpiresAt: Date;
}) {
  const [conn] = await db
    .insert(channelConnections)
    .values({
      tenantId: params.tenantId,
      platform: params.platform,
      pageId: params.pageId,
      pageName: params.pageName,
      igAccountId: params.igAccountId,
      igUsername: params.igUsername,
      accessToken: params.encryptedToken,
      tokenExpiresAt: params.tokenExpiresAt,
      status: "active",
    })
    .onConflictDoUpdate({
      target: [channelConnections.tenantId, channelConnections.pageId, channelConnections.platform],
      set: {
        pageName: params.pageName,
        accessToken: params.encryptedToken,
        tokenExpiresAt: params.tokenExpiresAt,
        igAccountId: params.igAccountId,
        igUsername: params.igUsername,
        status: "active",
        disconnectedAt: null,
        updatedAt: new Date(),
      },
    })
    .returning({ id: channelConnections.id });

  return conn.id;
}

export const channelsRouter = router({
  /**
   * Tenant-ийн бүх channel connections.
   */
  listConnections: protectedProcedure.query(async ({ ctx }) => {
    const connections = await db
      .select({
        id: channelConnections.id,
        platform: channelConnections.platform,
        pageId: channelConnections.pageId,
        pageName: channelConnections.pageName,
        igAccountId: channelConnections.igAccountId,
        igUsername: channelConnections.igUsername,
        status: channelConnections.status,
        createdAt: channelConnections.createdAt,
        updatedAt: channelConnections.updatedAt,
      })
      .from(channelConnections)
      .where(eq(channelConnections.tenantId, ctx.tenantId));

    return connections;
  }),

  /**
   * Facebook OAuth URL авах.
   */
  getMetaOAuthUrl: protectedProcedure
    .input(z.object({ redirectUri: z.string().url() }))
    .query(({ ctx, input }) => {
      return { url: buildOAuthUrl(ctx.tenantId, input.redirectUri) };
    }),

  /**
   * Encrypted pages data-г задлаж page жагсаалт буцаана.
   * UI-д page select dialog-д хэрэглэнэ.
   */
  decryptPages: protectedProcedure
    .input(z.object({ pagesData: z.string() }))
    .query(({ ctx, input }) => {
      const parsed = decryptPagesData(input.pagesData, ctx.tenantId);
      return {
        pages: parsed.pages.map((p) => ({
          pageId: p.pageId,
          pageName: p.pageName,
          igAccountId: p.igAccountId,
          igUsername: p.igUsername,
        })),
      };
    }),

  /**
   * OAuth callback-аас ирсэн page-ийг холбох.
   * pagesData нь encrypted JSON — callback route-аас дамжсан.
   */
  connectPage: protectedProcedure
    .input(
      z.object({
        pagesData: z.string(),
        selectedPageId: z.string(),
        connectInstagram: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parsed = decryptPagesData(input.pagesData, ctx.tenantId);

      const selectedPage = parsed.pages.find((p) => p.pageId === input.selectedPageId);
      if (!selectedPage) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page олдсонгүй" });
      }

      // Subscribe page to webhooks
      await subscribePageToWebhook(selectedPage.pageId, selectedPage.pageAccessToken);

      const encryptedToken = encryptToken(selectedPage.pageAccessToken);
      const tokenExpiresAt = new Date(parsed.tokenExpiresAt);

      const common = {
        tenantId: ctx.tenantId,
        pageId: selectedPage.pageId,
        pageName: selectedPage.pageName,
        igAccountId: selectedPage.igAccountId,
        igUsername: selectedPage.igUsername,
        encryptedToken,
        tokenExpiresAt,
      };

      // Messenger connection
      const messengerConnectionId = await upsertConnection({
        ...common,
        platform: "messenger",
      });

      // Instagram connection (if opted in + IG account exists)
      let igConnectionId: string | null = null;
      if (input.connectInstagram && selectedPage.igAccountId) {
        igConnectionId = await upsertConnection({
          ...common,
          platform: "instagram",
        });
      }

      return {
        messengerConnectionId,
        igConnectionId,
        pageName: selectedPage.pageName,
      };
    }),

  /**
   * Channel connection салгах.
   */
  disconnect: protectedProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(channelConnections)
        .set({
          status: "disconnected",
          disconnectedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(channelConnections.id, input.connectionId),
            eq(channelConnections.tenantId, ctx.tenantId),
          ),
        )
        .returning({ id: channelConnections.id });

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Connection олдсонгүй" });
      }

      return { success: true };
    }),
});
