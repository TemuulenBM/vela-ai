import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { channelConnections } from "@/server/db/schema";
import { encryptToken, decryptToken } from "@/server/lib/meta/crypto";
import { buildOAuthUrl } from "@/server/lib/meta/oauth";
import { subscribePageToWebhook } from "@/server/lib/meta/oauth";

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
      // Decrypt pages data
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
        parsed = JSON.parse(decryptToken(input.pagesData));
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Буруу pages data" });
      }

      // Tenant ownership verify
      if (parsed.tenantId !== ctx.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Tenant таарахгүй байна" });
      }

      const selectedPage = parsed.pages.find((p) => p.pageId === input.selectedPageId);
      if (!selectedPage) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page олдсонгүй" });
      }

      // Subscribe page to webhooks
      await subscribePageToWebhook(selectedPage.pageId, selectedPage.pageAccessToken);

      // Save Messenger connection
      const encryptedToken = encryptToken(selectedPage.pageAccessToken);

      const [messengerConn] = await db
        .insert(channelConnections)
        .values({
          tenantId: ctx.tenantId,
          platform: "messenger",
          pageId: selectedPage.pageId,
          pageName: selectedPage.pageName,
          igAccountId: selectedPage.igAccountId,
          igUsername: selectedPage.igUsername,
          accessToken: encryptedToken,
          tokenExpiresAt: new Date(parsed.tokenExpiresAt),
          status: "active",
        })
        .onConflictDoUpdate({
          target: [
            channelConnections.tenantId,
            channelConnections.pageId,
            channelConnections.platform,
          ],
          set: {
            pageName: selectedPage.pageName,
            accessToken: encryptedToken,
            tokenExpiresAt: new Date(parsed.tokenExpiresAt),
            igAccountId: selectedPage.igAccountId,
            igUsername: selectedPage.igUsername,
            status: "active",
            disconnectedAt: null,
            updatedAt: new Date(),
          },
        })
        .returning({ id: channelConnections.id });

      // Optionally connect Instagram too
      let igConnectionId: string | null = null;
      if (input.connectInstagram && selectedPage.igAccountId) {
        const [igConn] = await db
          .insert(channelConnections)
          .values({
            tenantId: ctx.tenantId,
            platform: "instagram",
            pageId: selectedPage.pageId,
            pageName: selectedPage.pageName,
            igAccountId: selectedPage.igAccountId,
            igUsername: selectedPage.igUsername,
            accessToken: encryptedToken,
            tokenExpiresAt: new Date(parsed.tokenExpiresAt),
            status: "active",
          })
          .onConflictDoUpdate({
            target: [
              channelConnections.tenantId,
              channelConnections.pageId,
              channelConnections.platform,
            ],
            set: {
              pageName: selectedPage.pageName,
              accessToken: encryptedToken,
              tokenExpiresAt: new Date(parsed.tokenExpiresAt),
              igAccountId: selectedPage.igAccountId,
              igUsername: selectedPage.igUsername,
              status: "active",
              disconnectedAt: null,
              updatedAt: new Date(),
            },
          })
          .returning({ id: channelConnections.id });

        igConnectionId = igConn.id;
      }

      return {
        messengerConnectionId: messengerConn.id,
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
